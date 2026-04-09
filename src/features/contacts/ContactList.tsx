import React, { useState } from'react';
import { useQuery } from'@tanstack/react-query';
import { api } from'../../lib/api';
import { Card, CardContent } from'../../components/ui/card';
import { Button } from'../../components/ui/button';
import { FontAwesomeIcon } from'@fortawesome/react-fontawesome';
import { faPlus, faBuilding, faUser, faTimes } from'@fortawesome/free-solid-svg-icons';
import * as Dialog from'@radix-ui/react-dialog';
import { ContactForm } from'./ContactForm';
import { ContactDetailSheet } from'./ContactDetailSheet';
import { cn } from'../../lib/utils';
import { Contact } from'../../types/schema';

export function ContactList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'Alle' |'Kunde' |'Leverandør'>('Alle');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const { data: contacts, isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => api.contacts.list()
  });

  const filteredContacts = contacts?.filter(c => filter ==='Alle' || c.relationType === filter) || [];

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-4 border-black pb-4 gap-4">
        <h1 className="text-3xl font-black tracking-widest">Register</h1>
        
        <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
          <Dialog.Trigger asChild>
            <Button className="w-full sm:w-auto h-12 text-lg px-8">
              <FontAwesomeIcon icon={faPlus} className="mr-2" /> Ny Kontakt
            </Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
            <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-white border-4 border-black p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)] max-h-[90vh] overflow-y-auto outline-none">
                <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-2">
                  <Dialog.Title className="text-2xl font-black tracking-widest">Ny Kontakt</Dialog.Title>
                  <Dialog.Close asChild>
                    <Button variant="outline" size="icon">
                      <FontAwesomeIcon icon={faTimes} />
                    </Button>
                  </Dialog.Close>
                </div>
                <ContactForm onSuccess={() => setIsModalOpen(false)} />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      {/* Brutalist Custom Toggle Group Filter */}
      <div className="flex bg-white border-4 border-black rounded-none shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none transition-shadow mb-6">
         {['Alle','Kunde','Leverandør'].map((tab) => (
            <button
               key={tab}
               onClick={() => setFilter(tab as any)}
               className={cn("flex-1 py-3 font-black tracking-widest text-sm transition-colors border-r-4 border-black last:border-r-0 focus:outline-none",
                 filter === tab ?"bg-black text-white" :"bg-white text-black hover:bg-zinc-100"
               )}
            >
               {tab}
            </button>
         ))}
      </div>

      {isLoading ? (
         <div className="text-xl font-bold animate-pulse">Laster kontakter...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((contact) => (
            <button
               key={contact.id}
               onClick={() => setSelectedContact(contact)}
               className="w-full text-left active:scale-[0.98] transition-transform duration-100 ease-in-out focus:outline-none block"
            >
               <Card className="hover:bg-zinc-50 transition-colors border-2 border-black w-full min-h-[96px]">
                 <CardContent className="p-5 flex flex-col gap-3">
                   {/* Top Row: Name and Icon */}
                   <div className="flex items-start gap-3">
                     <div className="shrink-0 pt-0.5">
                       <FontAwesomeIcon icon={contact.relationType ==='Leverandør' ? faBuilding : faUser} className="text-2xl text-zinc-400" />
                     </div>
                     <div className="w-full truncate">
                        <h3 className="font-bold text-xl leading-tight truncate">{contact.name}</h3>
                     </div>
                   </div>

                   {/* Bottom Row / Chips: Type and OrgNumber */}
                   <div className="flex flex-wrap gap-2 pl-[42px] mt-1">
                     <span className="font-bold text-[11px] tracking-widest bg-black text-white px-2 py-1 leading-none rounded-sm">
                        {contact.relationType}
                     </span>
                     {contact.orgNumber && (
                        <span className="font-mono font-bold text-[11px] tracking-widest border-2 border-black px-2 py-0.5 leading-none rounded-sm text-zinc-600 bg-white">
                          Org: {contact.orgNumber}
                        </span>
                     )}
                   </div>
                 </CardContent>
               </Card>
            </button>
          ))}
          
          {filteredContacts.length === 0 && (
            <div className="col-span-full p-8 text-center border-4 border-black border-dashed font-black text-xl text-zinc-400 tracking-widest">
              Ingen kontakter funnet.
            </div>
          )}
        </div>
      )}

      <ContactDetailSheet
        contact={selectedContact}
        onClose={() => setSelectedContact(null)}
      />
    </div>
  );
}
