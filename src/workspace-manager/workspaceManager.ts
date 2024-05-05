import { Folder, Page } from "@src/database/model"
import { PubSub } from "@src/pubSub"

export class WorkspaceManager {

  pubSub = PubSub.getInstance()

  queue: (() => Promise<void> | void)[] = []
  executing = false

  constructor() {
    this.pubSub.subscribe("change-page-folder", (child: number, parent: number | null) => {
      console.log("change page folder", child, parent)
    })

    this.pubSub.subscribe("change-folder-folder", (child: number, parent: number | null) => {
      console.log("change folder folder", child, parent)
    })
    this.addToQueue(this.init)
  }

  async init() {

  }

  addToQueue(foo: typeof this.queue[number]) {
    this.queue.unshift(foo)
    this.executeQueue()
  }

  async executeQueue() {
    if (this.executing) return
    while (true) {
      const foo = this.queue.pop()
      if (!foo) break
      await foo()
    }
    this.executing = false
  }
}