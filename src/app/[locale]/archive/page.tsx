import Link from 'next/link';import {notFound} from 'next/navigation';import type {Metadata} from 'next';import {locales,published,text,type Locale,route,copy} from '../../../lib/content';import {Shell} from '../../../components/Site';
export const dynamicParams=false;export function generateStaticParams(){return locales.map(locale=>({locale}))}
export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{const {locale:l}=await params;if(!locales.includes(l as Locale))return {};return {title:`${copy[l as Locale].archive} · ${copy[l as Locale].title}`,alternates:{canonical:`/${l}/archive/`,languages:{en:'/en/archive/','zh':'/zh/archive/','zh-TW':'/zh-TW/archive/'}}}}
export default async function Archive({params}:{params:Promise<{locale:string}>}) {
  const {locale:requestedLocale}=await params;
  if(!locales.includes(requestedLocale as Locale))notFound();
  const locale=requestedLocale as Locale;
  const list=published();
  const count=locale==='en'?`${list.length} ${list.length===1?'note':'notes'}`:
    `${list.length} ${locale==='zh'?'篇日签':'篇日簽'}`;
  return <Shell locale={locale}>
    <section className="archive">
      <div className="page-title"><h1>{copy[locale].archive}</h1><p>{count}</p></div>
      <div className="archive-grid">
        {list.map(entry=><Link className="entry" key={entry.id} href={route(locale,entry.publishDate)}>
          <div className="entry-photo">
            <img src={entry.image.replace('./','/')} alt={text(entry,locale,'imageAlt')} loading="lazy" decoding="async"/>
          </div>
          <div className="entry-meta">
            <time dateTime={entry.publishDate}>{entry.publishDate}</time>
            <span>{text(entry,locale,'theme')}</span>
          </div>
          <p>{text(entry,locale,'quote')}</p>
        </Link>)}
      </div>
    </section>
  </Shell>;
}
