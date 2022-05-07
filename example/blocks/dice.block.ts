import { Block } from '../../index'
import { ICustomContext } from '../types'
import { IMessage } from '../../src/types'
import { Markup } from '../../src/classes/Markup'

const block: Block = new Block()

block.on(/drop_(.*)/, async (ctx: ICustomContext): Promise<any> => {
  try {
    try {
      await ctx.msg.del()
    } catch {}

    const diceElement: string | undefined = ctx.matchParams[1]
    if (!diceElement) return

    const result: IMessage | void = await ctx.msg.sendDice(diceElement === 'darts' ? '🎯' : '🎲')
    if (!result || !result.dice) return

    let text: string

    if (diceElement === 'dice') {
      if (result.dice.value > 3) {
        text = 'You won!'
        if (ctx.session.dice) ctx.session.dice.wins++
      } else {
        text = 'You have failed!'
        if (ctx.session.dice) ctx.session.dice.fails++
      }
    } else {
      if (ctx.session.darts) ctx.session.darts.score += result.dice.value
      text = result.dice.value === 6 ? 'You\'re the best!' :
        result.dice.value >= 3 ? 'Bravo!' : 'You can do it better!'
    }

    await ctx.msg.send(text, new Markup('inline').useLayout('go_menu_btn'))
  } catch (e: any) {
    console.error(e)
  }
})

export default block