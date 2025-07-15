import { useState } from 'react';
import { MessageItem, ProcessStage, PromptType } from '../types/types';

export const useChatFlow = () => {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [processStage, setProcessStage] = useState<ProcessStage>({
    currentRole: 'user',
    editMode: 'none'
  });

  const updateRole = (currentRole: ProcessStage['currentRole'], promptType: PromptType) => {
    const roleFlow: Record<ProcessStage['currentRole'], ProcessStage['currentRole']> = {
        user: 'pd',
      pd: 'arch',
      arch: 'proj',
      proj: 'dev',
      dev: 'dev'
    };
  
    const isAdjust = promptType.includes('adjust');
    const nextRole = isAdjust ? currentRole : roleFlow[currentRole];
    
    setProcessStage(prev => ({
      ...prev,
      currentRole: nextRole,
      editMode: isAdjust ? 'llm' : 'none'
    }));
  };

  const addMessage = (role: MessageItem['role'], content: string) => {
    const newMessage: MessageItem = {
      id: Date.now().toString(),
      role,
      content,
      showActions: true
    };

    setMessages(prev => {
      const updated = prev.map(m => ({ ...m, showActions: false }));
      return [...updated, newMessage];
    });
  };

  const handleSend = async (content: string, promptType: PromptType) => {
    addMessage(processStage.currentRole, content);
    updateRole(processStage.currentRole, promptType);
  };

  return { messages, processStage, handleSend };
};