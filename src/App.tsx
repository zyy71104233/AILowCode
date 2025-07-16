import React, { useState } from 'react';
import { Segmented } from 'antd';
import { ThunderboltOutlined, AimOutlined, BulbOutlined, SettingOutlined } from '@ant-design/icons';
import './styles/chat-flow.css';
import ChatContainer from './containers/ChatContainer';
import DesignSystemShowcase from './components/DesignSystemShowcase';

export type TabType = 'create' | 'incremental';

function App() {
  const [showDesignSystem, setShowDesignSystem] = useState(false);
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
      {/* Header */}
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

      {/* Main Content */}
      <main style={{ height: 'calc(100vh - 80px)' }}>
        <ChatContainer activeTab={activeTab} />
      </main>
    </div>
  );
}

export default App;