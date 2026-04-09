import React, { useEffect, useState } from'react';
import { useMutation, useQueryClient } from'@tanstack/react-query';
import { useDrag } from'@use-gesture/react';
import { api } from'../../lib/api';
import { Button } from'../../components/ui/button';
import { FontAwesomeIcon } from'@fortawesome/react-fontawesome';
import { faTimes, faEdit, faTrash, faSpinner, faMinus, faPlus } from'@fortawesome/free-solid-svg-icons';
import { cn } from'../../lib/utils';
import { Product } from'../../types/schema';
import { ProductForm } from'./ProductForm';

export function ProductDetailSheet({ product, onClose }: { product: Product | null, onClose: () => void }) {
  const queryClient = useQueryClient();
  const isOpen = !!product;
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); 

  const bind = useDrag(({ movement: [, my], velocity: [, vy], direction: [, dy], cancel, last }) => {
    if (isEditing) cancel();
    if (my < -50) cancel();
    if (last && (my > 100 || (vy > 0.5 && dy > 0))) {
      handleClose();
    }
  }, {
    from: () => [0, 0],
    bounds: { top: 0 },
    rubberband: true,
    axis:'y'
  });

  useEffect(() => {
    if (product) {
      document.body.style.overflow ='hidden';
      setIsEditing(false);
      setIsDeleting(false);
    } else {
      document.body.style.overflow ='';
    }
    return () => { document.body.style.overflow =''; };
  }, [product]);

  const handleClose = () => {
    setIsEditing(false);
    setIsDeleting(false);
    onClose();
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.products.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      handleClose();
    }
  });

  const handleDelete = () => {
    if (isDeleting && product) {
      deleteMutation.mutate(product.id);
    } else {
      setIsDeleting(true);
    }
  };

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<Product> }) => {
      await api.products.update(id, data);
    },
    onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  const handleAdjustStock = (delta: number) => {
      if (!product || product.type ==='service' || updateMutation.isPending) return;
      const newStock = Math.max(0, (product.stockQuantity || 0) + delta);
      updateMutation.mutate({ id: product.id, data: { stockQuantity: newStock }});
  };

  return (
    <>
      <div 
        className={cn("fixed inset-0 z-40 bg-black/60 transition-opacity",
          isOpen ?"opacity-100" :"opacity-0 pointer-events-none"
        )}
        onClick={handleClose}
      />

      <div
        {...bind()}
        className={cn("fixed inset-x-0 bottom-0 z-50 flex flex-col bg-white border-t-4 border-black rounded-t-2xl shadow-[0_-4px_0_0_rgba(0,0,0,0.1)] transition-transform duration-300 h-[85vh]",
          isOpen ?"translate-y-0" :"translate-y-full",
          isEditing ?"" :"touch-none" 
        )}
      >
        <div className="w-full flex justify-center py-4 cursor-grab active:cursor-grabbing shrink-0 mt-2">
          <div className="w-12 h-1.5 bg-zinc-300 rounded-full" />
        </div>
        
        {product && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="px-6 flex justify-between items-start mb-4 flex-none border-b-4 border-black pb-4">
              <div>
                <h2 className="text-2xl font-black tracking-widest">{product.name}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="font-bold text-sm bg-zinc-200 text-zinc-700 px-2 py-0.5 tracking-widest font-mono">
                    SKU: {product.sku}
                  </span>
                  <span className="font-bold text-xs bg-black text-white px-2 py-1 tracking-widest">
                    {product.type ==='service' ?'Tjeneste' :'Fysisk'}
                  </span>
                </div>
              </div>
              <Button type="button" variant="outline" size="icon" onClick={handleClose} className="flex-none">
                <FontAwesomeIcon icon={faTimes} />
              </Button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
               {isEditing ? (
                  <ProductForm 
                    initialData={product} 
                    onSuccess={() => setIsEditing(false)} 
                  />
               ) : (
                  <div className="space-y-6">
                    {/* Stepper Control - Only for physical items */}
                    {product.type !=='service' && (
                        <div className="bg-black p-4 text-white flex flex-col items-center gap-4">
                           <span className="font-bold tracking-widest text-sm text-zinc-400">Aktiv Beholdning</span>
                           <div className="flex items-center justify-between w-full max-w-[250px] bg-white text-black p-1 border-2 border-black">
                               <button 
                                 onClick={() => handleAdjustStock(-1)} 
                                 disabled={(product.stockQuantity || 0) <= 0 || updateMutation.isPending}
                                 className="w-14 h-14 bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 disabled:opacity-50 flex items-center justify-center border-r-2 border-black focus:outline-none"
                               >
                                  <FontAwesomeIcon icon={faMinus} className="text-xl" />
                               </button>
                               
                               <div className="text-3xl font-black font-mono px-4 text-center">
                                  {updateMutation.isPending ?'...' : (product.stockQuantity || 0)}
                               </div>
    
                               <button 
                                 onClick={() => handleAdjustStock(1)} 
                                 disabled={updateMutation.isPending}
                                 className="w-14 h-14 bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 disabled:opacity-50 flex items-center justify-center border-l-2 border-black focus:outline-none"
                               >
                                  <FontAwesomeIcon icon={faPlus} className="text-xl" />
                               </button>
                           </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-zinc-50 p-4 border-2 border-black text-center">
                           <div className="font-bold text-xs text-zinc-500 tracking-widest mb-1">Pris (Inkl. MVA)</div>
                           <div className="font-mono font-black text-xl">{product.salesPriceIncVat.toLocaleString('no-NO')} kr</div>
                        </div>
                        <div className="bg-zinc-50 p-4 border-2 border-black text-center">
                           <div className="font-bold text-xs text-zinc-500 tracking-widest mb-1">Kostpris (Eks. MVA)</div>
                           <div className="font-mono font-bold text-lg">{product.costPriceExVat.toLocaleString('no-NO')} kr</div>
                        </div>
                    </div>

                    <div className="bg-zinc-50 p-4 border-2 border-black space-y-4">
                        <div className="flex justify-between items-center border-b border-black/10 pb-2">
                           <span className="font-bold text-xs text-zinc-500 tracking-widest">MVA-sats</span>
                           <span className="font-mono font-bold text-black text-lg">{product.vatRate}%</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-black/10 pb-2">
                           <span className="font-bold text-xs text-zinc-500 tracking-widest">Enhet</span>
                           <span className="font-bold text-black text-lg">{product.unit ||'stk'}</span>
                        </div>
                        {product.type !=='service' && (
                            <div className="flex justify-between items-center text-red-600">
                               <span className="font-bold text-xs tracking-widest overflow-hidden">Varslingsgrense</span>
                               <span className="font-mono font-bold text-lg">{product.warningLimit || 0}</span>
                            </div>
                        )}
                    </div>
                  </div>
               )}
            </div>

            {/* Sticky Action Footer */}
            {!isEditing && (
              <div className="flex-none p-4 bg-white border-t-4 border-black sticky bottom-0 flex gap-4 pb-8 w-full z-10">
                 <Button 
                   className="flex-1 h-14 text-lg bg-black text-white hover:bg-zinc-800" 
                   onClick={() => setIsEditing(true)}
                 >
                    <FontAwesomeIcon icon={faEdit} className="mr-2" /> Rediger
                 </Button>
                 
                 <Button 
                   variant="destructive"
                   className="flex-1 h-14 text-lg border-2 border-red-600 bg-red-100 text-red-600 hover:bg-red-200" 
                   onClick={handleDelete}
                   disabled={deleteMutation.isPending}
                 >
                   {deleteMutation.isPending ? (
                     <><FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" /> Sletter...</>
                   ) : isDeleting ? (
                     <><FontAwesomeIcon icon={faTrash} className="mr-2" /> Bekreft Slett</>
                   ) : (
                     <><FontAwesomeIcon icon={faTrash} className="mr-2" /> Slett</>
                   )}
                 </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
