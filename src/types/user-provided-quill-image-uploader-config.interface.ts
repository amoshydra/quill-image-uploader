import {
  UploadHandlerFunction,
  BeforeUploadHandlerFunction,
  OnFinishFunction,
  OnErrorFunction,
} from "./quill-image-uploader-config-function.type";

export interface UserProvidedQuillImageUploaderConfig {
  maxSize?: number,
  fileInputAttributes?: object,
  uploadHandler?: UploadHandlerFunction,
  beforeUploadHandler?: BeforeUploadHandlerFunction,
  onFinish?: OnFinishFunction,
  onError?: OnErrorFunction,
}
