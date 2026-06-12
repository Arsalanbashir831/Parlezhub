import { Clock, CreditCard, Lock, Shield } from 'lucide-react';

const TRUST_ITEMS = [
  { icon: Shield, label: 'SSL encrypted payment via Stripe' },
  { icon: Lock, label: 'One-time payment · No subscription' },
  { icon: CreditCard, label: 'All major cards accepted' },
  { icon: Clock, label: 'Lifetime download access' },
] as const;

export function ReportTrustPanel() {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
      <h3 className="mb-3 text-sm font-semibold text-primary-300">Secure Purchase</h3>
      <div className="flex flex-col gap-2.5">
        {TRUST_ITEMS.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <Icon className="h-3.5 w-3.5 shrink-0 text-green-500" />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
