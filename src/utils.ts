import * as vscode from "vscode";

type IConfigKey = "knockTime" | "alertTip";

export function loadConfig(key: IConfigKey, defaultValue: any) {
  return vscode.workspace
    .getConfiguration("kegel-exercises")
    .get(key, defaultValue);
}

export function setConfig(key: IConfigKey, value: any) {
  return vscode.workspace
    .getConfiguration("kegel-exercises")
    .update(key, value, true);
}
