# AI低代码平台重新设计方案

## 概述

本文档包含AI低代码平台的企业级重新设计方案，主要包括会话管理系统、可配置提示词系统和优化布局设计。

---

## 1. 企业级会话管理系统

### 1.1 核心数据结构

```typescript
interface ChatSession {
  // 基础信息
  id: string
  title: string
  description?: string
  
  // 状态管理
  status: 'active' | 'completed' | 'paused' | 'archived' | 'trash'
  createdAt: Date
  updatedAt: Date
  
  // 业务信息
  tabType: 'create' | 'incremental'
  currentStage: number
  messages: ChatMessage[]
  uploadedFiles: FileInfo[]
  
  // 统计信息
  messageCount: number
  duration: number
  
  // 组织信息
  tags: string[]
  isStarred: boolean
  lastActiveRole: string
  
  // 扩展信息
  metadata: Record<string, any>
}

interface SessionGroup {
  type: 'active' | 'completed' | 'paused' | 'trash'
  sessions: ChatSession[]
  count: number
}
```

### 1.2 UI布局设计

#### 三列式布局
```
┌─────────────────────────────────────────────────────────────┐
│                        顶部导航栏                           │
├─────────────┬─────────────────────────────┬─────────────────┤
│   会话侧边栏  │           主聊天区域           │   角色工作区     │
│   (200px)   │                             │   (220px)      │
│             │                             │                │
│ [搜索框]     │     聊天消息流               │  角色进度指示    │
│ [新建按钮]   │                             │                │
│             │                             │  当前角色状态    │
│ 📁 活跃会话   │     消息输入区               │                │
│ • 会话1      │                             │  角色操作面板    │
│ • 会话2      │                             │                │
│             │                             │                │
│ 📁 已完成     │                             │                │
│ • 会话3      │                             │                │
│             │                             │                │
│ 📁 已暂停     │                             │                │
│ 📁 回收站     │                             │                │
└─────────────┴─────────────────────────────┴─────────────────┘
```

### 1.3 会话侧边栏功能

#### 会话组织
- **活跃会话**: 正在进行的对话
- **已完成**: 已完成的项目会话
- **已暂停**: 暂时中断的会话
- **回收站**: 删除的会话（可恢复）

#### 智能功能
- 智能标题生成（基于首轮对话内容）
- 会话搜索和过滤
- 标签分类和收藏
- 快速操作（复制、删除、恢复）

### 1.4 技术架构

#### 存储层级
```typescript
interface SessionStorage {
  // 本地存储（快速访问）
  localStorage: {
    recentSessions: ChatSession[]
    userPreferences: UserPreferences
    cacheIndex: SessionIndex
  }
  
  // 浏览器数据库（大容量）
  indexedDB: {
    allSessions: ChatSession[]
    messageHistory: ChatMessage[]
    uploadedFiles: FileBlob[]
  }
  
  // 云端同步（可选）
  cloudSync?: {
    backup: CloudBackup
    crossDevice: DeviceSync
    teamSharing: TeamSession[]
  }
}
```

#### 状态管理
```typescript
interface SessionState {
  sessions: ChatSession[]
  currentSession: ChatSession | null
  activeGroup: SessionGroupType
  searchQuery: string
  sortBy: 'updatedAt' | 'createdAt' | 'title'
  filters: SessionFilters
}

// 使用 Context + Reducer 模式
const SessionContext = createContext<SessionContextType>()
```

---

## 2. 可配置提示词系统

### 2.1 核心概念重构

#### 从模板集到业务流程
```typescript
// 旧方案：模板集
interface TemplateSet {
  id: string
  name: string
  templates: PromptTemplate[]
}

// 新方案：业务流程
interface BusinessFlow {
  id: string
  name: string  // 如："移动应用开发"、"数据分析项目"
  description: string
  category: 'development' | 'analysis' | 'design' | 'management'
  
  // 流程中的角色配置
  roles: FlowRole[]
  
  // 流程状态
  isActive: boolean
  isDefault: boolean
  
  // 元数据
  version: string
  author: string
  createdAt: Date
  updatedAt: Date
}

interface FlowRole {
  roleId: string
  roleName: string
  actions: string[]  // 该角色支持的操作
  isRequired: boolean
  order: number
}
```

