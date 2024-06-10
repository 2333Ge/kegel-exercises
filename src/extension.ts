import * as vscode from "vscode";
import Manager from "./manager";

let manager: Manager;

export function activate(context: vscode.ExtensionContext) {
  manager = new Manager();

  context.subscriptions.push(
    vscode.commands.registerCommand("kegel-exercises.pauseTimer", () => {
      manager.pauseOrRestart();
    }),
    vscode.workspace.onDidChangeConfiguration((e) => {
      manager.onConfigChange(e);
    })
  );
}

export function deactivate() {
  manager.dispose();
}
