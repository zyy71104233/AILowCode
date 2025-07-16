// pages/CreateTab.tsx
import { useState, useEffect, useRef } from 'react';
import ChatFlow from '../components/ChatFlow';
import { MessageItem, TabState, PromptType, Role, ActionType } from '../types/types';
import { SessionData } from '../hooks/useSessionManager';
import OpenAI from "openai";
import { getPrompt } from '../lib/prompt';

const roleFlow: Role[] = ['user', 'pd', 'arch', 'proj', 'dev'];

interface CreateTabProps {
  currentSession?: SessionData;
  onUpdateSessionState: (newTabState: TabState) => void;
}

export default function CreateTab({ currentSession, onUpdateSessionState }: CreateTabProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  const [completedRoles, setCompletedRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // 默认状态初始化函数
  const getDefaultState = (): TabState => ({
    messages: [],
    currentStage: { currentRole: 'user', editMode: 'none' },
    uploadedFiles: {
      user: null,
      pd: null,
      arch: null,
      proj: null,
      dev: null
    }
  });

  const [state, setState] = useState<TabState>(currentSession?.tabState || getDefaultState());
  
  // 当currentSession改变时更新state
  useEffect(() => {
    if (currentSession?.tabState) {
      setState(currentSession.tabState);
    }
  }, [currentSession]);

  // 添加调试日志
  console.log('CreateTab render:', { 
    currentSession: !!currentSession, 
    stateMessages: state.messages,
    messagesLength: state.messages.length 
  });

  // 统一的状态更新函数
  // 负责更新本地状态和同步到会话管理器
  // 只在消息数量、角色或编辑模式发生变化时才同步会话
  const updateState = (updater: (prev: TabState) => TabState) => {
    setState(prev => {
      const newState = updater(prev);
      // 只在消息数量或角色发生变化时才更新session
      if (
        prev.messages.length !== newState.messages.length ||
        prev.currentStage.currentRole !== newState.currentStage.currentRole ||
        prev.currentStage.editMode !== newState.currentStage.editMode
      ) {
        onUpdateSessionState(newState);
      }
      return newState;
    });
  };

  // 将useEffect移到早期返回之前
  useEffect(() => {
    if (state?.messages) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state?.messages]);

  useEffect(() => {
    if (state?.currentStage?.currentRole) {
      const roles: Role[] = [];
      let foundCurrent = false;
      
      for (const role of roleFlow) {
        if (role === state.currentStage.currentRole) {
          foundCurrent = true;
          break;
        }
        roles.push(role);
      }
      
      setCompletedRoles(foundCurrent ? roles : []);
    }
  }, [state?.currentStage?.currentRole]);

  // 如果没有当前会话，显示空状态
  if (!currentSession) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-gray-500)',
        fontSize: '16px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
        <div>请先创建一个会话开始对话</div>
      </div>
    );
  }

  // 获取AI角色函数
  // 根据当前角色和promptType确定下一个AI回复的角色
  // 如果是调整操作，保持当前角色；否则获取下一个角色
  const getAIRole = (currentRole: Role, promptType: PromptType): Role => {
    if (promptType.includes('_adjust')) {
      return currentRole; // 调整时保持当前角色
    }
    
    const currentIndex = roleFlow.indexOf(currentRole);
    if (currentIndex < roleFlow.length - 1) {
      return roleFlow[currentIndex + 1];
    }
    return currentRole;
  };

  // 获取下一个角色函数
  // 处理角色流转逻辑
  // 确认操作时进入下一角色，调整操作时保持当前角色
  const getNextRole = (currentRole: Role, promptType: PromptType): Role => {
    console.log('🔄 getNextRole called:', {
      currentRole,
      promptType,
      shouldProgress: promptType.endsWith('_confirm') && !promptType.includes('_adjust'),
      nextRole: promptType.endsWith('_confirm') && !promptType.includes('_adjust') 
        ? roleFlow[roleFlow.indexOf(currentRole) + 1] || currentRole 
        : currentRole
    });
    
    // 如果是调整，保持当前角色
    if (promptType.includes('_adjust')) {
      return currentRole;
    }
    
    // 如果是确认，进入下一个角色
    const shouldProgress = promptType.endsWith('_confirm') && 
                         !promptType.includes('_adjust');
    
    const nextRole = shouldProgress ? roleFlow[roleFlow.indexOf(currentRole) + 1] || currentRole : currentRole;
    console.log('Role transition:', {
      from: currentRole,
      to: nextRole,
      promptType,
      shouldProgress
    });
    return nextRole;
  };

  // 角色点击处理函数
  // 更新当前角色状态
  const handleRoleClick = (role: Role) => {
    updateState(prev => ({
      ...prev,
      currentStage: { ...prev.currentStage, currentRole: role }
    }));
  };

  // 主要消息发送函数
  // 处理消息发送、API调用和状态更新的核心逻辑
  const onSend = async (
    content: string, 
    promptType: PromptType, 
    originalContent?: string,
    options: { createUserMessage?: boolean } = { createUserMessage: true }
  ) => {
    console.log('🚀 onSend called:', { 
      content: content.substring(0, 50) + '...',
      promptType,
      originalContent: originalContent?.substring(0, 50) + '...',
      options,
      currentState: {
        currentRole: state.currentStage.currentRole,
        editMode: state.currentStage.editMode,
        messagesCount: state.messages.length
      }
    });
    
    // 空内容或正在加载时不处理
    if (!content.trim() || isLoading) {
      console.log('onSend early return:', { contentEmpty: !content.trim(), isLoading });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 生成消息ID和确定角色
      const timestamp = Date.now();
      const [role, action] = promptType.split('_') as [Role, ActionType];
      const messageRole = role;
      const nextAiRole = getAIRole(messageRole, promptType);
      
      console.log('📊 Role transition:', {
        messageRole,
        nextAiRole,
        promptType,
        action
      });

      // 创建消息ID
      const userMessageId = `user_${timestamp}`;
      const aiMessageId = `ai_${timestamp}`;

      // 只在需要时创建并添加用户消息
      if (options.createUserMessage) {
        const userMessage: MessageItem = {
          id: userMessageId,
          role: messageRole,
          content,
          showActions: false
        };

        updateState(prev => ({
          ...prev,
          messages: [...prev.messages, userMessage]
        }));
      }

      // 获取提示词
      const { system, user: userPrompt } = getPrompt(role, action);
      const apiContent = userPrompt.replace('{user_input}', content);

      // 创建并添加AI思考中消息
      const aiMessage: MessageItem = {
        id: aiMessageId,  
        role: nextAiRole,     
        content: '思考中...',
        showActions: false
      };

      updateState(prev => ({
        ...prev,
        messages: [...prev.messages, aiMessage]
      }));

      // 调用OpenAI API
      const openai = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: 'sk-bb509f13ddf44ec1b539b30efcc5661a',
        dangerouslyAllowBrowser: true
      });

      // 创建流式请求
      const stream = await openai.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: system },
          { role: "user", content: apiContent }
        ],
        stream: true,
      });

      // 流式更新AI回复内容
      let fullResponse = '';
      for await (const chunk of stream) {
        const contentChunk = chunk.choices[0]?.delta?.content || "";
        fullResponse += contentChunk;
        
        updateState(prev => ({
          ...prev,
          messages: prev.messages.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, content: fullResponse } 
              : msg
          )
        }));
      }
      
      // 完成后更新消息状态和角色
      updateState(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.id === aiMessageId
            ? { ...msg, showActions: true }
            : msg
        ),
        currentStage: { 
          ...prev.currentStage,
          currentRole: getNextRole(messageRole, promptType)  // 使用消息角色来计算下一个角色
        }
      }));

    } catch (error) {     
      // 错误处理：更新失败消息
      console.error('=== onSend ERROR ===', error);
      updateState(prev => {
        const newState = {
          ...prev,
          messages: prev.messages.map(msg =>
            msg.role.includes('ai') && msg.content === '思考中...'
              ? { ...msg, content: `请求失败: ${error}`, showActions: true }
              : msg
          )
        };
        return newState;
      });
    } finally {
      console.log('=== onSend FINALLY ===');
      setIsLoading(false);
    }
  };

  // 消息编辑完成处理函数
  // 更新编辑后的消息内容，并处理消息的显示状态
  const handleEditComplete = (newContent: string, messageId: string) => {
    updateState(prev => ({
      ...prev,
      messages: prev.messages.map(msg => 
        msg.id === messageId
          ? { ...msg, content: newContent, showActions: true }
          : { ...msg, showActions: false }
      )
    }));
  };

  return (
    <div className="create-tab-container" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 移除了 RoleWorkspace，现在在 App.tsx 右侧 */}
      
      <div className="chat-area" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ChatFlow 
          messages={state.messages}
          onSend={onSend}
          currentStage={state.currentStage}
          setCurrentStage={(stage) => updateState(prev => ({ 
            ...prev, 
            currentStage: typeof stage === 'function' 
              ? stage(prev.currentStage)
              : stage 
          }))}
          onEditComplete={handleEditComplete}
          tabType="create"
          onRoleClick={(role, messageId) => handleRoleClick(role)}
          messageRefs={messageRefs}
        />
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}