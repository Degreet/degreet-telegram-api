import { IContext, middleware } from '../../types'

export class Layout {
  name: string
  handler: middleware

  constructor(name: string, handler: middleware) {
    this.name = name
    this.handler = handler
  }

  public static layoutCaller(name: string): middleware {
    return (ctx: IContext): any => ctx.callLayout(name)
  }
}