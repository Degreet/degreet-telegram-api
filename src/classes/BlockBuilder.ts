import { IHandler, middleware } from '../types'

export class BlockBuilder {
  handlers: IHandler[] = []
  middlewares: (middleware)[] = []

  public use(...middlewares: middleware[]): void {
    this.middlewares.push(...middlewares)
  }

  public on(event: string | RegExp, ...handlers: middleware[]): void {
    const listenEntities: string[] = typeof event === 'string' ? event.split(':') : []

    this.handlers.push({
      event: event instanceof RegExp ? event : listenEntities.shift(),
      type: 'event',
      listenEntities,
      middlewares: handlers,
    })
  }

  public listen(text: string, ...handlers: middleware[]): void {
    this.handlers.push({
      text,
      type: 'event',
      event: 'text',
      middlewares: handlers,
    })
  }

  public command(text: string, ...handlers: middleware[]): void {
    this.handlers.push({
      text,
      type: 'command',
      middlewares: handlers,
    })
  }
}