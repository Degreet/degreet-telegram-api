import { IHandler, middleware } from '../../types'

export class StepScene {
  name: string
  handlers: IHandler[] = []
  middlewares: (middleware)[] = []

  public use(...middlewares: middleware[]): void {
    this.middlewares.push(...middlewares)
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