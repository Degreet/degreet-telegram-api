import { DegreetTelegram, Session } from './index'
import { IContext, nextMiddleware } from './src/types'
import { Markup } from './src/classes/Markup'
import config from 'config'

interface IProps extends IContext {
  custom?: string
}

interface ISession {
  counter?: string
}

const token: string = config.get<string>('botToken')
const bot: DegreetTelegram<IProps> = new DegreetTelegram<IProps>(token)

bot.use(new Session<ISession>().middleware())

bot.use(async (ctx: IContext, next: nextMiddleware): Promise<void> => {
  console.log('global middleware worked')
  ctx.props.custom = 'Hello, world!'
  ctx.session.counter = ctx.session.counter + 1 || 1
  ctx.api.send(ctx.from?.id, 'hello')
  next()
})

bot.command('start', async (ctx: IContext): Promise<void> => {
  try {
    await ctx.msg.send(
      'Hello!',
      new Markup('inline')
        .btn('callback', 'TestButton', 'test_btn').row()
        .btn('callback', 'test2', 'test2').btn('cb', 'test3', 'test3').row()
    )

    console.log(ctx.props.custom)
    console.log(ctx.session)
    console.log(ctx.params)
  } catch (e: any) {
    console.error(e)
  }
})

bot.on(
  'test_btn',
  async (ctx: IContext): Promise<void> => {
    try {
      console.log(ctx)
      await ctx.msg.edit('nice')
      ctx.msg.alert('hi')
    } catch (e: any) {
      console.error(e)
    }
  }
)

bot.on('test2', async (ctx: IContext): Promise<void> => {
  try {
    await ctx.msg.editMarkup(
      new Markup('inline')
        .btn('cb', 'hello', 'hello').row()
    )
  } catch (e: any) {
    console.error(e)
  }
})

bot.listen('hello world', async (ctx: IContext) => {
  try {
    await ctx.msg.send('Hello, world!')
  } catch (e: any) {
    console.error(e)
  }
})

bot.on(
  'text',
  async (ctx: IContext, next: nextMiddleware): Promise<void> => {
    console.log('middleware worked')
    next()
  },
  async (ctx: IContext): Promise<void> => {
    try {
      await ctx.msg.send(ctx.msg.text, new Markup('remove'))
    } catch (e: any) {
      console.error(e)
    }
  }
)

bot.launch().then(() => {
  console.log(`started on @${bot.botInfo.username}`)
})