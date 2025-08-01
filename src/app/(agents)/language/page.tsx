import { fetchAccessToken } from 'hume';

import { LanguageClientWrapper } from '@/components/agents/language/language-client-wrapper';

export default async function LanguageAgentPage() {
  // Fetch Hume access token server-side
  let accessToken: string | null = null;

  try {
    if (process.env.HUME_API_KEY && process.env.HUME_SECRET_KEY) {
      accessToken = await fetchAccessToken({
        apiKey: process.env.HUME_API_KEY,
        secretKey: process.env.HUME_SECRET_KEY,
      });
    }
  } catch (error) {
    console.error('Failed to fetch Hume access token:', error);
  }

  return <LanguageClientWrapper accessToken={accessToken} />;
}
