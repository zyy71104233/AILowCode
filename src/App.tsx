import React, { useState } from 'react';
import { Segmented } from 'antd';
import { ThunderboltOutlined, AimOutlined, BulbOutlined, SettingOutlined } from '@ant-design/icons';
import './styles/chat-flow.css';
import ChatContainer from './containers/ChatContainer';
import DesignSystemShowcase from './components/DesignSystemShowcase';
import SessionSidebar from './components/SessionSidebar';
import RoleWorkspace from './components/RoleWorkspace';
import { useSessionManager } from './hooks/useSessionManager';
import { Role, TabState } from './types/types';

export type TabType = 'create' | 'incremental';

function App() {
  const [showDesignSystem, setShowDesignSystem] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('create');
  
  // 会话管理
  const {
    sessions,
    currentSessionId,
    createSession,
    switchSession,
    deleteSession,
    getCurrentSession,
    updateSession
  } = useSessionManager();
  
  // 角色相关状态 - 从当前会话获取
  const currentSession = getCurrentSession();
  const currentRole = currentSession?.tabState.currentStage.currentRole || 'user';
  
  // 计算已完成的角色
  const roleFlow: Role[] = ['user', 'pd', 'arch', 'proj', 'dev'];
  const completedRoles = roleFlow.slice(0, roleFlow.indexOf(currentRole));

  // 状态更新回调
  const handleUpdateSessionState = (newTabState: TabState) => {
    console.log('🏠 App.handleUpdateSessionState called');
    console.log('📋 Current session ID:', currentSessionId);
    console.log('📊 New tab state messages:', newTabState.messages);
    console.log('📊 New messages length:', newTabState.messages.length);
    console.log('🔍 Current session before update:', currentSession);
    
    if (currentSessionId) {
      console.log('✅ Calling updateSession...');
      updateSession(currentSessionId, { tabState: newTabState });
      console.log('✅ Session updated');
    } else {
      console.error('❌ ERROR: No current session ID!');
      // 如果没有会话ID，先创建一个新会话
      console.log('🆕 Creating new session...');
      const newSessionId = createSession();
      if (newSessionId) {
        console.log('✅ New session created, updating state...');
        updateSession(newSessionId, { tabState: newTabState });
      }
    }
  };

  // 角色点击处理
  const handleRoleClick = (role: Role) => {
    if (!currentSession || !completedRoles.includes(role)) return;

    const lastMessage = [...currentSession.tabState.messages].reverse().find(msg => msg.role === role);
    
    if (lastMessage) {
      const newTabState = {
        ...currentSession.tabState,
        currentStage: { ...currentSession.tabState.currentStage, currentRole: role },
        messages: currentSession.tabState.messages.map(msg => ({
          ...msg,
          showActions: msg.id === lastMessage.id
        }))
      };
      
      handleUpdateSessionState(newTabState);
    }
  };

  const segmentedOptions = [
    {
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
          <ThunderboltOutlined style={{ fontSize: '14px' }} />
          <span>新建需求</span>
        </div>
      ),
      value: 'create'
    },
    {
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', opacity: 0.5 }}>
          <AimOutlined style={{ fontSize: '14px' }} />
          <span>增量需求</span>
          <span style={{ fontSize: '11px', color: 'var(--color-gray-500)' }}>(开发中)</span>
        </div>
      ),
      value: 'incremental',
      disabled: true
    }
  ];

  if (showDesignSystem) {
    return <DesignSystemShowcase onBack={() => setShowDesignSystem(false)} />;
  }

  return (
    <div className="App">
      {/* Header - 完全保持不变 */}
      <header style={{
        padding: 'var(--space-4) var(--space-6)',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-secondary)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)'
          }}>
            🤖 AI低代码平台
          </div>
        </div>
        
        {/* Segmented Control in Header */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <Segmented
            options={segmentedOptions}
            value={activeTab}
            onChange={(value) => {
              // 只允许切换到'create'，增量需求被禁用
              if (value === 'create') {
                setActiveTab(value as TabType);
              }
            }}
            size="middle"
            style={{
              backgroundColor: 'white',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-base)',
              padding: '2px',
              boxShadow: 'var(--shadow-sm)',
              fontSize: '14px'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => setShowDesignSystem(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}
          >
            <BulbOutlined />
            设计系统
          </button>
          <button 
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}
          >
            <SettingOutlined />
            设置
          </button>
        </div>
      </header>

      {/* Main Content - 三列布局 */}
      <main style={{ 
        height: 'calc(100vh - 80px)',
        display: 'grid',
        gridTemplateColumns: '250px 1fr 220px',
        overflow: 'hidden'
      }}>
        {/* 左侧：会话列表 */}
        <div style={{ overflow: 'hidden' }}>
          <SessionSidebar
            sessions={sessions}
            currentSessionId={currentSessionId}
            onCreateSession={createSession}
            onSwitchSession={switchSession}
            onDeleteSession={deleteSession}
          />
        </div>
        
        {/* 中间：聊天区域 */}
        <div style={{ overflow: 'hidden' }}>
          <ChatContainer 
            activeTab={activeTab}
            currentSession={currentSession}
            onUpdateSessionState={handleUpdateSessionState}
          />
        </div>
        
        {/* 右侧：角色工作区 */}
        <div style={{ 
          overflow: 'hidden',
          borderLeft: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-secondary)'
        }}>
          {currentSession && (
            <RoleWorkspace 
              currentRole={currentRole}
              completedRoles={completedRoles}
              onRoleClick={handleRoleClick}
              roleFlow={roleFlow}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;