import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Contact } from '@/types/schema';
import { contactSchema } from '@/types/schema';
import { Card, CardContent } from '@/components/ui/card';
import { SidePanelForm } from '@/components/layout/SidePanelForm';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2 } from 'lucide-react';

export function ContactList() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  
  const queryClient = useQueryClient();

  const { data: contacts, isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => api.contacts.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<Contact, 'id'>) => api.contacts.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setIsSheetOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Contact> }) => api.contacts.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setIsSheetOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.contacts.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setIsSheetOpen(false);
    },
  });

  const form = useForm<Contact>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(contactSchema) as any,
    defaultValues: {
      name: '',
      relationType: 'Kunde',
      orgNumber: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      zipCity: '',
      paymentTermsDays: 14,
      currency: 'NOK',
      vatHandling: 'Standard',
    } as Partial<Contact>,
  });

  const openCreateSheet = useCallback(() => {
    setSelectedContact(null);
    form.reset({
      name: '', relationType: 'Kunde', orgNumber: '', contactPerson: '', email: '',
      phone: '', address: '', zipCity: '', paymentTermsDays: 14, currency: 'NOK', vatHandling: 'Standard'
    });
    setIsSheetOpen(true);
  }, [form]);

  useEffect(() => {
    const handler = () => openCreateSheet();
    window.addEventListener('openCreateContact', handler);
    return () => window.removeEventListener('openCreateContact', handler);
  }, [openCreateSheet]);

  const openEditSheet = (contact: Contact) => {
    setSelectedContact(contact);
    form.reset(contact);
    setIsSheetOpen(true);
  };

  const onSubmit = (data: Contact) => {
    if (selectedContact?.id) {
      updateMutation.mutate({ id: selectedContact.id, data });
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...createData } = data;
      createMutation.mutate(createData);
    }
  };

  if (isLoading) return <div className="p-8 text-center animate-pulse text-muted-foreground">Laster kontakter...</div>;

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto pb-24 space-y-3 px-1">
        {contacts?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
            <Building2 className="w-12 h-12 mb-4 opacity-20" />
            <p>Ingen kontakter funnet i hovedboken.</p>
            <p className="text-sm mt-2">Trykk på pluss-knappen for å legge til kunder eller leverandører.</p>
          </div>
        ) : (
          contacts?.map((contact) => (
            <Card 
              key={contact.id} 
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => openEditSheet(contact)}
            >
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0 pr-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1 truncate">
                      <h3 className="font-semibold leading-none truncate">{contact.name}</h3>
                      <p className="text-sm text-muted-foreground block truncate">
                        {contact.contactPerson ? `${contact.contactPerson}` : contact.orgNumber ? `Org: ${contact.orgNumber}` : 'Ingen detaljer'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end shrink-0">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider bg-muted text-muted-foreground">
                      {contact.relationType}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>


      <SidePanelForm
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        title={selectedContact ? 'Rediger kontakt' : 'Ny kontakt'}
        description="Skjema for å administrere CRM kontakt"
        onCancel={() => setIsSheetOpen(false)}
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
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Generell Informasjon</h4>
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Firmanavn / Navn</FormLabel><FormControl><Input placeholder="Bedrift AS" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="relationType" render={({ field }) => (
                  <FormItem className="flex flex-col justify-end space-y-0 gap-2"><FormLabel>Type relasjon</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <FormItem className="flex flex-col justify-end space-y-0 gap-2"><FormLabel>Org.nummer</FormLabel><FormControl><Input placeholder="9-siffer" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="contactPerson" render={({ field }) => (
                <FormItem><FormLabel>Kontaktperson</FormLabel><FormControl><Input placeholder="Ola Nordmann" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Kontakt & Fakturering</h4>
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
              <FormField control={form.control} name="zipCity" render={({ field }) => (
                <FormItem><FormLabel>Postnr & Sted</FormLabel><FormControl><Input placeholder="0101 Oslo" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Økonomiske Betingelser</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="paymentTermsDays" render={({ field }) => (
                  <FormItem className="flex flex-col justify-end space-y-0 gap-2"><FormLabel>Kredittid (Dager)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="currency" render={({ field }) => (
                  <FormItem className="flex flex-col justify-end space-y-0 gap-2"><FormLabel>Valuta</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
