import React, { useState } from 'react';
import './styles/chat-flow.css';
import ChatContainer from './containers/ChatContainer';
import DesignSystemShowcase from './components/DesignSystemShowcase';

function App() {
  const [showDesignSystem, setShowDesignSystem] = useState(false);

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
        
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => setShowDesignSystem(true)}
          >
            设计系统
          </button>
          <button className="btn btn-outline btn-sm">设置</button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ height: 'calc(100vh - 80px)' }}>
        <ChatContainer />
      </main>
    </div>
  );
}

export default App;