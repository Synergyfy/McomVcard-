// Local stand-in for Express.Multer.File — avoids a dependency on @types/multer.
export interface UploadedFileRecord {
  originalname: string
  mimetype: string
  size: number
  buffer: Buffer
}