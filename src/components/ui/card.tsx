import * as React from "react"

function Card({
 className,
 size = "default",
 ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
 return (
 <div
 data-slot="card"
 data-size={size}
 className={[
 "group/card flex flex-col gap-4 overflow-hidden rounded-none bg-card py-4 text-sm text-card-foreground ring-1 ring-foreground/10 has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
 className
 ].filter(Boolean).join(' ')}
 {...props}
 />
 )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
 return (
 <div
 data-slot="card-header"
 className={[
 "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-4 group-data-[size=sm]/card:px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3",
 className
 ].filter(Boolean).join(' ')}
 {...props}
 />
 )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
 return (
 <div
 data-slot="card-title"
 className={[
 "font-heading text-base leading-snug font-medium group-data-[size=sm]/card:text-sm",
 className
 ].filter(Boolean).join(' ')}
 {...props}
 />
 )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
 return (
 <div
 data-slot="card-description"
 className={["text-sm text-muted-foreground", className].filter(Boolean).join(' ')}
 {...props}
 />
 )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
 return (
 <div
 data-slot="card-action"
 className={[
 "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
 className
 ].filter(Boolean).join(' ')}
 {...props}
 />
 )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
 return (
 <div
 data-slot="card-content"
 className={["px-4 group-data-[size=sm]/card:px-3", className].filter(Boolean).join(' ')}
 {...props}
 />
 )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
 return (
 <div
 data-slot="card-footer"
 className={[
 "flex items-center rounded-b-xl border-t bg-muted/50 p-4 group-data-[size=sm]/card:p-3",
 className
 ].filter(Boolean).join(' ')}
 {...props}
 />
 )
}

export {
 Card,
 CardHeader,
 CardFooter,
 CardTitle,
 CardAction,
 CardDescription,
 CardContent,
}
