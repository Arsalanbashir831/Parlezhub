import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

export default async function LegacyChatPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    if (Array.isArray(value)) value.forEach((item) => params.append(key, item));
    else if (value !== undefined) params.set(key, value);
  }
  redirect(
    `${ROUTES.AGENT.ASTROLOGY.HIRE.CHAT}${params.size ? `?${params}` : ''}`
  );
}
