import * as vscode from "vscode";
import Timer from "./timer";

export default class Manager {
  _timer: Timer;
  _interval?: ReturnType<typeof setInterval>;
  _statusBar: vscode.StatusBarItem;
  _pausing: boolean = false;
  _repeatCounts: number = 0;

  constructor() {
    this._timer = new Timer(loadConfig("knockTime", "23:30"), this.doKelgel);
    this._statusBar = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left
    );
    this._statusBar.text = "肛宝";
    this._statusBar.command = "kegel-exercises.pauseTimer";
    this._statusBar.show();
  }

  doKelgel() {
    let countdown = 5;
    let status: "focus" | "relax" = "focus";

    this._interval = setInterval(() => {
      if (this._pausing) {
        return;
      }
      if (this._repeatCounts >= 60) {
        this._repeatCounts = 0;
        this.complete();
        return;
      }

      if (status === "relax") {
        this._statusBar.text = `放松: ${countdown}s`;
        countdown--;
        if (countdown <= 0) {
          countdown = 5;
          status = "focus";
          this._repeatCounts++;
        }
      } else {
        this._statusBar.text = `夹紧: ${countdown}s`;
        countdown--;
        if (countdown <= 0) {
          countdown = 2;
          status = "focus";
        }
      }
    }, 1000);
  }

  onConfigChange(e: vscode.ConfigurationChangeEvent) {
    clearInterval(this._interval);
    if (e.affectsConfiguration("kegel-exercises.knockTime")) {
      this._timer.dispose();
      this._timer = new Timer(loadConfig("knockTime", "18:30"), this.doKelgel);
      this._statusBar.text = "肛宝";
    }
  }

  pauseOrRestart() {
    this._pausing = !this._pausing;
  }

  complete() {
    this._statusBar.text = `完成`;
    clearInterval(this._interval);
  }

  dispose() {
    this.complete();
    this._timer.dispose();
  }
}

function loadConfig(key: "knockTime", defaultValue: any) {
  return vscode.workspace
    .getConfiguration("kegel-exercises")
    .get(key, defaultValue);
}

/**
 * 状态栏悬浮提示倒计时等
 *
 *
 */
