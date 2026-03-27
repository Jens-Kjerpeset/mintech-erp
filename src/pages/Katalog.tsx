import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faBoxOpen, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ContactList } from '@/features/katalog/ContactList';
import { ProductList } from '@/features/katalog/ProductList';


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
 <div className="space-y-6 pb-20 md:pb-6 h-full flex flex-col">
 <header className="flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-heading font-medium tracking-tight">Katalog</h1>
 <p className="text-muted-foreground">Administrer kunder, leverandører og varelager.</p>
 </div>
 </header>

 <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
 <TabsList className="!grid w-full grid-cols-2 mb-4">
 <TabsTrigger value="kontakter" className="flex items-center gap-2">
 <FontAwesomeIcon icon={faUsers} className="w-4 h-4" /> Kontakter
 </TabsTrigger>
 <TabsTrigger value="varelager" className="flex items-center gap-2">
 <FontAwesomeIcon icon={faBoxOpen} className="w-4 h-4" /> Varelager
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

 <div className="fixed bottom-24 right-6 md:bottom-8 md:right-8 ">
 <button 
 className="focus:outline-none flex items-center justify-center rounded-full h-14 w-14 shadow-sm hover:shadow-sm cursor-pointer bg-primary text-primary-foreground"
 aria-label="Ny katalog"
 onClick={() => {
 if (activeTab === 'kontakter') window.dispatchEvent(new CustomEvent('openCreateContact'));
 else window.dispatchEvent(new CustomEvent('openCreateProduct'));
 }}
 >
 <FontAwesomeIcon icon={faPlus} className="size-6" />
 </button>
 </div>
 </>
 );
}
