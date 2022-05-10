import { Layout, Keyboard } from '../../index'
import { ICustomContext } from '../types'
import * as path from 'path'

const layout: Layout = new Layout('menu', async (ctx: ICustomContext): Promise<any> => {
  try {
    if (!ctx.session.dice) {
      ctx.session.dice = { wins: 0, fails: 0 }
    }

    if (!ctx.session.darts) {
      ctx.session.darts = { score: 0 }
    }

    const text: string | undefined = ctx.i18n?.get('menu', {
      diceWins: ctx.session.dice.wins,
      diceFails: ctx.session.dice.fails,
      dartsScore: ctx.session.darts.score,
    })

    const keyboard: Keyboard = new Keyboard('under_the_message')
      .btn('callback', ctx.i18n?.get('drop_dice_btn')!, 'drop_dice')
      .btn('callback', ctx.i18n?.get('drop_darts_btn')!, 'drop_darts')
      .row()

    try {
      await ctx.msg.edit(text, keyboard)
    } catch {
      await ctx.msg.sendPhoto(
        { photoPath: path.resolve(__dirname, 'mountain.jpg') },
        keyboard.setCaption(text)
      )
    }
  } catch (e: any) {
    console.error(e)
  }
})

export default layout