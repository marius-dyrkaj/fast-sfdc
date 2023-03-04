import * as vscode from 'vscode'
import StatusBar from '../statusbar'
import sfdcConnector from '../sfdc-connector'
import parsers from '../utils/parsers'
import configService from '../services/config-service'
import { DoneCallback } from '../fast-sfdc'
import toolingService from '../services/tooling-service'
import utils from '../utils/utils'
import logger, { diagnosticCollection } from '../logger'
import * as path from 'upath'
import * as minimatch from 'minimatch'

function updateProblemsPanel (errors: any[], doc: vscode.TextDocument) {
  diagnosticCollection.set(doc.uri, errors
    .filter(e => e.ProblemType !== 'Error')
    .map(failure => {
      const failureLineNumber = Math.abs(failure.lineNumber || failure.LineNumber || 1)
      let failureRange = doc.lineAt(Math.min(failureLineNumber - 1, doc.lineCount - 1)).range
      if (failure.columnNumber > 0) {
        failureRange = failureRange.with(new vscode.Position((failureLineNumber - 1), failure.columnNumber - 1))
      }
      return new vscode.Diagnostic(failureRange, failure.problem, failure.problemType)
    })
  )
}

function updateProblemsPanelFromAuraError (err: any, doc: vscode.TextDocument) {
  const filename = parsers.getFilename(doc.fileName)

  let failureLineNumber: number
  let failureColumnNumber: number
  let errorMessage: string
  const errorLines = /^.*\[(\d+)[:, ]+(\d+)\].*$/
  const m = err.message.match(errorLines)
  if (m) {
    const [msg, line, col] = m
    errorMessage = msg
    failureLineNumber = parseInt(line, 10) - 1
    failureColumnNumber = parseInt(col, 10)
  } else {
    const splitString = err.message.split(filename + ':')
    const partTwo = splitString.length > 1 ? splitString[1] : '1,1:' + err.message
    const idx = partTwo.indexOf(':') + 1
    const rangeArray: any[] = partTwo.substring(0, idx).split(',')
    errorMessage = partTwo.substring(idx)
    failureLineNumber = rangeArray[0] - 1
    failureColumnNumber = rangeArray[1]
  }

  let failureRange = doc.lineAt(failureLineNumber).range
  if (failureColumnNumber > 0) {
    failureRange = failureRange.with(new vscode.Position(failureLineNumber, failureColumnNumber))
  }
  diagnosticCollection.set(doc.uri, [new vscode.Diagnostic(failureRange, errorMessage, 0)])
}

const compileAuraDefinition = async (doc: vscode.TextDocument, done: DoneCallback) => {
  const bundleName = parsers.getAuraBundleName(doc.uri)
  const auraDefType = parsers.getAuraDefType(doc.fileName)
  const record = await sfdcConnector.findAuraByNameAndDefType(bundleName, auraDefType as string)
  if (!record) throw Error('File not found on Salesforce server')
  try {
    await sfdcConnector.upsertAuraObj({ ...record, Source: doc.getText() })
    diagnosticCollection.set(doc.uri, [])
    done('👍🏻')
  } catch (e) {
    updateProblemsPanelFromAuraError(e, doc)
    done('👎🏻')
  }
}

const createLightningWebComponentMetadata = async (doc: vscode.TextDocument): Promise<any> => {
  const metadata = { ...await utils.parseXmlStrict<any>(doc.getText()), $: undefined }
  const targetConfigs = metadata.targetConfigs ? utils.buildXml({ targetConfigs: metadata.targetConfigs }, true) : ''
  metadata.targets = utils.toArray(metadata.targets, 'target')
  metadata.targetConfigs = Buffer.from(targetConfigs).toString('base64')
  return metadata
}

const compileLightninWebComponent = async (doc: vscode.TextDocument, done: DoneCallback) => {
  const bundleName = parsers.getLwcBundleName(doc.uri)
  const lwcDefType = parsers.getLWCDefType(doc.fileName)
  try {
    const bundleId = await sfdcConnector.findLwcBundleId(bundleName)
    if (lwcDefType === 'xml') {
      await sfdcConnector.upsertObj('LightningComponentBundle', {
        Id: bundleId,
        Metadata: await createLightningWebComponentMetadata(doc)
      })
    }
    const filePath = `lwc/${bundleName}/${parsers.getFilename(doc.fileName)}.${lwcDefType}`
    // meta.xml resources are saved with format js during metadata deployments. nobody knows why
    const resourceFormat = lwcDefType === 'xml' ? 'js' : lwcDefType
    let record = await sfdcConnector.findLwcByNameAndDefType(bundleName, resourceFormat, filePath)
    if (!record) {
      record = {
        Format: resourceFormat,
        LightningComponentBundleId: bundleId,
        FilePath: filePath
      }
    }
    await sfdcConnector.upsertLwcObj({ ...record, Source: doc.getText() })
    diagnosticCollection.set(doc.uri, [])
    done('👍🏻')
  } catch (e) {
    updateProblemsPanelFromAuraError(e, doc)
    done('👎🏻')
  }
}

const compileMetadataContainerObject = async (doc: vscode.TextDocument, done: DoneCallback) => {
  try {
    logger.appendLine(`Compiling ${doc.fileName}`)
    const compile = await toolingService.requestCompile()
    const results = await compile(parsers.getToolingType(doc), {
      Body: doc.getText(),
      FullName: parsers.getFilename(doc.fileName)
    })
    logger.appendLine('Done.')
    updateProblemsPanel(results.DeployDetails.componentFailures, doc)
    done(results.State === 'Completed' ? '👍🏻' : '👎🏻')
  } catch (e) {
    vscode.window.showErrorMessage(e.message)
    done('👎🏻')
  }
}

const compileStaticResource = async (doc: vscode.TextDocument, done: DoneCallback) => {
  try {
    const fileName = parsers.getFilename(doc.fileName)
    const staticRes = await sfdcConnector.query(`SELECT Id FROM StaticResource WHERE Name = '${fileName}'`)
    if (!staticRes.records.length) return done('')
    logger.appendLine(`Updating ${doc.fileName}`)
    await sfdcConnector.upsertObj('StaticResource', {
      Id: staticRes.records[0].Id,
      Body: Buffer.from(doc.getText()).toString('base64')
    })
    done('👍🏻')
  } catch (e) {
    vscode.window.showErrorMessage(e.message)
    done('👎🏻')
  }
}

export default async function compile (doc?: vscode.TextDocument) {
  const cfg = await configService.getConfig()
  const sfdyConfig = configService.getSfdyConfigSync()
  if (!cfg.stored) return

  const creds = cfg.credentials[cfg.currentCredential]
  if (doc && !creds.deployOnSave) return

  if (!doc && vscode.window.activeTextEditor && vscode.window.activeTextEditor.document) {
    doc = vscode.window.activeTextEditor.document
  }

  if (!doc) return

  const type = parsers.getToolingType(doc)
  if (!type) return

  const basePath = path.join(utils.getWorkspaceFolder(), 'src') + '/'
  const fileName = path.toUnix(doc.fileName).replace(basePath, '')

  if ((sfdyConfig.excludeFiles || []).some(gl => minimatch(fileName, gl))) return

  StatusBar.startLongJob(done => {
    switch (type) {
      case 'AuraDefinition': return compileAuraDefinition(doc!, done)
      case 'LightningComponentResource': return compileLightninWebComponent(doc!, done)
      case 'StaticResource': return compileStaticResource(doc!, done)
      default: return compileMetadataContainerObject(doc!, done)
    }
  }, doc.uri.toString(), true)
}
