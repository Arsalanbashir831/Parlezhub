import { FileText } from 'lucide-react';

export function ReportPageHeader({ profileLabel }: { profileLabel?: string }) {
  return (
    <header className="space-y-2 text-foreground">
      <p className="obs-label flex items-center gap-2">
        <FileText className="h-4 w-4" /> Analysis documents
      </p>
      <h1 className="obs-title">My Reports</h1>
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Preview, purchase, and download your Vedic astrology report. Generation
        and payment status are shown from your available records.
      </p>
      {profileLabel && (
        <p className="text-sm text-muted-foreground">
          Reports for{' '}
          <span className="font-semibold text-foreground">{profileLabel}</span>
        </p>
      )}
    </header>
  );
}
