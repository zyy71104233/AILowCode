// pages/IncrementalTab.tsx
import React,{ useRef, useState, useEffect } from 'react';
import ChatFlow from '../components/ChatFlow';
import FileUpload from '../components/FileUpload';
import RoleWorkspace from '../components/RoleWorkspace';
import { MessageItem, ProcessStage, TabState, PromptType, Role, ActionType } from '../types/types';
import OpenAI from "openai";
import { getIncrementalPrompt } from '../lib/IncrementalPrompt';

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  dangerouslyAllowBrowser: true,
  apiKey: 'sk-bb509f13ddf44ec1b539b30efcc5661a',
});

interface IncrementalTabProps {
  state: {
    messages: MessageItem[];
    currentStage: ProcessStage;
    uploadedFiles: Record<Role, File | null>;
  };
  updateState: (updater: (prev: TabState) => TabState) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const roleFlow: Role[] = ['user', 'pd', 'arch', 'proj', 'dev'];

export default function IncrementalTab({ state, updateState, isLoading, setIsLoading }: IncrementalTabProps) {
  const messageRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  const [completedRoles, setCompletedRoles] = useState<Role[]>([]);

  useEffect(() => {
    const roles: Role[] = [];
    let foundCurrent = false;
    
    for (const role of roleFlow) {
      if (role === state.currentStage.currentRole) {
        foundCurrent = true;
        break;
      }
      roles.push(role);
    }
    
    setCompletedRoles(foundCurrent ? roles : []);
  }, [state.currentStage.currentRole]);

  const handleRoleClick = (role: Role) => {
    if (!completedRoles.includes(role)) return;
  
    const lastMessage = [...state.messages].reverse().find(msg => msg.role === role);
    
    if (lastMessage) {
      updateState(prev => ({
        ...prev,
        currentStage: { ...prev.currentStage, currentRole: role },
        messages: prev.messages.map(msg => ({
          ...msg,
          showActions: msg.id === lastMessage.id
        }))
      }));

      setTimeout(() => {
        const element = messageRefs.current[lastMessage.id];
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'nearest'
          });
        }
      }, 100);
    }
  };

  const getUploadDescription = (role: Role): { 
    label: string; 
    accept: string;
    uploadType: 'document' | 'folder';
  } => {
    switch (role) {
      case 'user':
        return { 
          label: '上传上个迭代的产品需求文档(.md)', 
          accept: '.md',
          uploadType: 'document'
        };
      case 'pd':
        return { 
          label: '上传上个迭代的设计文档(.md)', 
          accept: '.md',
          uploadType: 'document' 
        };
      case 'proj':
        return { 
          label: '上传项目文件夹', 
          accept: '*',
          uploadType: 'folder' 
        };
      default:
        return { 
          label: '', 
          accept: '',
          uploadType: 'document'
        };
    }
  };

  const handleFileUpload = (files: Array<{name: string, path: string, content: string}>, role: Role) => {
    const formattedContent = files.map(file => 
      `文件名：${file.name}\n路径：${file.path}\n文件内容：\n${file.content}`
    ).join('\n\n');
    
    const virtualFile = new File([formattedContent], `已上传${files.length}个文件.md`, {
      type: 'text/markdown'
    });
    
    updateState(prev => ({ 
      ...prev, 
      uploadedFiles: {
        ...prev.uploadedFiles,
        [role]: virtualFile
      }
    }));
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target?.result as string);
      reader.onerror = e => reject(new Error('文件读取失败'));
      reader.readAsText(file);
    });
  };

  const onSend = async (content: string, promptType: PromptType, originalContent?: string) => {
    let aiMessageId = '';
    const currentRole = state.currentStage.currentRole;
    if (!validateUploads(currentRole)) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      const [role, action] = promptType.split('_') as [Role, ActionType];
      const { system, user } = getIncrementalPrompt(role, action);
      
      
      let apiContent = user;
      if (promptType === 'user_confirm') {
        const requiredFile = state.uploadedFiles['user'];
        if (!requiredFile) {
          throw new Error('请先上传产品需求文档');
        }
        
        const fileContent = await readFileAsText(requiredFile);
        const versionMatch = requiredFile.name.match(/v(\d+\.\d+)\.md/);
        const currentVersion = versionMatch ? versionMatch[1] : '1.0';
        
        apiContent = user
          .replace('{original_doc}', fileContent)
          .replace('{user_input}', content)
          .replace('{current_version}', currentVersion);
      } 
      else if (promptType === 'pd_confirm') {
        const requiredFile = state.uploadedFiles['pd'];
        if (!requiredFile) {
          throw new Error('请先上传设计文档');
        }
        
        const fileContent = await readFileAsText(requiredFile);
        apiContent = user
          .replace('{original_doc}', fileContent)
          .replace('{user_input}', content);
      } else if (promptType === 'proj_confirm') {
        const requiredFile = state.uploadedFiles['proj'];
        if (!requiredFile) {
          throw new Error('请先上传项目代码文件夹');
        }

        const designDoc = state.messages.find(msg => 
          msg.role === 'arch' && msg.showActions
        )?.content || '';
        
        const fileContent = await readFileAsText(requiredFile);
        apiContent = user
          .replace('{original_code}', fileContent)
          .replace('{design_doc}', designDoc) 
          .replace('{user_input}', content);
      }
      else if (originalContent) {
        apiContent = user
          .replace('{user_input}', content)
          .replace('{adjust_content}', originalContent);
      } else {
        apiContent = user.replace('{user_input}', content);
      }

      if (currentRole === 'user') {
        const userMessage: MessageItem = {
          id: Date.now().toString(),
          role: 'user',
          content,
          showActions: false
        };
        updateState(prev => ({
          ...prev,
          messages: [...prev.messages, userMessage]
        }));
      }
      
      aiMessageId = (Date.now() + 1).toString();
      const aiMessage: MessageItem = {
        id: aiMessageId,
        role: getAIRole(currentRole, promptType),
        content: '思考中...',
        showActions: false,
        actions: getAvailableActions(getAIRole(currentRole))
      };
      
      updateState(prev => ({
        ...prev,
        messages: [...prev.messages, aiMessage]
      }));

      const stream = await openai.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: apiContent }
        ],
        stream: true,
      });
  
      let fullResponse = '';
      for await (const chunk of stream) {
        const contentChunk = chunk.choices[0]?.delta?.content || "";
        fullResponse += contentChunk;
        
        updateState(prev => ({
          ...prev,
          messages: prev.messages.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, content: fullResponse } 
              : msg
          )
        }));
      }

      updateState(prev => {
        const newState = {
          ...prev,
          messages: prev.messages.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, showActions: true } 
              : msg
          )
        };
  
        if (promptType.endsWith('_confirm')) {
          newState.currentStage = {
            ...prev.currentStage,
            currentRole: getNextRole(currentRole, promptType)
          };
        }
  
        return newState;
      });
      
    } catch (error) {
      updateState(prev => ({
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, content: `请求失败: ${error}`, showActions: true } 
            : msg
        )
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const shouldShowUpload = (): boolean => {
    const { currentRole } = state.currentStage;
    return ['user', 'pd', 'proj'].includes(currentRole);
  };

  const validateUploads = (role: Role): boolean => {
    switch(role) {
      case 'user':
        if (!state.uploadedFiles.user) {
          alert('请先上传产品需求文档(.md)');
          return false;
        }
        break;
      case 'pd':
        if (!state.uploadedFiles.pd) {
          alert('请先上传设计文档(.md)');
          return false;
        }
        break;
      case 'proj':
        if (!state.uploadedFiles.proj) {
          alert('请先上传项目代码文件夹');
          return false;
        }
        break;
    }
    return true;
  };

  const uploadConfig = getUploadDescription(state.currentStage.currentRole);

  return (
    <div className="create-tab-container">
      <div className="role-workspace incremental-workspace">
        <div className="role-workspace-header">
          <h3>增量需求工作区</h3>
        </div>
        
        <RoleWorkspace 
          currentRole={state.currentStage.currentRole}
          completedRoles={completedRoles}
          onRoleClick={handleRoleClick}
          roleFlow={roleFlow}
        />

        {shouldShowUpload() && (
          <div className="file-upload-section">
            <h4>文件上传</h4>
            <FileUpload 
              onFileUpload={(files) => handleFileUpload(files, state.currentStage.currentRole)}
              accept={uploadConfig.accept}
              label={uploadConfig.label}
              role={state.currentStage.currentRole}
              uploadType={uploadConfig.uploadType}
            />
            {state.uploadedFiles[state.currentStage.currentRole] && (
              <div className="file-info">
                  已上传: {state.uploadedFiles[state.currentStage.currentRole]?.name}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="chat-area">
        <ChatFlow 
          messages={state.messages}
          onSend={onSend}
          currentStage={state.currentStage}
          setCurrentStage={(stage) => updateState(prev => ({ 
            ...prev, 
            currentStage: typeof stage === 'function' 
              ? (stage as (prev: ProcessStage) => ProcessStage)(prev.currentStage)
              : stage 
          }))}
          tabType="incremental"
          messageRefs={messageRefs}
        />
      </div>
    </div>
  );
}

const getAvailableActions = (role: Role): ActionType[] => {
  const actionMap: Record<Role, ActionType[]> = {
    user: ['confirm'],
    pd: ['confirm', 'edit', 'adjust'],
    arch: ['confirm', 'edit', 'adjust'],
    proj: ['confirm', 'edit', 'adjust'],
    dev: ['confirm', 'edit']
  };
  return actionMap[role];
};

function getAIRole(currentRole: Role, promptType?: PromptType): Role {
  const roleMap: Record<Role, Role> = {
    user: 'pd',
    pd: 'arch',
    arch: 'proj',
    proj: 'dev',
    dev: 'dev'
  };
  
  if (promptType && promptType.endsWith('_adjust')) {
    return currentRole;
  }
  
  return roleMap[currentRole];
}

function getNextRole(currentRole: Role, promptType: PromptType): Role {
  const roleFlow: Record<Role, Role> = {
    user: 'pd',
    pd: 'arch',
    arch: 'proj',
    proj: 'dev',
    dev: 'dev'
  };

  if (promptType.endsWith('_confirm')) {
    return roleFlow[currentRole];
  }
  return currentRole;
}