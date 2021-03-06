import { IContext, middleware, nextMiddleware, sessionItem } from '../types'

export class Session<T> {
  session: sessionItem<Partial<T>>[] = []

  middleware(): middleware {
    return (ctx: IContext, next: nextMiddleware): any => {
      const userId: number | void = ctx.sender?.id
      if (!userId) return next()

      let session: sessionItem<Partial<T>> | undefined = this.session.find(
        (item: sessionItem<Partial<T>>): boolean => item[0] === userId)

      if (!session) {
        const sessionItem: sessionItem<Partial<T>> = [userId, {}]
        this.session.push(sessionItem)
        session = sessionItem
      }

      ctx.session = session[1]
      return next()
    }
  }
}