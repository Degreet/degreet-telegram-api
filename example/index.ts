import { Keyboard } from '../src/classes/Extra/Keyboard'
import { DegreetTelegram, Session, I18n } from '../index'
import { ICustomContext, ISession } from './types'
import config from 'config'

import menuLayout from './layouts/menu.layout'
import diceBlock from './blocks/dice.block'
import shopBlock from './blocks/shop.block'
import * as path from 'path'

const token: string = config.get<string>('botToken')
const bot: DegreetTelegram<ICustomContext> = new DegreetTelegram<ICustomContext>(token)

new Keyboard('under_the_message', true)
  .btn('callback', 'menu_btn', 'menu').row()
  .saveLayout('go_menu_btn')

const i18n: I18n = new I18n(
  path.resolve(__dirname, 'locales'),
  ['en']
)

bot.use(new Session<ISession>().middleware())
bot.use(i18n.middleware())
bot.use(menuLayout)
bot.use(shopBlock)
bot.use(diceBlock)

bot.onClick('menu', (ctx: ICustomContext): any => ctx.callLayout('menu'))
bot.command('start', (ctx: ICustomContext): any => ctx.callLayout('menu'))

bot.start().then((username: string): void => {
  console.log(`Bot started on @${username}`)
})