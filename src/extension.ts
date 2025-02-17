import * as vscode from 'vscode';
import * as net from 'net';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('cadwork-python-runner.runPythonCode', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const code = document.getText();
            await sendCodeToCadwork(code);
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}

async function sendCodeToCadwork(code: string) {
    return new Promise<void>((resolve, reject) => {
        const client = new net.Socket();
        client.connect(9999, 'localhost', () => {
            client.write(code);
            client.end();
        });

        client.on('data', (data) => {
            vscode.window.showInformationMessage(data.toString());
            resolve();
        });

        client.on('error', (err) => {
            vscode.window.showErrorMessage(`Failed to send code to cadwork: ${err.message}`);
            reject(err);
        });

        client.on('close', () => {
            resolve();
        });
    });
}