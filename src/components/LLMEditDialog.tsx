// src/components/LLMEditDialog.tsx
import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

interface EditorProps {
  content: string;
  onClose: () => void;
  onSubmit: (instruction: string) => void;
}

const LLMEditDialog: React.FC<EditorProps> = ({ 
  content, 
  onClose, 
  onSubmit 
}) => {
  const [instruction, setInstruction] = useState('');

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <h3>AI 编辑</h3>
        <Editor
          height="300px"
          defaultLanguage="markdown"
          value={content}
          options={{ readOnly: true }}
        />
        <textarea
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="输入修改指令..."
        />
        <div className="dialog-actions">
          <button onClick={onClose}>取消</button>
          <button onClick={() => onSubmit(instruction)}>确认</button>
        </div>
      </div>
    </div>
  );
};

export default LLMEditDialog;