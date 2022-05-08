# Getting started

```typescript
import { DegreetTelegram } from 'degreet-telegram'
import { IContext } from 'degreet-telegram/src/types'

const token: string = "Enter your token here"
const bot: DegreetTelegram = new DegreetTelegram(token)

bot.command('start', async (ctx: IContext): Promise<void> => {
  try {
    await ctx.msg.send('Hello!')
  } catch (e: any) {
    console.error(e)
  }
})

bot.launch().then(() => {
  console.log(`Started on @${bot.botInfo.username}`)
})
```

Documentation: https://degreetpro.gitbook.io/degreet-telegram