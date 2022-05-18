import { BlockBuilder } from '../Block/BlockBuilder'
import { middleware } from '../../types'

export class BlockScene extends BlockBuilder {
  name: string
  onLeaveHandler: middleware

  public onEnter(handler: middleware): void {
    this.handlers.push({
      event: 'sceneEnter',
      type: 'event',
      middlewares: [handler],
    })
  }

  public onLeave(handler: middleware): void {
    this.onLeaveHandler = handler
  }

  /**
   * @deprecated Use .onEnter instead
   */
  public enter(handler: middleware): void {
    return this.onEnter(handler)
  }

  constructor(name: string) {
    super()
    this.name = name
  }
}