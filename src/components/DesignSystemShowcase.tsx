import React from 'react';

interface DesignSystemShowcaseProps {
  onBack?: () => void;
}

const DesignSystemShowcase: React.FC<DesignSystemShowcaseProps> = ({ onBack }) => {
  return (
    <div style={{ padding: 'var(--space-8)', maxWidth: '1200px', margin: '0 auto' }}>
      {onBack && (
        <button 
          onClick={onBack}
          className="btn btn-outline btn-sm"
          style={{ marginBottom: 'var(--space-4)' }}
        >
          ← 返回应用
        </button>
      )}
      <h1 className="text-4xl font-bold" style={{ color: 'var(--color-gray-900)', marginBottom: 'var(--space-8)' }}>
        AI智能开发平台 - 设计系统展示
      </h1>

      {/* 颜色系统 */}
      <section style={{ marginBottom: 'var(--space-12)' }}>
        <h2 className="text-2xl font-semibold" style={{ marginBottom: 'var(--space-6)' }}>颜色系统</h2>
        
        <h3 className="text-lg font-medium" style={{ marginBottom: 'var(--space-4)' }}>主色调</h3>
        <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
          {[50, 500, 900].map(shade => (
            <div key={shade} style={{
              width: '100px',
              height: '80px',
              background: `var(--color-primary-${shade})`,
              borderRadius: 'var(--radius-base)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: shade > 400 ? 'white' : 'var(--color-gray-900)',
              fontWeight: 'var(--font-medium)',
              fontSize: 'var(--text-sm)'
            }}>
              {shade}
            </div>
          ))}
        </div>

        <h3 className="text-lg font-medium" style={{ marginBottom: 'var(--space-4)' }}>功能色彩</h3>
        <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
          {[
            { name: 'Success', color: 'var(--color-success-500)' },
            { name: 'Warning', color: 'var(--color-warning-500)' },
            { name: 'Error', color: 'var(--color-error-500)' },
            { name: 'Info', color: 'var(--color-info-500)' }
          ].map(({ name, color }) => (
            <div key={name} style={{
              width: '100px',
              height: '80px',
              background: color,
              borderRadius: 'var(--radius-base)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'var(--font-medium)',
              fontSize: 'var(--text-sm)'
            }}>
              {name}
            </div>
          ))}
        </div>

        <h3 className="text-lg font-medium" style={{ marginBottom: 'var(--space-4)' }}>角色主题色</h3>
        <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
          {[
            { name: 'PD', color: 'var(--color-role-pd)' },
            { name: 'Arch', color: 'var(--color-role-arch)' },
            { name: 'Proj', color: 'var(--color-role-proj)' },
            { name: 'Dev', color: 'var(--color-role-dev)' }
          ].map(({ name, color }) => (
            <div key={name} style={{
              width: '100px',
              height: '80px',
              background: color,
              borderRadius: 'var(--radius-base)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'var(--font-medium)',
              fontSize: 'var(--text-sm)'
            }}>
              {name}
            </div>
          ))}
        </div>
      </section>

      {/* 按钮组件 */}
      <section style={{ marginBottom: 'var(--space-12)' }}>
        <h2 className="text-2xl font-semibold" style={{ marginBottom: 'var(--space-6)' }}>按钮组件</h2>
        
        <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
          <button className="btn btn-primary">主要按钮</button>
          <button className="btn btn-success">成功按钮</button>
          <button className="btn btn-warning">警告按钮</button>
          <button className="btn btn-outline">轮廓按钮</button>
          <button className="btn btn-ghost">幽灵按钮</button>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-sm">小按钮</button>
          <button className="btn btn-primary">中等按钮</button>
          <button className="btn btn-primary btn-lg">大按钮</button>
          <button className="btn btn-primary" disabled>禁用按钮</button>
        </div>
      </section>

      {/* 卡片组件 */}
      <section style={{ marginBottom: 'var(--space-12)' }}>
        <h2 className="text-2xl font-semibold" style={{ marginBottom: 'var(--space-6)' }}>卡片组件</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
          <div className="card">
            <div className="card-header">
              <h3 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>基础卡片</h3>
            </div>
            <div className="card-body">
              <p style={{ margin: 0 }}>这是一个基础卡片的示例，展示了卡片的基本结构和样式。</p>
            </div>
            <div className="card-footer">
              <button className="btn btn-primary btn-sm">操作</button>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h4 style={{ marginTop: 0 }}>简单卡片</h4>
              <p>这是一个只有内容区域的简单卡片示例。</p>
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
                <span className="badge badge-primary">标签1</span>
                <span className="badge badge-success">标签2</span>
                <span className="badge badge-warning">标签3</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 表单组件 */}
      <section style={{ marginBottom: 'var(--space-12)' }}>
        <h2 className="text-2xl font-semibold" style={{ marginBottom: 'var(--space-6)' }}>表单组件</h2>
        
        <div style={{ maxWidth: '400px' }}>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: 'var(--space-2)', 
              fontWeight: 'var(--font-medium)',
              fontSize: 'var(--text-sm)'
            }}>
              输入框
            </label>
            <input type="text" className="input" placeholder="请输入内容" />
          </div>

          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: 'var(--space-2)', 
              fontWeight: 'var(--font-medium)',
              fontSize: 'var(--text-sm)'
            }}>
              文本域
            </label>
            <textarea className="input" rows={4} placeholder="请输入多行内容"></textarea>
          </div>
        </div>
      </section>

      {/* 徽章组件 */}
      <section style={{ marginBottom: 'var(--space-12)' }}>
        <h2 className="text-2xl font-semibold" style={{ marginBottom: 'var(--space-6)' }}>徽章组件</h2>
        
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <span className="badge badge-primary">主要</span>
          <span className="badge badge-success">成功</span>
          <span className="badge badge-warning">警告</span>
          <span className="badge badge-error">错误</span>
        </div>
      </section>

      {/* 字体系统 */}
      <section style={{ marginBottom: 'var(--space-12)' }}>
        <h2 className="text-2xl font-semibold" style={{ marginBottom: 'var(--space-6)' }}>字体系统</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <h1 className="text-4xl font-bold">超大标题 (4xl)</h1>
          <h2 className="text-3xl font-bold">大标题 (3xl)</h2>
          <h3 className="text-2xl font-semibold">中标题 (2xl)</h3>
          <h4 className="text-xl font-semibold">小标题 (xl)</h4>
          <p className="text-lg">大号文本 (lg)</p>
          <p className="text-base">正文内容 (base)</p>
          <p className="text-sm">辅助文字 (sm)</p>
          <p className="text-xs">注释文字 (xs)</p>
        </div>
      </section>

      {/* 间距系统 */}
      <section style={{ marginBottom: 'var(--space-12)' }}>
        <h2 className="text-2xl font-semibold" style={{ marginBottom: 'var(--space-6)' }}>间距系统</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {[1, 2, 3, 4, 5, 6, 8].map(space => (
            <div key={space} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <span style={{ minWidth: '60px', fontSize: 'var(--text-sm)' }}>space-{space}</span>
              <div style={{
                height: '20px',
                width: `calc(var(--space-${space}) * 4)`,
                background: 'var(--color-primary-500)',
                borderRadius: 'var(--radius-sm)'
              }}></div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>
                {space === 1 ? '4px' : space === 2 ? '8px' : space === 3 ? '12px' : space === 4 ? '16px' : 
                 space === 5 ? '20px' : space === 6 ? '24px' : '32px'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 阴影系统 */}
      <section style={{ marginBottom: 'var(--space-12)' }}>
        <h2 className="text-2xl font-semibold" style={{ marginBottom: 'var(--space-6)' }}>阴影系统</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--space-6)' }}>
          {['sm', 'base', 'md', 'lg', 'xl'].map(shadow => (
            <div key={shadow} style={{
              padding: 'var(--space-6)',
              background: 'white',
              borderRadius: 'var(--radius-lg)',
              boxShadow: `var(--shadow-${shadow})`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>
                shadow-{shadow}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DesignSystemShowcase; 