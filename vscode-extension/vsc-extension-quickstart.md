# Welcome to your VS Code Extension

## What's in the folder

* This folder contains all of the files necessary for your extension.
* `package.json` - this is the manifest file in which you declare your extension and command.
  * The sample plugin registers a command and defines its title and command name. With this information VS Code can display the command in the command palette. It doesn't yet need to load the JS bundle of the extension.
* `extension.ts` - this is the main file where you will provide the implementation of your command.
  * The file exports one function, `activate`, which is called the very first time your extension is activated (in this case by executing the command).
  * Inside the `activate` function we call `registerCommand` to create the implementation of the command with the commandId we declared in `package.json`.
* `tsconfig.json` - configuration for the TypeScript compiler.

## Get up and running straight away

* Press `F5` to open a new window with your extension loaded.
* Run your command from the command palette by pressing (`Ctrl+Shift+P` or `Cmd+Shift+P` on Mac) and typing `CodeSentinel: Review Current File`.
* Set your breakpoints in your code inside `extension.ts` to debug your extension.
* Find output from your extension in the debug console.

## Make changes

* You can relaunch the extension from the debug toolbar after changing code in `extension.ts`.
* You can also reload (`Ctrl+R` or `Cmd+R` on Mac) the VS Code window with your extension to load your changes.

## Install your extension

* To use your extension in your daily workflow, copy the extension folder to your local extensions folder:
  * **Windows**: `%USERPROFILE%\.vscode\extensions`
  * **macOS/Linux**: `~/.vscode/extensions`
* Alternatively, you can package your extension into a `.vsix` file using `vsce`:
  * `npm install -g @vscode/vsce`
  * `vsce package`
  * Then install the `.vsix` file in VS Code.
