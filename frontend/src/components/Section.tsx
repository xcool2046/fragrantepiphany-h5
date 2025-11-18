import type { ReactNode } from 'react'

export default function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="bg-white/80 rounded-card shadow-card p-4 mb-4 border border-black/5">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <div className="text-sm text-subtext space-y-2">{children}</div>
    </section>
  )
}
