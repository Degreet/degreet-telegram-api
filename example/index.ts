import { DegreetTelegram, Session, StepScene } from '../index'
import { IContext, nextMiddleware } from '../src/types'
import config from 'config'

import subscription from './blocks/subcription.block'
import bonus from './blocks/bonus.block'
import { Layout } from '../src/classes/Layout'
import { Markup } from '../src/classes/Markup'

interface ISession {
  balance?: number
}

const token: string = config.get<string>('botToken')
const bot: DegreetTelegram<IContext> = new DegreetTelegram<IContext>(token)

new Markup('inline')
  .btn('cb', 'text', 'action').row()
  .saveLayout('test')

const scene = new StepScene(
  'test',
  async (ctx: IContext): Promise<any> => {
    try {
      await ctx.msg.send('enter your name')
      ctx.scene.next()
    } catch (e: any) {
      console.error(e)
    }
  },
  async (ctx: IContext): Promise<any> => {
    try {
      console.log(ctx)
      ctx.scene.leave()
      ctx.callLayout('menu')
    } catch (e: any) {
      console.error(e)
    }
  },
)

async function setupSession(ctx: IContext, next: nextMiddleware): Promise<any> {
  try {
    if (!ctx.session?.balance) ctx.session.balance = 0
    return next()
  } catch (e: any) {
    console.error(e)
  }
}

bot.use(new Session<ISession>().middleware())
bot.use(setupSession)
bot.use(scene)

bot.use(subscription)
bot.use(bonus)

bot.on(/test_(.*)/, async (ctx) => {
  console.log(ctx)
})

const layout = new Layout('menu', async (ctx: IContext): Promise<any> => {
  await ctx.msg.send('layout')
})

bot.use(layout)

bot.launch().then(() => {
  console.log(`started on @${bot.botInfo.username}`)
})