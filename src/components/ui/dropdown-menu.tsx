import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faCheck } from '@fortawesome/free-solid-svg-icons';
"use client"

import * as React from "react"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"



function DropdownMenu({ ...props }: MenuPrimitive.Root.Props) {
 return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal({ ...props }: MenuPrimitive.Portal.Props) {
 return <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
}

function DropdownMenuTrigger({ ...props }: MenuPrimitive.Trigger.Props) {
 return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />
}

function DropdownMenuContent({
 align = "start",
 alignOffset = 0,
 side = "bottom",
 sideOffset = 4,
 className,
 ...props
}: MenuPrimitive.Popup.Props &
 Pick<
 MenuPrimitive.Positioner.Props,
 "align" | "alignOffset" | "side" | "sideOffset"
 >) {
 return (
 <MenuPrimitive.Portal>
 <MenuPrimitive.Positioner
 className="isolate z-50 outline-none"
 align={align}
 alignOffset={alignOffset}
 side={side}
 sideOffset={sideOffset}
 >
 <MenuPrimitive.Popup
 data-slot="dropdown-menu-content"
 className={["z-50 max-h-(--available-height) w-(--anchor-width) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-none bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none data-[side=bottom]:data-[side=inline-end]:data-[side=inline-start]:data-[side=left]:data-[side=right]:data-[side=top]:data-open:data-open:data-open:data-closed:data-closed:overflow-hidden data-closed:data-closed:", className ].filter(Boolean).join(' ')}
 {...props}
 />
 </MenuPrimitive.Positioner>
 </MenuPrimitive.Portal>
 )
}

function DropdownMenuGroup({ ...props }: MenuPrimitive.Group.Props) {
 return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
}

function DropdownMenuLabel({
 className,
 inset,
 ...props
}: MenuPrimitive.GroupLabel.Props & {
 inset?: boolean
}) {
 return (
 <MenuPrimitive.GroupLabel
 data-slot="dropdown-menu-label"
 data-inset={inset}
 className={[
 "px-1.5 py-1 text-xs font-medium text-muted-foreground data-inset:pl-7",
 className
 ].filter(Boolean).join(' ')}
 {...props}
 />
 )
}

function DropdownMenuItem({
 className,
 inset,
 variant = "default",
 ...props
}: MenuPrimitive.Item.Props & {
 inset?: boolean
 variant?: "default" | "destructive"
}) {
 return (
 <MenuPrimitive.Item
 data-slot="dropdown-menu-item"
 data-inset={inset}
 data-variant={variant}
 className={[
 "group/dropdown-menu-item relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive",
 className
 ].filter(Boolean).join(' ')}
 {...props}
 />
 )
}

function DropdownMenuSub({ ...props }: MenuPrimitive.SubmenuRoot.Props) {
 return <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />
}

function DropdownMenuSubTrigger({
 className,
 inset,
 children,
 ...props
}: MenuPrimitive.SubmenuTrigger.Props & {
 inset?: boolean
}) {
 return (
 <MenuPrimitive.SubmenuTrigger
 data-slot="dropdown-menu-sub-trigger"
 data-inset={inset}
 className={[
 "flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7 data-popup-open:bg-accent data-popup-open:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
 className
 ].filter(Boolean).join(' ')}
 {...props}
 >
 {children}
 <FontAwesomeIcon icon={faChevronRight} className="ml-auto" />
 </MenuPrimitive.SubmenuTrigger>
 )
}

function DropdownMenuSubContent({
 align = "start",
 alignOffset = -3,
 side = "right",
 sideOffset = 0,
 className,
 ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
 return (
 <DropdownMenuContent
 data-slot="dropdown-menu-sub-content"
 className={["w-auto min-w-[96px] rounded-none bg-popover p-1 text-popover-foreground shadow-sm ring-1 ring-foreground/10 data-[side=bottom]:data-[side=left]:data-[side=right]:data-[side=top]:data-open:data-open:data-open:data-closed:data-closed:data-closed:", className ].filter(Boolean).join(' ')}
 align={align}
 alignOffset={alignOffset}
 side={side}
 sideOffset={sideOffset}
 {...props}
 />
 )
}

function DropdownMenuCheckboxItem({
 className,
 children,
 checked,
 inset,
 ...props
}: MenuPrimitive.CheckboxItem.Props & {
 inset?: boolean
}) {
 return (
 <MenuPrimitive.CheckboxItem
 data-slot="dropdown-menu-checkbox-item"
 data-inset={inset}
 className={[
 "relative flex cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
 className
 ].filter(Boolean).join(' ')}
 checked={checked}
 {...props}
 >
 <span
 className="pointer-events-none absolute right-2 flex items-center justify-center"
 data-slot="dropdown-menu-checkbox-item-indicator"
 >
 <MenuPrimitive.CheckboxItemIndicator>
 <FontAwesomeIcon icon={faCheck}
 />
 </MenuPrimitive.CheckboxItemIndicator>
 </span>
 {children}
 </MenuPrimitive.CheckboxItem>
 )
}

function DropdownMenuRadioGroup({ ...props }: MenuPrimitive.RadioGroup.Props) {
 return (
 <MenuPrimitive.RadioGroup
 data-slot="dropdown-menu-radio-group"
 {...props}
 />
 )
}

function DropdownMenuRadioItem({
 className,
 children,
 inset,
 ...props
}: MenuPrimitive.RadioItem.Props & {
 inset?: boolean
}) {
 return (
 <MenuPrimitive.RadioItem
 data-slot="dropdown-menu-radio-item"
 data-inset={inset}
 className={[
 "relative flex cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
 className
 ].filter(Boolean).join(' ')}
 {...props}
 >
 <span
 className="pointer-events-none absolute right-2 flex items-center justify-center"
 data-slot="dropdown-menu-radio-item-indicator"
 >
 <MenuPrimitive.RadioItemIndicator>
 <FontAwesomeIcon icon={faCheck}
 />
 </MenuPrimitive.RadioItemIndicator>
 </span>
 {children}
 </MenuPrimitive.RadioItem>
 )
}

function DropdownMenuSeparator({
 className,
 ...props
}: MenuPrimitive.Separator.Props) {
 return (
 <MenuPrimitive.Separator
 data-slot="dropdown-menu-separator"
 className={["-mx-1 my-1 h-px bg-border", className].filter(Boolean).join(' ')}
 {...props}
 />
 )
}

function DropdownMenuShortcut({
 className,
 ...props
}: React.ComponentProps<"span">) {
 return (
 <span
 data-slot="dropdown-menu-shortcut"
 className={[
 "ml-auto text-xs tracking-widest text-muted-foreground group-focus/dropdown-menu-item:text-accent-foreground",
 className
 ].filter(Boolean).join(' ')}
 {...props}
 />
 )
}

export {
 DropdownMenu,
 DropdownMenuPortal,
 DropdownMenuTrigger,
 DropdownMenuContent,
 DropdownMenuGroup,
 DropdownMenuLabel,
 DropdownMenuItem,
 DropdownMenuCheckboxItem,
 DropdownMenuRadioGroup,
 DropdownMenuRadioItem,
 DropdownMenuSeparator,
 DropdownMenuShortcut,
 DropdownMenuSub,
 DropdownMenuSubTrigger,
 DropdownMenuSubContent,
}
