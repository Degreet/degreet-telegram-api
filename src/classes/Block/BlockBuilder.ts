import { eventType, IHandler, middleware } from '../../types'

export class BlockBuilder {
  handlers: IHandler[] = []
  middlewares: (middleware)[] = []

  public use(...middlewares: middleware[]): void {
    this.middlewares.push(...middlewares)
  }

  public on(events: eventType[] | eventType, ...handlers: middleware[]): void {
    const saveHandler = (event: eventType): void => {
      const listenEntities: string[] = typeof event === 'string' ? event.split(':') : []

      this.handlers.push({
        event: event instanceof RegExp ? event : listenEntities.shift(),
        type: 'event',
        listenEntities,
        middlewares: handlers,
      })
    }

    if (events instanceof Array) events.forEach(saveHandler)
    else saveHandler(events)
  }

  public onClick(actions: string[] | string, ...handlers: middleware[]): void {
    const saveHandler = (action: string): void => {
      this.handlers.push({
        event: action,
        type: 'button_click',
        middlewares: handlers,
      })
    }

    if (actions instanceof Array) actions.forEach(saveHandler)
    else saveHandler(actions)
  }

  public listen(texts: string[] | string, ...handlers: middleware[]): void {
    const saveHandler = (text: string): void => {
      this.handlers.push({
        text,
        type: 'event',
        event: 'text',
        middlewares: handlers,
      })
    }

    if (texts instanceof Array) texts.forEach(saveHandler)
    else saveHandler(texts)
  }

  public command(commands: string[] | string, ...handlers: middleware[]): void {
    const saveHandler = (text: string): void => {
      this.handlers.push({
        text,
        type: 'command',
        middlewares: handlers,
      })
    }

    if (commands instanceof Array) commands.forEach(saveHandler)
    else saveHandler(commands)
  }
}