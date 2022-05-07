import { Block } from '../../src/classes/Block'
import { IContext } from '../../src/types'
import { CHANNEL, CHANNEL_ID } from '../constants'
import { Markup } from '../../src/classes/Markup'

const block = new Block()

block.command('start', async (ctx: IContext): Promise<any> => {
  try {
    await ctx.msg.send(
      `Hello! Subscribe to the <a href="${CHANNEL}">channel</a> for continue bot using!`,
      new Markup('inline')
        .btn('cb', 'Check subscription', 'test_1').row()
    )
  } catch (e: any) {
    console.error(e)
  }
})

block.on('check', async (ctx: IContext): Promise<any> => {
  try {
    const isSubscribed = await ctx.msg.checkSubscription(CHANNEL_ID)
    if (!isSubscribed)
      return ctx.msg.alert('You have not subscribed to all channels')

    await ctx.msg.edit(
      'Thank you for subscribing!',
      new Markup('inline')
        .btn('cb', 'Get Bonus!', 'bonus').row()
    )

    ctx.scene.enter('test')
  } catch (e: any) {
    console.error(e)
  }
})

export default block