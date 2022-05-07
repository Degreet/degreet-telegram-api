import { middleware } from '../types'

export class Layout {
  name: string
  handler: middleware

  constructor(name: string, handler: middleware) {
    this.name = name
    this.handler = handler
  }
}