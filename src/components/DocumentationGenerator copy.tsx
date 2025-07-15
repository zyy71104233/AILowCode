import React from 'react';
import ReactMarkdown from 'react-markdown';
import  saveAs  from 'file-saver';
import mermaid from 'mermaid';

// 定义组件props的类型
interface DocumentationGeneratorProps {
  data: {
    'Implementation approach': string;
    'File list': string[];
    'Flow chart Diagram': string;
    'Full API spec': string;
    'Data structures and interfaces': string;
    'Program call flow': string;
    'Database operation': {
      'DDL Changes': string[];
      'Data Flow': string;
    };
    'Anything UNCLEAR': string;
  };
}

// 定义组件state的类型
interface DocumentationGeneratorState {
  flowChartImg: string;
  classDiagramImg: string;
  sequenceDiagramImg: string;
}

class DocumentationGenerator extends React.Component<DocumentationGeneratorProps, DocumentationGeneratorState> {
  constructor(props: DocumentationGeneratorProps) {
    super(props);
    this.state = {
      flowChartImg: '',
      classDiagramImg: '',
      sequenceDiagramImg: ''
    };
  }

  static async generateAndDownloadMD(data: any, fileName: string = '设计文档.md') {
    try {
      // 创建临时实例来生成图表
      const tempInstance = new DocumentationGenerator({ data });

      // 显式等待图表生成
    await Promise.all([
        tempInstance.renderMermaidToPng(data['Flow chart Diagram']),
        tempInstance.renderMermaidToPng(data['Data structures and interfaces']),
        tempInstance.renderMermaidToPng(data['Program call flow'])
      ]);
      
      // 等待图表生成完成
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 获取生成的Markdown内容
      const mdContent = tempInstance.generateMarkdown();
      
      // 创建Blob并下载
      const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
      saveAs(blob, fileName);
      return true;
    } catch (error) {
      console.error('生成文档失败:', error);
      throw error;
    }
  }

  componentDidMount() {
    // this.generateDiagrams();
    this.generateDiagrams().catch(console.error);
  }

//   generateDiagrams = async () => {
//     try {
//       // Generate flow chart diagram
//       const flowChartPng = await this.renderMermaidToPng(this.props.data['Flow chart Diagram']);
//       this.setState({ flowChartImg: flowChartPng });

//       // Generate class diagram
//       const classDiagramPng = await this.renderMermaidToPng(this.props.data['Data structures and interfaces']);
//       this.setState({ classDiagramImg: classDiagramPng });

//       // Generate sequence diagram
//       const sequenceDiagramPng = await this.renderMermaidToPng(this.props.data['Program call flow']);
//       this.setState({ sequenceDiagramImg: sequenceDiagramPng });
//     } catch (error) {
//       console.error('Error generating diagrams:', error);
//     }
//   };

private async generateDiagrams() {
    const [flow, classes, sequence] = await Promise.all([
      this.renderMermaidToPng(this.props.data['Flow chart Diagram']),
      this.renderMermaidToPng(this.props.data['Data structures and interfaces']),
      this.renderMermaidToPng(this.props.data['Program call flow'])
    ]);
    
    this.setState({ 
      flowChartImg: flow,
      classDiagramImg: classes, 
      sequenceDiagramImg: sequence 
    });
  }

