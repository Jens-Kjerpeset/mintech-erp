import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxOpen, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Product } from '@/types/schema';
import { productSchema } from '@/types/schema';
import { z } from 'zod';

import { SidePanelForm } from '@/components/layout/SidePanelForm';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { formatCurrency } from '@/lib/formatting';

export function ProductList() {
 const [isSheetOpen, setIsSheetOpen] = useState(false);
 const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
 const [searchTerm, setSearchTerm] = useState("");
 
 const queryClient = useQueryClient();

 const { data: products, isLoading } = useQuery({
 queryKey: ['products'],
 queryFn: () => api.products.list(),
 });

 const createMutation = useMutation({
 mutationFn: (data: Omit<Product, 'id'>) => api.products.create(data),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['products'] });
 setIsSheetOpen(false);
 },
 });

 const updateMutation = useMutation({
 mutationFn: ({ id, data }: { id: string, data: Partial<Product> }) => api.products.update(id, data),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['products'] });
 setIsSheetOpen(false);
 },
 });

 const deleteMutation = useMutation({
 mutationFn: (id: string) => api.products.delete(id),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['products'] });
 setIsSheetOpen(false);
 },
 });

 const form = useForm<z.input<typeof productSchema>>({
 resolver: zodResolver(productSchema),
 defaultValues: {
 name: '',
 sku: '',
 ean: '',
 unit: 'stk',
 costPriceExVat: 0,
 salesPriceIncVat: 0,
 vatRate: 25,
 stockQuantity: 0,
 warningLimit: 5,
 } as Partial<Product>,
 });

 const openCreateSheet = useCallback(() => {
 setSelectedProduct(null);
 form.reset({
 name: '', sku: '', ean: '', unit: 'stk', costPriceExVat: 0, salesPriceIncVat: 0, vatRate: 25, stockQuantity: 0, warningLimit: 5
 });
 setIsSheetOpen(true);
 }, [form]);

 useEffect(() => {
 const handler = () => openCreateSheet();
 window.addEventListener('openCreateProduct', handler);
 return () => window.removeEventListener('openCreateProduct', handler);
 }, [openCreateSheet]);

 const openEditSheet = (product: Product) => {
 setSelectedProduct(product);
 form.reset(product);
 setIsSheetOpen(true);
 };



 // Auto-Avanse Calculator 
 const currentCost = useWatch({ control: form.control, name: 'costPriceExVat' }) || 0;
 const currentSales = useWatch({ control: form.control, name: 'salesPriceIncVat' }) || 0;
 const currentVatRate = useWatch({ control: form.control, name: 'vatRate' }) || 25;
 
 const salesNet = currentSales / (1 + (currentVatRate / 100));
 const marginGross = salesNet - currentCost;
 const marginPercentage = currentCost > 0 ? (marginGross / salesNet) * 100 : 0;

 const filteredProducts = products?.filter(p => 
 p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
 (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
 (p.ean && p.ean.toLowerCase().includes(searchTerm.toLowerCase()))
 ) || [];

 if (isLoading) return <div className="p-8 text-center text-muted-foreground">Laster varelager...</div>;

 return (
 <div className="flex flex-col h-full relative mt-4">
 <div className="px-1 mb-4">
 <Input 
 placeholder="Søk etter vare, SKU eller EAN..." 
 className="w-full h-12"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 />
 </div>
 <div className="flex-1 overflow-y-auto pb-24 space-y-2 px-1">
 {filteredProducts.length === 0 ? (
 <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
 <FontAwesomeIcon icon={faBoxOpen} className="w-12 h-12 mb-4 opacity-20" />
 <p>Ingen varer funnet i systemet.</p>
 <p className="text-sm mt-2">Trykk på pluss-knappen for å legge til produkter eller SKUer.</p>
 </div>
 ) : (
 filteredProducts.map((product) => {
 const isLowStock = product.stockQuantity <= product.warningLimit;
 return (
 <div 
  key={product.id} 
  className={`cursor-pointer transition-colors border rounded-none shadow-sm hover:border-primary/50 py-3 px-3 sm:px-4 flex items-center justify-between group ${isLowStock ? 'bg-destructive/10 hover:bg-destructive/20 border-destructive/30' : 'bg-card hover:bg-muted/50'}`}
  
  onClick={() => openEditSheet(product)}
  >
  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 pr-2 sm:pr-4">
  <div className="space-y-1 truncate">
  <h3 className="font-medium tracking-tight leading-none truncate flex items-center gap-2 group-hover:underline">
  {product.name}
  {isLowStock && <FontAwesomeIcon icon={faExclamationTriangle} className="w-3.5 h-3.5 text-destructive shrink-0" />}
  </h3>
  <p className="text-sm text-muted-foreground truncate">
  {product.sku ? `SKU: ${product.sku}` : 'Ingen SKU'} • {product.stockQuantity} {product.unit} på lager
  </p>
  </div>
  </div>
  <div className="flex flex-col items-end shrink-0 gap-1.5 sm:gap-1">
  <span className="font-mono font-medium tracking-tight text-sm sm:text-base">
  {formatCurrency(product.salesPriceIncVat)}
  </span>
  {isLowStock && (
  <span className="text-[10px] sm:text-xs text-destructive bg-destructive/10 px-1.5 py-0.5 rounded-none font-medium tracking-wider border border-destructive/20 mt-0.5">
  Lite på lager
  </span>
  )}
  </div>
  </div>
 );
 })
 )}
 </div>


 <SidePanelForm
 open={isSheetOpen}
 onOpenChange={setIsSheetOpen}
 title={selectedProduct ? 'Rediger produkt' : 'Nytt produkt'}
 description="Skjema for varelager"
 onCancel={() => setIsSheetOpen(false)}
 onSubmit={form.handleSubmit((data) => {
 if (selectedProduct) {
 updateMutation.mutate({ id: selectedProduct.id!, data: data as Partial<Product> });
 } else {
 createMutation.mutate(data as Omit<Product, 'id'>);
 }
 })}
 isSubmitting={createMutation.isPending || updateMutation.isPending}
 submitText="Lagre Produkt"
 onDelete={
 selectedProduct?.id
 ? () => {
 if (confirm('Er du sikker på at du vil slette dette produktet?')) {
 deleteMutation.mutate(selectedProduct.id!);
 }
 }
 : undefined
 }
 deleteText="Slett Vare"
 >
 <Form {...form}>
 <div className="space-y-6">
 
 <div className="space-y-4">
 <h4 className="text-sm font-medium tracking-tight tracking-wider text-muted-foreground">Generell Informasjon</h4>
 <FormField control={form.control} name="name" render={({ field }) => (
 <FormItem><FormLabel>Varenavn</FormLabel><FormControl><Input placeholder="Økologisk Olivenolje" {...field} /></FormControl><FormMessage /></FormItem>
 )} />
 
 <div className="grid grid-cols-2 gap-4">
 <FormField control={form.control} name="sku" render={({ field }) => (
 <FormItem className="flex flex-col justify-end space-y-0 gap-2"><FormLabel>Varenummer (SKU)</FormLabel><FormControl><Input placeholder="OLIV-001" {...field} /></FormControl><FormMessage /></FormItem>
 )} />
 <FormField control={form.control} name="ean" render={({ field }) => (
 <FormItem className="flex flex-col justify-end space-y-0 gap-2"><FormLabel>Strekkode (EAN)</FormLabel><FormControl><Input placeholder="7041234..." {...field} /></FormControl><FormMessage /></FormItem>
 )} />
 </div>
 </div>

 <div className="space-y-4 pt-4 border-t">
 <h4 className="text-sm font-medium tracking-tight tracking-wider text-muted-foreground">Prising & MVA</h4>
 <div className="grid grid-cols-2 gap-4">
 <FormField control={form.control} name="costPriceExVat" render={({ field }) => (
 <FormItem className="flex flex-col justify-end space-y-0 gap-2"><FormLabel>Innkjøpspris (Eks. Mva)</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
 )} />
 <FormField control={form.control} name="salesPriceIncVat" render={({ field }) => (
 <FormItem className="flex flex-col justify-end space-y-0 gap-2"><FormLabel>Utsalgspris (Inkl. Mva)</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
 )} />
 </div>
 
 <div className="grid grid-cols-2 gap-4">
 <FormField control={form.control} name="vatRate" render={({ field }) => (
 <FormItem className="flex flex-col justify-end space-y-0 gap-2"><FormLabel>Mva-sats</FormLabel>
 <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={(field.value ?? 25).toString()}>
 <FormControl><SelectTrigger><SelectValue placeholder="Velg" /></SelectTrigger></FormControl>
 <SelectContent><SelectItem value="25">25% (Standard)</SelectItem><SelectItem value="15">15% (Mat/Drikke)</SelectItem><SelectItem value="12">12% (Transport/Kultur)</SelectItem><SelectItem value="0">0% (Fritatt)</SelectItem></SelectContent>
 </Select>
 <FormMessage /></FormItem>
 )} />
 <div className="flex flex-col justify-end space-y-0 gap-2">
 <FormLabel className="text-muted-foreground">Beregnet Avanse (Margin)</FormLabel>
 <div className="h-10 px-3 py-2 border rounded-md bg-muted/30 font-mono text-sm flex items-center justify-between gap-4 overflow-hidden">
 <span className={`shrink-0 ${marginPercentage > 0 ? "text-green-500" : marginPercentage < 0 ? "text-destructive" : "text-muted-foreground"}`}>
 {marginPercentage.toFixed(1)}%
 </span>
 <span className="text-xs text-muted-foreground font-mono truncate">{formatCurrency(marginGross)}</span>
 </div>
 </div>
 </div>
 </div>

 <div className="space-y-4 pt-4 border-t">
 <h4 className="text-sm font-medium tracking-tight tracking-wider text-muted-foreground">Lagerbeholdning</h4>
 <div className="grid grid-cols-3 gap-4">
 <FormField control={form.control} name="stockQuantity" render={({ field }) => (
 <FormItem className="flex flex-col justify-end space-y-0 gap-2"><FormLabel>Antall</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
 )} />
 <FormField control={form.control} name="unit" render={({ field }) => (
 <FormItem className="flex flex-col justify-end space-y-0 gap-2"><FormLabel>Enhet</FormLabel>
 <Select onValueChange={field.onChange} defaultValue={field.value}>
 <FormControl><SelectTrigger><SelectValue placeholder="Velg" /></SelectTrigger></FormControl>
 <SelectContent><SelectItem value="stk">Stk</SelectItem><SelectItem value="kg">Kg</SelectItem><SelectItem value="liter">Liter</SelectItem><SelectItem value="pkm">Pkm</SelectItem></SelectContent>
 </Select>
 <FormMessage /></FormItem>
 )} />
 <FormField control={form.control} name="warningLimit" render={({ field }) => (
 <FormItem className="flex flex-col justify-end space-y-0 gap-2"><FormLabel>Varselgrense</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormDescription className="sr-only">Stock alert limit</FormDescription><FormMessage /></FormItem>
 )} />
 </div>
 </div>

 </div>
 </Form>
 </SidePanelForm>
 </div>
 );
}
