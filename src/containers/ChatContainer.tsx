import React from 'react';
import CreateTab from './CreateTab';
import '../styles/chat-flow.css';

export type TabType = 'create' | 'incremental';

interface ChatContainerProps {
  activeTab: TabType;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ activeTab }) => {

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      padding: 'var(--space-4)'
    }}>
      {/* Tab Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* 暂时只显示创建需求，增量需求开发中 */}
        <CreateTab />
      </div>
    </div>
  );
};

export default ChatContainer;