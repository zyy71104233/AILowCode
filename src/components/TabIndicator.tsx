import React from 'react';

interface TabIndicatorProps {
  activeTab: string;
  tabs: Array<{ id: string; label: string }>;
}

const TabIndicator: React.FC<TabIndicatorProps> = ({ activeTab, tabs }) => {
  const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
  
  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      gap: 'var(--space-2)',
      marginBottom: 'var(--space-4)',
      padding: 'var(--space-2)',
      background: 'rgba(255, 255, 255, 0.8)',
      borderRadius: 'var(--radius-full)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
    }}>
      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          style={{
            flex: 1,
            height: '6px',
            borderRadius: 'var(--radius-full)',
            background: index <= activeIndex 
              ? 'linear-gradient(90deg, #4f46e5, #7c3aed)' 
              : 'var(--color-gray-200)',
            transition: 'all var(--transition-slow)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {index <= activeIndex && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)',
              animation: 'shimmer 2s infinite'
            }} />
          )}
        </div>
      ))}
      
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default TabIndicator; 