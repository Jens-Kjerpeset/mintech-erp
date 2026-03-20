import * as React from "react"
import { cn } from "@/lib/utils"

export interface RecordItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode;
  iconBgClass?: string;
  title: string;
  titleClass?: string;
  badge?: React.ReactNode;
  primaryValue: string;
  primaryValueClass?: string;
  secondaryValue: string;
}

export const RecordItem = React.forwardRef<HTMLDivElement, RecordItemProps>(
  ({ className, icon, iconBgClass = "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground", title, titleClass, badge, primaryValue, primaryValueClass, secondaryValue, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-4 px-4 py-3 sm:px-4 sm:py-3 bg-card border rounded-xl shadow-sm relative hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group",
          className
        )}
        {...props}
      >
        <div className={cn("size-10 rounded-full flex items-center justify-center shrink-0 transition-colors", iconBgClass)}>
          {icon}
        </div>
        
        <div className="flex flex-col flex-1 min-w-0 justify-center mt-1">
          <div className="flex justify-between items-center mb-1">
            <h3 className={cn("font-semibold text-[15px] leading-tight truncate pr-2 m-0", titleClass)}>
              {title}
            </h3>
            {badge}
          </div>
          <div className="flex justify-between items-baseline -mb-1.5">
            <p className={cn("font-semibold text-lg leading-none font-mono m-0", primaryValueClass)}>
              {primaryValue}
            </p>
            <p className="text-xs text-muted-foreground whitespace-nowrap pl-2 m-0">
              {secondaryValue}
            </p>
          </div>
        </div>
      </div>
    )
  }
)
RecordItem.displayName = "RecordItem"
