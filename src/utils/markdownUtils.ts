import { marked } from 'marked';
import hljs from 'highlight.js';

// 添加类型定义
declare module 'marked' {
  interface MarkedOptions {
    highlight?: (code: string, lang: string) => string | Promise<string>;
  }
}

/**
 * 渲染Markdown内容
 * @param content Markdown文本
 * @returns 渲染后的HTML字符串
 */
export const renderMarkdown = (content: string): string => {
  marked.setOptions({
    highlight: (code: string, lang: string) => {
      return hljs.highlightAuto(code).value;
    }
  });
  
  // 确保返回同步结果
  return marked.parse(content) as string;
};

// 确保文件被视为模块
export {};