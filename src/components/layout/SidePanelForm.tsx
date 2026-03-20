import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

export interface SidePanelFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: string;
  
  // Submit actions
  onSubmit?: (e?: React.FormEvent) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitText?: React.ReactNode;
  cancelText?: React.ReactNode;
  
  // Destructive actions (optional)
  onDelete?: () => void;
  deleteText?: string;
  
  // Content
  children: React.ReactNode;
  
  // Customization
  maxWidthClass?: string;
}

export function SidePanelForm({
  open,
  onOpenChange,
  title,
  description,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitText = 'Lagre',
  cancelText = 'Avbryt',
  onDelete,
  deleteText = 'Slett',
  children,
  maxWidthClass = 'sm:max-w-xl'
}: SidePanelFormProps) {
  
  const formProps = onSubmit ? { onSubmit } : {};
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className={`w-[88vw] ${maxWidthClass} p-0 flex flex-col h-full border-l bg-background shadow-2xl overflow-y-auto`}>
        <SheetHeader className="px-6 sm:px-8 py-5 sm:py-6 shrink-0 border-b">
          <button autoFocus className="sr-only" aria-hidden="true">Fokus-felle</button>
          <SheetTitle className="text-xl sm:text-2xl flex items-center gap-2 leading-tight">
            {title}
          </SheetTitle>
          <SheetDescription className={description ? "" : "sr-only"}>
            {description || "Skjema"}
          </SheetDescription>
        </SheetHeader>

        <form {...formProps} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-6 pb-12">
            {children}
            
            {onDelete && (
              <div className="pt-4 mt-6 border-t border-border">
                <Button 
                  type="button" 
                  variant="destructive" 
                  className="w-full h-12 rounded-xl text-base"
                  onClick={onDelete}
                >
                  {deleteText}
                </Button>
              </div>
            )}
          </div>
          
          <div className="mt-auto px-6 sm:px-8 py-4 border-t bg-background shrink-0 z-10 w-full">
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1 h-14 text-lg rounded-xl font-semibold" onClick={onCancel}>
                {cancelText}
              </Button>
              {onSubmit && (
                <Button type="submit" disabled={isSubmitting} className="flex-1 h-14 text-lg rounded-xl shadow-xl flex items-center justify-center gap-2 font-semibold bg-primary text-primary-foreground">
                  {isSubmitting ? 'Lagrer...' : submitText}
                </Button>
              )}
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
