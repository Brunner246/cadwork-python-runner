import * as vscode from "vscode";
import * as net from "net";

let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
  outputChannel = vscode.window.createOutputChannel("Cadwork Python Runner");
  context.subscriptions.push(outputChannel);

  let disposable = vscode.commands.registerCommand(
    "cadwork-python-runner.runPythonCode",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const document = editor.document;
        const code = document.getText();
        outputChannel.appendLine("------ Sending Code ------");
        outputChannel.show(true);

        try {
          await sendCodeToCadwork(code);
        } catch (error) {
          outputChannel.appendLine(`Error: ${error}`);
        }
      }
    }
  );

  context.subscriptions.push(disposable);
}

async function sendCodeToCadwork(code: string) {
  return new Promise<void>((resolve, reject) => {
    const client = new net.Socket();
    outputChannel.appendLine(`Attempting to connect to localhost:9999...`);

    client.connect(9999, "localhost", () => {
      outputChannel.appendLine("Connected to server");
      client.write(code);
      outputChannel.appendLine("Code sent to server");
      client.end();
    });

    client.on("data", (data) => {
      const response = data.toString();
      outputChannel.appendLine(`Received from server: ${response}`);
      vscode.window.showInformationMessage(response);
      resolve();
    });

    client.on("error", (err) => {
      const errorMessage = `Failed to send code to cadwork: ${err.message}`;
      outputChannel.appendLine(errorMessage);
      vscode.window.showErrorMessage(errorMessage);
      reject(err);
    });

    client.on("close", () => {
      outputChannel.appendLine("Connection closed");
      resolve();
    });
  });
}

export function deactivate() {
  outputChannel?.dispose();
}
