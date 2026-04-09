import React, { useState } from'react';
import { useQuery } from'@tanstack/react-query';
import { api } from'../../lib/api';
import { Card, CardContent } from'../../components/ui/card';
import { FontAwesomeIcon } from'@fortawesome/react-fontawesome';
import { faBoxOpen, faPlus, faTimes, faTruckFast, faTag } from'@fortawesome/free-solid-svg-icons';
import { Button } from'../../components/ui/button';
import * as Dialog from'@radix-ui/react-dialog';
import { ProductForm } from'./ProductForm';
import { ProductDetailSheet } from'./ProductDetailSheet';
import { Product } from'../../types/schema';
import { useTranslation } from '../../lib/i18n';
import { cn } from'../../lib/utils';

export function InventoryList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { t } = useTranslation();

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.products.list()
  });

  if (isLoading) {
    return <div className="text-xl font-bold animate-pulse">{t('inventory.loading')}</div>;
  }

  const getProductIcon = (product: Product) => {
     if (product.type ==='service') {
        if (product.name.toLowerCase().includes('frakt')) return faTruckFast;
        return faTag;
     }
     return faBoxOpen;
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-4 border-black pb-4 gap-4">
        <h1 className="text-3xl font-black tracking-widest">{t('inventory.title')}</h1>
        
        <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
          <Dialog.Trigger asChild>
            <Button className="w-full sm:w-auto h-12 text-lg px-8">
              <FontAwesomeIcon icon={faPlus} className="mr-2" /> {t('inventory.new_item')}
            </Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
            <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-white border-4 border-black p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)] max-h-[90vh] overflow-y-auto outline-none">
                <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-2">
                  <Dialog.Title className="text-2xl font-black tracking-widest">{t('inventory.new_item')}</Dialog.Title>
                  <Dialog.Close asChild>
                    <Button variant="outline" size="icon">
                      <FontAwesomeIcon icon={faTimes} />
                    </Button>
                  </Dialog.Close>
                </div>
                <ProductForm onSuccess={() => setIsModalOpen(false)} />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products?.map((product) => {
          const isService = product.type ==='service';
          const isLowStock = !isService && (product.stockQuantity || 0) <= (product.warningLimit || 0);
          
          return (
            <button
               key={product.id}
               onClick={() => setSelectedProduct(product)}
               className="w-full text-left active:scale-[0.98] transition-transform duration-100 ease-in-out focus:outline-none block"
            >
              <Card className={cn("hover:bg-zinc-50 border-2 border-black transition-colors w-full h-full",
                isLowStock &&"border-red-600 bg-red-50/30"
              )}>
                <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <FontAwesomeIcon icon={getProductIcon(product)} className="text-2xl text-zinc-400" />
                      <span className="font-mono font-bold text-xs bg-zinc-200 px-2 py-1 rounded-sm text-zinc-700 tracking-widest">{product.sku}</span>
                    </div>
                    <h3 className="font-bold text-xl leading-tight line-clamp-2">{product.name}</h3>
                  </div>
                  
                  <div className="border-t-2 border-black/10 pt-3">
                    <div className={cn("flex items-end", isService ?"justify-end" :"justify-between")}>
                      {!isService && (
                        <div>
                          <div className="text-xs font-bold tracking-widest text-zinc-500 mb-1">{t('inventory.stock')}</div>
                          <div className={cn("text-3xl font-black font-mono leading-none",
                            isLowStock ?"text-red-600" :"text-black"
                          )}>
                            {product.stockQuantity} <span className="text-sm font-sans tracking-tight text-zinc-500 font-bold">{product.unit || t('inventory.unit_default')}</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="text-right">
                        <div className="text-xs font-bold tracking-widest text-zinc-500 mb-1">{t('inventory.price')}</div>
                        <div className="text-xl font-bold font-mono leading-none">{product.salesPriceIncVat.toLocaleString('no-NO')} kr</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </button>
          )
        })}
        
        {products?.length === 0 && (
          <div className="col-span-full p-8 text-center border-4 border-black border-dashed font-black text-xl text-zinc-400 tracking-widest">
            {t('inventory.no_items')}
          </div>
        )}
      </div>

      <ProductDetailSheet
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