### 2.2 提示词模板结构

```typescript
interface PromptTemplate {
  // 基础信息
  id: string
  name: string
  description: string
  
  // 分类信息
  flowId: string        // 属于哪个业务流程
  role: string          // 角色：user, pd, arch, proj, dev
  action: string        // 操作：confirm, edit, adjust, generate
  category: string      // 分类：requirement, architecture, project, development
  
  // 提示词内容
  systemPrompt: string  // 系统提示词
  userPrompt: string    // 用户提示词模板
  
  // 变量和验证
  variables: PromptVariable[]    // 支持的变量
  validation: ValidationRule[]   // 验证规则
  
  // 版本管理
  version: string
  parentId?: string     // 继承自哪个模板
  
  // 使用统计
  usageCount: number
  successRate: number
  lastUsed: Date
  
  // 元数据
  author: string
  isActive: boolean
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

interface PromptVariable {
  name: string          // 变量名：如 {{projectName}}
  type: 'string' | 'number' | 'array' | 'object'
  required: boolean
  defaultValue?: any
  description: string
  validation?: RegExp
}
```

### 2.3 管理界面设计

#### 主界面布局
```
┌─────────────────────────────────────────────────────────────┐
│  提示词管理系统                      [导入] [导出] [新建流程]   │
├─────────────┬─────────────────────────────────────────────────┤
│             │                                               │
│  业务流程     │                编辑区域                         │
│             │                                               │
│ 📱 移动应用开发  │  ┌─角色选择─────────────────────────────────┐   │
│ 📊 数据分析项目  │  │ 👤用户 📋产品 🏗️架构 📊项目 💻开发      │   │
│ 🎨 UI设计流程   │  └─────────────────────────────────────────┘   │
│ 📈 项目管理     │                                               │
│              │  ┌─操作选择─────────────────────────────────┐   │
│ + 新建流程     │  │ ✅确认 ✏️编辑 🔧调整 📄生成文档         │   │
│              │  └─────────────────────────────────────────┘   │
│              │                                               │
│              │  ┌─提示词编辑器─────────────────────────────┐   │
│              │  │ 系统提示词:                             │   │
│              │  │ [富文本编辑器 - 语法高亮]                │   │
│              │  │                                         │   │
│              │  │ 用户提示词:                             │   │
│              │  │ [富文本编辑器 - 变量提示]                │   │
│              │  │                                         │   │
│              │  │ 可用变量: {{projectName}} {{userInput}}  │   │
│              │  └─────────────────────────────────────────┘   │
│              │                                               │
│              │  [预览] [保存] [测试] [版本历史]               │
└─────────────┴─────────────────────────────────────────────────┘
```

#### 核心功能
1. **业务流程管理**
   - 创建自定义开发流程
   - 配置流程中的角色和操作
   - 流程模板导入导出

2. **提示词编辑器**
   - 语法高亮和自动补全
   - 变量插入和验证
   - 实时预览功能

3. **版本控制**
   - 提示词版本管理
   - A/B测试支持
   - 回滚和比较功能

### 2.4 技术架构

#### 提示词矩阵
```typescript
// 提示词查找：流程 × 角色 × 操作 → 模板
type PromptMatrix = {
  [flowId: string]: {
    [role: string]: {
      [action: string]: PromptTemplate
    }
  }
}

// 使用示例
const template = promptMatrix["mobile-app-dev"]["arch"]["confirm"]
```

