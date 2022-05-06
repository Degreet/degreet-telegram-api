import { DegreetTelegram, Session } from '../index'
import { IContext, nextMiddleware } from '../src/types'
import config from 'config'

import subscription from './blocks/subcription.block'
import bonus from './blocks/bonus.block'

interface ISession {
  balance?: number
}

const token: string = config.get<string>('botToken')
const bot: DegreetTelegram<IContext> = new DegreetTelegram<IContext>(token)

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

bot.use(subscription)
bot.use(bonus)

bot.launch().then(() => {
  console.log(`started on @${bot.botInfo.username}`)
})