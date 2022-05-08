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

    const text: string = `
🎲 +${ctx.session.dice.wins} : -${ctx.session.dice.fails}
🎯 ${ctx.session.darts.score}`

    const markup: Keyboard = new Keyboard('under_the_message')
      .btn('callback', '🎲 Drop Dice!', 'drop_dice')
      .btn('callback', '🎯 Darts!', 'drop_darts').row()

    try {
      await ctx.msg.edit(text, markup)
    } catch {
      await ctx.msg.sendPhoto(
        { photoPath: path.resolve(__dirname, 'mountain.jpg') },
        markup.setCaption(text)
      )
    }
  } catch (e: any) {
    console.error(e)
  }
})

export default layout