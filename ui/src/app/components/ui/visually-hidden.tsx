import * as React from "react"

const VisuallyHidden = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className="absolute left-[-10000px] top-auto w-[1px] h-[1px] overflow-hidden"
      {...props}
    />
  )
})

VisuallyHidden.displayName = "VisuallyHidden"

export { VisuallyHidden }
