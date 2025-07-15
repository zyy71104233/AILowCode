import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageItem, ProcessStage, PromptType } from '../types/types';

interface ChatFlowProps {
  messages: MessageItem[];
  onSend: (content: string, promptType: PromptType,originalContent?: string) => void;
  currentStage: ProcessStage;
  setCurrentStage: React.Dispatch<React.SetStateAction<ProcessStage>>;
  activeTab: 'create' | 'incremental';
}

const ChatFlow: React.FC<ChatFlowProps> = ({ 
  messages,
  onSend,
  currentStage,
  setCurrentStage,
  activeTab
}) => {
  const [currentInput, setCurrentInput] = useState('');
  const [selectedMessageContent, setSelectedMessageContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContentRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

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
  }, [messages]);

  const getDefaultIncrementalPrompt = () => {
    if (currentStage.currentRole === 'user' && activeTab === 'incremental') {
      return "基于需求文档，新增以下需求，回答内容不要包含上个迭代的需求，只包含本次迭代新增需求：1.xxxx 2.xxxx";
    }
    return "";
  };

  useEffect(() => {
    if (currentStage.currentRole === 'user' && activeTab === 'incremental') {
      setCurrentInput(getDefaultIncrementalPrompt());
    }
  }, [activeTab, currentStage.currentRole]);

  const roleMap: Record<
    ProcessStage['currentRole'], 
    Record<'confirm' | 'edit' | 'adjust', PromptType>
  > = {
    pd: {
      confirm: 'pd_confirm',
      edit: 'pd_edit',
      adjust: 'pd_adjust'
    },
    arch: {
      confirm: 'arch_confirm',
      edit: 'arch_edit',
      adjust: 'arch_adjust'
    },
    proj: {
      confirm: 'proj_confirm',
      edit: 'proj_edit',
      adjust: 'proj_adjust'
    },
    dev: {
      confirm: 'dev_confirm',
      edit: 'dev_edit',
      adjust: 'dev_adjust'
    },
    user: {
      confirm: 'user_confirm',
      edit: 'pd_edit',
      adjust: 'pd_adjust'
    }
  };

  const roleDisplayNames: Record<MessageItem['role'], string> = {
    user: '用户',
    pd: '产品经理',
    arch: '系统架构师',
    proj:'项目经理',
    dev: '开发工程师'
  };

  const getPromptType = (actionType: 'confirm' | 'edit' | 'adjust'): PromptType => {
    return roleMap[currentStage.currentRole][actionType];
  };

  const handleAction = (action: 'confirm' | 'edit' | 'adjust', content: string) => {
    const promptType = getPromptType(action);
    if (action === 'adjust') {
      setCurrentStage(prev => ({
        ...prev,
        editMode: 'llm'
      }));
      setSelectedMessageContent(content);
      setCurrentInput(''); // 清空输入框等待指令
    } else if (action === 'edit') {
      setCurrentInput(content);
      setCurrentStage(prev => ({
        ...prev,
        editMode: 'manual'
      }));
    } else {
      // 确认提交时区分是普通确认还是LLM调整后的确认
    const isAdjustConfirm = currentStage.editMode === 'llm';
    onSend(
      isAdjustConfirm ? currentInput : content,
      isAdjustConfirm ? getPromptType('adjust') : promptType,
      isAdjustConfirm ? selectedMessageContent : undefined
    );
    setCurrentInput('');
    }
  };

  /**
   * 处理编辑框区域的提交动作
   */
  const handleSubmit = () => {
    if (!currentInput.trim()) return;

    if (currentStage.editMode === 'llm') {
      // LLM模式：发送修改指令+原始内容
      onSend(currentInput, getPromptType('adjust'), selectedMessageContent);
    } 
    else {
      // 其他模式：直接发送当前内容
      onSend(currentInput, getPromptType('confirm'));
    }
    
    setCurrentInput('');
    setCurrentStage(prev => ({ ...prev, editMode: 'none' }));
  };


  return (
    <div className="chat-container">
      <div className="message-list">
        {messages.map((msg) => (
          <div key={msg.id} className="message-item">
            <div className="message-header">
              <img 
                src={`/avatars/${msg.role}.png`}
                alt={roleDisplayNames[msg.role]}
                className="avatar"
              />
              <span className="role-name">
                {roleDisplayNames[msg.role]}
              </span>
            </div>
            
            <div 
              className="message-content"
              ref={(el) => messageContentRefs.current[msg.id] = el}
            >
              {msg.content}
            </div>

            {msg.showActions && (
              <div className="action-buttons">
                <button onClick={() => handleAction('confirm', msg.content)}>
                  确认提交
                </button>
                <button onClick={() => {
                  setSelectedMessageContent(msg.content);
                  handleAction('edit', msg.content);
                }}>
                  手动编辑
                </button>
                <button onClick={() => {
                  setSelectedMessageContent(msg.content);
                  handleAction('adjust', msg.content);
                }}>
                  LLM编辑
                </button>
              </div>
            )}
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
          placeholder={
            currentStage.editMode === 'none' 
              ? activeTab === 'incremental' && currentStage.currentRole === 'user'
                ? "输入增量需求指令..."
                : "请输入内容..."
              : currentStage.editMode === 'manual'
                ? "请在此编辑内容..."
                : "请描述需要大模型修改的内容"
          }
        />
        
        <div className="edit-controls">
          {(currentStage.editMode === 'manual' || currentStage.editMode === 'llm') && (
            <button onClick={handleSubmit}>
              {currentStage.editMode === 'manual' ? '完成编辑' : '提交修改指令'}
            </button>
          )}
          
          {currentStage.editMode === 'none' && (
            <button onClick={handleSubmit} disabled={!currentInput.trim()}>
              提交
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatFlow;