import { useState, useCallback } from 'react';
import { TabState } from '../types/types';

export interface SessionData {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  tabState: TabState;
  viewState: {
    scrollPosition: number;
    selectedMessageId?: string;
    inputValue: string;
  };
}

export interface SessionManager {
  sessions: SessionData[];
  currentSessionId: string | null;
}

// 生成初始TabState
const getInitialTabState = (): TabState => ({
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

// 生成初始ViewState
const getInitialViewState = () => ({
  scrollPosition: 0,
  inputValue: ''
});

// 智能标题生成函数
const generateSessionTitle = (firstMessage: string): string => {
  if (!firstMessage || firstMessage.trim().length === 0) {
    return `新会话 ${new Date().toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
  }

  const content = firstMessage.trim();
  
  // 提取关键词
  const keywords = ['APP', '系统', '平台', '网站', '小程序', '功能', '模块', '项目'];
  
  // 查找项目类型关键词
  let projectType = '';
  for (const keyword of keywords) {
    if (content.includes(keyword)) {
      projectType = keyword;
      break;
    }
  }
  
  // 尝试提取具体项目名称
  const patterns = [
    /开发(.{1,10})(APP|系统|平台|网站|小程序)/,
    /创建(.{1,10})(功能|模块)/,
    /设计(.{1,10})(界面|页面)/,
    /实现(.{1,10})(功能)/
  ];
  
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      const name = match[1].replace(/[的一个]/g, '').trim();
      if (name && name.length > 0) {
        return `${name}${match[2] || projectType}`;
      }
    }
  }
  
  // 如果找到项目类型但没有具体名称
  if (projectType) {
    return `${projectType}开发`;
  }
  
  // 截取前15个字符作为标题
  const title = content.length > 15 ? content.substring(0, 15) + '...' : content;
  return title;
};

export const useSessionManager = () => {
  const [sessionManager, setSessionManager] = useState<SessionManager>({
    sessions: [],
    currentSessionId: null
  });

  // 创建新会话
  const createSession = useCallback(() => {
    const newSession: SessionData = {
      id: `session_${Date.now()}`,
      title: `新会话 ${sessionManager.sessions.length + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      tabState: getInitialTabState(),
      viewState: getInitialViewState()
    };

    setSessionManager(prev => ({
      sessions: [newSession, ...prev.sessions],
      currentSessionId: newSession.id
    }));

    return newSession.id;
  }, [sessionManager.sessions.length]);

  // 切换会话
  const switchSession = useCallback((sessionId: string) => {
    setSessionManager(prev => ({
      ...prev,
      currentSessionId: sessionId
    }));
  }, []);

  // 删除会话
  const deleteSession = useCallback((sessionId: string) => {
    setSessionManager(prev => {
      const newSessions = prev.sessions.filter(s => s.id !== sessionId);
      let newCurrentId = prev.currentSessionId;

      // 如果删除的是当前会话，切换到第一个会话
      if (sessionId === prev.currentSessionId) {
        newCurrentId = newSessions.length > 0 ? newSessions[0].id : null;
      }

      return {
        sessions: newSessions,
        currentSessionId: newCurrentId
      };
    });
  }, []);

  // 更新会话数据
  const updateSession = useCallback((sessionId: string, updates: Partial<SessionData>) => {
    console.log('🔄 useSessionManager.updateSession called');
    console.log('🆔 Session ID:', sessionId);
    console.log('📝 Updates messages length:', updates.tabState?.messages.length);
    
    setSessionManager(prev => {
      const result = {
        ...prev,
        sessions: prev.sessions.map(session => {
          if (session.id === sessionId) {
            const updatedSession = { ...session, ...updates, updatedAt: new Date() };
            
            console.log('🔄 Session updated successfully');
            console.log('📊 Old messages length:', session.tabState.messages.length);
            console.log('📊 New messages length:', updatedSession.tabState.messages.length);
            
            // 如果是第一次添加消息，自动生成标题
            if (updates.tabState && session.tabState.messages.length === 0 && updates.tabState.messages.length > 0) {
              const firstMessage = updates.tabState.messages[0]?.content;
              if (firstMessage && session.title.startsWith('新会话')) {
                updatedSession.title = generateSessionTitle(firstMessage);
                console.log('🏷️ Generated new title:', updatedSession.title);
              }
            }
            
            return updatedSession;
          }
          return session;
        })
      };
      
      return result;
    });
  }, []);

  // 获取当前会话
  const getCurrentSession = useCallback(() => {
    return sessionManager.sessions.find(s => s.id === sessionManager.currentSessionId);
  }, [sessionManager]);

  // 更新当前会话的TabState
  const updateCurrentSessionTabState = useCallback((tabState: TabState) => {
    if (sessionManager.currentSessionId) {
      updateSession(sessionManager.currentSessionId, { tabState });
    }
  }, [sessionManager.currentSessionId, updateSession]);

  return {
    sessions: sessionManager.sessions,
    currentSessionId: sessionManager.currentSessionId,
    createSession,
    switchSession,
    deleteSession,
    updateSession,
    getCurrentSession,
    updateCurrentSessionTabState
  };
}; 