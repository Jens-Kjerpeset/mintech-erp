import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, PackageSearch, Plus } from 'lucide-react';
import { ContactList } from '@/features/katalog/ContactList';
import { ProductList } from '@/features/katalog/ProductList';
import { Button } from '@/components/ui/button';

export function Katalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("kontakter");

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setTimeout(() => window.dispatchEvent(new CustomEvent('openCreateContact')), 100);
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return (
    <>
      <div className="space-y-6 pb-20 md:pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight">Katalog</h1>
            <p className="text-muted-foreground">Administrer kunder, leverandører og varelager.</p>
          </div>
        </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="kontakter" className="flex items-center gap-2">
            <Users className="w-4 h-4" /> Kontakter
          </TabsTrigger>
          <TabsTrigger value="varelager" className="flex items-center gap-2">
            <PackageSearch className="w-4 h-4" /> Varelager
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="kontakter" className="flex-1 mt-0 outline-none data-[state=active]:flex flex-col gap-4 overflow-hidden">
          <ContactList />
        </TabsContent>
        
        <TabsContent value="varelager" className="flex-1 mt-0 outline-none data-[state=active]:flex flex-col gap-4 overflow-hidden">
          <ProductList />
        </TabsContent>
      </Tabs>
    </div>

      <div className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-50">
        <Button 
          size="icon" 
          className="rounded-full h-14 w-14 shadow-xl hover:shadow-2xl transition-all"
          onClick={() => {
            if (activeTab === 'kontakter') window.dispatchEvent(new CustomEvent('openCreateContact'));
            else window.dispatchEvent(new CustomEvent('openCreateProduct'));
          }}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </>
  );
}
