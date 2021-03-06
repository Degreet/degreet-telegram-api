import {
  allowedTypes,
  IButton, IContext,
  IInlineKeyboard,
  IMarkupLayout, IMarkupLayoutEntity,
  IMessageExtra, IRemoveKeyboard, IReplyKeyboard,
  keyboardType,
} from '../../types'

const layouts: IMarkupLayout[] = []

export class Keyboard {
  type: keyboardType
  unresolvedBtns: IButton[] = []
  savedLayouts: IMarkupLayoutEntity[] = []
  rows: IButton[][] = []
  placeholder?: string
  isI18n: boolean

  constructor(type: keyboardType, isI18n?: boolean) {
    this.type = type
    this.isI18n = isI18n || false
  }

  public btn(type: allowedTypes, text: string, action?: string, hidden?: boolean): Keyboard {
    let button: IButton
    if (this.type === 'remove_under_the_message') return this

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
      case 'pay':
        button = { text, pay: true }
        break
      default:
        button = { text }
    }

    if (!hidden) this.unresolvedBtns.push(button)
    return this
  }

  public row(btnsPerLine?: number, hidden?: boolean): Keyboard {
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

  public saveLayout(name: string): Keyboard {
    layouts.push({
      name,
      layout: this.rows,
      isI18n: this.isI18n,
    })

    return this
  }

  public useLayout(name: string): Keyboard {
    const layout: IMarkupLayout | undefined = layouts.find((layout: IMarkupLayout): boolean => (
      layout.name === name
    ))

    if (layout) {
      this.savedLayouts.push({ layout, isI18n: layout.isI18n, index: this.rows.length })
      this.rows.push(...layout.layout)
    }

    return this
  }

  public setPlaceholder(placeholder: string): Keyboard {
    this.placeholder = placeholder
    return this
  }

  public solveExtra(ctx?: IContext): IMessageExtra {
    let replyMarkup
    const savedLayouts: IMarkupLayoutEntity[] = this.savedLayouts

    savedLayouts.forEach((layout: IMarkupLayoutEntity): void => {
      if (layout.isI18n && ctx) {
        this.rows[layout.index].forEach((btn: IButton): void => {
          btn.text = ctx.i18n?.get(btn.text) || btn.text
        })
      }
    })

    if (this.type === 'under_the_message') {
      const keyboard: IInlineKeyboard = { inline_keyboard: this.rows }
      replyMarkup = { reply_markup: keyboard }
    } else if (this.type === 'under_the_chat') {
      const keyboard: IReplyKeyboard = {
        keyboard: this.rows,
        resize_keyboard: true,
        input_field_placeholder: this.placeholder,
      }

      replyMarkup = { reply_markup: keyboard }
    } else {
      const keyboard: IRemoveKeyboard = { remove_keyboard: true }
      replyMarkup = { reply_markup: keyboard }
    }

    return replyMarkup
  }
}