import * as React from "react"
export interface RecordItemProps extends React.HTMLAttributes<HTMLDivElement> {
 icon?: React.ReactNode;
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
 className={[
 "flex items-center gap-4 px-4 py-3 sm:px-4 sm:py-3 bg-card border rounded-none shadow-sm relative hover:shadow-md hover:border-primary/50 cursor-pointer group",
 className
 ].filter(Boolean).join(' ')}
 {...props}
 >
 {icon && (
  <div className={["size-10 rounded-full flex items-center justify-center shrink-0 transition-colors", iconBgClass].filter(Boolean).join(' ')}>
  {icon}
  </div>
  )}
 
 <div className="flex flex-col flex-1 min-w-0 justify-center mt-1">
 <div className="flex justify-between items-center mb-1">
 <h3 className={["font-medium tracking-tight text-[15px] leading-tight truncate pr-2 m-0", titleClass].filter(Boolean).join(' ')}>
 {title}
 </h3>
 {badge}
 </div>
 <div className="flex justify-between items-baseline -mb-1.5">
 <p className={["font-medium tracking-tight text-lg leading-none font-mono m-0", primaryValueClass].filter(Boolean).join(' ')}>
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
