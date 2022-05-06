import { BlockBuilder } from './BlockBuilder'
import { middleware } from '../types'

export class BlockScene extends BlockBuilder {
  name: string

  public enter(handler: middleware): void {
    this.handlers.push({
      event: 'sceneEnter',
      type: 'event',
      middlewares: [handler],
    })
  }

  constructor(name: string) {
    super()
    this.name = name
  }
}