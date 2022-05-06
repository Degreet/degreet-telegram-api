import { Block } from '../../src/classes/Block'
import { IContext } from '../../src/types'
import { BONUS_SIZE } from '../constants'

const block = new Block()

block.on('bonus', async (ctx: IContext): Promise<any> => {
  try {
    ctx.session.balance += BONUS_SIZE
    await ctx.msg.edit(`You got the bonus! Your balance: ${ctx.session.balance}`)
  } catch (e: any) {
    console.error(e)
  }
})

export default block