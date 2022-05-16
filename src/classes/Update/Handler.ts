import { eventHint, IContext, IEntity, IHandler, IUpdate, middleware, nextMiddleware, scene } from '../../types'
import { Context } from '../Context/Context'
import { SceneController } from '../Scenes/SceneController'
import { Layout } from '../Block/Layout'

export class Handler<T> {
  sceneController: SceneController
  scenes: scene[] = []
  layouts: Layout[] = []
  handlers: IHandler[] = []
  middlewares: middleware[] = []

  constructor(sceneController: SceneController, scenes: scene[], layouts: Layout[], handlers: IHandler[], middlewares: middleware[]) {
    this.sceneController = sceneController
    this.scenes = scenes
    this.layouts = layouts
    this.handlers = handlers
    this.middlewares = middlewares
  }

  private getAvailableHandlers(userId?: number): IHandler[] {
    if (this.sceneController.getActiveScene(userId)) {
      const scene = this.scenes.find((scene: scene) => (
        scene.name === this.sceneController.getActiveScene(userId)
      ))

      if (!scene) {
        return this.handlers
      } else {
        return scene.handlers
      }
    } else {
      return this.handlers
    }
  }

  private static getEvents(update: IUpdate) {
    const events: (eventHint | void)[] = []

    if (update.message) {
      events.push('message')

      if (update.message.text) {
        events.push('text')
      }

      if (update.message.new_chat_member) {
        events.push('new_chat_member')
      } else if (update.message.left_chat_member) {
        events.push('left_chat_member')
      } else if (update.message.dice) {
        events.push('dice')
      } else if (update.message.location) {
        events.push('location')
      } else if (update.message.contact) {
        events.push('contact')
      } else if (update.message.photo) {
        events.push('photo')
      } else if (update.message.invoice) {
        events.push('payment')
      } else if (update.message.successful_payment) {
        events.push('successful_payment')
      } else if (update.message.forward_from_chat) {
        events.push('forward')
      } else if (update.message.video) {
        events.push('video')
      } else if (update.message.video_note) {
        events.push('video_note')
      } else if (update.message.document) {
        events.push('document')
      }
    } else if (update.chat_join_request) {
      events.push('join_request')
    } else if (update.edited_message) {
      events.push('edit')
    } else if (update.chat_member) {
      events.push('chat_member_update')
    } else if (update.pre_checkout_query) {
      events.push('payment_answer')
    } else if (update.poll) {
      events.push('poll')
    } else if (update.channel_post) {
      events.push('post')
    } else if (update.edited_channel_post) {
      events.push('post_edit')
    } else if (update.inline_query) {
      events.push('inline_query')
    } else if (update.chosen_inline_query) {
      events.push('inline_query_chose')
    } else if (update.shipping_query) {
      events.push('shipping_query')
    } else if (update.my_chat_member) {
      events.push('user_status_update')
    }

    return events
  }

  public async handleUpdate(update: IUpdate): Promise<void> {
    const events: (eventHint | void)[] = Handler.getEvents(update)

    let handlers: IHandler[] = []
    const entities: IEntity[] | void = update.message?.entities

    const ctx: IContext = new Context<T>(update, this.sceneController, this.layouts)
    const userId: number | undefined = ctx.sender?.id
    const availableHandlers: IHandler[] = this.getAvailableHandlers(userId)

    const commandEntities: IEntity[] | void = entities?.filter(
      (entity: IEntity): boolean => entity.type === 'bot_command')

    if (commandEntities && commandEntities.length) {
      commandEntities.forEach((entity: IEntity): void => {
        handlers = [
          ...handlers,
          ...availableHandlers.filter((handler: IHandler): boolean => {
            if (handler.type !== 'command') return false
            if (!update.message?.text) return false
            return update.message.text.slice(entity.offset + 1, entity.length) === handler.text
          })
        ]
      })
    } else if (update.callback_query) {
      handlers = availableHandlers.filter((handler: IHandler): boolean => {
        if (handler.type === 'button_click' && handler.event instanceof RegExp) {
          const match: RegExpMatchArray | null | undefined =
            update.callback_query?.data.match(handler.event)
          if (!match) return false

          ctx.matchParams = match
          return true
        } else {
          return handler.type === 'button_click' && update.callback_query?.data === handler.event
        }
      })
    } else if (events.includes('message') && this.sceneController.getActiveScene(userId)) {
      const activeScene: string | null = this.sceneController.getActiveScene(userId)

      if (activeScene) {
        const scene: scene | undefined = this.scenes.find((scene: scene) => (
          scene.name === this.sceneController.getActiveScene(userId)
        ))

        if (scene && scene.handlers.length) {
          const activeIndex: number | null = this.sceneController.getActiveIndex(userId)
          if (!activeIndex) return

          const middleware = scene.handlers[0].middlewares[activeIndex]
          if (!middleware) return

          middleware(ctx, () => {})
        }
      }
    } else {
      function defaultHandlers() {
        handlers = availableHandlers.filter((handler: IHandler): boolean => (
          handler.type === 'event' && handler.event === 'text' && handler.text === update.message?.text
        ))

        if (!handlers || !handlers.length) {
          handlers = availableHandlers.filter((handler: IHandler): boolean => (
            handler.type === 'event' && typeof handler.event === 'string' &&
            events.includes(handler.event) && !handler.text && !handler.listenEntities?.length
          ))
        }
      }

      if (entities && entities.length) {
        handlers = availableHandlers.filter((handler: IHandler): boolean => (
          handler.type === 'event' && handler.event === 'message' &&
          !!handler.listenEntities?.find((entityType: string): boolean => (
            !!entities.find((entity: IEntity): boolean => entity.type === entityType)
          ))
        ))

        if (!handlers || !handlers.length) defaultHandlers()
      } else {
        defaultHandlers()
      }
    }

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
}