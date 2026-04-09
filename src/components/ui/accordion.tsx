import React, { createContext, useContext, useState } from 'react';
import { cn } from '../../lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

// Mimics @radix-ui/react-accordion structure for local-first architecture
const AccordionContext = createContext<{
  value: string | undefined;
  onValueChange: (value: string) => void;
} | null>(null);

export const Accordion = ({ type = "single", collapsible = true, className, children, ...props }: any) => {
  const [value, setValue] = useState<string | undefined>(undefined);
  
  return (
    <AccordionContext.Provider value={{
      value,
      onValueChange: (itemValue) => {
        setValue(value === itemValue && collapsible ? undefined : itemValue);
      }
    }}>
      <div className={cn("space-y-4", className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

const AccordionItemContext = createContext<{ value: string; } | null>(null);

export const AccordionItem = ({ value, className, children, ...props }: any) => {
  return (
    <AccordionItemContext.Provider value={{ value }}>
      <div className={cn("border-4 border-[var(--border-brutal)] bg-[var(--card-bg)] shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_rgba(24,24,27,1)]", className)} {...props}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
};

export const AccordionTrigger = ({ className, children, ...props }: any) => {
  const { value: selectedValue, onValueChange } = useContext(AccordionContext)!;
  const { value: itemValue } = useContext(AccordionItemContext)!;
  const isOpen = selectedValue === itemValue;

  return (
    <button
      type="button"
      onClick={() => onValueChange(itemValue)}
      className={cn(
        "flex w-full items-center justify-between p-5 font-black tracking-widest text-lg transition-all hover:bg-[var(--muted-bg)] focus:outline-none [&[data-state=open]>svg]:rotate-180",
        className
      )}
      data-state={isOpen ? "open" : "closed"}
      {...props}
    >
      {children}
      <FontAwesomeIcon 
        icon={faChevronDown} 
        className="h-5 w-5 shrink-0 transition-transform duration-200" 
      />
    </button>
  );
};

export const AccordionContent = ({ className, children, ...props }: any) => {
  const { value: selectedValue } = useContext(AccordionContext)!;
  const { value: itemValue } = useContext(AccordionItemContext)!;
  const isOpen = selectedValue === itemValue;

  if (!isOpen) return null;

  return (
    <div
      className={cn("p-5 pt-0 border-t-2 border-[var(--border-brutal)] opacity-80", className)}
      {...props}
    >
      <div className="pt-4">{children}</div>
    </div>
  );
};
