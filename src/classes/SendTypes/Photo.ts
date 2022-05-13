import { IPhotoInfo, photoTypes } from '../../types'

export class Photo {
  info: IPhotoInfo = {}

  constructor(type: photoTypes, pathOrUrl: string) {
    if (type === 'url') this.info.url = pathOrUrl
    else if (type === 'path') this.info.photoPath = pathOrUrl
  }
}