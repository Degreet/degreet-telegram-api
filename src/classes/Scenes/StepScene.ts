import { IHandler, middleware } from '../../types'

export class StepScene {
  name: string
  handlers: IHandler[] = []
  middlewares: (middleware)[] = []
  onLeaveHandler: middleware

  public use(...middlewares: middleware[]): void {
    this.middlewares.push(...middlewares)
  }

  public onLeave(handler: middleware): void {
    this.onLeaveHandler = handler
  }

  constructor(name: string, ...handlers: middleware[]) {
    this.name = name

    this.handlers.push({
      type: 'event',
      event: 'message',
      middlewares: handlers,
    })
  }
}