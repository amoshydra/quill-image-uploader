export interface UserProvidedQuillImageUploaderConfig {
  maxSize?: number,
  fileInputAttributes?: object,
  uploadHandler?: Function,
  beforeUploadHandler?: Function,
  errorHandler?: Function,
}
