import { Block, Keyboard } from '../../index'
import { ICustomContext } from '../types'
import { Payment } from '../../src/creators'
import { IMAGE_URL } from '../constants'
import config from 'config'

const block: Block = new Block()

const offer = {
  livesCount: 690,
  discount: 20,
  sum: 100,
}

block.onClick('buy_lives', async (ctx: ICustomContext): Promise<any> => {
  try {
    try {
      await ctx.answer.delete()
    } catch {}

    const { livesCount, sum, discount } = offer

    await ctx.answer.send(
      new Payment()
        .setTitle(ctx.i18n?.get('buy_lives_offer', { livesCount })!)
        .setDescription(ctx.i18n?.get('buy_lives_offer', { livesCount })!)
        .setToken(config.get<string>('paymentToken'))
        .setCurrency('USD')
        .addItem(ctx.i18n?.get('buy_lives_offer', { livesCount })!, sum)
        .addDiscount('Discount', discount)
        .allowTips(5, [1, 3, 5])
        .needUserData(['email'])
        .setPhotoUrl(IMAGE_URL),
      new Keyboard('under_the_message')
        .btn('pay', ctx.i18n?.get('pay_btn')!).row()
        .useLayout('go_menu_btn')
    )
  } catch (e: any) {
    console.error(e)
  }
})

block.on('payment_answer', async (ctx: ICustomContext): Promise<any> => {
  try {
    await ctx.answer.payment(true)
  } catch (e: any) {
    console.error(e)
  }
})

block.on('successful_payment', async (ctx: ICustomContext): Promise<any> => {
  try {
    if (typeof ctx.session.lives === 'number') ctx.session.lives += offer.livesCount
    ctx.callLayout('menu')
  } catch (e: any) {
    console.error(e)
  }
})

export default block