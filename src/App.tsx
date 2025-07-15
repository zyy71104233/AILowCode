import React from 'react';
import ChatFlow from './components/ChatFlow';
import { useChatFlow } from './hooks/useChatFlow';
import './styles/chat-flow.css';
import ChatContainer from './containers/ChatContainer';
const App: React.FC = () => {
  const { messages, processStage, handleSend } = useChatFlow();

  return (
    <div className="app-container">
      <h2>AI低代码平台</h2>
      <ChatContainer />
      {/* <ChatFlow 
        messages={messages}
        currentStage={processStage}
        onSend={handleSend}
      /> */}
    </div>
  );
};

export default App;