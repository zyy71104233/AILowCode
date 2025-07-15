import React from 'react';
import ReactMarkdown from 'react-markdown';
import { saveAs } from 'file-saver';
import mermaid from 'mermaid';

// 初始化 Mermaid 配置
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  fontFamily: 'Arial',
  securityLevel: 'loose'
});

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
    "frontEnd clientApi":string;
    "frontEnd flow chart":string;
    'Total File list':string[];
    'Anything UNCLEAR': string;
  };
}

interface DocumentationGeneratorState {
  flowChartImg: string;
  classDiagramImg: string;
  sequenceDiagramImg: string;
  frontclassDiagramImg: string;
  frontsequenceDiagramImg: string;
}

class DocumentationGenerator extends React.Component<DocumentationGeneratorProps, DocumentationGeneratorState> {
  constructor(props: DocumentationGeneratorProps) {
    super(props);
    this.state = {
      flowChartImg: '',
      classDiagramImg: '',
      sequenceDiagramImg: '',
      frontclassDiagramImg:'',
      frontsequenceDiagramImg:''
    };
  }

  static async generateAndDownloadMD(data: any, fileName: string = '设计文档.md') {
    try {
      const instance = new DocumentationGenerator({ data });
      
      const [flow, classes, sequence,frontClasses,frontSequence] = await Promise.all([
        instance.renderMermaidToDataURL(data['Flow chart Diagram']),
        instance.renderMermaidToDataURL(data['Data structures and interfaces']),
        instance.renderMermaidToDataURL(data['Program call flow']),
        instance.renderMermaidToDataURL(data['frontEnd clientApi']),
        instance.renderMermaidToDataURL(data['frontEnd flow chart']),
      ]);

      
        console.log('生成的图片 Program call flow URL11111:', sequence.substring(0, 100));

      const mdContent = instance.generateMarkdownWithImages( flow, classes, sequence,frontClasses,frontSequence);
      const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
      saveAs(blob, fileName);

      return true;
    } catch (error) {
      console.error('生成文档失败:', error);
      throw error;
    }
  }

  componentDidMount() {
    this.generateDiagrams().catch(console.error);
  }

  private async generateDiagrams() {
    const [flow, classes, sequence] = await Promise.all([
      this.renderMermaidToDataURL(this.props.data['Flow chart Diagram']),
      this.renderMermaidToDataURL(this.props.data['Data structures and interfaces']),
      this.renderMermaidToDataURL(this.props.data['Program call flow']),
      this.renderMermaidToDataURL(this.props.data['frontEnd clientApi']),
      this.renderMermaidToDataURL(this.props.data['frontEnd flow chart'])
    ]);
    
    this.setState({ 
      flowChartImg: flow,
      classDiagramImg: classes, 
      sequenceDiagramImg: sequence 
    });
  }

  private async renderMermaidToDataURL111(graphDefinition: string): Promise<string> {
    try {

        console.log('2222定义:', graphDefinition);
      // 1. 创建临时容器
      const container = document.createElement('div');
      container.id = 'mermaid-container-' + Date.now();
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      document.body.appendChild(container);
      
      // 2. 使用 await 等待渲染完成
      const result = await mermaid.render(container.id, graphDefinition);
      
      // 3. 转换为 DataURL
      const svgData = `data:image/svg+xml;utf8,${encodeURIComponent(result.svg)}`;
      
      // 4. 转换为 PNG（可选）
      try {
        const pngData = await this.convertSvgToPng(svgData);
        return pngData;
      } catch {
        return svgData; // 如果 PNG 转换失败，回退到 SVG
      }
    } catch (err) {
      console.error('Mermaid 渲染失败:', err);
      throw err;
    } finally {
      // 确保清理临时容器
      const container = document.getElementById('mermaid-container-' + Date.now());
      if (container) {
        document.body.removeChild(container);
      }
    }
  }

