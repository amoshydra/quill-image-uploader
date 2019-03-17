import quill from "quill";
import { UploadedImageElementWrapperElement } from "./types/upload-image-element-wrapper-element.interface";

export class UploadedImageElementWrapper {
  id: Number;
  el: UploadedImageElementWrapperElement;
  imageEl: Element;
  file: File;

  constructor(wrapperEl: UploadedImageElementWrapperElement, file: File) {
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
    return !(
      (this.imageEl.parentNode === this.el)
        ? this.el.parentNode
        : this.imageEl.parentNode
    );
  }

  updateProgress(progress: string | number) {
    this.el.dataset.progress = `${progress}`;
  }

  finalizeUpload(newImageLink: string) {
    if (!this.removed) {
      this.imageEl.setAttribute('src', newImageLink);
      this.el.outerHTML = this.imageEl.outerHTML;
    }
  }
}

export const createUploadedImageBlot = (Quill: typeof quill) => {
  return class UploadImageBlot extends Quill.import('blots/block/embed') {
    static blotName = 'uploaded-image';
    static tagName = 'div';
    static className = 'uploaded-image';

    static create({ file, createHandler }: { file: File, createHandler: Function }) {
      const wrapperEl = super.create();
      const wrapper = new UploadedImageElementWrapper(wrapperEl, file);
      createHandler(wrapper);
      return wrapper.el;
    }
  
    static value(node: UploadedImageElementWrapperElement) {
      return node._wrapper;
    }
  }
};
