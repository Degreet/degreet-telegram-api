import { IContext, middleware, middlewareArgs } from '../../types'

export class Layout {
  name: string
  handler: middlewareArgs

  constructor(name: string, handler: middlewareArgs) {
    this.name = name
    this.handler = handler
  }

  public static layoutCaller(name: string, ...args: any[]): middleware {
    return (ctx: IContext): any => ctx.callLayout(name, ...args)
  }
}