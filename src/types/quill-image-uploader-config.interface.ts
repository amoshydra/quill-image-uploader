export interface QuillImageUploaderConfig {
  maxSize: number,
  fileInputAttributes: object,
  uploadHandler: Function,
  beforeUploadHandler: Function,
  errorHandler: Function,
}
