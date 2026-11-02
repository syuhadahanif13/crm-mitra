export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatGrams = (grams: number): string => {
  return `${grams.toLocaleString('id-ID', {
    minimumFractionDigits: grams % 1 !== 0 ? 1 : 0,
    maximumFractionDigits: 2,
  })} gr`;
};

export const formatNumber = (num: number): string => {
  return num.toLocaleString('id-ID');
};
