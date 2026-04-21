import fs from 'fs';
import path from 'path';
import { ShieldCheck } from 'lucide-react';
import MarkdownPage from '@/components/common/markdown-page';

export const metadata = {
  title: 'Privacy Policy | ParlezHub',
  description: 'Learn how we protect and manage your data at ParlezHub.',
};

export default function PrivacyPage() {
  const filePath = path.join(process.cwd(), 'src/content/privacy.md');
  const content = fs.readFileSync(filePath, 'utf8');

  return (
    <MarkdownPage 
      title="Privacy Policy"
      subtitle="Your privacy and data security are our top priorities."
      content={content}
      icon={<ShieldCheck className="h-5 w-5 text-primary-500" />}
    />
  );
}
