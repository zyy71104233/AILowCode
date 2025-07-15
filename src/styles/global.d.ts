import 'highlight.js';
import 'marked';

declare module 'marked' {
  interface MarkedOptions {
    highlight?: (code: string, lang: string) => string | Promise<string>;
  }
}

declare module 'react' {
  interface HTMLAttributes<T> {
    // 添加任何需要的自定义属性
    block?: boolean;
  }
}