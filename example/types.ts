import { IContext } from '../src/types'

export interface ISession {
  score?: number
  lives?: number
}

export interface ICustomContext extends IContext {
  session: ISession
}