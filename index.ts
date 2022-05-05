import { IChat, IContext, IEntity, IHandler, IUpdate, middleware, nextMiddleware } from './src/types'
import { updateConnectionUri } from './src/classes/TelegramMethods'
import { TELEGRAM_BOT_API } from './src/constants'
import { Context } from './src/classes/Context'
import { Session } from './src/classes/Session'
import axios from 'axios'

class DegreetTelegram<T extends IContext> {
  token: string
  connectionUri: string

  botInfo: IChat
  handlers: IHandler[] = []
  middlewares: middleware[] = []

  constructor(token: string) {
    this.token = token
    this.connectionUri = TELEGRAM_BOT_API + this.token
    updateConnectionUri(this.connectionUri)
  }

  private async fetch<T>(url: string): Promise<T> {
    const { data } = await axios.get(this.connectionUri + url)
    if (!data.ok) throw 'TelegramError'
    return data.result
  }

  private async *updateGetter(): AsyncIterableIterator<Promise<IUpdate[] | any>> {
    while (true) {
      const updates = await this.fetch<any>('/getUpdates')
      yield updates
    }
  }

  public use(...middlewares: middleware[]): void {
    this.middlewares.push(...middlewares)
  }

  public on(event: string, ...handlers: middleware[]): void {
    this.handlers.push({
      event,
      type: 'event',
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

  private async handleUpdate(update: IUpdate): Promise<void> {
    const events: (string | void)[] = []

    if (update.message) {
      events.push('message')

      if (update.message.text) {
        events.push('text')
      }
    }

    let handlers: IHandler[] = []
    const entities: IEntity[] | void = update.message?.entities

    const commandEntities: IEntity[] | void = entities?.filter(
      (entity: IEntity): boolean => entity.type === 'bot_command')

    if (commandEntities && commandEntities.length) {
      commandEntities.forEach((entity: IEntity): void => {
        handlers = [
          ...handlers,
          ...this.handlers.filter((handler: IHandler): boolean => {
            if (handler.type !== 'command') return false
            if (!update.message?.text) return false
            return update.message.text.slice(entity.offset + 1, entity.length) === handler.text
          })
        ]
      })
    } else if (update.callback_query) {
      handlers = this.handlers.filter((handler: IHandler): boolean => (
        handler.type === 'event' && update.callback_query?.data === handler.event
      ))
    } else {
      handlers = this.handlers.filter((handler: IHandler): boolean => (
        handler.type === 'event' && handler.event === 'text' && handler.text === update.message?.text
      ))

      console.log(handlers, this.handlers)

      if (!handlers || !handlers.length) {
        handlers = this.handlers.filter((handler: IHandler): boolean => (
          handler.type === 'event' && events.includes(handler.event) && !handler.text
        ))
      }
    }

    const ctx: IContext = new Context<T>(update)

    function passMiddlewares() {
      handlers.forEach((handler: IHandler): void => {
        handler.middlewares[0](ctx, getNextHandler(handler.middlewares, 1))
      })
    }

    const getNextHandler = (middlewares: middleware[], i: number): nextMiddleware => {
      return (): void => {
        if (!middlewares[i]) return passMiddlewares()
        middlewares[i](ctx, getNextHandler(middlewares, i + 1))
      }
    }

    if (this.middlewares.length) this.middlewares[0](ctx, getNextHandler(this.middlewares, 1))
    else passMiddlewares()
  }

  private async startPolling(): Promise<void> {
    for await (const updates of this.updateGetter()) {
      for (const update of updates) {
        await this.handleUpdate(update)
        await this.fetch<any>(`/getUpdates?offset=${update.update_id + 1}`)
      }
    }
  }

  public async launch(): Promise<any> {
    this.botInfo = await this.fetch<IChat>('/getMe')
    this.startPolling()
  }
}

export { DegreetTelegram, Context, Session }