import { IMessageExtra, parseModeTypes } from '../../types'

export class Options {
  extra: IMessageExtra = {}

  public disableWebPagePreview(): this {
    this.extra.disable_web_page_preview = true
    return this
  }

  public disableNotification(): this {
    this.extra.disable_notification = true
    return this
  }

  public setCaption(caption?: string): this {
    if (caption) this.extra.caption = caption
    return this
  }

  public setParseMode(parseMode: parseModeTypes): this {
    this.extra.parse_mode = parseMode
    return this
  }
}