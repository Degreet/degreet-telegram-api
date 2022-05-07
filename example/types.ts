import { IContext } from '../src/types'

export interface ISession {
  dice?: {
    wins: number
    fails: number
  }
  darts?: {
    score: number
  }
}

export interface ICustomContext extends IContext {
  session: ISession
}