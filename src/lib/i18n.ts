import { useAppStore } from '../store/useAppStore';

type Dictionary = Record<string, any>;

export const dictionary: Record<'no' | 'en', Dictionary> = {
  no: {
    app: {
      loading: "Laster...",
      search: "Søk i min-iWiki..."
    },
    nav: {
      dashboard: "Sentral",
      ledger: "Hovedbok",
      invoices: "Fakturaer",
      contacts: "Kontakter",
      pos: "Kasselogg (Z)",
      inventory: "Varelager",
      settings: "Systemoppsett"
    },
    settings: {
      title: "Systemoppsett",
      loading: "Laster innstillinger...",
      legal: "Juridisk Informasjon",
      legal_name: "Selskapsnavn *",
      legal_org: "Organisasjonsnummer *",
      legal_address: "Gateadresse *",
      legal_zip: "Postnummer *",
      legal_city: "Poststed *",
      payment: "Betalingsinformasjon",
      payment_bank: "Bankkontonummer *",
      payment_vipps: "Vipps-nummer (Valgfritt)",
      payment_iban: "IBAN (Valgfritt)",
      payment_swift: "SWIFT/BIC (Valgfritt)",
      system: "System & Fakturering",
      system_next_inv: "Neste Fakturanummer",
      system_next_inv_locked: "Låst av systemet (Fakturaer eksisterer)",
      system_mva: "MVA Termin",
      system_mva_bimo: "Annenhver måned",
      system_mva_year: "Årlig",
      system_credit: "Standard Kredittid (Dager)",
      system_lang: "Språk / Language",
      system_lang_no: "Norsk (Norway)",
      system_lang_en: "English (UK)",
      profile: "Profilering",
      profile_logo: "Logo URL",
      profile_note: "Standard Fakturatekst",
      profile_note_placeholder: "Skriv inn en melding som vises på alle fakturaer...",
      theme: "Utseende & Tema",
      theme_light: "Lys",
      theme_dark: "Mørk",
      save: "Lagre Innstillinger",
      saving: "Lagrer..."
    },
    dashboard: {
      loading: "Laster Dashboard...",
      title: "Dashboard",
      new_invoice: "Ny Faktura",
      new_zreport: "Nytt Salg/Z",
      new_contact: "Ny Kontakt",
      outstanding_invoices: "Utestående Fakturaer",
      active_claims: "aktive krav",
      financial_overview: "Økonomisk Oversikt (6 mnd)",
      income: "Inntekter",
      expenses: "Kostnader"
    },
    ledger: {
      title: "Hovedbok",
      filter_type: "Type",
      filter_all: "Alle",
      filter_income: "Inntekt",
      filter_expense: "Utgift",
      filter_category: "Kategori",
      filter_category_all: "Alle Kategorier",
      date_from: "Fra Dato",
      date_to: "Til Dato",
      loading: "Laster hovedbok...",
      filtering: "Filtrerer Data...",
      export_saft: "Eksportér SAF-T (XML)",
      sort_by: "Sorter etter:",
      sort_date_desc: "Dato (Nyeste først)",
      sort_date_asc: "Dato (Eldste først)",
      sort_amount_desc: "Beløp (Høyeste først)",
      sort_amount_asc: "Beløp (Laveste først)",
      no_description: "Ingen beskrivelse",
      inc_vat: "inkl. MVA",
      no_transactions: "Ingen transaksjoner funnet for valgt filter"
    },
    ledger_edit: {
      title: "Endre Postering",
      category: "Kategori *",
      status: "Status *",
      saving: "Lagrer...",
      update_btn: "Oppdater Transaksjon"
    },
    invoices: {
      loading: "Laster fakturaer...",
      title: "Fakturaer",
      new_invoice: "Ny Faktura",
      due: "Forfall:",
      no_invoices: "Ingen fakturaer registrert."
    },
    invoice_detail: {
      issue_date: "Fakturadato",
      due_date: "Forfallsdato",
      line_items: "Varelinjer",
      subtotal: "Delsum",
      vat: "MVA",
      total: "Total",
      generating_pdf: "Genererer PDF...",
      download_pdf: "Last Ned PDF",
      updating: "Oppdaterer...",
      mark_paid: "Marker som Betalt"
    },
    invoice_form: {
      title: "Ny Faktura",
      back: "Tilbake",
      client_details: "Kundedetaljer",
      select_client: "Velg Kunde *",
      select_placeholder: "-- Velg fra register --",
      no_org: "Ingen Org",
      issue_date: "Fakturadato *",
      due_date_auto: "Forfallsdato (Auto) *",
      add_item: "Legg til",
      line_items: "Varelinjer",
      desc_placeholder: "Beskrivelse",
      qty_placeholder: "Antall",
      price_placeholder: "Pris eks. MVA",
      cancel: "Avbryt",
      saving: "Lagrer...",
      create_btn: "Opprett Faktura"
    },
    invoice_pdf: {
      title: "Faktura",
      invoice_number: "Fakturanummer:",
      issue_date: "Fakturadato:",
      due_date: "Forfallsdato:",
      billed_to: "Fakturert til:",
      desc: "Beskrivelse",
      qty: "Antall",
      unit: "Enhet",
      price: "Pris",
      vat_pct: "MVA %",
      sum: "Sum",
      sum_ex_vat: "Sum eks. mva",
      vat_base: "MVA Grunnlag",
      amount_due: "Å Betale",
      payment_info: "Betalingsinformasjon",
      bank_account: "Bankkonto:",
      pending: "Ventes",
      company: "Foretak"
    },
    contacts: {
      loading: "Laster kontakter...",
      title: "Register",
      new_contact: "Ny Kontakt",
      filter_all: "Alle",
      filter_customer: "Kunde",
      filter_vendor: "Leverandør",
      no_contacts: "Ingen kontakter funnet.",
      org: "Org:"
    },
    contact_form: {
      relation_type: "Type Relasjon",
      customer: "Kunde (Customer)",
      vendor: "Leverandør (Vendor)",
      name: "Navn / Selskap *",
      org_number: "OrgNummer",
      email: "E-post",
      credit_days: "Standard Kredittid (Dager)",
      saving: "Lagrer...",
      save_btn: "Lagre Kontakt"
    },
    contact_detail: {
      type: "Type",
      org_number: "Org. Nummer",
      email: "E-post",
      credit_days: "Standard Kredittid",
      days: "Dager",
      edit: "Rediger",
      deleting: "Sletter...",
      confirm_delete: "Bekreft Slett",
      delete: "Slett"
    },
    zreports: {
      title: "Kasseoppgjør (Z)",
      new_report: "Nytt Kasseoppgjør",
      z_report: "Z-Rapport",
      loading: "Laster oppgjørshistorikk...",
      gross_sales: "Omsetning",
      balanced: "I Balanse",
      shortage: "Manko",
      surplus: "Overskudd",
      no_reports: "Ingen Z-Rapporter funnet i systemet."
    },
    zreport_form: {
      info_text: "Eventuelle kassedifferanser vil automatisk bokføres i hovedboken mot konto for Drift.",
      card_sales: "Kortsalg *",
      vipps_sales: "Vipps-salg *",
      expected_cash: "Forventet Kontant *",
      actual_cash: "Opptalt Kontant *",
      gross_sales: "Bruttoomsetning",
      saving: "Bokfører...",
      save_btn: "Bokfør Z-Rapport"
    },
    zreport_detail: {
      tenders: "Betalingsmidler",
      card_sales: "Kortsalg",
      vipps: "Vipps",
      counted_cash: "Opptelt Kontant",
      perfect_balance: "Perfekt Balanse",
      vat_base: "MVA-Grunnlag",
      vat_25: "MVA 25%",
      vat_15: "MVA 15%",
      vat_0: "MVA 0%",
      print_not_implemented: "Kvittering funksjonalitet ikke implementert i demo.",
      view_receipt: "Se Kvittering"
    },
    inventory: {
      loading: "Laster varelager...",
      title: "Varelager",
      new_item: "Ny Vare",
      stock: "Beholdning",
      price: "Pris",
      no_items: "Ingen varer registrert.",
      unit_default: "stk"
    },
    product_form: {
      type: "Varetype *",
      type_physical: "Fysisk Vare",
      type_service: "Tjeneste",
      name: "Varenavn *",
      sku: "Varekode (SKU) *",
      unit: "Enhet *",
      unit_placeholder: "f.eks stk, kg, timer",
      cost_price: "Kostpris (Eks. MVA)",
      sales_price: "Salgspris (Inkl. MVA) *",
      vat_rate: "MVA-Sats *",
      vat_25: "Standard (25%)",
      vat_15: "Mat/Drikke (15%)",
      vat_12: "Person/Kino (12%)",
      vat_0: "Fritatt (0%)",
      supplier: "Leverandør (Valgfri)",
      supplier_none: "-- Ingen valgt --",
      active_stock: "Aktiv Beholdning",
      warning_limit: "Varslingsgrense",
      saving: "Lagrer...",
      save_btn: "Lagre Vare"
    },
    product_detail: {
      service: "Tjeneste",
      physical: "Fysisk",
      active_stock: "Aktiv Beholdning",
      sales_price: "Pris (Inkl. MVA)",
      cost_price: "Kostpris (Eks. MVA)",
      vat_rate: "MVA-sats",
      unit: "Enhet",
      warning_limit: "Varslingsgrense",
      edit: "Rediger",
      deleting: "Sletter...",
      confirm_delete: "Bekreft Slett",
      delete: "Slett"
    }
  },
  en: {
    app: {
      loading: "Loading...",
      search: "Search in min-iWiki..."
    },
    nav: {
      dashboard: "Dashboard",
      ledger: "Ledger",
      invoices: "Invoices",
      contacts: "Contacts",
      pos: "POS Log (Z)",
      inventory: "Inventory",
      settings: "System Settings"
    },
    settings: {
      title: "System Settings",
      loading: "Loading settings...",
      legal: "Legal Information",
      legal_name: "Company Name *",
      legal_org: "Organisation Number *",
      legal_address: "Street Address *",
      legal_zip: "Postcode *",
      legal_city: "City *",
      payment: "Payment Information",
      payment_bank: "Bank Account Number *",
      payment_vipps: "Vipps Number (Optional)",
      payment_iban: "IBAN (Optional)",
      payment_swift: "SWIFT/BIC (Optional)",
      system: "System & Billing",
      system_next_inv: "Next Invoice Number",
      system_next_inv_locked: "System Locked (Invoices exist)",
      system_mva: "VAT Term",
      system_mva_bimo: "Bi-Monthly",
      system_mva_year: "Annually",
      system_credit: "Standard Credit Days",
      system_lang: "Language",
      system_lang_no: "Norsk (Norway)",
      system_lang_en: "English (UK)",
      profile: "Branding",
      profile_logo: "Logo URL",
      profile_note: "Default Invoice Note",
      profile_note_placeholder: "Enter a message displayed on all invoices...",
      theme: "Appearance & Theme",
      theme_light: "Light",
      theme_dark: "Dark",
      save: "Save Settings",
      saving: "Saving..."
    },
    dashboard: {
      loading: "Loading Dashboard...",
      title: "Dashboard",
      new_invoice: "New Invoice",
      new_zreport: "New Z-Report",
      new_contact: "New Contact",
      outstanding_invoices: "Outstanding Invoices",
      active_claims: "active claims",
      financial_overview: "Financial Overview (6 mo)",
      income: "Income",
      expenses: "Expenses"
    },
    ledger: {
      title: "Ledger",
      filter_type: "Type",
      filter_all: "All",
      filter_income: "Income",
      filter_expense: "Expense",
      filter_category: "Category",
      filter_category_all: "All Categories",
      date_from: "Date From",
      date_to: "Date To",
      loading: "Loading ledger...",
      filtering: "Filtering Data...",
      export_saft: "Export SAF-T (XML)",
      sort_by: "Sort by:",
      sort_date_desc: "Date (Newest first)",
      sort_date_asc: "Date (Oldest first)",
      sort_amount_desc: "Amount (Highest first)",
      sort_amount_asc: "Amount (Lowest first)",
      no_description: "No description",
      inc_vat: "inc. VAT",
      no_transactions: "No transactions found for the selected filter"
    },
    ledger_edit: {
      title: "Edit Transaction",
      category: "Category *",
      status: "Status *",
      saving: "Saving...",
      update_btn: "Update Transaction"
    },
    invoices: {
      loading: "Loading invoices...",
      title: "Invoices",
      new_invoice: "New Invoice",
      due: "Due:",
      no_invoices: "No invoices registered."
    },
    invoice_detail: {
      issue_date: "Issue Date",
      due_date: "Due Date",
      line_items: "Line Items",
      subtotal: "Subtotal",
      vat: "VAT",
      total: "Total",
      generating_pdf: "Generating PDF...",
      download_pdf: "Download PDF",
      updating: "Updating...",
      mark_paid: "Mark as Paid"
    },
    invoice_form: {
      title: "New Invoice",
      back: "Back",
      client_details: "Client Details",
      select_client: "Select Client *",
      select_placeholder: "-- Select from registry --",
      no_org: "No Org",
      issue_date: "Issue Date *",
      due_date_auto: "Due Date (Auto) *",
      add_item: "Add",
      line_items: "Line Items",
      desc_placeholder: "Description",
      qty_placeholder: "Quantity",
      price_placeholder: "Price ex. VAT",
      cancel: "Cancel",
      saving: "Saving...",
      create_btn: "Create Invoice"
    },
    invoice_pdf: {
      title: "Invoice",
      invoice_number: "Invoice Number:",
      issue_date: "Issue Date:",
      due_date: "Due Date:",
      billed_to: "Billed To:",
      desc: "Description",
      qty: "Qty",
      unit: "Unit",
      price: "Price",
      vat_pct: "VAT %",
      sum: "Sum",
      sum_ex_vat: "Sum ex. VAT",
      vat_base: "VAT Base",
      amount_due: "Amount Due",
      payment_info: "Payment Information",
      bank_account: "Bank Account:",
      pending: "Pending",
      company: "Company"
    },
    contacts: {
      loading: "Loading contacts...",
      title: "Registry",
      new_contact: "New Contact",
      filter_all: "All",
      filter_customer: "Customer",
      filter_vendor: "Vendor",
      no_contacts: "No contacts found.",
      org: "Org:"
    },
    contact_form: {
      relation_type: "Relation Type",
      customer: "Customer",
      vendor: "Vendor",
      name: "Name / Company *",
      org_number: "Org Number",
      email: "Email",
      credit_days: "Standard Credit (Days)",
      saving: "Saving...",
      save_btn: "Save Contact"
    },
    contact_detail: {
      type: "Type",
      org_number: "Org. Number",
      email: "Email",
      credit_days: "Standard Credit",
      days: "Days",
      edit: "Edit",
      deleting: "Deleting...",
      confirm_delete: "Confirm Delete",
      delete: "Delete"
    },
    zreports: {
      title: "POS Log (Z)",
      new_report: "New Z-Report",
      z_report: "Z-Report",
      loading: "Loading POS history...",
      gross_sales: "Gross Sales",
      balanced: "Balanced",
      shortage: "Shortage",
      surplus: "Surplus",
      no_reports: "No Z-Reports found in the system."
    },
    zreport_form: {
      info_text: "Any cash differences will automatically be posted to the general ledger against the operations account.",
      card_sales: "Card Sales *",
      vipps_sales: "Vipps Sales *",
      expected_cash: "Expected Cash *",
      actual_cash: "Actual Cash *",
      gross_sales: "Gross Sales",
      saving: "Processing...",
      save_btn: "Post Z-Report"
    },
    zreport_detail: {
      tenders: "Tenders",
      card_sales: "Card Sales",
      vipps: "Vipps",
      counted_cash: "Counted Cash",
      perfect_balance: "Perfect Balance",
      vat_base: "VAT Base",
      vat_25: "VAT 25%",
      vat_15: "VAT 15%",
      vat_0: "VAT 0%",
      print_not_implemented: "Receipt functionality not implemented in demo.",
      view_receipt: "View Receipt"
    },
    inventory: {
      loading: "Loading inventory...",
      title: "Inventory",
      new_item: "New Item",
      stock: "Stock",
      price: "Price",
      no_items: "No items registered.",
      unit_default: "pcs"
    },
    product_form: {
      type: "Item Type *",
      type_physical: "Physical Item",
      type_service: "Service",
      name: "Item Name *",
      sku: "SKU *",
      unit: "Unit *",
      unit_placeholder: "e.g. pcs, kg, hours",
      cost_price: "Cost Price (Ex. VAT)",
      sales_price: "Sales Price (Inc. VAT) *",
      vat_rate: "VAT Rate *",
      vat_25: "Standard (25%)",
      vat_15: "Food/Drink (15%)",
      vat_12: "Transport/Cinema (12%)",
      vat_0: "Exempt (0%)",
      supplier: "Supplier (Optional)",
      supplier_none: "-- None Selected --",
      active_stock: "Active Stock",
      warning_limit: "Warning Limit",
      saving: "Saving...",
      save_btn: "Save Item"
    },
    product_detail: {
      service: "Service",
      physical: "Physical",
      active_stock: "Active Stock",
      sales_price: "Price (Inc. VAT)",
      cost_price: "Cost Price (Ex. VAT)",
      vat_rate: "VAT Rate",
      unit: "Unit",
      warning_limit: "Warning Limit",
      edit: "Edit",
      deleting: "Deleting...",
      confirm_delete: "Confirm Delete",
      delete: "Delete"
    }
  }
};

export function useTranslation() {
  const language = useAppStore(state => state.language);
  
  function t(path: string): string {
    const keys = path.split('.');
    let current: any = dictionary[language] || dictionary['en'];
    
    for (const key of keys) {
      if (current[key] === undefined) {
        console.warn(`Translation missing: ${path}`);
        return path;
      }
      current = current[key];
    }
    
    return current as string;
  }
  
  return { t, language };
}
