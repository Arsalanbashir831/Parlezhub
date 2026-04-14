'use client';

import { memo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AccountStatusProps {
  accountType: 'TEACHER' | 'STUDENT';
  verificationStatus: 'verified' | 'pending' | 'unverified';
  memberSince: string;
}

const AccountStatus = memo(
  ({ accountType, verificationStatus, memberSince }: AccountStatusProps) => {
    const getVerificationBadge = () => {
      switch (verificationStatus) {
        case 'verified':
          return (
            <Badge className="border border-green-500/20 bg-green-500/10 text-[10px] font-bold uppercase tracking-widest text-green-400">
              Verified
            </Badge>
          );
        case 'pending':
          return (
            <Badge className="border border-yellow-500/20 bg-yellow-500/10 text-[10px] font-bold uppercase tracking-widest text-yellow-500">
              Pending
            </Badge>
          );
        case 'unverified':
          return (
            <Badge className="border border-red-500/20 bg-red-500/10 text-[10px] font-bold uppercase tracking-widest text-red-400">
              Unverified
            </Badge>
          );
        default:
          return (
            <Badge
              variant="secondary"
              className="text-[10px] font-bold uppercase tracking-widest"
            >
              Unknown
            </Badge>
          );
      }
    };

    const formatDate = (dateString: string) => {
      if (!dateString) return 'N/A';

      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';

        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      } catch (error) {
        return 'N/A';
      }
    };

    return (
      <Card className="overflow-hidden rounded-3xl border-white/5 bg-white/[0.03] shadow-2xl backdrop-blur-md transition-all duration-300">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="font-serif text-xl font-bold text-primary-500">
            Account Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-8 pt-4">
          <div className="group flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary-100/60 transition-colors group-hover:text-primary-100">
              Account Type
            </span>
            <Badge
              variant="secondary"
              className="border border-primary-500/20 bg-primary-500/10 text-[10px] font-bold uppercase capitalize tracking-widest text-primary-400"
            >
              {accountType.toLowerCase()}
            </Badge>
          </div>

          <div className="group flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary-100/60 transition-colors group-hover:text-primary-100">
              Verification
            </span>
            {getVerificationBadge()}
          </div>

          <div className="group flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary-100/60 transition-colors group-hover:text-primary-100">
              Member Since
            </span>
            <span className="text-sm font-bold text-primary-100/40 transition-colors group-hover:text-primary-100/60">
              {formatDate(memberSince)}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }
);

AccountStatus.displayName = 'AccountStatus';

export default AccountStatus;
