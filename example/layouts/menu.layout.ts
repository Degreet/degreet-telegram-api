import { Layout, Keyboard, Options } from '../../index'
import { Photo } from '../../src/creators'
import { ICustomContext } from '../types'
import { FREE_LIVES, IMAGE_URL } from '../constants'

const layout: Layout = new Layout('menu', async (ctx: ICustomContext): Promise<any> => {
  try {
    if (!ctx.session.score) ctx.session.score = 0
    if (typeof ctx.session.lives !== 'number') ctx.session.lives = FREE_LIVES

    const text: string | undefined = ctx.i18n?.get('menu', {
      score: ctx.session.score,
      lives: ctx.session.lives,
    })

    const keyboard: Keyboard = new Keyboard('under_the_message')
      .btn('callback', '🎲', 'dice')
      .btn('callback', '🎯', 'darts')
      .btn('callback', '🏀', 'basketball')
      .row()
      .btn('callback', ctx.i18n?.get('buy_lives_btn')!, 'buy_lives')
      .row()

    try {
      await ctx.answer.edit(text, keyboard)
    } catch {
      await ctx.answer.send(
        new Photo('url', IMAGE_URL),
        keyboard,
        new Options().setCaption(text)
      )
    }
  } catch (e: any) {
    console.error(e)
  }
})

export default layout