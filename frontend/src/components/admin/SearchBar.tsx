import type { ChangeEventHandler } from 'react'

type Props = {
  value: string
  onChange: ChangeEventHandler<HTMLInputElement>
  placeholder?: string
  className?: string
}

export default function SearchBar({ value, onChange, placeholder = '搜索', className = '' }: Props) {
  return (
    <div className={`flex items-center w-full max-w-md ${className}`}>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A373]/20 bg-white"
      />
    </div>
  )
}
