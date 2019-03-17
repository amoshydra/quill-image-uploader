import typescript from 'rollup-plugin-typescript';
import serve from 'rollup-plugin-serve';

const mode = process.env.NODE_ENV === 'production'  ? 'production' : 'development';

export default {
  input: './src/index.ts',
  plugins: [
    typescript(),
    ...(mode === 'production' ? [] : [serve({
      open: true,
      openPage: '/example',
      contentBase: '.',
      host: 'localhost',
      port: 8080,
    })]),
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
