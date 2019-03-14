export const ERROR_FILE_SIZE_EXCEEDED = 'ERROR_FILE_SIZE_EXCEEDED';
export const imageHandler = function imageHandler() {
  this.quill.options.modules.toolbar.handlers.image();
};

const createFileInputElement = (providedAttributes) => {
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

const setupConfig = (userProvidedConfig = {}) => ({
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
  constructor(quill, userProvidedConfig) {
    this.quill = quill;
    this.config = setupConfig(userProvidedConfig);
    this.inputElement = createFileInputElement(this.config.fileInputAttributes);

    this.quill.options.modules.toolbar.handlers.image = this.inputElement.click.bind(this.inputElement);

    // Attach event listeners
    [
      [this.inputElement, 'change', this.fileInputEventHandler.bind(this, 'target')],
      [quill.root, 'paste', this.fileInputEventHandler.bind(this, 'clipboardData')],
      [quill.root, 'drop', this.fileInputEventHandler.bind(this, 'dataTransfer')],
    ]
      .forEach(([ el, ...params]) => el.addEventListener(...params, false))
    ;
  }

  checkFileError(file) {
    if ((this.config.maxSize != 0) && (file.size > this.config.maxSize)) {
      return ERROR_FILE_SIZE_EXCEEDED;
    }

    return;
  }

  // Event Handlers
  async fileInputEventHandler(accessor, event) {
    const [ file ] = [...event[accessor].files];
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

  beforeUpload(file) {
    const error = this.checkFileError(file);
    if (error) {
      throw new Error(error);
    };
  }

  registerUploadElement(file) {
    return new Promise((resolve) => {
      this.quill.insertEmbed(
        (this.quill.getSelection(true) || {}).index,
        'uploaded-image',
        {
          file,
          createHandler: resolve,
        },
      );
    });
  }
};

