import Link from 'next/link';
import {LanguageSelect} from './LanguageSelect';
import {copy, locales, type Locale} from '../lib/content';
export function Shell({locale,children}:{locale:Locale;children:React.ReactNode}) {
  const c=copy[locale];
  const skip=locale==='en'?'Skip to content':locale==='zh'?'跳到正文':'跳到內文';
  const navigation=locale==='en'?'Main navigation':locale==='zh'?'主导航':'主導覽';
  return <>
    <header className="nav" lang={locale}>
      <div className="wrap nav-inner">
        <Link className="skip-link" href="#content">{skip}</Link>
        <Link className="brand" href={`/${locale}`}><span className="brand-mark"/><span>{c.title}<small>{c.subtitle}</small></span></Link>
        <nav aria-label={navigation}>
          <Link href={`/${locale}`}>{c.today}</Link>
          <Link href={`/${locale}/archive`}>{c.archive}</Link>
          <LanguageSelect locale={locale}/>
        </nav>
      </div>
    </header>
    <main id="content" className="wrap" lang={locale}>{children}</main>
    <footer className="wrap footer" lang={locale}>
      <span>{c.title} © 2026</span>
      <Link href={`/${locale}/credits`}>{c.footer}</Link>
    </footer>
  </>;
}
export function LocaleLinks({date}:{date:string}) { return <span className="locale-links">{locales.map(l=><Link key={l} href={`/${l}/quote/${date}`}>{l}</Link>)}</span>; }
