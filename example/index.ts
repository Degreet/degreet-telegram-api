import { Markup } from '../src/classes/Markup'
import { DegreetTelegram, Session } from '../index'
import { ICustomContext, ISession } from './types'
import config from 'config'

import menuLayout from './layouts/menu.layout'
import diceBlock from './blocks/dice.block'

const token: string = config.get<string>('botToken')
const bot: DegreetTelegram<ICustomContext> = new DegreetTelegram<ICustomContext>(token)

new Markup('inline')
  .btn('callback', 'Go to menu', 'menu').row()
  .saveLayout('go_menu_btn')

bot.use(new Session<ISession>().middleware())
bot.use(menuLayout)
bot.use(diceBlock)

bot.on('menu', (ctx: ICustomContext): any => ctx.callLayout('menu'))
bot.command('start', (ctx: ICustomContext): any => ctx.callLayout('menu'))

bot.launch().then((): void => {
  console.log(`Bot started on @${bot.info.username}`)
})