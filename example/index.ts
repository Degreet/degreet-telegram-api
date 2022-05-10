import { Keyboard } from '../src/classes/Keyboard'
import { DegreetTelegram, Session } from '../index'
import { ICustomContext, ISession } from './types'
import config from 'config'

import menuLayout from './layouts/menu.layout'
import diceBlock from './blocks/dice.block'

const token: string = config.get<string>('botToken')
const bot: DegreetTelegram<ICustomContext> = new DegreetTelegram<ICustomContext>(token)

new Keyboard('under_the_message')
  .btn('callback', 'Go to menu', 'menu').row()
  .saveLayout('go_menu_btn')

bot.use(new Session<ISession>().middleware())
bot.use(menuLayout)
bot.use(diceBlock)

bot.onClick('menu', (ctx: ICustomContext): any => ctx.callLayout('menu'))
bot.command('start', (ctx: ICustomContext): any => ctx.callLayout('menu'))

bot.start().then((): void => {
  console.log(`Bot started on @${bot.info.username}`)
})