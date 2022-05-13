import { Layout, Keyboard, Options } from '../../index'
import { ICustomContext } from '../types'
import * as path from 'path'

const layout: Layout = new Layout('menu', async (ctx: ICustomContext): Promise<any> => {
  try {
    if (!ctx.session.score) ctx.session.score = 0

    const text: string | undefined = ctx.i18n?.get('menu', {
      score: ctx.session.score
    })

    const keyboard: Keyboard = new Keyboard('under_the_message')
      .btn('callback', '🎲', 'dice')
      .btn('callback', '🎯', 'darts')
      .btn('callback', '🏀', 'basketball')
      .row()

    try {
      await ctx.answer.edit(text, keyboard)
    } catch {
      await ctx.answer.sendPhoto(
        { photoPath: path.resolve(__dirname, 'mountain.jpg') },
        keyboard,
        new Options().setCaption(text)
      )
    }
  } catch (e: any) {
    console.error(e)
  }
})

export default layout