import { useState } from 'react';
import CreateTab from './CreateTab';
import IncrementalTab from './IncrementalTab';
import { TabState, TabType } from '../types/types';

export default function ChatContainer() {
  const [activeTab, setActiveTab] = useState<TabType>('create');
  const [isLoading, setIsLoading] = useState(false);
  
  const [tabStates, setTabStates] = useState<Record<TabType, TabState>>({
    create: {
      messages: [],
      currentStage: { currentRole: 'user', editMode: 'none' },
      uploadedFiles: {
        user: null,
        pd: null,
        arch: null,
        proj: null,
        dev: null
      }
    },
    incremental: {
      messages: [],
      currentStage: { currentRole: 'user', editMode: 'none' },
      uploadedFiles: {
        user: null,
        pd: null,
        arch: null,
        proj: null,
        dev: null
      }
    }
  });

  const updateTabState = (tab: TabType, updater: (prev: TabState) => TabState) => {
    setTabStates(prev => ({
      ...prev,
      [tab]: updater(prev[tab])
    }));
  };

  return (
    <div className="chat-container">
      <div className="segmented-control">
        <button 
          className={activeTab === 'create' ? 'active' : ''}
          onClick={() => setActiveTab('create')}
        >
          创建新需求
        </button>
        <button 
          className={activeTab === 'incremental' ? 'active' : ''}
          onClick={() => setActiveTab('incremental')}
        >
          增量需求
        </button>
      </div>

      {activeTab === 'create' && (
        <CreateTab
          state={tabStates.create}
          updateState={(updater) => updateTabState('create', updater)}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      )}

      {activeTab === 'incremental' && (
        <IncrementalTab
          state={tabStates.incremental}
          updateState={(updater) => updateTabState('incremental', updater)}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      )}
    </div>
  );
}