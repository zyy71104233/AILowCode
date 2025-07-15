declare module 'rehype-highlight' {
    import { Plugin } from 'unified';
    const rehypeHighlight: Plugin<[Options?]>;
    export default rehypeHighlight;
  }