export class PubSub {

  private static _instance: PubSub;

  static getInstance(): PubSub {
    if (this._instance) return this._instance;
    this._instance = new this();
    return this._instance;
  };

  private constructor() {
    
  }

  link: { [id: string] : Array<Function> } = {};

  emit(event: string, ...args: any[]) {
    if (this.link[event]) {
      this.link[event].forEach(callback => {
        callback(...args);
      });
    }
  }

  subscribe(event: string, callback: Function) {
    if (!this.link[event]) this.link[event] = [];
    this.link[event].push(callback);
  }

  static subscribe(event: string, callback: Function) {
    let instance = this.getInstance();
    if (!instance.link[event]) instance.link[event] = [];
    instance.link[event].push(callback);
  }
}