  private async renderMermaidToDataURL(graphDefinition: string): Promise<string> {
    // 降级到后端渲染
    try {
      const response = await fetch('http://localhost:3001/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: graphDefinition,
          theme: 'default' 
        })
      });
      
      const { pngUrl, error } = await response.json();
      if (error) throw new Error(error);
      
      return pngUrl; // 直接返回PNG URL
    } catch (backendError) {
      console.error('前后端渲染均失败:', backendError);
      // 最终降级方案：返回原始代码块
      return `ERROR`+backendError;
    }
  }

  private convertSvgToPng(svgDataURL: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width || 800;
          canvas.height = img.height || 600;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('无法获取 Canvas 上下文'));
            return;
          }
          
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          
          resolve(canvas.toDataURL('image/png'));
        } catch (err) {
          reject(err);
        }
      };
      
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = svgDataURL;
    });
  }

  private generateMarkdownWithImages( 
    flowDiagramImg: string,
    classDiagramImg: string,
    sequenceDiagramImg: string,
    frontclassDiagramImg: string,
    frontsequenceDiagramImg: string
  ): string {
    const { data } = this.props;
  
    
    const flowDiagramSection = `![流程图](${flowDiagramImg})`;
    const classDiagramSection = `![类图](${classDiagramImg})`;
    const sequenceDiagramSection = `![序列图](${sequenceDiagramImg})`;
    const frontclassDiagramSection = `![类图](${frontclassDiagramImg})`;
    const frontsequenceDiagramSection = `![序列图](${frontsequenceDiagramImg})`;

    const ddlChanges = 
  Array.isArray(data?.['Database operation']?.['DDL Changes']) 
    ? data['Database operation']['DDL Changes'].join('\n\n') 
    : '无DDL变更';

    console.log("===============Database operation ============ ",data?.['Database operation']?.['DDL Changes'])

    return `
# 系统设计文档

## 实现方案(Implementation approach)
${data?.['Implementation approach']}

## 文件列表(File list)
${data?.['File list']}


## API 规范(Full API spec)
\`\`\`yaml
${data?.['Full API spec']}
\`\`\`

## 流程图(Flow chart Diagram)
${flowDiagramSection}
${data?.['Flow chart Diagram']}

## 类图(Data structures and interfaces)

${classDiagramSection}
${data?.['Data structures and interfaces']}

## 时序图(Program call flow)
${sequenceDiagramSection}
${sequenceDiagramImg}
${data?.['Program call flow']}

## 数据库操作
### DDL 变更(Database operation)
${ddlChanges}

### 数据流
${data?.['Database operation']?.['Data Flow']}

### 前端Api类图(frontEnd clientApi)
${frontclassDiagramSection}
${data?.['frontEnd clientApi']}

### 页面流程图(frontEnd flow chart)
${frontsequenceDiagramSection}
${frontsequenceDiagramImg}
${data?.['frontEnd flow chart']}

## 所有文件列表(Total File list)
${data?.['Total File list']}

## 待明确事项
${data?.['Anything UNCLEAR']}
    `;
  }


  downloadMarkdown = () => {
    const markdownContent = this.generateMarkdownWithImages(
      this.state.flowChartImg,
      this.state.classDiagramImg,
      this.state.sequenceDiagramImg,
      this.state.frontclassDiagramImg,
      this.state.frontsequenceDiagramImg,
    );
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, 'certificate-management-docs.md');
  };

  render() {
    return (
      <div>
        <button onClick={this.downloadMarkdown}>下载 Markdown</button>
        <div className="markdown-preview">
          <ReactMarkdown>
            {this.generateMarkdownWithImages(
              this.state.flowChartImg,
              this.state.classDiagramImg,
          this.state.sequenceDiagramImg,
          this.state.frontclassDiagramImg,
          this.state.frontsequenceDiagramImg
            )}
          </ReactMarkdown>
        </div>
      </div>
    );
  }
}

export default DocumentationGenerator;