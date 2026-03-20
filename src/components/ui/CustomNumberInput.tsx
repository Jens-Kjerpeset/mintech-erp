import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface CustomNumberInputProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: number) => void;
  initialValue?: number;
}

export function CustomNumberInput({ isOpen, onClose, onConfirm, initialValue = 0 }: CustomNumberInputProps) {
  const [valueStr, setValueStr] = useState<string>(
    initialValue > 0 ? (initialValue * 100).toString() : '0'
  );

  const handleKeyPress = (key: string) => {
    if (key === 'BACKSPACE') {
      setValueStr(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    } else if (key === 'CONFIRM') {
      onConfirm(parseFloat(valueStr) / 100);
      onClose();
    } else {
      setValueStr(prev => (prev === '0' ? key : prev + key));
    }
  };

  const displayValue = (parseFloat(valueStr) / 100).toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' });

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[75vh] sm:h-auto sm:max-w-md mx-auto p-0 rounded-t-3xl border-t-0 flex flex-col">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle className="text-center font-heading text-xl">Enter Amount</SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={displayValue}
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-mono font-bold tracking-tighter text-primary truncate w-full text-center"
            >
              {displayValue}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-3 gap-1 p-2 bg-muted/30">
          {keys.map((k) => (
            <button
              key={k}
              onClick={() => handleKeyPress(k === '⌫' ? 'BACKSPACE' : k)}
              className="h-16 text-2xl font-medium rounded-xl active:bg-accent hover:bg-accent/50 transition-colors flex items-center justify-center"
            >
              {k}
            </button>
          ))}
          <div className="col-span-3 p-2">
            <button
              onClick={() => handleKeyPress('CONFIRM')}
              className="w-full h-14 bg-primary text-primary-foreground font-semibold rounded-xl text-lg hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Confirm
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
