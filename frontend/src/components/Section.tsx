import type { ReactNode } from 'react'

// 管理后台常用的容器组件，保持旧版样式便于迁移
export default function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="bg-white/80 rounded-card shadow-card p-4 mb-4 border border-black/5">
      <h2 className="text-lg font-semibold mb-1">{title}</h2>
      {description && <p className="text-xs text-subtext mb-2">{description}</p>}
      <div className="text-sm text-subtext space-y-2">{children}</div>
    </section>
  )
}
