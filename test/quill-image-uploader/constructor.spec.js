import test from 'ava';
import { fake } from 'sinon';

import { QuillImageUploader } from '../../src/quill-image-uploader';

const makeMockQuill = (mockWrapper) => ({
  options: {
    modules: {
      toolbar: {
        handlers: {
          image: function() {},
        },
      },
    },
  },
  root: document.createElement('div'),
  insertEmbed: fake((index, type, value) => {
    const { file, createHandler } = value;
    createHandler(mockWrapper);
  }),
  getSelection() {
    return { index: 0 };
  },
});

const makeMockWrapper = (x = {}) => ({
  finalizeUpload: fake(x.finalizeUpload || (() => '')),
});

const wait = (condition, timeout = 5000, checkInterval = 1) => {
  let timeElapsed = 0;
  return new Promise((resolve, reject) => {
    const intervalId = setInterval(() => {
      timeElapsed += checkInterval;
      if (condition()) {
        clearInterval(intervalId);
        return resolve();
      } else if (timeElapsed > timeout) {
        return reject(new Error('timeout'));
      }
    }, checkInterval);
  });
};

test('should contruct', t => {
  t.truthy(new QuillImageUploader(makeMockQuill()));
});

test('should call the provided handler when a file is received', async t => {
  const handlers = {
    beforeUploadHandler: fake(),
    uploadHandler: fake.resolves('http://mock-url'),
  };
  const mockFile = {};
  const mockWrapper = makeMockWrapper();
  const mockWrapperPromise = Promise.resolve(mockWrapper);
  const mockQuill = makeMockQuill(mockWrapperPromise)

  const quillImageUploader = new QuillImageUploader(mockQuill, handlers);
  quillImageUploader.processFile(mockFile)
  t.true(handlers.beforeUploadHandler.calledOnceWith(mockFile));
  
  await wait(() => handlers.uploadHandler.calledOnce);
  t.true(handlers.uploadHandler.calledOnceWithExactly(mockWrapper));
});

test('should call the provided error handler when an error occured, and stop upload', async t => {
  const customError = new Error('custom error');
  const handlers = {
    onError: fake(),
    uploadHandler: fake.resolves('http://mock-url'),
    beforeUploadHandler: fake(() => {
      throw customError;
    }),
  };
  const mockFile = {};
  const mockWrapper = makeMockWrapper();
  const mockWrapperPromise = Promise.resolve(mockWrapper);
  const mockQuill = makeMockQuill(mockWrapperPromise)

  const quillImageUploader = new QuillImageUploader(mockQuill, handlers);
  quillImageUploader.processFile(mockFile)
  t.true(handlers.beforeUploadHandler.calledOnceWith(mockFile));
  t.true(handlers.onError.calledOnceWithExactly(customError));

  try {
    await wait(() => handlers.uploadHandler.calledOnce, 100);
  } catch (error) {
    t.false(handlers.uploadHandler.calledOnce);
    t.false(mockQuill.insertEmbed.calledOnce);
  }
});
