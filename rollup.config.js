import typescript from 'rollup-plugin-typescript';

export default {
  input: './src/index.ts',
  plugins: [
    typescript(),
  ],
  output: [
    {
      name: 'QuillImageUploader',
      file: 'dist/index.js',
      format: 'umd',
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
    },
  ],
};
