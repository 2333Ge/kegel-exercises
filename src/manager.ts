import * as vscode from "vscode";
import Timer from "./timer";

export default class Manager {
  _timer?: Timer;
  _interval?: ReturnType<typeof setInterval>;
  _statusBar: vscode.StatusBarItem;
  _status: "waiting" | "doing" | "pausing" | "done" = "waiting";
  _repeatCounts: number = 0;

  constructor() {
    this._statusBar = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right
    );
    this._statusBar.text = "纲宝";
    this._statusBar.command = "kegel-exercises.pauseTimer";
    this._statusBar.show();
    this._timer = new Timer(
      loadConfig("knockTime", "23:30"),
      this.doKelgel,
      this.reset
    );
  }

  public showQuickPick() {
    const picker = this._status !== "doing" ? ["开始"] : ["暂停", "结束"];

    vscode.window
      .showQuickPick(picker, {
        canPickMany: false,
        placeHolder: "纲宝",
      })
      .then((res) => {
        if (res === "开始") {
          if (this._status === "pausing") {
            this._status = "doing";
          } else {
            this._status = "waiting";
            this.doKelgel();
          }
        }
        if (res === "暂停") {
          this._status = "pausing";
        }
        if (res === "结束") {
          this._status = "done";
          this.reset("纲包：已结束");
        }
      });
  }

  doKelgel() {
    if (this._status === "done") return;
    this.reset();
    let countdown = 5;
    let status: "focus" | "relax" = "focus";
    this._status = "doing";
    this._interval = setInterval(() => {
      if (this._status === "pausing") {
        return;
      }
      if (this._repeatCounts >= 60) {
        this._repeatCounts = 0;
        this.reset("纲包：已完成");
        return;
      }

      if (status === "relax") {
        this._statusBar.text = `呼气: ${countdown}s`;
        countdown--;
        if (countdown <= 0) {
          countdown = 5;
          status = "focus";
          this._repeatCounts++;
        }
      } else {
        this._statusBar.text = `吸气: ${countdown}s`;
        countdown--;
        if (countdown <= 0) {
          countdown = 2;
          status = "relax";
        }
      }
    }, 1000);
  }

  reset(text?: string) {
    this._status = "waiting";
    this._statusBar.text = text || `纲宝`;
    clearInterval(this._interval);
    this._timer?.dispose();
  }

  public dispose() {
    this.reset();
    this._timer?.dispose();
  }

  public onConfigChange(e: vscode.ConfigurationChangeEvent) {
    if (e.affectsConfiguration("kegel-exercises.knockTime")) {
      this.reset();
      this._timer = new Timer(
        loadConfig("knockTime", "23:30"),
        this.doKelgel,
        this.reset
      );
    }
  }
}

function loadConfig(key: "knockTime", defaultValue: any) {
  return vscode.workspace
    .getConfiguration("kegel-exercises")
    .get(key, defaultValue);
}
