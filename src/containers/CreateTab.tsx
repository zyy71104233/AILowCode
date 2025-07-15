// pages/CreateTab.tsx
import { useState, useEffect, useRef } from 'react';
import ChatFlow from '../components/ChatFlow';
import RoleWorkspace from '../components/RoleWorkspace';
import { MessageItem, ProcessStage, TabState, PromptType, Role, ActionType } from '../types/types';
import OpenAI from "openai";
import { getPrompt } from '../lib/prompt';
import {notification} from 'antd'

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  dangerouslyAllowBrowser: true,
  apiKey: 'sk-bb509f13ddf44ec1b539b30efcc5661a',
});

interface CreateTabProps {
  state: {
    messages: MessageItem[];
    currentStage: ProcessStage;
  };
  updateState: (updater: (prev: TabState) => TabState) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const roleFlow: Role[] = ['user', 'pd', 'arch', 'proj', 'dev'];

export default function CreateTab({ state, updateState, isLoading, setIsLoading }: CreateTabProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [completedRoles, setCompletedRoles] = useState<Role[]>([]);
  const messageRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

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

  // 解析 content 函数
const parseContent = (content: string): string[] => {
  try {

    const startTag = '[CONTENT]';
    const endTag = '[/CONTENT]';
    const startIndex = content.indexOf(startTag);
    const endIndex = content.indexOf(endTag);
    const jsonStr = startIndex === -1 || endIndex === -1 
      ? content 
      : content.slice(startIndex + startTag.length, endIndex).trim();  


    const fileListMatch = jsonStr.match(/"Task list":\s*([\s\S]*?)(?=,\s*"Full API spec")/);
    // 关键转换步骤：将匹配到的字符串转为数组
    let fileList = [];
    if (fileListMatch && fileListMatch[1]) {
      try {
        // 移除可能的尾部逗号/空格后解析为数组
        const cleanedStr = fileListMatch[1].trim().replace(/,$/, '');
        console.log("--------------cleanedStr",cleanedStr)
        // fileList = JSON.parse(`[${cleanedStr}]`);
        fileList = JSON.parse(cleanedStr); 
        // fileList = fileList.map((item: any) => String(item)).filter(Boolean);
      } catch (e) {
        console.error('解析Task list失败:', e);
      }
    }
    
    console.log("--------------fileList",fileList)
    // return fileList
    // 确保返回字符串数组
    console.log("原始 fileList 结构:", JSON.stringify(fileList));
    console.log("类型检查:", {
      isArray: Array.isArray(fileList),
      firstItemType: fileList.length > 0 ? typeof fileList[0] : 'empty'
    });

    // const filtered = fileList.filter(item => {
    //   console.log(`处理元素:`, item, `类型:`, typeof item);
    //   return typeof item === 'string';
    // });
    // console.log("过滤结果:", filtered);

    return Array.isArray(fileList) 
      ? fileList.filter(item => typeof item === 'string')
      : [];

  } catch (error) {
    console.error('Failed to parse content:', error);
    return [];
  }
};

// 发送到 generate API 函数
// const sendToGenerateAPI = async (idea: string, tasklist: string,taskDoc: string, designDoc: string, taskId: string) => {
//   try {
//     const response = await fetch('http://localhost:8000/generate', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         idea,
//         task_doc: taskDoc,
//         task_list: tasklist,
//         design_doc: designDoc,
//       }),
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Error sending to generate API:', error);
//     throw error;
//   }
// };

const sendToGenerateAPI = async (
  idea: string,
  taskList: string[],
  taskDoc: string,
  designDoc: string
): Promise<{ project_id: string; code_path: string }> => {

  console.log('++++++ taskList',taskList)
  const response = await fetch('http://localhost:8000/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idea,
      task_list: taskList,  // 直接传数组
      task_doc: taskDoc,
      design_doc: designDoc
    }),
  });
  return await response.json();
};

