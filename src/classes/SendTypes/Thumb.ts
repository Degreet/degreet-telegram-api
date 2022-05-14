import { IMediaInfo, mediaFileTypes } from '../../types'

export class Thumb {
  fileType: mediaFileTypes
  info: IMediaInfo = {}

  constructor(type: mediaFileTypes, pathOrUrl: string) {
    this.fileType = type
    if (type === 'url') this.info.url = pathOrUrl
    else if (type === 'path') this.info.path = pathOrUrl
  }
}