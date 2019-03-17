import Quill from "quill";
import { UploadedImageElementWrapper } from "./uploaded-image-blot";
import { UserProvidedQuillImageUploaderConfig } from "./types/user-provided-quill-image-uploader-config.interface";
import { QuillImageUploaderConfig } from "./types/quill-image-uploader-config.interface";
import { createFileInputElement } from "./core/create-file-input-element";

export const ERROR_FILE_SIZE_EXCEEDED = 'ERROR_FILE_SIZE_EXCEEDED';

const setupConfig = (userProvidedConfig: UserProvidedQuillImageUploaderConfig = {}) => ({
  // Options
  maxSize: 0,
  fileInputAttributes: {},
  // Handlers
  uploadHandler: () => {},
  errorHandler: () => {},
  beforeUploadHandler: () => {},
  // ...
  ...userProvidedConfig,
});

export class QuillImageUploader {
  quill: Quill;
  config: QuillImageUploaderConfig;
  inputElement: Element;

  static imageHandler(this: QuillImageUploader) {
    // @ts-ignore // quill.options is present in actual object but not in typed definition
    this.quill.options.modules.toolbar.handlers.image();
  }

  constructor(quill: Quill, userProvidedConfig: UserProvidedQuillImageUploaderConfig) {
    this.quill = quill;
    this.config = setupConfig(userProvidedConfig);
    this.inputElement = createFileInputElement(this.config.fileInputAttributes);

    this.attachEventListeners();
  }

  attachEventListeners() {
    // @ts-ignore // quill.options is present in actual object but not in typed definition
    this.quill.options.modules.toolbar.handlers.image = this.inputElement.click.bind(this.inputElement);
    [
      {
        el: this.inputElement,
        name: 'change',
        handler: this.handleFileEvent.bind(this, ({ target }: Event) => target)
      },
      {
        el: this.quill.root,
        name: 'paste',
        handler: this.handleFileEvent.bind(this, ({ clipboardData }: ClipboardEvent) => clipboardData)
      },
      {
        el: this.quill.root,
        name: 'drop',
        handler: this.handleFileEvent.bind(this, ({ dataTransfer }: DragEvent) => dataTransfer)
      },
    ]
      .forEach(({ el, name, handler }) => el.addEventListener(name, handler, false))
    ;
  }

  beforeUpload(file: File) {
    if ((this.config.maxSize != 0) && (file.size > this.config.maxSize)) {
      throw new Error(ERROR_FILE_SIZE_EXCEEDED);
    }
    this.config.beforeUploadHandler.call(this, file);
  }

  // Event Handlers
  handleFileEvent(accessorFn: Function, event: ClipboardEvent | DragEvent | Event) {
    const [ file ] = accessorFn(event).files;

    if (!file) return;
    event.preventDefault();

    this.processFile(file);
  }

  async processFile(file: File) {
    try {
      this.beforeUpload(file);

      const uploadWrapper = await this.registerUploadElement(file)
      const url = await this.config.uploadHandler.call(this, uploadWrapper);
      uploadWrapper.finalizeUpload(url);
    } catch (error) {
      this.config.errorHandler(error);
    }
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

