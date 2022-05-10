import ErrnoException = NodeJS.ErrnoException
import { I18nSession, IContext, middleware, nextMiddleware } from '../types'
import * as yaml from 'js-yaml'
import * as fs from 'fs'
import path from 'path'

export class I18n {
  localesPath: string
  localeNames: string[]
  defaultLocale: string
  locales: any = {}

  constructor(localesPath: string, localeNames: string[]) {
    this.localesPath = localesPath
    this.localeNames = localeNames
    this.defaultLocale = localeNames[0]

    this.localeNames.forEach((localeName: string): void => {
      fs.readFile(
        path.resolve(this.localesPath, `${localeName}.yaml`),
        'utf8',
        (err: ErrnoException | null, result: string): void => {
          if (err) throw new Error(`I18nError: ${err}`)
          this.locales[localeName] = yaml.load(result)
        }
      )
    })
  }

  middleware(): middleware {
    return (ctx: IContext<I18nSession>, next: nextMiddleware): void => {
      if (!ctx.session.i18n) ctx.session.i18n = { locale: this.defaultLocale }

      ctx.i18n = {
        setLocale: (localeName: string) => this.setLocale(ctx, localeName),
        get: (key: string, data?: any) => this.get(ctx, key, data),
      }

      return next()
    }
  }

  setLocale(ctx: IContext<I18nSession>, localeName: string) {
    if (ctx.session.i18n) ctx.session.i18n.locale = localeName
  }

  get(ctx: IContext<I18nSession>, key: string, data: any = {}): string | undefined {
    const locale: any | undefined = this.locales[ctx.session.i18n?.locale || this.defaultLocale]
    if (!locale) return

    let text: string | undefined = locale[key]
    if (!text) return

    const interpolations: RegExpMatchArray | null = text.match(/\${(.*?)}/g)
    if (!interpolations || !interpolations.length) return text

    interpolations.forEach((interpolation: string): void => {
      const key: string = interpolation
        .replace('${', '')
        .replace('}', '')

      text = text?.replace(interpolation, data[key])
    })

    return text
  }
}