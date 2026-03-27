import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Contact } from '@/types/schema';
import { contactSchema } from '@/types/schema';
import { z } from 'zod';

import { SidePanelForm } from '@/components/layout/SidePanelForm';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


export function ContactList() {
 const [isSheetOpen, setIsSheetOpen] = useState(false);
 const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
 const [searchTerm, setSearchTerm] = useState("");
 
 const location = useLocation();
 const navigate = useNavigate();
 const queryClient = useQueryClient();

 const handleOpenChange = (open: boolean) => {
 setIsSheetOpen(open);
 if (!open && location.state?.returnToDashboard) {
 navigate('/', { replace: true });
 }
 };

 const { data: contacts, isLoading } = useQuery({
 queryKey: ['contacts'],
 queryFn: () => api.contacts.list(),
 });

 const createMutation = useMutation({
 mutationFn: (data: Omit<Contact, 'id'>) => api.contacts.create(data),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['contacts'] });
 handleOpenChange(false);
 },
 });

 const updateMutation = useMutation({
 mutationFn: ({ id, data }: { id: string, data: Partial<Contact> }) => api.contacts.update(id, data),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['contacts'] });
 handleOpenChange(false);
 },
 });

 const deleteMutation = useMutation({
 mutationFn: (id: string) => api.contacts.delete(id),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['contacts'] });
 handleOpenChange(false);
 },
 });

 const form = useForm<z.input<typeof contactSchema>>({
 resolver: zodResolver(contactSchema),
 defaultValues: {
 name: '',
 relationType: 'Kunde',
 orgNumber: '',
 contactPerson: '',
 email: '',
 phone: '',
 address: '',
 zipCode: '',
 city: '',
 paymentTermsDays: 14,
 currency: 'NOK',
 vatHandling: 'Standard',
 } as Partial<Contact>,
 });

 const openCreateSheet = useCallback(() => {
 setSelectedContact(null);
 form.reset({
 name: '', relationType: 'Kunde', orgNumber: '', contactPerson: '', email: '',
 phone: '', address: '', zipCode: '', city: '', paymentTermsDays: 14, currency: 'NOK', vatHandling: 'Standard', ehfEnabled: false, defaultAccount: ''
 });
 setIsSheetOpen(true);
 }, [form]);

 useEffect(() => {
 const handler = () => openCreateSheet();
 window.addEventListener('openCreateContact', handler);
 return () => window.removeEventListener('openCreateContact', handler);
 }, [openCreateSheet]);

 const orgWatch = form.watch('orgNumber');
 
 useEffect(() => {
 if (!orgWatch) return;
 const cleanOrg = orgWatch.replace(/\D/g, '');
 if (cleanOrg.length === 9) {
 const currentName = form.getValues('name');
 if (!currentName || currentName.trim() === '') {
 fetch(`https://data.brreg.no/enhetsregisteret/api/enheter/${cleanOrg}`)
 .then(res => res.json())
 .then(data => {
 if (data && data.navn) {
 form.setValue('name', data.navn);
 if (data.forretningsadresse) {
 form.setValue('address', data.forretningsadresse.adresse?.[0] || '');
 form.setValue('zipCode', data.forretningsadresse.postnummer || '');
 form.setValue('city', data.forretningsadresse.poststed || '');
 }
 if (data.organisasjonsform?.kode === 'AS') {
 form.setValue('ehfEnabled', true);
 }
 }
 })
 .catch(err => console.error("Brreg fetch error:", err));
 }
 }
 }, [orgWatch, form]);

 const openEditSheet = (contact: Contact) => {
 setSelectedContact(contact);
 form.reset(contact);
 setIsSheetOpen(true);
 };

 const onSubmit = (formData: z.input<typeof contactSchema>) => {
 const data = formData as Contact;
 if (selectedContact?.id) {
 updateMutation.mutate({ id: selectedContact.id, data });
 } else {
 const dataCopy = { ...data };
 delete dataCopy.id;
 createMutation.mutate(dataCopy);
 }
 };

 const filteredContacts = contacts?.filter(c => 
 c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
 (c.orgNumber && c.orgNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
 (c.contactPerson && c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()))
 ) || [];

 if (isLoading) return <div className="p-8 text-center text-muted-foreground">Laster kontakter...</div>;

 return (
 <div className="flex flex-col h-full relative mt-4">
 <div className="px-1 mb-4">
 <Input 
 placeholder="Søk etter kunde, org.nr eller kontaktperson..." 
 className="w-full h-12"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 />
 </div>
 <div className="flex-1 overflow-y-auto pb-24 space-y-2 px-1">
 {filteredContacts.length === 0 ? (
 <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
 <FontAwesomeIcon icon={faBuilding} className="w-12 h-12 mb-4 opacity-20" />
 <p>Ingen kontakter funnet i hovedboken.</p>
 <p className="text-sm mt-2">Trykk på pluss-knappen for å legge til kunder eller leverandører.</p>
 </div>
 ) : (
 filteredContacts.map((contact) => (
 <div 
  key={contact.id} 
  className="cursor-pointer bg-card hover:bg-muted/50 transition-colors border rounded-none shadow-sm hover:border-primary/50 py-3 px-3 sm:px-4 flex items-center justify-between group"
  
  onClick={() => openEditSheet(contact)}
  >
  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 pr-2 sm:pr-4">
  <div className="space-y-1 truncate">
  <h3 className="font-medium tracking-tight leading-none truncate group-hover:underline">{contact.name}</h3>
  <p className="text-sm text-muted-foreground truncate">
  {contact.contactPerson ? `${contact.contactPerson}` : contact.orgNumber ? `Org: ${contact.orgNumber}` : 'Ingen detaljer'}
  </p>
  </div>
  </div>
  <div className="flex items-center justify-end shrink-0 gap-1.5 sm:gap-2">
  {contact.ehfEnabled && (
  <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-none font-medium tracking-wider bg-blue-500/10 text-blue-600 border border-blue-500/20">
  EHF
  </span>
  )}
  <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-none font-medium tracking-wider bg-muted text-muted-foreground">
  {contact.relationType}
  </span>
  </div>
  </div>
 ))
 )}
 </div>


 <SidePanelForm
 open={isSheetOpen}
 onOpenChange={handleOpenChange}
 title={selectedContact ? 'Rediger kontakt' : 'Ny kontakt'}
 description="Skjema for å administrere CRM kontakt"
 onCancel={() => handleOpenChange(false)}
 onSubmit={form.handleSubmit(onSubmit)}
 isSubmitting={createMutation.isPending || updateMutation.isPending}
 submitText="Lagre Kontakt"
 onDelete={
 selectedContact?.id
 ? () => {
 if (confirm('Er du sikker på at du vil slette denne kontakten?')) {
 deleteMutation.mutate(selectedContact.id!);
 }
 }
 : undefined
 }
 deleteText="Slett Kontakt"
 >
 <Form {...form}>
 <div className="space-y-6">
 
 <div className="space-y-4">
 <h4 className="text-sm font-medium tracking-tight tracking-wider text-muted-foreground">Generell Informasjon</h4>
 <FormField control={form.control} name="name" render={({ field }) => (
 <FormItem><FormLabel>Firmanavn / Navn</FormLabel><FormControl><Input placeholder="Bedrift AS" {...field} /></FormControl><FormMessage /></FormItem>
 )} />
 
 <div className="grid grid-cols-2 gap-4">
 <FormField control={form.control} name="relationType" render={({ field }) => (
 <FormItem className="flex flex-col justify-end space-y-0 gap-2"><FormLabel>Type relasjon</FormLabel>
 <Select onValueChange={field.onChange} value={field.value}>
 <FormControl><SelectTrigger><SelectValue placeholder="Velg" /></SelectTrigger></FormControl>
 <SelectContent>
 <SelectItem value="Kunde">Kunde</SelectItem>
 <SelectItem value="Leverandør">Leverandør</SelectItem>
 <SelectItem value="Begge">Begge</SelectItem>
 </SelectContent>
 </Select>
 <FormMessage /></FormItem>
 )} />
 <FormField control={form.control} name="orgNumber" render={({ field }) => (
 <FormItem className="flex flex-col justify-end space-y-0 gap-2">
 <FormLabel>Org.nummer</FormLabel>
 <FormControl>
 <Input 
 placeholder="XXX XXX XXX" 
 {...field} 
 maxLength={11}
 onChange={(e) => {
 const val = e.target.value.replace(/\D/g, '');
 const formatted = val.replace(/(\d{3})(?=\n|$|\d)/g, '$1 ').trim();
 field.onChange(formatted);
 }}
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )} />
 </div>
 <FormField control={form.control} name="contactPerson" render={({ field }) => (
 <FormItem><FormLabel>Kontaktperson</FormLabel><FormControl><Input placeholder="Ola Nordmann" {...field} /></FormControl><FormMessage /></FormItem>
 )} />
 </div>

 <div className="space-y-4 pt-4 border-t">
 <h4 className="text-sm font-medium tracking-tight tracking-wider text-muted-foreground">Kontakt & Fakturering</h4>
 <div className="grid grid-cols-2 gap-4">
 <FormField control={form.control} name="email" render={({ field }) => (
 <FormItem className="flex flex-col justify-end space-y-0 gap-2"><FormLabel>Faktura E-post</FormLabel><FormControl><Input type="email" placeholder="faktura@bedrift.no" {...field} /></FormControl><FormMessage /></FormItem>
 )} />
 <FormField control={form.control} name="phone" render={({ field }) => (
 <FormItem className="flex flex-col justify-end space-y-0 gap-2"><FormLabel>Telefon</FormLabel><FormControl><Input type="tel" placeholder="+47" {...field} /></FormControl><FormMessage /></FormItem>
 )} />
 </div>
 <FormField control={form.control} name="address" render={({ field }) => (
 <FormItem><FormLabel>Adresse</FormLabel><FormControl><Input placeholder="Storgata 1" {...field} /></FormControl><FormMessage /></FormItem>
 )} />
 <div className="grid grid-cols-[1fr_2fr] gap-4">
 <FormField control={form.control} name="zipCode" render={({ field }) => (
 <FormItem><FormLabel>Postnummer</FormLabel><FormControl><Input placeholder="0101" maxLength={4} {...field} /></FormControl><FormMessage /></FormItem>
 )} />
 <FormField control={form.control} name="city" render={({ field }) => (
 <FormItem><FormLabel>Poststed</FormLabel><FormControl><Input placeholder="Oslo" {...field} /></FormControl><FormMessage /></FormItem>
 )} />
 </div>
 </div>

 <div className="space-y-4 pt-4 border-t">
 <h4 className="text-sm font-medium tracking-tight tracking-wider text-muted-foreground">Økonomiske Betingelser</h4>
 
 {form.watch('relationType') === 'Leverandør' && (
 <FormField control={form.control} name="defaultAccount" render={({ field }) => (
 <FormItem className="mb-4 flex flex-col justify-end space-y-0 gap-2">
 <FormLabel>Standard Kostnadskonto (Regnskap)</FormLabel>
 <Select onValueChange={field.onChange} value={field.value || ""}>
 <FormControl><SelectTrigger><SelectValue placeholder="Velg konto" /></SelectTrigger></FormControl>
 <SelectContent>
 <SelectItem value="4000">4000 - Varekjøp, høy sats</SelectItem>
 <SelectItem value="4300">4300 - Innkjøp av varer for videresalg, høy sats</SelectItem>
 <SelectItem value="6540">6540 - Inventar</SelectItem>
 <SelectItem value="6800">6800 - Kontorrekvisita</SelectItem>
 <SelectItem value="6900">6900 - Telefon og portokostnader</SelectItem>
 <SelectItem value="7140">7140 - Reisekostnad, ikke opplysningspliktig</SelectItem>
 <SelectItem value="7320">7320 - Reklamekostnad</SelectItem>
 <SelectItem value="7770">7770 - Bank og kortgebyrer</SelectItem>
 </SelectContent>
 </Select>
 <FormMessage />
 </FormItem>
 )} />
 )}

 <div className="grid grid-cols-2 gap-4">
 <FormField control={form.control} name="paymentTermsDays" render={({ field }) => (
 <FormItem className="flex flex-col justify-end space-y-0 gap-2"><FormLabel>Kredittid (Dager)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
 )} />
 <FormField control={form.control} name="currency" render={({ field }) => (
 <FormItem className="flex flex-col justify-end space-y-0 gap-2"><FormLabel>Valuta</FormLabel>
 <Select onValueChange={field.onChange} value={field.value}>
 <FormControl><SelectTrigger><SelectValue placeholder="Velg" /></SelectTrigger></FormControl>
 <SelectContent><SelectItem value="NOK">NOK</SelectItem><SelectItem value="EUR">EUR</SelectItem><SelectItem value="USD">USD</SelectItem></SelectContent>
 </Select>
 <FormMessage /></FormItem>
 )} />
 </div>
 </div>

 </div>
 </Form>
 </SidePanelForm>
 </div>
 );
}
