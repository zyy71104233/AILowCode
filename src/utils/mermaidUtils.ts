/**
 * 检测是否为Mermaid图表
 * @param content 待检测内容
 * @returns boolean
 */
export const isMermaid = (content: string): boolean => {
    return /%%{mermaid}%%/.test(content);
  };
  
  /**
   * 提取Mermaid代码
   * @param content 包含Mermaid的内容
   * @returns 纯Mermaid代码
   */
  export const extractMermaidCode = (content: string): string => {
    const match = content.match(/%%{mermaid}%%([\s\S]*?)%%{end}%%/);
    return match ? match[1] : '';
  };
  
  // 确保文件被视为模块
  export {};