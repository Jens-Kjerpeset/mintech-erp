export const formatCurrency = (amount: number): string => {
  // Enforces Norwegian locale: 1 234,50 kr
  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateInput: string | Date): string => {
  // Enforces strict DD.MM.YYYY
  const date = new Date(dateInput);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

export const parseNumberInput = (inputValue: string): number => {
  // Replaces commas with dots for JS number parsing
  if (!inputValue) return 0;
  return parseFloat(inputValue.replace(/\s/g, '').replace(',', '.'));
};
