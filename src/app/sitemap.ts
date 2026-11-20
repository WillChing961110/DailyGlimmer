import type {MetadataRoute} from 'next';import {locales,published,route,siteUrl} from '../lib/content';
export const dynamic='force-static';
export default function sitemap():MetadataRoute.Sitemap{return published().flatMap(e=>locales.map(locale=>({url:`${siteUrl}${route(locale,e.publishDate)}/`,lastModified:new Date(`${e.publishDate}T00:00:00Z`),alternates:{languages:Object.fromEntries(locales.map(l=>[l,`${siteUrl}${route(l,e.publishDate)}/`]))}})))}
