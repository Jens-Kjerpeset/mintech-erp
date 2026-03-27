import { z } from "zod";

export const transactionSchema = z.object({
 id: z.string().uuid().optional(), // Optional for creates, required after insert
 amount: z.number().positive(),
 vatRate: z.number().optional(), // 0, 12, 15, 25
 vatAmount: z.number().optional(),
 date: z.string().datetime(), // ISO string
 type: z.enum(["income", "expense"]),
 category: z.string().min(1, "Category is required"),
 description: z.string().optional(),
 receiptUrl: z.string().optional(),
 status: z.enum(["pending", "completed", "cancelled"]).default("completed"),
});

export type Transaction = z.infer<typeof transactionSchema>;

export const invoiceItemSchema = z.object({
 id: z.string().uuid().optional(),
 productId: z.string().uuid().optional(),
 description: z.string().min(1, "Description is required"),
 quantity: z.number().positive().min(1),
 price: z.number().positive(),
 vatRate: z.number().optional().default(25),
});

export type InvoiceItem = z.infer<typeof invoiceItemSchema>;

export const invoiceSchema = z.object({
 id: z.string().uuid().optional(),
 clientName: z.string().min(1, "Client name is required"),
 clientEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
 issueDate: z.string().datetime(),
 dueDate: z.string().datetime(),
 items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
 subtotal: z.number().min(0).default(0),
 taxRate: z.number().min(0).max(100).default(0),
 total: z.number().min(0).default(0),
 status: z.enum(["draft", "sent", "paid", "overdue"]).default("draft"),
 notes: z.string().optional(),
});

export type Invoice = z.infer<typeof invoiceSchema>;

// Contacts CRM (Kunder og Leverandører)
export const contactSchema = z.object({
 id: z.string().uuid().optional(),
 name: z.string().min(1, "Navn/Firmanavn er påkrevd"),
 relationType: z.enum(["Kunde", "Leverandør", "Begge"]),
 orgNumber: z.string().optional(),
 contactPerson: z.string().optional(),
 email: z.string().email("Ugyldig e-post").optional().or(z.literal("")),
 phone: z.string().optional(),
 address: z.string().optional(),
 zipCode: z.string().optional(),
 city: z.string().optional(),
 paymentTermsDays: z.number().int().min(0).default(14),
 currency: z.enum(["NOK", "EUR", "USD"]).default("NOK"),
 vatHandling: z.enum(["Standard", "Fritatt", "Omvendt avgiftsplikt"]).default("Standard"),
 ehfEnabled: z.boolean().default(false),
 defaultAccount: z.string().optional(),
});
export type Contact = z.infer<typeof contactSchema>;

// Products (Varelager)
export const productSchema = z.object({
 id: z.string().uuid().optional(),
 name: z.string().min(1, "Varenavn er påkrevd"),
 sku: z.string().optional(),
 ean: z.string().optional(),
 unit: z.enum(["stk", "kg", "liter", "timer", "pkm"]).default("stk"),
 costPriceExVat: z.number().min(0).default(0),
 salesPriceIncVat: z.number().min(0).default(0),
 vatRate: z.number().min(0).max(100).default(25),
 stockQuantity: z.number().default(0),
 warningLimit: z.number().default(5),
 supplierId: z.string().uuid().optional(),
});
export type Product = z.infer<typeof productSchema>;

// Z-Reports (Kasseoppgjør)
export const zReportSchema = z.object({
 id: z.string().uuid().optional(),
 date: z.string().datetime(),
 cardSales: z.number().min(0).default(0),
 vippsSales: z.number().min(0).default(0),
 cashSales: z.number().min(0).default(0),
 grossSales: z.number().min(0).default(0),
 vat25: z.number().min(0).default(0),
 vat15: z.number().min(0).default(0),
 vat0: z.number().min(0).default(0),
 expectedCash: z.number().min(0).default(0),
 actualCash: z.number().min(0).default(0),
 cashDifference: z.number().default(0),
 receiptUrl: z.string().optional(),
 status: z.enum(["completed", "draft"]).default("completed"),
});
export type ZReport = z.infer<typeof zReportSchema>;

// Settings (Master Configuration)
export const settingsSchema = z.object({
 id: z.string().default("default"), // Singleton
 // 1. Bedriftsopplysninger
 companyName: z.string().min(1, "Selskapsnavn er påkrevd").default("Kotta"),
 orgNumber: z.string().min(1, "Organisasjonsnummer er påkrevd").default("987 654 321 MVA"),
 companyAddress: z.string().default("Bergen"),
 companyZipCode: z.string().default("5003"),
 companyCity: z.string().default("Bergen"),
 bankAccount: z.string().default("1234.56.78901"),
 vippsNumber: z.string().optional(),
 iban: z.string().optional(),
 swift: z.string().optional(),
 
 // 2. Fakturaoppsett
 logoUrl: z.string().optional(),
 defaultCreditDays: z.number().int().min(0).default(14),
 nextInvoiceNumber: z.number().int().min(1).default(10001),
 defaultNote: z.string().default("Takk for handelen!"),
 priceDisplay: z.enum(["ExVat", "IncVat"]).default("ExVat"),

 // 3. Regnskap & Avgiftsinnstillinger
 mvaTerm: z.enum(["Annually", "BiMonthly"]).default("BiMonthly"),
 fiscalYear: z.enum(["Calendar", "Divergent"]).default("Calendar"),

 // 4. Integrasjoner
 psd2Connected: z.boolean().default(false),
 izettleConnected: z.boolean().default(false),
 altinnConnected: z.boolean().default(false),
});
export type Settings = z.infer<typeof settingsSchema>;

