import { eventHint, IUpdate } from '../../types'
import { Handler } from './Handler'

import { IncomingMessage, ServerResponse } from 'http'
import * as http from 'http'

export class WebhookRunner {
  connectionUri: string
  allowedUpdates: (eventHint | string)[]
  handler: Handler<any>

  constructor(connectionUri: string, allowedUpdates: (eventHint | string)[], handler: Handler<any>) {
    this.connectionUri = connectionUri
    this.allowedUpdates = allowedUpdates
    this.handler = handler
  }

  public async start(port: number = 80): Promise<http.Server> {
    return http.createServer(async (req: IncomingMessage, res: ServerResponse): Promise<any> => {
      try {
        let data = ''
        req.on('data', (chunk: string): any => data += chunk)

        req.on('end', async (): Promise<any> => {
          try {
            const update: IUpdate = JSON.parse(data.toString())
            await this.handler.handleUpdate(update)
            res.end('ok')
          } catch (e: any) {
            console.error(e)
          }
        })
      } catch (e: any) {
        console.error(e)
      }
    }).listen(port)
  }
}