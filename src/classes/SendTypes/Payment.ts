import { IPaymentExtra, needUserDataPayment } from '../../types'

export class Payment {
  info: IPaymentExtra = {}

  setTitle(title: string): this {
    this.info.title = title
    return this
  }

  setDescription(description: string): this {
    this.info.description = description
    return this
  }

  setPayload(payload: string): this {
    this.info.payload = payload
    return this
  }

  setToken(token: string): this {
    this.info.provider_token = token
    this.info.payload = token
    return this
  }

  setCurrency(currency: string): this {
    this.info.currency = currency
    return this
  }

  addItem(label: string, amount: number): this {
    if (!this.info.prices) this.info.prices = []
    this.info.prices.push({ label, amount: amount * 100 })
    return this
  }

  addDiscount(label: string, amount: number): this {
    if (!this.info.prices) this.info.prices = []
    this.info.prices.push({ label, amount: -(amount * 100) })
    return this
  }

  allowTips(maxCustomTipAmount?: number | null, suggestedTipAmounts?: number[] | null): this {
    if (maxCustomTipAmount) this.info.max_tip_amount = maxCustomTipAmount * 100
    if (suggestedTipAmounts) this.info.suggested_tip_amounts =
      suggestedTipAmounts.map((amount: number) => amount * 100)
    return this
  }

  setPhotoUrl(url: string): this {
    this.info.photo_url = url
    return this
  }

  needUserData(fields: needUserDataPayment[]): this {
    fields.forEach((field: needUserDataPayment) => {
      this.info[`need_${field}`] = true
    })

    return this
  }
}