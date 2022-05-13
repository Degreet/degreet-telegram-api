import { Block, Keyboard } from '../../index'
import { ICustomContext } from '../types'
import { diceEmojis, IMessage } from '../../src/types'

const block: Block = new Block()

block.onClick(['dice', 'darts', 'basketball'], async (ctx: ICustomContext): Promise<any> => {
  try {
    try {
      await ctx.answer.delete()
    } catch {}

    const diceElement: string | undefined = ctx.msg.clickedBtnId
    if (!diceElement) return

    const diceEmoji: diceEmojis | boolean = diceElement === 'darts' ? '🎯' : diceElement === 'basketball' && '🏀'
    const result: IMessage | void = await ctx.answer.sendDice(diceEmoji ? diceEmoji : undefined)
    if (!result || !result.dice) return

    if (typeof ctx.session.score === 'number') ctx.session.score += result.dice.value
    const text: string | undefined = ctx.i18n?.get(result.dice.value === 6 ? 'one_level_message' :
      result.dice.value >= 3 ? 'two_level_message' : 'three_level_message')

    await ctx.answer.send(text, new Keyboard('under_the_message').useLayout('go_menu_btn'))
  } catch (e: any) {
    console.error(e)
  }
})

export default block