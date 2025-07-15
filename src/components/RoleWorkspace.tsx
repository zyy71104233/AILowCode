import React from 'react';
import { Role } from '../types/types';

interface RoleInfo {
  id: Role;
  name: string;
  description: string;
  color: string;
  gradient: string;
}

interface RoleWorkspaceProps {
  currentRole: Role;
  completedRoles: Role[];
  onRoleClick: (role: Role) => void;
  roleFlow: Role[];
}

const roleInfoMap: Record<Role, RoleInfo> = {
  user: {
    id: 'user',
    name: '用户',
    description: '提出需求和想法',
    color: '#666666',
    gradient: 'linear-gradient(135deg, #666666, #888888)'
  },
  pd: {
    id: 'pd',
    name: '产品经理',
    description: '需求分析与产品设计',
    color: '#52c41a',
    gradient: 'linear-gradient(135deg, #52c41a, #73d13d)'
  },
  arch: {
    id: 'arch',
    name: '系统架构师',
    description: '技术架构与系统设计',
    color: '#1890ff',
    gradient: 'linear-gradient(135deg, #1890ff, #40a9ff)'
  },
  proj: {
    id: 'proj',
    name: '项目经理',
    description: '项目规划与任务分解',
    color: '#fa8c16',
    gradient: 'linear-gradient(135deg, #fa8c16, #ffa940)'
  },
  dev: {
    id: 'dev',
    name: '开发工程师',
    description: '代码实现与技术落地',
    color: '#722ed1',
    gradient: 'linear-gradient(135deg, #722ed1, #9254de)'
  }
};

const RoleWorkspace: React.FC<RoleWorkspaceProps> = ({
  currentRole,
  completedRoles,
  onRoleClick,
  roleFlow
}) => {
  const getCurrentRoleIndex = () => {
    return roleFlow.indexOf(currentRole);
  };

  const getRoleStatus = (role: Role) => {
    if (role === currentRole) return 'active';
    if (completedRoles.includes(role)) return 'completed';
    return 'pending';
  };

  const isRoleClickable = (role: Role) => {
    return completedRoles.includes(role) || role === currentRole;
  };

  return (
    <div className="role-workspace">
      <div className="role-workspace-header">
        <h3>角色工作区</h3>
      </div>
      
      <div className="role-flow-progress">
        <div className="progress-line">
          <div 
            className="progress-fill"
            style={{ 
              width: `${(getCurrentRoleIndex() / (roleFlow.length - 1)) * 100}%` 
            }}
          />
        </div>
      </div>

      <div className="role-cards-container">
        {roleFlow.map((role, index) => {
          const roleInfo = roleInfoMap[role];
          const status = getRoleStatus(role);
          const isClickable = isRoleClickable(role);
          
          return (
            <div
              key={role}
              className={`role-card ${status} ${isClickable ? 'clickable' : ''}`}
              onClick={() => isClickable && onRoleClick(role)}
              style={{
                '--role-color': roleInfo.color,
                '--role-gradient': roleInfo.gradient
              } as React.CSSProperties}
            >
              <div className="role-card-content">
                <div className="role-avatar-container">
                  <img 
                    src={`/avatars/${role}.png`}
                    alt={roleInfo.name}
                    className="role-avatar"
                  />
                  <div className={`role-status-badge ${status}`}>
                    {status === 'completed' && '✓'}
                    {status === 'active' && '●'}
                    {status === 'pending' && '○'}
                  </div>
                </div>
                <div className="role-info">
                  <h4 className="role-name">{roleInfo.name}</h4>
                  {status === 'active' && (
                    <div className="role-working-indicator">
                      <div className="working-pulse"></div>
                      <span>工作中</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="workspace-tips">
        <div className="tip-item">
          <span className="tip-icon">💡</span>
          <span>点击已完成的角色可以查看和修改历史工作</span>
        </div>
        <div className="tip-item">
          <span className="tip-icon">🔄</span>
          <span>当前角色完成工作后会自动切换到下一个角色</span>
        </div>
      </div>
    </div>
  );
};

export default RoleWorkspace; 