#### 管理服务
```typescript
class PromptTemplateManager {
  // 基础操作
  async getTemplate(flowId: string, role: string, action: string): Promise<PromptTemplate>
  async saveTemplate(template: PromptTemplate): Promise<void>
  async deleteTemplate(id: string): Promise<void>
  
  // 业务流程管理
  async createFlow(flow: BusinessFlow): Promise<void>
  async updateFlow(flowId: string, updates: Partial<BusinessFlow>): Promise<void>
  async getFlowTemplates(flowId: string): Promise<PromptTemplate[]>
  
  // 变量处理
  async renderTemplate(template: PromptTemplate, variables: Record<string, any>): Promise<string>
  async validateVariables(template: PromptTemplate, variables: Record<string, any>): Promise<ValidationResult>
  
  // 导入导出
  async exportFlow(flowId: string): Promise<FlowExport>
  async importFlow(flowData: FlowExport): Promise<void>
}
```

---

## 3. 布局优化方案

### 3.1 当前问题分析

#### 状态丢失问题
- React条件渲染导致组件卸载
- 切换标签页时完全丢失对话历史
- 需要实现持久化状态管理

#### 空间利用问题
- 角色工作区占用垂直空间
- 聊天区域被压缩
- 需要更灵活的布局方案

### 3.2 推荐方案：三列布局

#### 优势分析
✅ **信息密度高**: 三个功能区域并行显示  
✅ **工作流连贯**: 会话→聊天→角色状态一目了然  
✅ **专业感强**: 类似IDE的多面板设计  
✅ **扩展性好**: 便于添加更多功能面板  

#### 响应式设计
```css
/* 桌面端：三列布局 */
@media (min-width: 1200px) {
  .layout {
    grid-template-columns: 200px 1fr 220px;
  }
}

/* 平板端：双列布局 */
@media (min-width: 768px) and (max-width: 1199px) {
  .layout {
    grid-template-columns: 180px 1fr;
  }
  .role-workspace {
    position: absolute;
    right: 0;
    top: 60px;
    width: 200px;
    background: white;
    box-shadow: -2px 0 8px rgba(0,0,0,0.1);
    transform: translateX(100%);
    transition: transform 0.3s ease;
  }
  .role-workspace.open {
    transform: translateX(0);
  }
}

/* 移动端：单列布局 */
@media (max-width: 767px) {
  .layout {
    grid-template-columns: 1fr;
  }
  .session-sidebar,
  .role-workspace {
    display: none;
  }
}
```

---

## 4. 技术实现路线图

### 4.1 第一阶段：状态管理修复
- [ ] 实现全局状态管理（Context + Reducer）
- [ ] 修复标签页切换状态丢失
- [ ] 实现会话持久化存储

### 4.2 第二阶段：会话管理系统
- [ ] 设计和实现会话数据结构
- [ ] 构建会话侧边栏UI
- [ ] 实现会话的CRUD操作
- [ ] 添加搜索和过滤功能

### 4.3 第三阶段：提示词配置系统
- [ ] 重构提示词数据结构
- [ ] 实现业务流程管理
- [ ] 构建提示词编辑器
- [ ] 添加版本控制功能

### 4.4 第四阶段：布局优化
- [ ] 实现三列响应式布局
- [ ] 优化角色工作区设计
- [ ] 添加面板折叠功能
- [ ] 完善移动端适配

### 4.5 第五阶段：高级功能
- [ ] 云端同步支持
- [ ] 团队协作功能
- [ ] A/B测试框架
- [ ] 数据分析面板

---

## 5. 附录

### 5.1 技术栈建议
- **前端框架**: React 18 + TypeScript
- **状态管理**: Context API + useReducer
- **UI组件库**: Ant Design 5.x
- **布局方案**: CSS Grid + Flexbox
- **存储方案**: localStorage + IndexedDB
- **编辑器**: Monaco Editor (VS Code)
- **图标库**: Ant Design Icons + Lucide React

### 5.2 性能优化建议
- 虚拟滚动处理大量会话
- 懒加载历史消息
- 防抖搜索和过滤
- 缓存提示词模板
- 压缩存储的JSON数据

### 5.3 可访问性考虑
- 键盘导航支持
- 屏幕阅读器兼容
- 高对比度主题
- 响应式字体大小
- 焦点管理优化

---

**文档版本**: v1.0  
**创建日期**: 2024年12月  
**最后更新**: 2024年12月  
**维护者**: AI助手 