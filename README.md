# fast-sfdc README

Standalone VSCode extension for fast development in the salesforce.com platform.
Built from scratch, no jsforce/salesforceDX dependencies, **LIGHTNING FAST!** ⚡️

## Features

![Command Palette](images/commands.png "Command Palette")

### NEW!!! 🔥 Metadata explorer 🔥

![Metadata Explorer](images/metadata-explorer.png "Metadata Explorer")

Explore Metadata in your org and download from Salesforce everything you need. The retrieved metadata will be automatically added to package.xml

### NEW!!! 🔥 Authorize an org via OAuth2 flow 🔥

You can now authorize your org both using the canonical user+pass+token method or using an OAuth2 flow. The OAuth2 flow is useful if you have enforced MFA using the high assurance requirement on the profile. In this case, the user+pass+token flow will not work anymore

### Deploy, Retrieve, Validate & Compile

Canonical deployment and retrieval of metadata based on your package.xml configuration is fully featured, but you can also deploy or retrieve single files/folders!
Compile on save for apex classes, Visualforce pages, triggers, Visualforce components, aura bundles and **lightning web components** is supported!

### Metadata Creation

Straightforward metadata creation and deployment for apex classes, Visualforce pages & components, triggers, aura bundles, and LWC.

#### Offline Field Creation

You can create most of the supported fields and set the Profile FLS directly from the `Create new...` command. No more endless metadata retrieval and insane hunk versioning of profiles! This functionality is highly inspired by the excellent [swift-sfdc](https://marketplace.visualstudio.com/items?itemName=tr4uma.swift-sfdc) extension of [tr4uma](https://github.com/tr4uma). Thanks, tr4uma for helping me to integrate this useful functionality

![Create New Field](images/create-new-field.gif "Create new field")

### Edit FLS directly from Profile or PermissionSet

Just open the Profile or PermissionSet and click on the codelen
![Edit FLS](images/edit-fls.png "Edit FLS")

### Destructive changesets

Deleting metadata from your org is just easy as right-clicking on the metadata in the file explorer

### Metadata Patching

`fast-sfdc` uses [sfdy](https://www.npmjs.com/package/sfdy) as the engine to deploy and retrieve metadata. Thanks to that, it supports a bunch of useful metadata patches (see [here](https://github.com/micheletriaca/sfdy#apply-standard-patches-to-metadata-after-retrieve))

To set up a `.sfdy.json` config in your project, just open the command palette and type `Fast-Sfdc: Init metadata patching`

### Static resource bundles

Handle your static resources as uncompressed folders. Just select the static resource you want to handle as folders:

![Command Palette](images/static-resources.png "Static Resource Configuration")

`fast-sfdc` will do the rest!

### Multi-org support

Store different credentials for fast org-switch and deploy when needed or in a hurry!

### Lightning Web Components

**Full support for lightning web components**: from their creation to their deployment!

### Execute Anonymous

Run your code snippets directly from VSCode. Buggy developer console is now a distant memory.

![Execute Anonymous](images/execute-anonymous.gif "Execute Anonymous")

### Run tests

Just open a test class and click on the codelen
![Tests](images/tests.png "Tests")

## Release Notes

See [here](CHANGELOG.md)
