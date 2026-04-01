"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const https = require("https");
function activate(context) {
    let outputChannel = vscode.window.createOutputChannel("CodeSentinel");
    let reviewCommand = vscode.commands.registerCommand('codesentinel.reviewFile', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found.');
            return;
        }
        const config = vscode.workspace.getConfiguration('codesentinel');
        const apiKey = config.get('apiKey');
        const apiUrl = config.get('apiUrl') || 'https://ais-dev-23dbf7rsf5fmizqmxr53o2-335762143281.asia-east1.run.app';
        if (!apiKey) {
            vscode.window.showErrorMessage('CodeSentinel API Key not set. Use "CodeSentinel: Set API Key" command.');
            return;
        }
        const document = editor.document;
        const code = document.getText();
        const fileName = document.fileName.split(/[\\/]/).pop() || 'file.txt';
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "CodeSentinel: Reviewing code...",
            cancellable: false
        }, async (progress) => {
            try {
                const result = await performReview(apiUrl, apiKey, code, fileName);
                displayResults(outputChannel, result);
            }
            catch (err) {
                vscode.window.showErrorMessage(`CodeSentinel Review Failed: ${err.message}`);
            }
        });
    });
    let setApiKeyCommand = vscode.commands.registerCommand('codesentinel.setApiKey', async () => {
        const key = await vscode.window.showInputBox({
            prompt: 'Enter your CodeSentinel API Key',
            password: true,
            placeHolder: 'cs_...'
        });
        if (key) {
            await vscode.workspace.getConfiguration('codesentinel').update('apiKey', key, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage('CodeSentinel API Key updated successfully.');
        }
    });
    context.subscriptions.push(reviewCommand, setApiKeyCommand);
}
exports.activate = activate;
async function performReview(apiUrl, apiKey, code, fileName) {
    return new Promise((resolve, reject) => {
        const url = new URL(`${apiUrl}/api/review`);
        const options = {
            hostname: url.hostname,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey
            }
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(JSON.parse(data).review);
                }
                else {
                    const error = JSON.parse(data).error || 'Unknown error';
                    reject(new Error(error));
                }
            });
        });
        req.on('error', (err) => reject(err));
        req.write(JSON.stringify({ code, fileName }));
        req.end();
    });
}
function displayResults(outputChannel, review) {
    outputChannel.clear();
    outputChannel.show();
    outputChannel.appendLine("=== CodeSentinel AI Review Results ===");
    outputChannel.appendLine("");
    if (review.issues.length === 0) {
        outputChannel.appendLine("✅ No major issues detected! Your code looks great.");
    }
    else {
        review.issues.forEach((issue, index) => {
            outputChannel.appendLine(`[${index + 1}] ${issue.severity.toUpperCase()}: ${issue.title}`);
            outputChannel.appendLine(`Line: ${issue.line}`);
            outputChannel.appendLine(`Description: ${issue.description}`);
            if (issue.cve)
                outputChannel.appendLine(`CVE: ${issue.cve}`);
            if (issue.fix) {
                outputChannel.appendLine("AI Suggested Fix:");
                outputChannel.appendLine(issue.fix);
            }
            outputChannel.appendLine("---------------------------------------");
        });
    }
}
function deactivate() { }
exports.deactivate = deactivate;
