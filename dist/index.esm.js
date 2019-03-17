/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

const createFileInputElement = (attributes) => {
    const inputElement = document.createElement('input');
    Object.entries(Object.assign({ accept: 'image/png, image/gif, image/jpeg, image/bmp, image/x-icon' }, (attributes || {}), { type: 'file' }))
        .forEach(([key, value]) => {
        inputElement.setAttribute(key, value);
    });
    return inputElement;
};
//# sourceMappingURL=create-file-input-element.js.map

const ERROR_FILE_SIZE_EXCEEDED = 'ERROR_FILE_SIZE_EXCEEDED';
const noop = () => { };
const setupConfig = (userProvidedConfig = {}) => (Object.assign({ 
    // Options
    maxSize: 0, fileInputAttributes: {}, 
    // Handlers
    uploadHandler: Promise.resolve, beforeUploadHandler: noop, onContentInsert: noop, onFinish: noop, onError: noop }, userProvidedConfig));
class QuillImageUploader {
    static imageHandler() {
        // @ts-ignore // quill.options is present in actual object but not in typed definition
        this.quill.options.modules.toolbar.handlers.image();
    }
    constructor(quill, userProvidedConfig) {
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
                handler: this.handleFileEvent.bind(this, ({ target }) => target)
            },
            {
                el: this.quill.root,
                name: 'paste',
                handler: this.handleFileEvent.bind(this, ({ clipboardData }) => clipboardData)
            },
            {
                el: this.quill.root,
                name: 'drop',
                handler: this.handleFileEvent.bind(this, ({ dataTransfer }) => dataTransfer)
            },
        ]
            .forEach(({ el, name, handler }) => el.addEventListener(name, handler, false));
    }
    // Event Handlers
    handleFileEvent(accessorFn, event) {
        const [file] = accessorFn(event).files;
        if (!file)
            return;
        event.preventDefault();
        this.processFile(file);
    }
    processFile(file) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.config.beforeUploadHandler.call(this, file);
                this.beforeUpload(file);
                const uploadWrapper = yield this.insertContent(file);
                const url = yield this.config.uploadHandler.call(this, uploadWrapper);
                this.config.onFinish.call(this, url);
                uploadWrapper.finalizeUpload(url);
            }
            catch (error) {
                this.config.onError.call(this, error);
            }
        });
    }
    beforeUpload(file) {
        if ((this.config.maxSize != 0) && (file.size > this.config.maxSize)) {
            throw new Error(ERROR_FILE_SIZE_EXCEEDED);
        }
    }
    insertContent(file) {
        return new Promise((resolve) => {
            this.quill.insertEmbed((this.quill.getSelection(true) || { index: this.quill.getLength() }).index, 'uploaded-image', {
                file,
                createHandler: resolve,
            });
        });
    }
}
//# sourceMappingURL=quill-image-uploader.js.map

class UploadedImageElementWrapper {
    constructor(wrapperEl, file) {
        wrapperEl._wrapper = this;
        // Create image
        const imageLink = URL.createObjectURL(file);
        const imageEl = document.createElement('img');
        imageEl.addEventListener('load', () => URL.revokeObjectURL(imageLink));
        imageEl.setAttribute('alt', file.name);
        imageEl.setAttribute('src', imageLink);
        // Append DOM
        wrapperEl.appendChild(imageEl);
        // Add element as property
        this.id = Math.trunc(Math.random() * 10000000000);
        this.el = wrapperEl;
        this.imageEl = imageEl;
        this.file = file;
    }
    get removed() {
        return !((this.imageEl.parentNode === this.el)
            ? this.el.parentNode
            : this.imageEl.parentNode);
    }
    updateProgress(progress) {
        this.el.dataset.progress = `${progress}`;
    }
    finalizeUpload(newImageLink) {
        if (!this.removed) {
            this.imageEl.setAttribute('src', newImageLink);
            this.el.outerHTML = this.imageEl.outerHTML;
        }
    }
}
const createUploadedImageBlot = (Quill) => {
    var _a;
    return _a = class UploadImageBlot extends Quill.import('blots/block/embed') {
            static create({ file, createHandler }) {
                const wrapperEl = super.create();
                const wrapper = new UploadedImageElementWrapper(wrapperEl, file);
                createHandler(wrapper);
                return wrapper.el;
            }
            static value(node) {
                return node._wrapper;
            }
        },
        _a.blotName = 'uploaded-image',
        _a.tagName = 'div',
        _a.className = 'uploaded-image',
        _a;
};
//# sourceMappingURL=uploaded-image-blot.js.map

//# sourceMappingURL=index.js.map

export { ERROR_FILE_SIZE_EXCEEDED, QuillImageUploader, createUploadedImageBlot, UploadedImageElementWrapper };
