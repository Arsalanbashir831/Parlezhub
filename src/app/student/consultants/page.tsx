import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

export default function LegacyConsultantsPage() {
  redirect(ROUTES.AGENT.ASTROLOGY.ASTROLOGERS);
}
