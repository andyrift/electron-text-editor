export class PubSub {

  private static _instance: PubSub

  static getInstance(): PubSub {
    if (this._instance) return this._instance
    this._instance = new this()
    return this._instance
  }

  channels: { [id: string] : Array<Function> } = {}

  emit(event: string, ...args: any[]) {
    if (this.channels[event]) {
      this.channels[event].forEach(callback => {
        callback(...args)
      })
    }
  }

  subscribe(event: string, callback: Function) {
    if (!this.channels[event]) this.channels[event] = []
    this.channels[event].push(callback)
  }

  static subscribe(event: string, callback: Function) {
    let instance = this.getInstance()
    instance.subscribe(event, callback)
  }
}