const handleOpenDirectory = async (path: string) => {
  try {
    const response = await fetch('http://localhost:8000/open-directory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    });
    const result = await response.json();
    
    if (result.status !== 'success') {
      notification.error({
        message: '打开目录失败',
        description: result.message || '未知错误',
      });
    }
  } catch (error) {
    notification.error({
      message: '请求失败',
    });
  }
};

  const onSend = async (content: string, promptType: PromptType, originalContent?: string) => {
    let aiMessageId = '';
    
    try {
      setIsLoading(true);
      
      const [role, action] = promptType.split('_') as [Role, ActionType];
      const { system, user } = getPrompt(role, action);
      
      let apiContent = user;
      if (promptType === 'proj_confirm') {
        const designDoc = [...state.messages]
          .reverse()
          .find(msg => msg.role === 'arch')?.content || '';


          // 解析并发送
      // console.log("==================== content",content)
      const taskList = parseContent(content);
      const taskListStr = JSON.stringify(taskList);

      const taskId = Date.now().toString();

      console.log("==================== task list",taskList)

      // 生成开始时的通知key（用于后续更新）
      const generateNotificationKey = `generate_${Date.now()}`;

      // 显示开始生成的通知
      notification.info({
        key: generateNotificationKey,
        message: '代码生成中',
        description: '正在生成项目代码，请稍候...',
        duration: 0, // 不自动关闭
      });

      
      // 启动文件生成（不阻塞）
      sendToGenerateAPI("创建简单后端系统", taskList, content, designDoc)
      .then(({ project_id, code_path }) => {  // 改为解构后端返回的 project_id 和 
        notification.destroy(generateNotificationKey);

        notification.success({
          message: '项目生成成功',
          description: (
            <div>
              <p>项目ID: {project_id}</p>
              <p>代码路径: {code_path}</p>
              <a 
                onClick={() => handleOpenDirectory(code_path)}
                style={{ cursor: 'pointer', color: '#1890ff' }}
              >
                点击打开项目目录
              </a>
            </div>
          ),
          duration: null,
        });
      })
      .catch(error => {
        notification.destroy(generateNotificationKey);

        notification.error({
          message: '生成失败',
          description: error.message,
        });
      });

      return

        apiContent = user
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

      if (state.currentStage.currentRole === 'user') {
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
        role: getAIRole(state.currentStage.currentRole, promptType),
        content: '思考中...',
        showActions: false,
        actions: getAvailableActions(getAIRole(state.currentStage.currentRole))
      };
      
      updateState(prev => ({
        ...prev,
        messages: prev.messages.map(msg => ({
          ...msg,
          showActions: false
        })).concat(aiMessage)
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

      updateState(prev => ({
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, showActions: true } 
            : msg
        ),
        currentStage: {
          ...prev.currentStage,
          currentRole: getNextRole(prev.currentStage.currentRole, promptType)
        }
      }));
      
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

  const handleEditComplete = (newContent: string, messageId: string) => {
    updateState(prev => ({
      ...prev,
      messages: prev.messages.map(msg => 
        msg.id === messageId
          ? { ...msg, content: newContent, showActions: true }
          : { ...msg, showActions: false }
      )
    }));
  };

  return (
    <div className="create-tab-container">
      <RoleWorkspace 
        currentRole={state.currentStage.currentRole}
        completedRoles={completedRoles}
        onRoleClick={handleRoleClick}
        roleFlow={roleFlow}
      />

      <div className="chat-area">
        <ChatFlow 
          messages={state.messages}
          onSend={onSend}
          currentStage={state.currentStage}
          setCurrentStage={(stage) => updateState(prev => ({ 
            ...prev, 
            currentStage: typeof stage === 'function' 
              ? stage(prev.currentStage)
              : stage 
          }))}
          onEditComplete={handleEditComplete}
          tabType="create"
          onRoleClick={(role, messageId) => handleRoleClick(role)}
          messageRefs={messageRefs}
        />
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

const getAvailableActions = (role: Role): ActionType[] => {
  const actionMap: Record<Role, ActionType[]> = {
    user: ['confirm'],
    pd: ['confirm', 'edit', 'adjust'],
    arch: ['confirm', 'edit', 'adjust', 'generateDoc'],
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
  
  const shouldProgress = promptType.endsWith('_confirm') && 
                       !promptType.includes('_adjust');
  
  return shouldProgress ? roleFlow[currentRole] : currentRole;
}