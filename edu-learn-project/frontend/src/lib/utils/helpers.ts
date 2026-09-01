export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function calcDiscount(original: number, sale: number): number {
  return Math.round(((original - sale) / original) * 100);
}

export function truncateText(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + '...';
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

const BANK_KEYWORDS: Array<{ keywords: string[]; bin: string }> = [
  { keywords: ['mbbank', 'mb', 'quandoi', 'military'], bin: '970422' },
  { keywords: ['vietcombank', 'vcb', 'vietcom'], bin: '970436' },
  { keywords: ['techcombank', 'tcb', 'techcom'], bin: '970407' },
  { keywords: ['bidv', 'bid'], bin: '970418' },
  { keywords: ['vietinbank', 'ctg', 'vietin', 'congthuong', 'icb'], bin: '970415' },
  { keywords: ['acb', 'achau'], bin: '970416' },
  { keywords: ['vpbank', 'vpb', 'vp'], bin: '970432' },
  { keywords: ['sacombank', 'stb', 'sacom'], bin: '970403' },
  { keywords: ['tpbank', 'tpb', 'tp'], bin: '970423' },
  { keywords: ['agribank', 'vba', 'nongnghiep', 'agri', 'varb'], bin: '970405' },
  { keywords: ['vib'], bin: '970441' },
  { keywords: ['shb'], bin: '970443' },
  { keywords: ['ocb', 'phuongdong'], bin: '970448' },
  { keywords: ['msb', 'hanghai', 'maritime'], bin: '970426' },
  { keywords: ['hdbank', 'hdb'], bin: '970437' },
  { keywords: ['scb', 'saigon'], bin: '970429' },
  { keywords: ['lpbank', 'lpb', 'lienviet', 'buudien'], bin: '970449' },
  { keywords: ['seabank', 'seab'], bin: '970440' },
  { keywords: ['bacabank', 'bab'], bin: '970409' },
  { keywords: ['pvcombank', 'pvc'], bin: '970412' },
  { keywords: ['shinhan'], bin: '970424' },
  { keywords: ['woori'], bin: '970457' }
];

export function getBankId(bankName: string): string {
  if (!bankName) return '970422';
  const name = bankName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const matched = BANK_KEYWORDS.find(b => b.keywords.some(k => name.includes(k)));
  if (matched) return matched.bin;
  return bankName.toUpperCase().replace(/[^A-Z0-9]/g, '') || '970422';
}

const vietnameseToTelexMap: Record<string, string> = {
  'á': 'as', 'à': 'af', 'ả': 'ar', 'ã': 'ax', 'ạ': 'aj',
  'â': 'aa', 'ấ': 'aas', 'ầ': 'aaf', 'ẩ': 'aar', 'ẫ': 'aax', 'ậ': 'aaj',
  'ă': 'aw', 'ắ': 'aws', 'ằ': 'awf', 'ẳ': 'awr', 'ẵ': 'awx', 'ặ': 'awj',
  'ó': 'os', 'ò': 'of', 'ỏ': 'or', 'õ': 'ox', 'ọ': 'oj',
  'ô': 'oo', 'ố': 'oos', 'ồ': 'oof', 'ổ': 'oor', 'ỗ': 'oox', 'ộ': 'ooj',
  'ơ': 'ow', 'ớ': 'ows', 'ờ': 'owf', 'ở': 'owr', 'ỡ': 'owx', 'ợ': 'owj',
  'é': 'es', 'è': 'ef', 'ẻ': 'er', 'ẽ': 'ex', 'ẹ': 'ej',
  'ê': 'ee', 'ế': 'ees', 'ề': 'eef', 'ể': 'eer', 'ễ': 'eex', 'ệ': 'eej',
  'í': 'is', 'ì': 'if', 'ỉ': 'ir', 'ĩ': 'ix', 'ị': 'ij',
  'ú': 'us', 'ù': 'uf', 'ủ': 'ur', 'ũ': 'ux', 'ụ': 'uj',
  'ư': 'uw', 'ứ': 'uws', 'ừ': 'uwf', 'ử': 'uwr', 'ữ': 'uwx', 'ự': 'uwj',
  'ý': 'ys', 'ỳ': 'yf', 'ỷ': 'yr', 'ỹ': 'yx', 'ỵ': 'yj',
  'đ': 'dd',
  'Á': 'As', 'À': 'Af', 'Ả': 'Ar', 'Ã': 'Ax', 'Ạ': 'Aj',
  'Â': 'Aa', 'Ấ': 'Aas', 'Ầ': 'Aaf', 'Ẩ': 'Aar', 'Ẫ': 'Aax', 'Ậ': 'Aaj',
  'Ă': 'Aw', 'Ắ': 'Aws', 'Ằ': 'Awf', 'Ẳ': 'Awr', 'Ẵ': 'Awx', 'Ặ': 'Awj',
  'Ó': 'Os', 'Ò': 'Of', 'Ỏ': 'Or', 'Õ': 'Ox', 'Ọ': 'Oj',
  'Ô': 'Oo', 'Ố': 'Oos', 'Ồ': 'Oof', 'Ổ': 'Oor', 'Ỗ': 'Oox', 'Ộ': 'Ooj',
  'Ơ': 'Ow', 'Ớ': 'Ows', 'Ờ': 'Owf', 'Ở': 'Owr', 'Ỡ': 'Owx', 'Ợ': 'Owj',
  'É': 'Es', 'È': 'Ef', 'Ẻ': 'Er', 'Ẽ': 'Ex', 'Ẹ': 'Ej',
  'Ê': 'Ee', 'Ế': 'Ees', 'Ề': 'Eef', 'Ể': 'Eer', 'Ễ': 'Eex', 'Ệ': 'Eej',
  'Í': 'Is', 'Ì': 'If', 'Ỉ': 'Ir', 'Ĩ': 'Ix', 'Ị': 'Ij',
  'Ú': 'Us', 'Ù': 'Uf', 'Ủ': 'Ur', 'Ũ': 'Ux', 'Ụ': 'Uj',
  'Ư': 'Uw', 'Ứ': 'Uws', 'Ừ': 'Uwf', 'Ử': 'Uwr', 'Ữ': 'Uwx', 'Ự': 'Uwj',
  'Ý': 'Ys', 'Ỳ': 'Yf', 'Ỷ': 'Yr', 'Ỹ': 'Yx', 'Ỵ': 'Yj',
  'Đ': 'Dd'
};

export function cleanPassword(val: string): string {
  if (!val) return '';
  return val.split('').map(char => vietnameseToTelexMap[char] || char).join('');
}
