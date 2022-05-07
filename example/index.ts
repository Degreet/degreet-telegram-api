import { DegreetTelegram, Session, StepScene } from '../index'
import { IContext, nextMiddleware } from '../src/types'
import config from 'config'

import subscription from './blocks/subcription.block'
import bonus from './blocks/bonus.block'

interface ISession {
  balance?: number
}

const token: string = config.get<string>('botToken')
const bot: DegreetTelegram<IContext> = new DegreetTelegram<IContext>(token)

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

bot.launch().then(() => {
  console.log(`started on @${bot.botInfo.username}`)
})