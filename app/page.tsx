import { redirect } from 'next/navigation';
import { routing } from '@/i18n/routing';

export default function Home() {
  const loginPath = routing.localePrefix === 'as-needed'
    ? '/login'
    : `/${routing.defaultLocale}/login`;
  redirect(loginPath);
}