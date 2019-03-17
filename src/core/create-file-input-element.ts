export const createFileInputElement = (attributes: object): HTMLInputElement => {
  const inputElement = document.createElement('input');

  Object.entries({
    accept: 'image/png, image/gif, image/jpeg, image/bmp, image/x-icon',
    ...(attributes || {}),
    type: 'file',
  })
    .forEach(([key, value]) => {
      inputElement.setAttribute(key, value);
    })
  ;
  return inputElement;
};
