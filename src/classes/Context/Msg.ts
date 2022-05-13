import { IEntity, IMessage, IUpdate } from '../../types'

export class Msg {
  update?: IUpdate
  message?: IMessage

  constructor(message?: IMessage, update?: IUpdate) {
    this.message = message
    this.update = update
  }

  get clickedBtnId(): string | undefined {
    return this.update?.callback_query?.data
  }

  get text(): string | undefined {
    return this.message?.text
  }

  get id(): number | undefined {
    return this.message?.message_id
  }

  get entities(): IEntity[] | undefined {
    return this.message?.entities
  }
}