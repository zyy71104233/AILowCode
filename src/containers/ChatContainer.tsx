import React, { useState } from 'react';
import { Segmented } from 'antd';
import { ThunderboltOutlined, AimOutlined } from '@ant-design/icons';
import CreateTab from './CreateTab';
import IncrementalTab from './IncrementalTab';
import '../styles/chat-flow.css';

export type TabType = 'create' | 'incremental';

const ChatContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('create');

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
          <AimOutlined style={{ fontSize: '14px' }} />
          <span>增量需求</span>
        </div>
      ),
      value: 'incremental'
    }
  ];

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      padding: 'var(--space-4)'
    }}>
      {/* Segmented Control */}
      <div style={{ 
        marginBottom: 'var(--space-4)',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <Segmented
          options={segmentedOptions}
          value={activeTab}
          onChange={(value) => setActiveTab(value as TabType)}
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

      {/* Tab Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activeTab === 'create' && <CreateTab />}
        {activeTab === 'incremental' && <IncrementalTab />}
      </div>
    </div>
  );
};

export default ChatContainer;