import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'

interface ButtonProps extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
          disabled:opacity-50 disabled:pointer-events-none
          bg-primary text-primary-foreground hover:bg-primary/90
          h-10 py-2 px-4 ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
