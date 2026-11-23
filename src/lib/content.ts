import raw from '../../content/quotes.json';

export type Locale = 'en' | 'zh' | 'zh-TW';
export type Entry = {
  id: string; publishDate: string; quote: string; theme: string; action: string;
  image: string; imageAlt: string; imageAuthor: string; imageSourceUrl: string;
  imageLicenseUrl: string; imageLicense: string; quoteType: string;
  quoteAuthor?: string; quoteWork?: string; quoteSourceUrl?: string;
  translations?: Record<string, Partial<Pick<Entry, 'quote'|'theme'|'action'|'imageAlt'>>>;
};
export const entries = raw as Entry[];
export const locales: Locale[] = ['en','zh','zh-TW'];
export const copy = {
  en: {today:'Today', archive:'Past notes', save:'Save this note', copy:'Copy quote', action:'A small thing to try', source:'Original source', credit:'Photo by', footer:'Photo credits & licenses', title:'Daily Glimmer', subtitle:'A little light for today', original:'Daily Glimmer',translation:'Translation by Daily Glimmer',open:'Open today’s note',layout:'Layout',palette:'Color palette',photo:'Photo first',quote:'Quote first',full:'Full-bleed image',download:'Download PNG',poster:'Poster settings',posterTitle:'Choose a poster layout',posterHelp:'Pick a layout, then download your poster.',close:'Close editor',languageLabel:'Choose language'},
  zh: {today:'今日', archive:'往期', save:'保存日签', copy:'复制语录', action:'今日小行动', source:'原作出处', credit:'摄影', footer:'图片鸣谢与许可', title:'今日微光', subtitle:'每天一束微光', original:'今日微光原创',translation:'本站译文',open:'查看今日日签',layout:'布局',palette:'配色',photo:'图片优先',quote:'文字优先',full:'满版图片',download:'下载 PNG',poster:'日签设置',posterTitle:'选择日签布局',posterHelp:'选择布局后即可下载日签。',close:'关闭编辑器',languageLabel:'选择语言'},
  'zh-TW': {today:'今日', archive:'過往日簽', save:'儲存日簽', copy:'複製語錄', action:'今日小行動', source:'原文出處', credit:'攝影者', footer:'圖片來源與授權', title:'今日微光', subtitle:'每天一束微光', original:'今日微光原創',translation:'本站譯文',open:'查看今日日簽',layout:'版面配置',palette:'配色',photo:'圖片優先',quote:'文字優先',full:'滿版圖片',download:'下載 PNG',poster:'日簽設定',posterTitle:'選擇日簽版面',posterHelp:'選擇版面後即可下載日簽。',close:'關閉編輯器',languageLabel:'選擇語言'}
} as const;
export function text(entry: Entry, locale: Locale, field: 'quote'|'theme'|'action'|'imageAlt') {
  return entry.translations?.[locale]?.[field] || entry[field];
}
const publicationDateFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function published(date = new Date()) {
  const parts = publicationDateFormatter.formatToParts(date);
  const year = parts.find(part => part.type === 'year')?.value;
  const month = parts.find(part => part.type === 'month')?.value;
  const day = parts.find(part => part.type === 'day')?.value;
  const publicationDate = `${year}-${month}-${day}`;
  return entries
    .filter(entry => entry.publishDate <= publicationDate)
    .sort((a, b) => b.publishDate.localeCompare(a.publishDate));
}
export function route(locale: Locale, date: string) { return `/${locale}/quote/${date}`; }
export const siteUrl=(process.env.NEXT_PUBLIC_SITE_URL||'https://dailyglimmer.pages.dev').replace(/\/$/,'');
