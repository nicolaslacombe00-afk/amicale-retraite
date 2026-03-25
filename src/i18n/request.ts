import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'

export const locales = ['fr'] as const
export const defaultLocale = 'fr'

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale
  const locale = hasLocale(locales, requestedLocale) ? requestedLocale : defaultLocale

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
