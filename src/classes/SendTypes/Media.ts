import { IEditMessageMediaExtra, IMediaCache, IMediaInfo, IMessageExtra, mediaFileTypes, mediaTypes } from '../../types'
import { Thumb } from './Thumb'

import FormData from 'form-data'
import fs from 'fs'

const caches: IMediaCache[] = []

export class Media {
  type: mediaTypes
  fileType: mediaFileTypes
  info: IMediaInfo = {}
  thumb: Thumb
  caption: string
  width: number
  height: number

  constructor(type: mediaFileTypes, pathOrUrl: string) {
    this.fileType = type
    if (type === 'url') this.info.url = pathOrUrl
    else if (type === 'path') this.info.path = pathOrUrl
  }

  public setThumb(thumb: Thumb): this {
    this.thumb = thumb
    return this
  }

  public setCaption(caption?: string): this {
    if (caption) this.caption = caption
    return this
  }

  public setResolution(width: number, height: number): this {
    this.width = width
    this.height = height
    return this
  }

  public get cache(): IMediaCache | undefined {
    return caches.find((cache: IMediaCache) => cache.filePath === this.info.url || this.info.path)
  }

  public saveCache(fileId: string): this {
    const cache: IMediaCache | undefined = this.cache

    if (!cache) {
      caches.push({
        fileId,
        filePath: this.info.url || this.info.path!,
      })
    }

    return this
  }

  public async getFormData(userId: number, moreExtra: IMessageExtra = {}): Promise<FormData> {
    const formData: FormData = new FormData()
    formData.append('chat_id', userId)
    formData.append('parse_mode', 'HTML')
    if (this.caption) formData.append('caption', this.caption)

    const cache: IMediaCache | undefined = this.cache

    if (this.fileType === 'url') {
      if (cache) formData.append(this.type, cache.fileId)
      else formData.append(this.type, this.info.url)
    } else if (this.fileType === 'path' && this.info.path) {
      if (cache) formData.append(this.type, cache.fileId)
      else formData.append(this.type, fs.createReadStream(this.info.path))
    }

    if (this.type === 'video') {
      formData.append('width', this.width || 1920)
      formData.append('height', this.height || 1080)
    }

    if (this.thumb) {
      if (this.thumb.fileType === 'url')
        formData.append('thumb', this.thumb.info.url)
      else if (this.thumb.fileType === 'path' && this.thumb.info.path)
        formData.append('thumb', fs.createReadStream(this.thumb.info.path))
    }

    Object.keys(moreExtra).forEach((key: string): void => {
      const data = moreExtra[key as keyof typeof moreExtra]
      formData.append(key, typeof data === 'object' ? JSON.stringify(data) : data)
    })

    return formData
  }

  public async getEditFormData(userId: number, msgId: number, moreExtra: IMessageExtra = {}): Promise<FormData> {
    const formData: FormData = new FormData()
    formData.append('chat_id', userId)
    formData.append('message_id', msgId)

    const mediaData: IEditMessageMediaExtra = {
      type: this.type,
      media: this.info.url || 'attach://mediaFile',
      caption: this.caption,
      parse_mode: 'HTML',
    }

    if (this.fileType === 'path' && this.info.path) {
      formData.append('mediaFile', fs.createReadStream(this.info.path))
    }

    if (this.type === 'video') {
      mediaData.width = this.width || 1920
      mediaData.height = this.height || 1080
    }

    if (this.thumb) {
      if (this.thumb.fileType === 'url') {
        mediaData.thumb = this.thumb.info.url
      } else if (this.thumb.info.path) {
        mediaData.thumb = 'attach://thumb'
        formData.append('thumb', fs.createReadStream(this.thumb.info.path))
      }
    }

    formData.append('media', JSON.stringify(mediaData))

    Object.keys(moreExtra).forEach((key: string): void => {
      const data = moreExtra[key as keyof typeof moreExtra]
      formData.append(key, typeof data === 'object' ? JSON.stringify(data) : data)
    })

    return formData
  }
}