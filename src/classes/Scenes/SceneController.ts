import { IHandler, middleware, nextMiddleware, scene, sceneInfoItem } from '../../types'
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

  /**
   * @deprecated Use .onEnter instead
   */
  public enter(userId?: number, ctx?: any, sceneName?: string): void {
    return this.onEnter(userId, ctx, sceneName)
  }

  public onEnter(userId?: number, ctx?: any, sceneName?: string): void {
    if (!userId || !ctx || !sceneName) return
    let sceneInfo = data.find((info: sceneInfoItem) => info[0] === userId)

    if (!sceneInfo) {
      sceneInfo = [userId, { activeScene: sceneName, middlewareIndex: 0, data: [] }]
      data.push(sceneInfo)
    } else {
      sceneInfo[1].activeScene = sceneName
      sceneInfo[1].middlewareIndex = 0
    }

    const scene: scene | void = this.scenes.find((scene: scene): boolean => scene.name === sceneName)
    if (!scene) throw new Error(`DegreetTelegram: Scene ${sceneName} not found`)

    function passMiddleware(middleware: middleware): void {
      middleware(ctx, () => {})
    }

    function getNextHandler(middlewares: middleware[], i: number, resultHandler: middleware): nextMiddleware {
      return (): void => {
        const middleware: middleware | void = middlewares[i]
        if (!middleware) return passMiddleware(resultHandler)
        middleware(ctx, getNextHandler(middlewares, i + 1, resultHandler))
      }
    }

    let handler: IHandler | undefined

    if (scene instanceof BlockScene) {
      handler = scene.handlers.find((handler: IHandler): boolean => (
        handler.type === 'event' && handler.event === 'sceneEnter'
      ))

      if (!handler || !handler.middlewares) return
    } else {
      handler = scene.handlers[0]
      if (!handler || !handler.middlewares) return
    }

    if (scene.middlewares && scene.middlewares.length)
      scene.middlewares[0](ctx, getNextHandler(scene.middlewares, 1, handler.middlewares[0]))
    else passMiddleware(handler.middlewares[0])
  }

  public next(userId?: number): void {
    if (!userId) return
    const sceneInfo = data.find((info: sceneInfoItem): boolean => info[0] === userId)
    if (sceneInfo) sceneInfo[1].middlewareIndex++
  }

  public getData(userId?: number): string[] | void {
    if (!userId) return
    const sceneInfo = data.find((info: sceneInfoItem): boolean => info[0] === userId)
    if (sceneInfo) return sceneInfo[1].data
  }

  public setData(userId?: number, newData?: string[] | void): void {
    if (!userId || !newData) return
    const sceneInfo = data.find((info: sceneInfoItem): boolean => info[0] === userId)
    if (sceneInfo) sceneInfo[1].data = [...newData]
  }

  public leave(userId?: number): void {
    if (!userId) return
    let sceneInfo = data.find((info: sceneInfoItem): boolean => info[0] === userId)

    if (!sceneInfo) {
      sceneInfo = [userId, { activeScene: null, middlewareIndex: 0, data: [] }]
      data.push(sceneInfo)
    } else {
      sceneInfo[1].activeScene = null
      sceneInfo[1].middlewareIndex = 0
      sceneInfo[1].data = []
    }
  }
}