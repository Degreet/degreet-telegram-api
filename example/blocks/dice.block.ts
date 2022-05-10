import { Block, Keyboard } from '../../index'
import { ICustomContext } from '../types'
import { IMessage } from '../../src/types'

const block: Block = new Block()

block.onClick(['drop_dice', 'drop_darts'], async (ctx: ICustomContext): Promise<any> => {
  try {
    try {
      await ctx.msg.del()
    } catch {}

    const diceElement: string | undefined = ctx.update?.callback_query?.data.split('_')[1]
    if (!diceElement) return

    const result: IMessage | void = await ctx.msg.sendDice(diceElement === 'darts' ? '🎯' : '🎲')
    if (!result || !result.dice) return

    let text: string | undefined

    if (diceElement === 'dice') {
      if (result.dice.value > 3) {
        text = ctx.i18n?.get('you_won_msg')
        if (ctx.session.dice) ctx.session.dice.wins++
      } else {
        text = ctx.i18n?.get('you_failed_msg')
        if (ctx.session.dice) ctx.session.dice.fails++
      }
    } else {
      if (ctx.session.darts) ctx.session.darts.score += result.dice.value
      text = ctx.i18n?.get(result.dice.value === 6 ? 'one_level_message' :
        result.dice.value >= 3 ? 'two_level_message' : 'three_level_message')
    }

    await ctx.msg.send(text, new Keyboard('under_the_message').useLayout('go_menu_btn'))
  } catch (e: any) {
    console.error(e)
  }
})

export default block