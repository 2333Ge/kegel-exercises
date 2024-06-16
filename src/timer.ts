import dayjs from "dayjs";

export default class Timer {
  /**每日几时几分(如:14:33表示的是每日14时33分) */
  _dayTime: string;
  _doSomeThing: () => void;
  _interval?: ReturnType<typeof setInterval>;
  _timeOut?: ReturnType<typeof setTimeout>;
  _done: boolean = false;
  _onNewDay: () => void;

  constructor(dayTime: string, doSomeThing: () => void, onNewDay: () => void) {
    this._dayTime = dayTime;
    this._doSomeThing = doSomeThing;
    this._onNewDay = onNewDay;
    this._startTimeChecker();
    this._doSomeThingIfTimeOk();
  }

  private get remainSeconds() {
    const [hour, minute] = this._dayTime.split(":").map(Number);
    const now = dayjs();
    const targetTime = now.hour(hour).minute(minute).second(0);
    const diff = targetTime.diff(now, "second");
    return diff;
  }

  private _startTimeChecker() {
    // todo: 能否不轮询，使用setTimeout， 可能跨天了
    this._interval = setInterval(() => {
      this._doSomeThingIfTimeOk();
      if (dayjs().hour() === 0 && dayjs().minute() === 0) {
        this._onNewDay();
      }
    }, 1000 * 60);
  }

  private _doSomeThingIfTimeOk() {
    if (this._done) {
      return;
    }
    if (this.remainSeconds < 60 && this.remainSeconds >= 0) {
      clearTimeout(this._timeOut);
      this._timeOut = setTimeout(() => {
        this._doSomeThing();
        this._done = true;
        clearInterval(this._interval);
      }, this.remainSeconds * 1000);
    }
  }

  public dispose() {
    clearTimeout(this._timeOut);
    clearInterval(this._interval);
  }
}
