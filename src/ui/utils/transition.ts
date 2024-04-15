abstract class FixedTransition {
  protected interval: NodeJS.Timeout | undefined;
  protected fps = 60;
  protected duration: number;

  protected current: number;
  protected from: number;
  protected to: number;
  protected diff: number;
  protected frames: number;
  protected callback: (value: number) => void;

  protected newInterval(callback: () => void) {
    clearInterval(this.interval);
    this.interval = setInterval(callback, 1000 / this.fps);
  }

  protected abstract step(up: boolean): number;

  show(callend?: () => void) {
    this.newInterval(() => {
      this.current += this.step(true);
      if (this.current < this.to) {
        this.callback(this.current);
      } else {
        this.current = this.to;
        this.callback(this.current);
        clearInterval(this.interval);
        callend && callend();
      }
    });
  }

  hide(callend?: () => void) {
    this.newInterval(() => {
      this.current -= this.step(false);
      if (this.current > this.from) {
        this.callback(this.current);
      } else {
        this.current = this.from;
        this.callback(this.current);
        clearInterval(this.interval);
        callend && callend();
      }
    });
  }

  constructor(callback: (value: number) => void, duration: number, from: number, to: number, initial = true) {
    this.duration = duration;
    this.callback = callback;

    this.from = from;
    this.to = to;
    this.current = initial ? to : from;
    this.diff = (this.to - this.from);
    this.frames = (this.fps * this.duration)
  }
}

export class FixedLinearTransition extends FixedTransition {
  step(up: boolean) : number {
    return this.diff / this.frames;
  }
}

export class FixedSquaredTransition extends FixedTransition {
  c: number;
  c2: number;
  constructor(callback: (value: number) => void, duration: number, from: number, to: number, initial = true) {
    super(callback, duration, from, to, initial)
    this.c = Math.sqrt(this.diff) / this.frames;
    this.c2 = this.c * this.c;
  }
  step(up: boolean): number {
    if (up) {
      return Math.max(this.c2 + 2 * this.c * Math.sqrt(this.to - this.current), 0.01);
    } else {
      return Math.max(- this.c2 + 2 * this.c * Math.sqrt(this.current - this.from), 0.01);
    }
  }
}
