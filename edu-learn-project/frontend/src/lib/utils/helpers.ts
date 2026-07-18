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

export function getBankId(bankName: string): string {
  if (!bankName) return '970422'; // Default to MB BIN
  const name = bankName.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (name.includes('mbbank') || name.includes('mb') || name.includes('quandoi') || name.includes('military')) return '970422'; // MB
  if (name.includes('vietcombank') || name.includes('vcb') || name.includes('vietcom')) return '970436'; // VCB
  if (name.includes('techcombank') || name.includes('tcb') || name.includes('techcom')) return '970407'; // TCB
  if (name.includes('bidv') || name.includes('bid')) return '970418'; // BIDV
  if (name.includes('vietinbank') || name.includes('ctg') || name.includes('vietin') || name.includes('congthuong') || name.includes('icb')) return '970415'; // CTG/ICB
  if (name.includes('acb') || name.includes('achau')) return '970416'; // ACB
  if (name.includes('vpbank') || name.includes('vpb') || name.includes('vp')) return '970432'; // VPB
  if (name.includes('sacombank') || name.includes('stb') || name.includes('sacom')) return '970403'; // STB
  if (name.includes('tpbank') || name.includes('tpb') || name.includes('tp')) return '970423'; // TPB
  if (name.includes('agribank') || name.includes('vba') || name.includes('nongnghiep') || name.includes('agri') || name.includes('varb')) return '970405'; // VBA/VARB
  if (name.includes('vib')) return '970441';
  if (name.includes('shb')) return '970443';
  if (name.includes('ocb') || name.includes('phuongdong')) return '970448';
  if (name.includes('msb') || name.includes('hanghai') || name.includes('maritime')) return '970426';
  if (name.includes('hdbank') || name.includes('hdb')) return '970437';
  if (name.includes('scb') || name.includes('saigon')) return '970429';
  if (name.includes('lpbank') || name.includes('lpb') || name.includes('lienviet') || name.includes('buudien')) return '970449';
  if (name.includes('seabank') || name.includes('seab')) return '970440';
  if (name.includes('bacabank') || name.includes('bab')) return '970409';
  if (name.includes('pvcombank') || name.includes('pvc')) return '970412';
  if (name.includes('shinhan')) return '970424';
  if (name.includes('woori')) return '970457';
  
  const cleaned = bankName.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return cleaned || '970422';
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
