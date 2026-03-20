import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, PackageSearch, Plus } from 'lucide-react';
import { ContactList } from '@/features/katalog/ContactList';
import { ProductList } from '@/features/katalog/ProductList';
import { Button } from '@/components/ui/button';

export function Katalog() {
  const [activeTab, setActiveTab] = useState("kontakter");

  return (
    <div className="space-y-6 pb-20 md:pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">Katalog</h1>
          <p className="text-muted-foreground">Administrer kunder, leverandører og varelager.</p>
        </div>
        <Button 
          size="icon" 
          className="rounded-full h-12 w-12 shadow-md hover:shadow-lg transition-all"
          onClick={() => {
            if (activeTab === 'kontakter') window.dispatchEvent(new CustomEvent('openCreateContact'));
            else window.dispatchEvent(new CustomEvent('openCreateProduct'));
          }}
        >
          <Plus className="h-6 w-6" />
        </Button>
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
  );
}
