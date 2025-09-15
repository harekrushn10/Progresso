import { cn } from "@/lib/utils"
import { ReactNode } from "react"

const ContentContainer = ({
  children = null,
  className = "",
  id = "",
}: {
  children?: ReactNode
  className?: string
  id?: string
}) => {
  return (
    <div
      className={cn(
        "mx-auto flex flex-col items-center max-w-screen-xl px-2 md:px-4",
        className
      )}
      id={id}
    >
      {children}
    </div>
  )
}

export default ContentContainer