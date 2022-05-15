# Getting started

```typescript
import { DegreetTelegram } from 'degreet-telegram'
import { IContext } from 'degreet-telegram/src/types'

const token: string = 'Enter your token here'
const bot: DegreetTelegram = new DegreetTelegram(token)

bot.command('start', async (ctx: IContext): Promise<any> => {
  try {
    await ctx.answer.send('Hello!')
  } catch (e: any) {
    console.error(e)
  }
})

bot.start().then((username: string): void => {
  console.log(`Started on @${username}`)
})
```

Full documentation is here: https://degreetpro.gitbook.io/degreet-telegram