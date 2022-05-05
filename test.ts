import { DegreetTelegram } from './index'
import { IContext, nextMiddleware } from './src/interfaces'
import { Session } from './src/classes/Session'
import config from 'config'

interface ICustomContext extends IContext {
  counter?: number
}

interface ISession {
  testProp?: string
}

const token: string = config.get<string>('botToken')
const bot: DegreetTelegram<ICustomContext> = new DegreetTelegram<ICustomContext>(token)

bot.use(new Session<ISession>().middleware())

bot.use(async (ctx: ICustomContext, next: nextMiddleware): Promise<void> => {
  console.log('global middleware worked')
  ctx.props.custom = 'Hello, world!'
  ctx.session.counter = ctx.session.counter + 1 || 1
  next()
})

bot.command('start', async (ctx: ICustomContext): Promise<void> => {
  try {
    await ctx.msg.send('Hello!')
    console.log(ctx.props.custom)
    console.log(ctx.session)
  } catch (e: any) {
    console.error(e)
  }
})

bot.on(
  'text',
  async (ctx: ICustomContext, next: nextMiddleware): Promise<void> => {
    console.log('middleware worked')
    next()
  },
  async (ctx: ICustomContext): Promise<void> => {
    try {
      await ctx.msg.send(ctx.msg.text)
    } catch (e: any) {
      console.error(e)
    }
  }
)

bot.launch().then(() => {
  console.log(`started on @${bot.botInfo.username}`)
})