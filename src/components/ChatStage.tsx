import React, { useState } from 'react';
import { MessageItem } from '../types/types';
import LLMEditDialog from './LLMEditDialog';
import styles from '../styles/ChatStage.module.css';

interface ChatStageProps {
  message: MessageItem;
  onAction: (action: string, data?: any) => void;
}

const ChatStage: React.FC<ChatStageProps> = ({ message, onAction }) => {
  const [editMode, setEditMode] = useState(false);
  const [llmEditMode, setLlmEditMode] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  // 类型安全的操作按钮配置
  const actionConfig = {
    confirm: { label: '确认提交', style: styles.confirm },
    edit: { label: '手动编辑', style: styles.edit },
    llm_edit: { label: 'AI修改', style: styles.llmEdit }
  };

  // 角色显示名称映射
  const roleDisplayNames: Record<MessageItem['role'], string> = {
    user: '用户',
    pd: '产品经理',
    arch: '系统架构师',
    proj:'项目经理',
    dev: '开发工程师'
  };

  const handleAction = (action: keyof typeof actionConfig) => {
    switch (action) {
      case 'confirm':
        onAction('confirm', { content: editContent });
        break;
      case 'edit':
        setEditMode(true);
        break;
      case 'llm_edit':
        setLlmEditMode(true);
        break;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img 
          src={`/avatars/${message.role}.png`} 
          alt={roleDisplayNames[message.role]} 
          className={styles.avatar}
        />
        <h3>{roleDisplayNames[message.role]}的建议</h3>
      </div>

      {/* 内容展示区域 */}
      {editMode ? (
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className={styles.editArea}
        />
      ) : (
        <div className={styles.content}>
          {message.content}
        </div>
      )}

      {/* 操作按钮 */}
      {message.showActions && (
        <div className={styles.actions}>
          {(Object.keys(actionConfig) as (keyof typeof actionConfig)[]).map(action => (
            <button
              key={action}
              onClick={() => handleAction(action)}
              className={actionConfig[action].style}
            >
              {actionConfig[action].label}
            </button>
          ))}
        </div>
      )}

      {llmEditMode && (
        <LLMEditDialog
          content={message.content}
          onClose={() => setLlmEditMode(false)}
          onSubmit={(instruction) => {
            onAction('llm_edit', { 
              instruction,
              content: message.content 
            });
            setLlmEditMode(false);
          }}
        />
      )}
    </div>
  );
};

export default ChatStage;