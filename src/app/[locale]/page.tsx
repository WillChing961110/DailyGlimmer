import {notFound} from 'next/navigation';import type {Metadata} from 'next';
import {locales,published,type Locale,copy} from '../../lib/content';import {Shell} from '../../components/Site';import {DailyCard} from '../../components/DailyCard';
export const dynamicParams=false;
export function generateStaticParams(){return locales.map(locale=>({locale}))}
export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{const {locale:l}=await params;if(!locales.includes(l as Locale))return {};return {title:`${copy[l as Locale].title} · ${copy[l as Locale].subtitle}`,alternates:{canonical:`/${l}/`,languages:{en:'/en/',zh:'/zh/','zh-TW':'/zh-TW/'}}}}
export default async function Home({params}:{params:Promise<{locale:string}>}){const {locale:l}=await params;if(!locales.includes(l as Locale))notFound();const locale=l as Locale;const list=published();return <Shell locale={locale}><DailyCard entry={list[0]} locale={locale} previous={list[1]} next={undefined}/></Shell>}
