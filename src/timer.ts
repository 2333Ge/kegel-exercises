import dayjs from "dayjs";

export default class Timer {
  /**每日几时几分(如:14:33表示的是每日14时33分) */
  _dayTime: string;
  _doSomeThine: () => void;
  _interval?: ReturnType<typeof setInterval>;
  _timeOut?: ReturnType<typeof setTimeout>;

  constructor(dayTime: string, doSomeThine: () => void) {
    this._dayTime = dayTime;
    this._doSomeThine = doSomeThine;
  }

  get remainSeconds() {
    const [hour, minute] = this._dayTime.split(":").map(Number);
    const now = dayjs();
    const targetTime = now.hour(hour).minute(minute).second(0);
    const diff = now.diff(targetTime, "second");
    return diff;
  }

  start() {
    this._interval = setInterval(() => {
      if (this.remainSeconds < 60 && this.remainSeconds >= 0) {
        clearTimeout(this._timeOut);
        this._timeOut = setTimeout(() => {
          this._doSomeThine();
        }, this.remainSeconds * 1000);
      }
    }, 1000 * 60);
  }

  dispose() {
    clearTimeout(this._timeOut);
    clearInterval(this._interval);
  }
}
