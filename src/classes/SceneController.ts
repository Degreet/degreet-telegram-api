import { IHandler, sceneInfoItem } from '../types'
import { BlockScene } from './BlockScene'

const data: sceneInfoItem[] = []

export class SceneController {
  scenes: BlockScene[] = []

  constructor(scenes: BlockScene[]) {
    this.scenes = scenes
  }

  public getActiveScene(userId?: number): string | null {
    if (!userId) return null
    const sceneInfo = data.find((info: sceneInfoItem) => info[0] === userId)
    if (!sceneInfo) return null
    return sceneInfo[1].activeScene
  }

  public enter(userId?: number, ctx?: any, sceneName?: string): any {
    if (!userId || !ctx || !sceneName) return
    let sceneInfo = data.find((info: sceneInfoItem) => info[0] === userId)

    if (!sceneInfo) {
      sceneInfo = [userId, { activeScene: sceneName }]
      data.push(sceneInfo)
    } else {
      sceneInfo[1].activeScene = sceneName
    }

    const scene: BlockScene | void = this.scenes.find((scene: BlockScene): boolean => scene.name === sceneName)
    if (!scene) return

    const handler: IHandler | undefined = scene.handlers.find((handler: IHandler): boolean => (
      handler.type === 'event' && handler.event === 'sceneEnter'
    ))

    if (!handler || !handler.middlewares) return
    return handler.middlewares[0](ctx, () => {})
  }

  public leave(userId?: number) {
    if (!userId) return
    let sceneInfo = data.find((info: sceneInfoItem) => info[0] === userId)

    if (!sceneInfo) {
      sceneInfo = [userId, { activeScene: null }]
      data.push(sceneInfo)
    } else {
      sceneInfo[1].activeScene = null
    }
  }
}