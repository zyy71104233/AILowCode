import React from 'react';
import { Button } from 'antd';
import { PlusOutlined, MessageOutlined, ClockCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { SessionData } from '../hooks/useSessionManager';

interface SessionSidebarProps {
  sessions: SessionData[];
  currentSessionId: string | null;
  onCreateSession: () => void;
  onSwitchSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
}

const SessionSidebar: React.FC<SessionSidebarProps> = ({
  sessions,
  currentSessionId,
  onCreateSession,
  onSwitchSession,
  onDeleteSession
}) => {
  
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString();
  };
  
  const getLastMessage = (session: SessionData) => {
    const lastMessage = session.tabState.messages[session.tabState.messages.length - 1];
    if (!lastMessage) return '还没有消息';
    
    const content = lastMessage.content;
    return content.length > 30 ? content.substring(0, 30) + '...' : content;
  };

  const handleDeleteClick = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这个会话吗？')) {
      onDeleteSession(sessionId);
    }
  };

  return (
    <div style={{
      height: '100%',
      backgroundColor: 'var(--bg-secondary)',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid var(--border-color)'
    }}>
      {/* Header */}
      <div style={{
        padding: 'var(--space-4)',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-primary)'
      }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={onCreateSession}
          style={{ 
            width: '100%',
            height: '40px',
            fontSize: '14px'
          }}
        >
          新建会话
        </Button>
      </div>
      
      {/* Session List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: 'var(--space-2) 0'
      }}>
        {sessions.map(session => (
          <div 
            key={session.id}
            onClick={() => onSwitchSession(session.id)}
            style={{
              padding: 'var(--space-3) var(--space-4)',
              margin: '0 var(--space-2)',
              borderRadius: 'var(--radius-base)',
              cursor: 'pointer',
              backgroundColor: session.id === currentSessionId ? 'var(--color-primary-light)' : 'transparent',
              border: session.id === currentSessionId ? '1px solid var(--color-primary)' : '1px solid transparent',
              transition: 'all 0.2s ease',
              marginBottom: 'var(--space-1)',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              if (session.id !== currentSessionId) {
                e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (session.id !== currentSessionId) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            {/* Session Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 'var(--space-1)'
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                lineHeight: '1.4',
                flex: 1,
                marginRight: 'var(--space-2)'
              }}>
                {session.title}
              </div>
              
              <button
                onClick={(e) => handleDeleteClick(session.id, e)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px',
                  borderRadius: '4px',
                  color: 'var(--color-gray-500)',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '20px',
                  height: '20px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-danger-light)';
                  e.currentTarget.style.color = 'var(--color-danger)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--color-gray-500)';
                }}
              >
                <DeleteOutlined />
              </button>
            </div>
            
            {/* Time and Message Count */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              marginBottom: 'var(--space-1)',
              fontSize: '12px',
              color: 'var(--color-gray-600)'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ClockCircleOutlined style={{ fontSize: '11px' }} />
                {formatTime(session.updatedAt)}
              </span>
              <span>·</span>
              <span>{session.tabState.messages.length}条消息</span>
            </div>
            
            {/* Last Message */}
            <div style={{
              fontSize: '12px',
              color: 'var(--color-gray-500)',
              lineHeight: '1.3',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}>
              {getLastMessage(session)}
            </div>
          </div>
        ))}
      </div>
      
      {/* Empty State */}
      {sessions.length === 0 && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-6)',
          color: 'var(--color-gray-500)',
          textAlign: 'center'
        }}>
          <MessageOutlined style={{ 
            fontSize: '48px', 
            color: 'var(--color-gray-400)',
            marginBottom: 'var(--space-4)'
          }} />
          <div style={{ fontSize: '16px', marginBottom: 'var(--space-2)' }}>
            还没有会话
          </div>
          <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
            点击上方按钮创建新会话<br />
            开始您的AI开发之旅
          </div>
        </div>
      )}
      
      {/* Footer */}
      <div style={{
        padding: 'var(--space-3) var(--space-4)',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-primary)',
        fontSize: '12px',
        color: 'var(--color-gray-500)',
        textAlign: 'center'
      }}>
        共 {sessions.length} 个会话
      </div>
    </div>
  );
};

export default SessionSidebar;