// components/ChatFlow.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageItem, ProcessStage, PromptType, Role, SetStateAction, ActionType } from '../types/types';
import DocumentationGenerator from './DocumentationGenerator';

interface ChatFlowProps {
  messages: MessageItem[];
  onSend: (content: string, promptType: PromptType, originalContent?: string) => void;
  currentStage: ProcessStage;
  setCurrentStage: (stage: SetStateAction<ProcessStage>) => void;
  onEditComplete?: (newContent: string, messageId: string) => void;
  tabType: 'create' | 'incremental';
  onRoleClick?: (role: Role, messageId: string) => void;
  messageRefs: React.RefObject<{[key: string]: HTMLDivElement | null}>;
}

const roleDisplayNames: Record<Role, string> = {
  user: '用户',
  pd: '产品经理',
  arch: '系统架构师',
  proj: '项目经理',
  dev: '开发工程师'
};

const ChatFlow: React.FC<ChatFlowProps> = ({ 
  messages,
  onSend,
  currentStage,
  setCurrentStage,
  onEditComplete,
  tabType,
  onRoleClick,
  messageRefs
}) => {
  const [currentInput, setCurrentInput] = useState('');
  const [selectedMessageContent, setSelectedMessageContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContentRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      Object.keys(messageContentRefs.current).forEach(key => {
        const ref = messageContentRefs.current[key];
        if (ref) {
          ref.scrollTop = ref.scrollHeight;
        }
      });
    }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const roleMap: Record<Role, Record<ActionType, PromptType>> = {
    user: {
      confirm: 'user_confirm',
      edit: 'user_confirm',
      adjust: 'user_confirm',
      generateDoc: 'user_confirm'
    },
    pd: {
      confirm: 'pd_confirm',
      edit: 'pd_edit',
      adjust: 'pd_adjust',
      generateDoc: 'pd_confirm'
    },
    arch: {
      confirm: 'arch_confirm',
      edit: 'arch_edit',
      adjust: 'arch_adjust',
      generateDoc: 'arch_confirm'
    },
    proj: {
      confirm: 'proj_confirm',
      edit: 'proj_edit',
      adjust: 'proj_adjust',
      generateDoc: 'proj_confirm'
    },
    dev: {
      confirm: 'dev_confirm',
      edit: 'dev_edit',
      adjust: 'dev_adjust',
      generateDoc: 'dev_confirm'
    }
  };

  const getPromptType = (actionType: ActionType): PromptType => {
    console.log('🎯 getPromptType called:', { 
      actionType, 
      currentRole: currentStage.currentRole,
      roleMapExists: !!roleMap,
      promptType: roleMap[currentStage.currentRole]?.[actionType]
    });
    return roleMap[currentStage.currentRole][actionType];
  };

  const extractContent = (text: string): string => {
    const startTag = '[CONTENT]';
    const endTag = '[/CONTENT]';
    const startIndex = text.indexOf(startTag);
    const endIndex = text.indexOf(endTag);
    return startIndex === -1 || endIndex === -1 
      ? text 
      : text.slice(startIndex + startTag.length, endIndex).trim();
  };




  const handleGenerateDoc = async (content: string) => {
    try {
      let parsedContent = extractContent(content);
      let parsedData;
      
      try {
        console.log("==== parsedData ====",parsedContent)

      parsedData = parseComplexStringToJson(parsedContent)

        
      } catch {
        parsedData = {
          "Implementation approach": content,
          "File list": [],
          "Flow chart Diagram": "flowchart TD\n    A[开始] --> B[结束]",
          "Full API spec": "",
          "Data structures and interfaces": "",
          "Program call flow": "",
          "Database operation": {
            "DDL Changes": [],
            "Data Flow": ""
          },
          "frontEnd clientApi":"",
          "frontEnd flow chart":"",
          "Total File list": [],
          "Anything UNCLEAR": ""
        };
      }

      await DocumentationGenerator.generateAndDownloadMD(parsedData, '系统设计文档.md');
    } catch (error) {
      console.error('生成设计文档失败:', error);
    }
  };

  function parseComplexStringToJson(str: string) {
    // 1. 提取 Implementation approach
    const implApproachMatch = str.match(/"Implementation approach":\s*"((?:\\"|[^"])*)"/);
    const implementationApproach = implApproachMatch ? implApproachMatch[1] : '';
  
    // 2. 提取 File list
    const fileListMatch = str.match(/"File list":\s*([\s\S]*?)(?=,\s*"Flow chart Diagram")/);
    let fileList = fileListMatch ? fileListMatch[1] : [];
  
    // 3. 提取 Flow chart Diagram (多行文本)
    const flowChartMatch = str.match(/"Flow chart Diagram":\s*"([\s\S]*?)"(?=,\s*"Data structures and interfaces")/);
    let flowChartDiagram = flowChartMatch ? flowChartMatch[1].trim() : '';
    if(flowChartDiagram){
      flowChartDiagram = flowChartDiagram.replace(/\\"/g, '"')
      .replace(/\\n/g, '\n')
      .trim();
    }

    console.log("===flowChartDiagram==",flowChartDiagram)
  
    // 4. 提取 Full API spec (多行YAML)
    const fullApiMatch = str.match(/"Full API spec":\s*"([\s\S]*?)"(?=,\s*"Data structures and interfaces")/);
    let fullApiSpec = '';
    if (fullApiMatch) {
      fullApiSpec = fullApiMatch[1]
        .replace(/\\"/g, '"')
        .replace(/\\n/g, '\n')
        .trim();
    }
  
    // 5. 提取 Data structures and interfaces
    const dataStructMatch = str.match(/"Data structures and interfaces":\s*"([\s\S]*?)"(?=,\s*"Program call flow")/);
    let dataStructures = dataStructMatch ? dataStructMatch[1].trim() : '';
    if(dataStructures){
      dataStructures = dataStructures.replace(/\\"/g, '"')
      .replace(/\\n/g, '\n')
      .trim();
    }
  
    // 6. 提取 Program call flow
    const programFlowMatch = str.match(/"Program call flow":\s*"([\s\S]*?)"(?=,\s*"Database operation")/);
    let programCallFlow = programFlowMatch ? programFlowMatch[1].trim() : '';
    if(programCallFlow){
      programCallFlow = programCallFlow.replace(/\\"/g, '"')
      .replace(/\\n/g, '\n')
      .trim();
    }
  
    // 7. 提取 Database operation (对象)
    const dbOpMatch = str.match(/"Database operation":\s*({[\s\S]*?})(?=,\s*"frontEnd clientApi")/);
    let databaseOperation = {
        "DDL Changes": [],
        "Data Flow": ""
    };
    try {
      if (dbOpMatch) {
        const dbOpStr = dbOpMatch[1]
          .replace(/"DDL Changes":\s*$$([\s\S]*?)$$/g, (_, list) => `"DDL Changes": [${list.replace(/\n/g, '').replace(/\s+/g, ' ')}]`)
          .replace(/"Data Flow":\s*"([\s\S]*?)"/g, '"Data Flow": "$1"');
        databaseOperation = JSON.parse(dbOpStr);
      }
    } catch (e) {
      console.error('解析Database operation失败:', e);
    }
  
    // 8. 提取 frontEnd clientApi (类图)
    const clientApiMatch = str.match(/"frontEnd clientApi":\s*"([\s\S]*?)"(?=,\s*"frontEnd flow chart")/);
    let frontEndClientApi = clientApiMatch ? clientApiMatch[1].trim() : '';
    if(frontEndClientApi){
      frontEndClientApi = frontEndClientApi.replace(/\\"/g, '"')
      .replace(/\\n/g, '\n')
      .trim();
    }
  
    // 9. 提取 frontEnd flow chart (时序图)
    const flowChartFrontMatch = str.match(/"frontEnd flow chart":\s*"([\s\S]*?)"(?=,\s*"Total File list")/);
    let frontEndFlowChart = flowChartFrontMatch ? flowChartFrontMatch[1].trim() : '';
    if(frontEndFlowChart){
      frontEndFlowChart = frontEndFlowChart.replace(/\\"/g, '"')
      .replace(/\\n/g, '\n')
      .trim();
    }

    // 10.提取 "Toal File list"
    const totalFileListMatch = str.match(/"Total File list":\s*([\s\S]*?)(?=,\s*"Anything UNCLEAR")/);
    let totalfileList = totalFileListMatch ? totalFileListMatch[1] : [];
  
    // 10. 提取 Anything UNCLEAR
    const unclearMatch = str.match(/"Anything UNCLEAR":\s*"((?:\\"|[^"]*)")/);
    const anythingUnclear = unclearMatch ? unclearMatch[1] : '';
  
    // 构建最终JSON对象
    return {
      "Implementation approach": implementationApproach,
      "File list": fileList,
      "Flow chart Diagram": flowChartDiagram,
      "Full API spec": fullApiSpec,
      "Data structures and interfaces": dataStructures,
      "Program call flow": programCallFlow,
      "Database operation": databaseOperation,
      "frontEnd clientApi": frontEndClientApi,
      "frontEnd flow chart": frontEndFlowChart,
      "Total File list":totalfileList,
      "Anything UNCLEAR": anythingUnclear
    };
}

  const handleAction = (action: ActionType, content: string) => {
    const promptType = getPromptType(action);

    if (action === 'generateDoc') {
      handleGenerateDoc(content);
      return;
    }

    if (action === 'adjust') {
      setCurrentStage(prev => ({ ...prev, editMode: 'llm' }));
      setSelectedMessageContent(content);
      setCurrentInput('');
    } else if (action === 'edit') {
      setCurrentInput(content);
      setCurrentStage(prev => ({ ...prev, editMode: 'manual' }));
    } else {
      const isAdjustConfirm = currentStage.editMode === 'llm';
      onSend(
        isAdjustConfirm ? currentInput : content,
        isAdjustConfirm ? getPromptType('adjust') : promptType,
        isAdjustConfirm ? selectedMessageContent : undefined
      );
      setCurrentInput('');
      setCurrentStage(prev => ({ ...prev, editMode: 'none' }));
    }
  };

  const handleSubmit = () => {
    console.log('⚡ ChatFlow handleSubmit called');
    console.log('📝 Current input:', currentInput);
    console.log('🎭 Current stage:', currentStage);

    if (!currentInput.trim()) {
      console.log('❌ Empty input, returning');
      return;
    }

    const promptType = currentStage.editMode === 'llm' 
      ? getPromptType('adjust')
      : getPromptType('confirm');
    
    console.log('🎯 Selected prompt type:', promptType);

    if (currentStage.editMode === 'llm') {
      console.log('🤖 Sending LLM adjust message');
      onSend(currentInput, promptType, selectedMessageContent);
    } else {
      console.log('✉️ Sending normal message');
      onSend(currentInput, promptType);
    }
    
    setCurrentInput('');
    setCurrentStage(prev => ({ ...prev, editMode: 'none' }));
  };

  const getPlaceholder = () => {
    if (tabType === 'incremental' && currentStage.currentRole === 'user') {
      return "输入增量需求指令...";
    }
    return "请输入内容...";
  };

  // 添加调试日志
  console.log('ChatFlow render:', { 
    messages, 
    messagesLength: messages.length,
    messageIds: messages.map(m => m.id),
    messageContents: messages.map(m => ({ id: m.id, content: m.content.substring(0, 50) + '...' })),
    currentStage 
  });
  
  // 断点：检查ChatFlow接收到的props
  

  return (
    <div className={`chat-flow ${tabType}`}>
      <div className="message-list" ref={messagesContainerRef}
        >
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className="message-item" 
            data-role={msg.role}
            ref={(el) => {
              if (el && messageRefs.current) {
                messageRefs.current[msg.id] = el;
              }
            }}
          >
            {tabType === 'incremental' && <div className="incremental-badge">增量需求</div>}
            
            <div className="message-header">
              <img 
                src={`/avatars/${msg.role}.png`}
                alt={roleDisplayNames[msg.role]}
                className="avatar"
                onClick={() => onRoleClick?.(msg.role, msg.id)}
              />
              <span className="role-name">{roleDisplayNames[msg.role]}</span>
            </div>
            
            <div className="message-bubble">
              <div 
                className="message-content"
                ref={(el) => messageContentRefs.current[msg.id] = el}
              >
                {msg.content}
              </div>

              {msg.showActions && (
                <div className="action-buttons">
                  <button onClick={() => handleAction('confirm', msg.content)}>✓ 确认提交</button>
                  <button onClick={() => {
                    setSelectedMessageContent(msg.content);
                    handleAction('edit', msg.content);
                  }}>✏ 手动调整</button>
                  <button onClick={() => {
                    setSelectedMessageContent(msg.content);
                    handleAction('adjust', msg.content);
                  }}>🤖 AI调整</button>
                  {msg.role === 'arch' && (
                    <button 
                      onClick={() => handleAction('generateDoc', msg.content)}
                      className="generate-doc-btn"
                    >📄 生成设计文档</button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="edit-area">
        <textarea
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && currentStage.editMode === 'none') {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder={getPlaceholder()}
        />
        
        <div className="edit-controls">
          {(currentStage.editMode === 'manual' || currentStage.editMode === 'llm') && (
            <button onClick={handleSubmit}>
              {currentStage.editMode === 'manual' ? '完成编辑' : '提交修改指令'}
            </button>
          )}
          
          {currentStage.editMode === 'none' && (
            <button onClick={handleSubmit} disabled={!currentInput.trim()}>提交</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatFlow;