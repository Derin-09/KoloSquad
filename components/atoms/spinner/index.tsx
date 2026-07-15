import React from 'react'

export const SpinnerCircle = () => {
  return (
    <div className='w-full flex items-center justify-center'>
      <div className="size-12 rounded-full border-[3px] border-[color:var(--accent-bg)] border-t-[color:var(--accent-foreground)] animate-spin shadow-[0_0_12px_color:var(--accent-bg)]" />
      </div>
  )
}
