import * as vscode from "vscode";
import Timer from "./timer";
import { loadConfig, setConfig } from "./utils";
import { ALERT_TIP, DEFAULT_KNOCK_TIME } from "./constant";

export default class Manager {
  private _timer?: Timer;
  private _interval?: ReturnType<typeof setInterval>;
  private _statusBar: vscode.StatusBarItem;
  private _status: "waiting" | "doing" | "pausing" | "done" = "waiting";
  private _repeatCounts: number = 0;

  constructor() {
    this._statusBar = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right
    );
    this._statusBar.text = "纲宝";
    this._statusBar.command = "kegel-exercises.pauseTimer";
    this._statusBar.show();
    this._initTimer();
  }

  public onConfigChange = (e: vscode.ConfigurationChangeEvent) => {
    if (e.affectsConfiguration("kegel-exercises.knockTime")) {
      this._reset();
      this._initTimer();
    }
  };

  public showQuickPick = () => {
    const pickerLabels = this._status !== "doing" ? ["开始"] : ["暂停", "结束"];
    pickerLabels.push("设置");
    vscode.window
      .showQuickPick(pickerLabels, {
        canPickMany: false,
        placeHolder: "纲宝",
      })
      .then((res) => {
        if (res === "开始") {
          if (this._status === "pausing") {
            this._status = "doing";
          } else {
            this._reset();
            this._doKelgel();
          }
        }
        if (res === "暂停") {
          this._status = "pausing";
        }
        if (res === "结束") {
          this._status = "done";
          this._reset("纲宝：已结束");
        }

        if (res === "设置") {
          this.showSettingPick();
        }
      });
  };

  private showSettingPick = () => {
    const pickerLabels = ["每日提醒时间", "弹窗文案"];

    vscode.window
      .showQuickPick(pickerLabels, {
        canPickMany: false,
        placeHolder: "纲宝",
      })
      .then((selection) => {
        if (selection === "每日提醒时间") {
          vscode.window
            .showInputBox({
              placeHolder: "请输入每日提醒时间(如 17:30)",
            })
            .then((value) => {
              setConfig("knockTime", value?.trim() || DEFAULT_KNOCK_TIME);
              this._reset();
              this._initTimer();
            });
        }
        if (selection === "弹窗文案") {
          vscode.window
            .showInputBox({
              placeHolder: "输入定时完成的提醒文案",
            })
            .then((value) => {
              setConfig("alertTip", value || ALERT_TIP);
            });
        }
      });
  };

  public dispose = () => {
    this._reset();
    this._timer?.dispose();
  };

  private showTimeConfirm = () => {
    vscode.window
      .showInformationMessage(loadConfig("alertTip", ALERT_TIP), "是的", "取消")
      .then((selection) => {
        if (selection === "是的") {
          this._doKelgel();
        }
      });
  };

  private _doKelgel = () => {
    // if (this._status === "done") return;
    this._reset();
    let countdown = 5;
    let status: "focus" | "relax" = "focus";
    this._status = "doing";
    this._interval = setInterval(() => {
      if (this._status === "pausing") {
        return;
      }
      if (this._repeatCounts >= 60) {
        this._repeatCounts = 0;
        this._reset("纲宝：已完成");
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
        this._statusBar.text = `吸气: ${countdown}s`;
        countdown--;
        if (countdown <= 0) {
          countdown = 2;
          status = "relax";
        }
      }
    }, 1000);
  };

  private _reset(statusText?: string) {
    this._status = "waiting";
    this._statusBar.text = statusText || `纲宝`;
    clearInterval(this._interval);
    this._timer?.dispose();
  }

  private _initTimer = () => {
    this._timer = new Timer(
      loadConfig("knockTime", DEFAULT_KNOCK_TIME),
      this.showTimeConfirm,
      this._reset
    );
  };
}
