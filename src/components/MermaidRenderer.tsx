import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidRendererProps {
  code: string; // Mermaid图表代码
}

/**
 * Mermaid图表渲染组件
 * 动态解析和渲染Mermaid语法
 */
const MermaidRenderer: React.FC<MermaidRendererProps> = ({ code }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      // 初始化Mermaid配置
      mermaid.initialize({ 
        startOnLoad: false,
        theme: 'default' 
      });
      
      try {
        // 尝试解析和渲染图表
        mermaid.parse(code);
        mermaid.init(undefined, ref.current);
      } catch (err) {
        // 渲染失败显示错误信息
        if (ref.current) {
          ref.current.innerHTML = 'Invalid Mermaid diagram: ' + (err as Error).message;
        }
      }
    }
  }, [code]);

  return <div ref={ref} className="mermaid">{code}</div>;
};

export default MermaidRenderer;