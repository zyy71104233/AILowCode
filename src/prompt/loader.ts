import { PromptKey, PromptTemplate, Role, ActionType } from './types';

// 内联提示词作为fallback
const FALLBACK_PROMPTS: Partial<Record<PromptKey, PromptTemplate>> = {
  'user_confirm': {
    system: 'You are a Product Manager...',
    user: '## Requirements\n{user_input}'
  },
  // 其他fallback提示词...
};

// 动态加载提示词（核心修改）
export async function loadPrompt(role: Role, action: ActionType): Promise<PromptTemplate> {
  const key: PromptKey = `${role}_${action}`;
  
  try {
    // 直接按文件名导入
    const module = await import(`./${key}.md?raw`);
    const content = module.default;
    console.log("==== content ====",content)
    
    // 解析Markdown内容（格式统一为SYSTEM_PROMPT和USER_PROMPT分隔）
    const systemEndIndex = content.indexOf('## USER_PROMPT');
    if (systemEndIndex === -1) throw new Error('Invalid prompt format');
    
    return {
      system: content.slice(0, systemEndIndex)
                .replace('## SYSTEM_PROMPT', '')
                .trim(),
      user: content.slice(systemEndIndex + '## USER_PROMPT'.length)
              .trim()
    };
  } catch (error) {
    console.warn(`Failed to load prompt ${key}, using fallback`, error);
    return FALLBACK_PROMPTS[key] || {
      system: 'You are an AI assistant',
      user: '{user_input}'
    };
  }
}

// 预加载提示词（可选）
export async function preloadPrompts(keys: PromptKey[]) {
  return Promise.all(keys.map(key => {
    const [role, action] = key.split('_') as [Role, ActionType];
    return loadPrompt(role, action);
  }));
}