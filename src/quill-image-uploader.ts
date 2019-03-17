import Quill from "quill";
import { UploadedImageElementWrapper } from "./uploaded-image-blot";
import { UserProvidedQuillImageUploaderConfig } from "./types/user-provided-quill-image-uploader-config.interface";
import { QuillImageUploaderConfig } from "./types/quill-image-uploader-config.interface";

export const ERROR_FILE_SIZE_EXCEEDED = 'ERROR_FILE_SIZE_EXCEEDED';
export const imageHandler = function imageHandler(this: QuillImageUploader) {
  // @ts-ignore // quill.options is present in actual object but not in typed definition
  this.quill.options.modules.toolbar.handlers.image();
};

const createFileInputElement = (providedAttributes: object) => {
  const inputElement = document.createElement('input');

  Object.entries({
    accept: 'image/png, image/gif, image/jpeg, image/bmp, image/x-icon',
    ...providedAttributes,
    type: 'file',
  })
    .forEach(([key, value]) => {
      inputElement.setAttribute(key, value);
    })
  ;
  return inputElement;
};

const setupConfig = (userProvidedConfig: UserProvidedQuillImageUploaderConfig = {}) => ({
  // Options
  maxSize: 0,
  fileInputAttributes: {},
  // Handlers
  imageUploadHandler: () => {},
  errorHandler: () => {},
  // ...
  ...userProvidedConfig,
});

export class QuillImageUploader {
  quill: Quill;
  config: QuillImageUploaderConfig;
  inputElement: Element;

  constructor(quill: Quill, userProvidedConfig: UserProvidedQuillImageUploaderConfig) {
    this.quill = quill;
    this.config = setupConfig(userProvidedConfig);
    this.inputElement = createFileInputElement(this.config.fileInputAttributes);

    // @ts-ignore // quill.options is present in actual object but not in typed definition
    this.quill.options.modules.toolbar.handlers.image = this.inputElement.click.bind(this.inputElement);

    // Attach event listeners
    [
      {
        el: this.inputElement,
        name: 'change',
        handler: this.fileInputEventHandler.bind(this, ({ target }: Event) => target)
      },
      {
        el: quill.root,
        name: 'paste',
        handler: this.fileInputEventHandler.bind(this, ({ clipboardData }: ClipboardEvent) => clipboardData)
      },
      {
        el: quill.root,
        name: 'drop',
        handler: this.fileInputEventHandler.bind(this, ({ dataTransfer }: DragEvent) => dataTransfer)
      },
    ]
      .forEach(({ el, name, handler }) => el.addEventListener(name, handler, false))
    ;
  }

  checkFileError(file: File) {
    if ((this.config.maxSize != 0) && (file.size > this.config.maxSize)) {
      return ERROR_FILE_SIZE_EXCEEDED;
    }

    return;
  }

  // Event Handlers
  async fileInputEventHandler(accessorFn: Function, event: ClipboardEvent | DragEvent | Event) {
    const [ file ] = accessorFn(event).files;

    if (!file) return;
    event.preventDefault();
  
    try {
      this.beforeUpload(file);

      const uploadWrapper = await this.registerUploadElement(file)
      const url = await this.config.imageUploadHandler.call(this, uploadWrapper);
      uploadWrapper.finalizeUpload(url);
    } catch (error) {
      this.config.errorHandler(error);
    }
  }

  beforeUpload(file: File) {
    const error = this.checkFileError(file);
    if (error) {
      throw new Error(error);
    };
  }

  registerUploadElement(file: File): Promise<UploadedImageElementWrapper> {
    return new Promise((resolve) => {
      this.quill.insertEmbed(
        (this.quill.getSelection(true) || { index: this.quill.getLength() }).index,
        'uploaded-image',
        {
          file,
          createHandler: resolve,
        },
      );
    });
  }
};