  /**
   * 将Mermaid图表渲染为PNG格式的DataURL
   */
//   renderMermaidToPng = async (graphDefinition: string): Promise<string> => {
//     // 创建临时容器
//     const container = document.createElement('div');
//     container.style.position = 'absolute';
//     container.style.left = '-9999px';
//     document.body.appendChild(container);

//     try {
//         // 初始化Mermaid（确保每次都有新配置）
//     mermaid.initialize({
//         startOnLoad: false,
//         theme: 'default',
//         fontFamily: 'Arial'
//       });

//       // 渲染Mermaid图表
//       container.innerHTML = `<div class="mermaid">${graphDefinition}</div>`;
      
//       await mermaid.run({
//         nodes: [container],
//         suppressErrors: true,
//       });

//       // 获取SVG元素
//       const svg = container.querySelector('svg');
//       if (!svg) throw new Error('Mermaid failed to render SVG');

//       // 转换为PNG
//       return await this.svgToPng(svg);
//     } finally {
//       // 清理临时DOM
//       document.body.removeChild(container);
//     }
//   };

private async renderMermaidToPng(graphDefinition: string): Promise<string> {
    // 创建临时容器（确保在DOM中）
    const container = document.createElement('div');
    container.style.visibility = 'hidden';
    container.style.position = 'absolute';
    document.body.appendChild(container);
  
    try {
      // 初始化Mermaid（确保每次都有新配置）
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        fontFamily: 'Arial'
      });
  
      // 渲染图表
      container.innerHTML = `<div class="mermaid">${graphDefinition}</div>`;
      await mermaid.run({ nodes: [container], suppressErrors: false });
  
      // 获取SVG并设置明确尺寸
      const svg = container.querySelector('svg');
      if (!svg) throw new Error('Mermaid渲染失败');
      
      svg.setAttribute('width', '1000');
      svg.setAttribute('height', '600');
      svg.style.backgroundColor = 'white';
  
      // 转换为DataURL
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}`;
      
      // 转换为PNG（使用canvas）
      return await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 1000;
          canvas.height = 600;
          const ctx = canvas.getContext('2d')!;
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
        img.src = svgUrl;
      });
    } finally {
      document.body.removeChild(container);
    }
  }

  /**
   * SVG转PNG工具方法
   */
  svgToPng = async (svg: SVGSVGElement): Promise<string> => {
    return new Promise((resolve, reject) => {
      // 创建Canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // 设置Canvas尺寸（2倍分辨率保证清晰度）
      const scale = 2;
      const width = parseInt(svg.getAttribute('width') || '0') || svg.clientWidth;
      const height = parseInt(svg.getAttribute('height') || '0') || svg.clientHeight;
      
      canvas.width = width * scale;
      canvas.height = height * scale;
      ctx.scale(scale, scale);

      // 创建Image对象
      const img = new Image();
      img.onload = () => {
        try {
          // 绘制到Canvas
          ctx.drawImage(img, 0, 0, width, height);
          
          // 获取PNG DataURL
          const pngUrl = canvas.toDataURL('image/png');
          resolve(pngUrl);
        } catch (e) {
          reject(e);
        }
      };

      img.onerror = (err) => {
        reject(new Error('Image loading failed'));
      };

      // 设置Image源为SVG
      const svgData = new XMLSerializer().serializeToString(svg);
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}`;
    });
  };

  downloadMarkdown = () => {
    const markdownContent = this.generateMarkdown();
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, 'certificate-management-docs.md');
  };

  generateMarkdown = (): string => {
    const { data } = this.props;
    const { flowChartImg, classDiagramImg, sequenceDiagramImg } = this.state;

    return `
## Implementation approach

${data['Implementation approach']}

## File list

${data['File list'].join('\n')}

## Flow chart Diagram

![Flow Chart Diagram](${flowChartImg})

## Full API spec

\`\`\`yaml
${data['Full API spec']}
\`\`\`

## Data structures and interfaces

![Class Diagram](${classDiagramImg})

## Program call flow

![Sequence Diagram](${sequenceDiagramImg})

## Database operation

### DDL Changes

${data['Database operation']['DDL Changes'].join('\n\n')}

### Data Flow

${data['Database operation']['Data Flow']}

## Anything UNCLEAR

${data['Anything UNCLEAR']}
    `;
  };

  render() {
    return (
      <div>
        <button onClick={this.downloadMarkdown}>Download Markdown</button>
        <div className="markdown-preview">
          <ReactMarkdown>{this.generateMarkdown()}</ReactMarkdown>
        </div>
      </div>
    );
  }
}

export default DocumentationGenerator;