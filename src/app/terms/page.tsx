import fs from 'fs';
import path from 'path';
import MarkdownPage from '@/components/common/markdown-page';

export const metadata = {
  title: 'Terms and Conditions | ParlezHub',
  description: 'Rules and regulations for using the ParlezHub platform.',
};

export default function TermsPage() {
  const filePath = path.join(process.cwd(), 'src/content/terms.md');
  const content = fs.readFileSync(filePath, 'utf8');

  return (
    <MarkdownPage 
      title="Terms & Conditions"
      subtitle="Please read these terms carefully before using our platform."
      content={content}
    />
  );
}
