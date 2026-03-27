import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"



function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
 return (
 <AccordionPrimitive.Root
 data-slot="accordion"
 className={["flex w-full flex-col", className].filter(Boolean).join(' ')}
 {...props}
 />
 )
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
 return (
 <AccordionPrimitive.Item
 data-slot="accordion-item"
 className={["not-last:border-b", className].filter(Boolean).join(' ')}
 {...props}
 />
 )
}

function AccordionTrigger({
 className,
 children,
 ...props
}: AccordionPrimitive.Trigger.Props) {
 return (
 <AccordionPrimitive.Header className="flex">
 <AccordionPrimitive.Trigger
 data-slot="accordion-trigger"
 className={[
 "group/accordion-trigger relative flex flex-1 items-start justify-between rounded-none border border-transparent py-2.5 text-left text-sm font-medium outline-none hover:underline focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:after:border-ring aria-disabled:pointer-events-none aria-disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4 **:data-[slot=accordion-trigger-icon]:text-muted-foreground",
 className
 ].filter(Boolean).join(' ')}
 {...props}
 >
 {children}
 <FontAwesomeIcon icon={faChevronDown} data-slot="accordion-trigger-icon" className="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden" />
 <FontAwesomeIcon icon={faChevronUp} data-slot="accordion-trigger-icon" className="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline" />
 </AccordionPrimitive.Trigger>
 </AccordionPrimitive.Header>
 )
}

function AccordionContent({
 className,
 children,
 ...props
}: AccordionPrimitive.Panel.Props) {
 return (
 <AccordionPrimitive.Panel
 data-slot="accordion-content"
 className="overflow-hidden text-sm "
 {...props}
 >
 <div
 className={[
 "h-(--accordion-panel-height) pt-0 pb-2.5 data-ending-style:h-0 data-starting-style:h-0 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
 className
 ].filter(Boolean).join(' ')}
 >
 {children}
 </div>
 </AccordionPrimitive.Panel>
 )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
