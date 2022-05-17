import { IHandler, scene, sceneInfoItem } from '../../types'
import { BlockScene } from './BlockScene'

const data: sceneInfoItem[] = []

export class SceneController {
  scenes: scene[] = []

  constructor(scenes: scene[]) {
    this.scenes = scenes
  }

  public getActiveScene(userId?: number): string | null {
    if (!userId) return null
    const sceneInfo = data.find((info: sceneInfoItem) => info[0] === userId)
    if (!sceneInfo) return null
    return sceneInfo[1].activeScene
  }

  public getActiveIndex(userId?: number): number | null {
    if (!userId) return null
    const sceneInfo = data.find((info: sceneInfoItem) => info[0] === userId)
    if (!sceneInfo) return null
    return sceneInfo[1].middlewareIndex
  }

  public enter(userId?: number, ctx?: any, sceneName?: string): void {
    if (!userId || !ctx || !sceneName) return
    let sceneInfo = data.find((info: sceneInfoItem) => info[0] === userId)

    if (!sceneInfo) {
      sceneInfo = [userId, { activeScene: sceneName, middlewareIndex: 0 }]
      data.push(sceneInfo)
    } else {
      sceneInfo[1].activeScene = sceneName
    }

    const scene: scene | void = this.scenes.find((scene: scene): boolean => scene.name === sceneName)
    if (!scene) throw new Error(`DegreetTelegram: Scene ${sceneName} not found`)

    if (scene instanceof BlockScene) {
      const handler: IHandler | undefined = scene.handlers.find((handler: IHandler): boolean => (
        handler.type === 'event' && handler.event === 'sceneEnter'
      ))

      if (!handler || !handler.middlewares) return
      handler.middlewares[0](ctx, () => {})
    } else {
      const handler: IHandler | undefined = scene.handlers[0]
      if (!handler || !handler.middlewares) return
      handler.middlewares[0](ctx, () => {})
    }
  }

  public next(userId?: number): void {
    if (!userId) return
    const sceneInfo = data.find((info: sceneInfoItem) => info[0] === userId)
    if (sceneInfo) sceneInfo[1].middlewareIndex++
  }

  public leave(userId?: number): void {
    if (!userId) return
    let sceneInfo = data.find((info: sceneInfoItem) => info[0] === userId)

    if (!sceneInfo) {
      sceneInfo = [userId, { activeScene: null, middlewareIndex: 0 }]
      data.push(sceneInfo)
    } else {
      sceneInfo[1].activeScene = null
    }
  }
}