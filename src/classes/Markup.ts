import { allowedTypes, IButton, IMarkupLayout, IMessageExtra, keyboardType, parseModeTypes } from '../types'

const layouts: IMarkupLayout[] = []

export class Markup {
  type: keyboardType
  removeKeyboard: boolean = false
  unresolvedBtns: IButton[] = []
  rows: IButton[][] = []
  extra: IMessageExtra = {}

  constructor(type: keyboardType) {
    this.type = type
  }

  public btn(type: allowedTypes, text: string, action?: string, hidden?: boolean): Markup {
    let button: IButton

    switch (type) {
      case 'callback':
      case 'cb':
        button = { text, callback_data: action }
        break
      case 'requestContact':
        button = { text, request_contact: true }
        break
      case 'requestLocation':
        button = { text, request_location: true }
        break
      case 'webApp':
        button = { text, web_app: { url: action } }
        break
      case 'url':
        button = { text, url: action }
        break
      case 'switchInlineQuery':
        button = { text, switch_inline_query: action }
        break
      default:
        button = { text }
    }

    if (!hidden) this.unresolvedBtns.push(button)
    return this
  }

  public row(btnsPerLine?: number, hidden?: boolean): Markup {
    if (hidden) return this
    const btns: IButton[] = [...this.unresolvedBtns]
    this.unresolvedBtns = []

    if (btnsPerLine) {
      const result: IButton[][] = [[]]

      btns.map((btn: IButton) => {
        const last: IButton[] = result[result.length - 1]

        if (last.length >= btnsPerLine) {
          result.push([btn])
        } else {
          last.push(btn)
        }
      })

      this.rows.push(...result)
    } else {
      this.rows.push(btns)
    }

    return this
  }

  public remove(): Markup {
    this.removeKeyboard = true
    return this
  }

  public disableWebPagePreview(): Markup {
    this.extra.disable_web_page_preview = true
    return this
  }

  public setParseMode(parseMode: parseModeTypes): Markup {
    this.extra.parse_mode = parseMode
    return this
  }

  public replyTo(msgId?: number): Markup {
    this.extra.reply_to_message_id = msgId
    return this
  }

  public saveLayout(name: string): Markup {
    layouts.push({
      name,
      layout: this.rows,
    })

    return this
  }

  public useLayout(name: string): Markup {
    const layout: IMarkupLayout | undefined = layouts.find((layout: IMarkupLayout): boolean => (
      layout.name === name
    ))

    if (layout) {
      this.rows.push(...layout.layout)
    }

    return this
  }
}