import { eventHint, IUpdate } from '../../types'
import axios from 'axios'
import { Handler } from './Handler'

export class Polling {
  connectionUri: string
  allowedUpdates: (eventHint | string)[]
  handler: Handler<any>

  constructor(connectionUri: string, allowedUpdates: (eventHint | string)[], handler: Handler<any>) {
    this.connectionUri = connectionUri
    this.allowedUpdates = allowedUpdates
    this.handler = handler
  }

  private async fetch<T>(url: string, params?: any): Promise<T> {
    const { data } = await axios.post(this.connectionUri + url, params)
    if (!data.ok) throw 'TelegramError'
    return data.result
  }

  private async *updateGetter(): AsyncIterableIterator<Promise<IUpdate[] | any>> {
    while (true) {
      const updates = await this.fetch<any>(
        '/getUpdates',
        { allowed_updates: this.allowedUpdates }
      )

      yield updates
    }
  }

  public async start(): Promise<void> {
    for await (const updates of this.updateGetter()) {
      for (const update of await updates) {
        await this.handler.handleUpdate(update)
        await this.fetch<any>(`/getUpdates?offset=${update.update_id + 1}`)
      }
    }
  }
}