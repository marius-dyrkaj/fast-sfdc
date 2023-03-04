export interface ConfigCredential {
  type?: string;
  username?: string;
  password?: string;
  instanceUrl?: string;
  environment?: string;
  url?: string;
  deployOnSave?: boolean;
}

export interface Config {
  readonly stored: boolean;
  lastVersion?: string;
  credentials: ConfigCredential[];
  currentCredential: number;
}

export interface DescribeMetadataItem {
  directoryName: string;
  inFolder: string;
  metaFile: string;
  suffix: string;
  xmlName: string;
}

export interface DescribeMetadataResult {
  metadataObjects: DescribeMetadataItem[];
  organizationNamespace: string;
  partialSaveAllowed: string;
  testRequired: string;
}

export interface ListMetadataResult {
  createdById: string;
  createdByName: string;
  createdDate: string;
  fileName: string;
  fullName: string;
  id: string;
  lastModifiedById: string;
  lastModifiedByName: string;
  type: string;
}

export interface Metadata {
  apiVersion: number;
}

export interface AuraMetadata extends Metadata {
  description: string;
}

export interface ApexClassMetadata extends Metadata {
  status: 'Active';
}

export interface ApexPageMetadata extends Metadata {
  availableInTouch: boolean;
  confirmationTokenRequired: boolean;
  label: string;
}

export interface ApexComponentMetadata extends Metadata {
  description: string;
  label: string;
}

export interface LwcMetadata extends Metadata {
  description: string;
  isExposed: boolean;
  targets: {
    target: string[];
  };
}

type AnyMetadata = ApexClassMetadata | ApexPageMetadata | ApexComponentMetadata | LwcMetadata | Metadata

export interface MetaObj {
  Id?: string;
  FullName: string;
  Body: string;
  MetadataContainerId?: string;
  Metadata?: AnyMetadata;
}

export interface StaticResourceObj {
  Id?: string;
  Body: string;
  CacheControl: 'Public' | 'Private';
  Name?: string;
  ContentType?: string;
}

type AuraDefType = 'APPLICATION'
  | 'CONTROLLER'
  | 'COMPONENT'
  | 'EVENT'
  | 'HELPER'
  | 'INTERFACE'
  | 'RENDERER'
  | 'STYLE'
  | 'PROVIDER'
  | 'MODEL'
  | 'TESTSUITE'
  | 'DOCUMENTATION'
  | 'TOKENS'
  | 'DESIGN'
  | 'SVG'

type AuraFormat = 'XML' | 'JS' | 'CSS'

export interface AuraObj {
  Id?: string;
  Source: string;
  AuraDefinitionBundleId?: string;
  DefType: AuraDefType;
  Format: AuraFormat;
}

export interface LwcObj {
  Id?: string;
  LightningComponentBundleId?: string;
  FullName?: string;
  Metadata?: any;
}

export interface AuraBundle {
  Id?: string;
  ApiVersion: number;
  Description: string;
  DeveloperName: string;
  MasterLabel: string;
}

export interface TestResult {
  name: string;
  methodName: string;
  message: string;
  stackTrace: string;
}

export interface TestExecutionResult {
  successes: TestResult[];
  failures: TestResult[];
}

export type DoneCallback = (s: string) => void
export type AnyObj = { [key: string]: any }

export interface XmlFls {
  editable: boolean;
  field: string;
  readable: boolean;
}

export interface XmlObjPermission {
  allowCreate: boolean;
  allowDelete: boolean;
  allowEdit: boolean;
  allowRead: boolean;
  modifyAllRecords: boolean;
  'object': string;
  viewAllRecords: boolean;
}

export interface XmlProfile {
  [key: string]: {
    fieldPermissions: XmlFls[];
    objectPermissions: XmlObjPermission[];
  };
}

export interface XmlField {
  fullName: string;
  label?: string;
  required: boolean;
  formula: string;
  type: 'AutoNumber' | 'Summary';
}

export interface XmlCustomObject {
  CustomObject: {
    customSettingsType: string[];
    fields: XmlField[];
  };
}
