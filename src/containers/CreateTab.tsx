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
  
  // 默认状态
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

  const updateState = (updater: (prev: TabState) => TabState) => {
    // 获取当前最新的状态
    setState(prev => {
      const newState = updater(prev);
      console.log('🔄 updateState - Previous state:', prev);
      console.log('🔄 updateState - New state:', newState);
      onUpdateSessionState(newState);
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

  // 辅助函数
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

  const getNextRole = (currentRole: Role, promptType: PromptType): Role => {
    // 如果是调整，保持当前角色
    if (promptType.includes('_adjust')) {
      return currentRole;
    }
    
    // 如果是确认，进入下一个角色
    const shouldProgress = promptType.endsWith('_confirm') && 
                         !promptType.includes('_adjust');
    
    return shouldProgress ? roleFlow[roleFlow.indexOf(currentRole) + 1] || currentRole : currentRole;
  };

  const handleRoleClick = (role: Role) => {
    updateState(prev => ({
      ...prev,
      currentStage: { ...prev.currentStage, currentRole: role }
    }));
  };

  // 主要发送函数
  const onSend = async (
    content: string, 
    promptType: PromptType, 
    originalContent?: string
  ) => {
    console.log('🚀 onSend called:', { content, promptType, originalContent });
    
    if (!content.trim() || isLoading) {
      console.log('onSend early return:', { contentEmpty: !content.trim(), isLoading });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 获取最新状态
      const latestState = currentSession?.tabState || getDefaultState();
      const currentRole = latestState.currentStage.currentRole;
      const timestamp = Date.now();
      
      const userMessageId = `user_${timestamp}`;
      const aiMessageId = `ai_${timestamp}`;

      // 添加用户消息
      const userMessage: MessageItem = {
        id: userMessageId,
        role: currentRole,
        content,
        showActions: false
      };

      console.log('📝 Adding user message');
      console.log('Current state before update:', currentSession?.tabState);
      updateState(prev => {
        const newState = {
          ...prev,
          messages: [...prev.messages, userMessage]
        };
        console.log('New state after adding user message:', newState);
        return newState;
      });

      // 获取提示词
      const [role, action] = promptType.split('_') as [Role, ActionType];
      console.log('Getting prompt for:', { role, action });   

      const { system, user: userPrompt } = getPrompt(role, action);

      // 准备API内容      
      const apiContent = userPrompt.replace('{user_input}', content);

      // 创建AI消息       
      const aiRole = getAIRole(latestState.currentStage.currentRole, promptType);
      const aiMessage: MessageItem = {
        id: aiMessageId,  
        role: aiRole,     
        content: '思考中...',
        showActions: false
      };

      console.log('🤖 Adding AI message placeholder');
      updateState(prev => ({
        ...prev,
        messages: [...prev.messages, aiMessage]
      }));

      // OpenAI 请求
      console.log('🔥 Starting OpenAI stream');
      
      const openai = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: 'sk-bb509f13ddf44ec1b539b30efcc5661a',
        dangerouslyAllowBrowser: true
      });

      const stream = await openai.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: system },
          { role: "user", content: apiContent }
        ],
        stream: true,
      });

      let fullResponse = '';
      console.log('=== STARTING STREAM ===');
      
      for await (const chunk of stream) {
        const contentChunk = chunk.choices[0]?.delta?.content || "";
        fullResponse += contentChunk;
        
        console.log('📝 Stream chunk received, fullResponse length:', fullResponse.length);
        
        updateState(prev => {
          const newState = {
            ...prev,
            messages: prev.messages.map(msg => 
              msg.id === aiMessageId 
                ? { ...msg, content: fullResponse } 
                : msg
            )
          };
          return newState;
        });
      }

      console.log('✅ OpenAI request completed. Final response length:', fullResponse.length);
      console.log('📄 Final response content:', fullResponse);
      
      // 断点：检查API响应数据
      // 完成后设置 showActions
      updateState(prev => {
        const newState = {
          ...prev,
          messages: prev.messages.map(msg =>
            msg.id === aiMessageId
              ? { ...msg, showActions: true }
              : msg
          ),
          currentStage: { 
            ...prev.currentStage,
            currentRole: getNextRole(prev.currentStage.currentRole, promptType)
          }
        };
        console.log('📊 Final state after completion:', newState);
        
        
        return newState;
      });

    } catch (error) {     
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