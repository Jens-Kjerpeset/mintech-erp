import React, { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDrag } from '@use-gesture/react';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faEdit, faTrash, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { cn } from '../../lib/utils';
import { Contact } from '../../types/schema';
import { ContactForm } from './ContactForm';
import { useTranslation } from '../../lib/i18n';

export function ContactDetailSheet({ contact, onClose }: { contact: Contact | null, onClose: () => void }) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const isOpen = !!contact;
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
    axis: 'y'
  });

  useEffect(() => {
    if (contact) {
      document.body.style.overflow = 'hidden';
      setIsEditing(false);
      setIsDeleting(false);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [contact]);

  const handleClose = () => {
    setIsEditing(false);
    setIsDeleting(false);
    onClose();
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.contacts.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      handleClose();
    }
  });

  const handleDelete = () => {
    if (isDeleting && contact) {
      deleteMutation.mutate(contact.id);
    } else {
      setIsDeleting(true);
    }
  };

  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-black/60 transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={handleClose}
      />

      <div
        {...bind()}
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 flex flex-col bg-white border-t-4 border-black rounded-t-2xl shadow-[0_-4px_0_0_rgba(0,0,0,0.1)] transition-transform duration-300 h-[85vh]",
          isOpen ? "translate-y-0" : "translate-y-full",
          isEditing ? "" : "touch-none" 
        )}
      >
        <div className="w-full flex justify-center py-4 cursor-grab active:cursor-grabbing shrink-0 mt-2">
          <div className="w-12 h-1.5 bg-zinc-300 rounded-full" />
        </div>
        
        {contact && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="px-6 flex justify-between items-start mb-4 flex-none border-b-4 border-black pb-4">
              <div>
                <h2 className="text-2xl font-black tracking-widest">{contact.name}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className="font-bold text-xs bg-black text-white px-2 py-1 tracking-widest">
                    {contact.relationType}
                  </span>
                </div>
              </div>
              <Button type="button" variant="outline" size="icon" onClick={handleClose} className="shrink-0">
                <FontAwesomeIcon icon={faTimes} />
              </Button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
               {isEditing ? (
                  <ContactForm 
                    initialData={contact} 
                    onSuccess={() => {
                        setIsEditing(false);
                    }} 
                  />
                ) : (
                  <div className="space-y-6">
                    <div className="bg-zinc-50 p-6 border-2 border-black space-y-4">
                        <div>
                           <div className="font-bold text-xs text-zinc-500 tracking-widest mb-1">{t('contact_detail.type')}</div>
                           <div className="font-black text-lg">{contact.relationType === 'Kunde' ? t('contacts.filter_customer') : contact.relationType === 'Leverandør' ? t('contacts.filter_vendor') : contact.relationType}</div>
                        </div>
                        {contact.orgNumber && (
                           <div>
                              <div className="font-bold text-xs text-zinc-500 tracking-widest mb-1">{t('contact_detail.org_number')}</div>
                              <div className="font-mono font-black text-lg">{contact.orgNumber}</div>
                           </div>
                        )}
                        <div>
                           <div className="font-bold text-xs text-zinc-500 tracking-widest mb-1">{t('contact_detail.email')}</div>
                           <div className="font-black text-lg">{contact.email || '-'}</div>
                        </div>
                        <div>
                           <div className="font-bold text-xs text-zinc-500 tracking-widest mb-1">{t('contact_detail.credit_days')}</div>
                           <div className="font-black text-lg">{contact.paymentTermsDays || 14} {t('contact_detail.days')}</div>
                        </div>
                    </div>
                  </div>
               )}
            </div>

            {/* Sticky Action Footer - Only show if not editing, as form has its own save */}
             {!isEditing && (
              <div className="flex-none p-4 bg-white border-t-4 border-black sticky bottom-0 flex gap-4 pb-8 w-full z-10">
                 <Button 
                   className="flex-1 h-14 text-lg bg-black text-white hover:bg-zinc-800" 
                   onClick={() => setIsEditing(true)}
                 >
                    <FontAwesomeIcon icon={faEdit} className="mr-2" /> {t('contact_detail.edit')}
                 </Button>
                 
                 <Button 
                   variant="destructive"
                   className="flex-1 h-14 text-lg border-2 border-red-600 bg-red-100 text-red-600 hover:bg-red-200" 
                   onClick={handleDelete}
                   disabled={deleteMutation.isPending}
                 >
                   {deleteMutation.isPending ? (
                     <><FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" /> {t('contact_detail.deleting')}</>
                   ) : isDeleting ? (
                     <><FontAwesomeIcon icon={faTrash} className="mr-2" /> {t('contact_detail.confirm_delete')}</>
                   ) : (
                     <><FontAwesomeIcon icon={faTrash} className="mr-2" /> {t('contact_detail.delete')}</>
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
