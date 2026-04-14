'use client';

import { useEffect, useState } from 'react';
import {
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  XCircle,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Meeting, MeetingStatus, useMeetings } from '@/hooks/useMeetings';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CancelMeetingDialog from '@/components/meetings/cancel-meeting-dialog';
import MeetingPaymentButton from '@/components/meetings/meeting-payment-button';
import RescheduleDialog from '@/components/meetings/reschedule-meeting-dialog';

export default function MeetingTabs() {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleTargetId, setRescheduleTargetId] = useState<string | null>(
    null
  );
  const [isRescheduling, setIsRescheduling] = useState(false);
  const {
    meetings,
    filteredMeetings,
    handleJoinMeeting,
    cancelBooking,
    rescheduleBooking,
    counts,
    activeTab,
    setActiveTab,
    approveBooking,
    userRole,
  } = useMeetings();

  const openCancel = (id: string) => {
    setCancelTargetId(id);
    setCancelOpen(true);
  };

  const confirmCancel = async (reason: string, shouldRefund: boolean) => {
    if (!cancelTargetId) return;
    setIsCancelling(true);
    try {
      // Find the meeting being cancelled
      const meetingToCancel = filteredMeetings.find(
        (m) => m.id === cancelTargetId
      );
      await cancelBooking(
        cancelTargetId,
        reason,
        shouldRefund,
        meetingToCancel
      );
      setCancelOpen(false);
      setCancelTargetId(null);
    } finally {
      setIsCancelling(false);
    }
  };

  const openReschedule = (id: string) => {
    setRescheduleTargetId(id);
    setRescheduleOpen(true);
  };

  const confirmReschedule = async (
    startTime: string,
    endTime: string,
    reason: string
  ) => {
    if (!rescheduleTargetId) return;
    setIsRescheduling(true);
    try {
      await rescheduleBooking(rescheduleTargetId, {
        start_time: startTime,
        end_time: endTime,
        reason,
      });
      setRescheduleOpen(false);
      setRescheduleTargetId(null);
    } finally {
      setIsRescheduling(false);
    }
  };

  // Use role from hook instead of heuristic
  const handleTabChange = (value: string) => {
    setActiveTab(
      value as
        | 'pending'
        | 'pendingPayment'
        | 'upcoming'
        | 'completed'
        | 'cancelled'
    );
  };

  // Keep a ticking "now" so time-based UI updates without user interaction
  const [nowMs, setNowMs] = useState<number>(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 5_000);
    return () => clearInterval(id);
  }, []);

  // Time helpers to avoid subtle Date comparison issues and to respect end time
  const getStartMs = (m: Meeting) => new Date(m.date).getTime();
  const getEndMs = (m: Meeting) =>
    m.endDate
      ? new Date(m.endDate).getTime()
      : new Date(m.date).getTime() + m.duration * 60_000;
  const isFuture = (m: Meeting) => {
    return getStartMs(m) > nowMs;
  };

  // Allow joining slightly before and after the window
  const JOIN_EARLY_MS = 5 * 60_000; // allow joining up to 5 minutes early
  const JOIN_LATE_MS = 5 * 60_000; // allow joining up to 15 minutes after end
  const canJoin = (m: Meeting) => {
    const start = getStartMs(m) - JOIN_EARLY_MS;
    const end = getEndMs(m) + JOIN_LATE_MS;
    const allowed = nowMs >= start && nowMs <= end;
    return allowed;
  };

  const getStatusIcon = (status: MeetingStatus) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'CONFIRMED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (
    status: MeetingStatus,
    overrideLabel?: 'pending' | 'upcoming' | 'completed' | 'cancelled'
  ) => {
    const label = overrideLabel
      ? overrideLabel
      : status === 'PENDING'
        ? 'pending'
        : status === 'CONFIRMED'
          ? 'confirmed'
          : 'cancelled';

    return (
      <Badge
        variant="outline"
        className={cn(
          'border px-3 py-0.5 text-[10px] font-bold capitalize tracking-widest transition-all duration-300',
          status === 'PENDING'
            ? 'border-primary-500/30 bg-primary-500/5 text-primary-400'
            : status === 'CONFIRMED'
              ? 'border-green-500/30 bg-green-500/5 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.1)]'
              : 'border-red-500/30 bg-red-500/5 text-red-400'
        )}
      >
        {label}
      </Badge>
    );
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

  const renderMeetingCard = (
    meeting: Meeting,
    overrideLabel?: 'pending' | 'upcoming' | 'completed' | 'cancelled'
  ) => (
    <Card
      key={meeting.id}
      className="group relative mb-6 overflow-hidden rounded-2xl border-primary-500/10 bg-white/[0.03] shadow-2xl backdrop-blur-md transition-all duration-300 hover:bg-white/[0.05]"
    >
      <div className="absolute bottom-0 left-0 top-0 w-1 bg-primary-500/50 shadow-[0_0_10px_rgba(212,175,55,0.2)] transition-colors group-hover:bg-primary-500" />
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary-500/20 bg-primary-500/10 text-primary-500">
              {getStatusIcon(meeting.status)}
            </div>
            <CardTitle className="font-serif text-xl font-bold tracking-tight text-white">
              {meeting.subject ||
                (userRole === 'student'
                  ? `Lesson with ${meeting.teacherName ?? ''}`
                  : `Lesson with ${meeting.studentName ?? ''}`)}
            </CardTitle>
          </div>
          {getStatusBadge(meeting.status, overrideLabel)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 text-sm font-medium text-primary-100/60">
              <Calendar className="h-4 w-4 text-primary-500" />
              <span>
                {formatDate(meeting.date)} at {formatTime(meeting.date)}
              </span>
              <span className="ml-1 text-primary-500/40">
                ({meeting.duration} min)
              </span>
            </div>

            {userRole === 'student' && meeting.teacherName && (
              <div className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 text-sm font-medium text-primary-100/60">
                <Badge
                  variant="outline"
                  className="border-primary-500/20 bg-primary-500/5 text-[9px] uppercase tracking-widest text-primary-400"
                >
                  Teacher
                </Badge>
                {meeting.teacherName}
              </div>
            )}

            {userRole === 'teacher' && meeting.studentName && (
              <div className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 text-sm font-medium text-primary-100/60">
                <Badge
                  variant="outline"
                  className="border-primary-500/20 bg-primary-500/5 text-[9px] uppercase tracking-widest text-primary-400"
                >
                  Student
                </Badge>
                {meeting.studentName}
              </div>
            )}
          </div>

          {overrideLabel !== 'completed' &&
            ((meeting.status === 'PENDING' && !isFuture(meeting)) ||
              meeting.status === 'CONFIRMED') && (
              <div className="mt-2 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.05] pt-4">
                <div className="flex flex-wrap gap-2">
                  {/* Only teachers can approve pending */}
                  {userRole === 'teacher' && meeting.status === 'PENDING' && (
                    <Button
                      size="sm"
                      onClick={() => approveBooking(meeting.id)}
                      className="h-10 rounded-xl bg-primary-500 px-6 font-bold text-primary-950 shadow-lg shadow-primary-500/20 transition-all hover:bg-primary-600 active:scale-95"
                    >
                      Approve Session
                    </Button>
                  )}
                  {/* Payment button for students with unpaid confirmed meetings */}
                  {userRole === 'student' &&
                    meeting.status === 'CONFIRMED' &&
                    meeting.paymentStatus === 'UNPAID' && (
                      <MeetingPaymentButton meeting={meeting} />
                    )}
                  {/* Join button visible only for confirmed and paid */}
                  {meeting.status === 'CONFIRMED' &&
                    meeting.paymentStatus === 'PAID' && (
                      <div className="flex flex-wrap gap-3">
                        <Button
                          size="sm"
                          onClick={() => handleJoinMeeting(meeting)}
                          disabled={!canJoin(meeting)}
                          className="h-10 rounded-xl bg-primary-500 px-8 font-bold text-primary-950 shadow-lg shadow-primary-500/20 transition-shadow hover:bg-primary-600 active:scale-95 disabled:bg-primary-500/10 disabled:text-primary-500/30"
                        >
                          Join Call
                        </Button>

                        {userRole === 'student' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openReschedule(meeting.id)}
                            className="h-10 rounded-xl border-primary-500/20 px-6 text-[10px] font-bold uppercase tracking-widest text-primary-400 hover:bg-primary-500/10"
                          >
                            Reschedule
                          </Button>
                        )}
                      </div>
                    )}
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => openCancel(meeting.id)}
                  className="ml-auto h-10 rounded-xl px-4 text-[10px] font-bold uppercase tracking-widest text-red-400 hover:bg-red-500/10 hover:text-red-300"
                >
                  Cancel Call
                </Button>
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );

  const renderPendingContent = () => (
    <div className="mt-8">
      {activeTab === 'pending' && filteredMeetings?.length > 0 ? (
        filteredMeetings?.map((m) => renderMeetingCard(m, 'pending'))
      ) : (
        <Card className="overflow-hidden rounded-3xl border-white/5 bg-white/[0.02] backdrop-blur-sm">
          <CardContent className="py-16 text-center">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary-500/10 shadow-lg shadow-primary-500/5">
              <Clock className="h-10 w-10 text-primary-500" />
            </div>
            <h3 className="mb-2 font-serif text-2xl font-bold text-primary-300">
              No pending meetings
            </h3>
            <p className="text-sm tracking-wide text-primary-100/40">
              New requests will appear in this cycle.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderUpcomingContent = () => (
    <div className="mt-8">
      {activeTab === 'upcoming' && filteredMeetings?.length > 0 ? (
        filteredMeetings?.map((m) => renderMeetingCard(m, 'upcoming'))
      ) : (
        <Card className="overflow-hidden rounded-3xl border-white/5 bg-white/[0.02] backdrop-blur-sm">
          <CardContent className="py-16 text-center">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary-500/10 shadow-lg shadow-primary-500/5">
              <Clock className="h-10 w-10 text-primary-500" />
            </div>
            <h3 className="mb-2 font-serif text-2xl font-bold text-primary-300">
              No upcoming meetings
            </h3>
            <p className="mx-auto max-w-sm text-sm tracking-wide text-primary-100/40">
              Schedule a session to continue your language learning journey.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderPendingPaymentContent = () => (
    <div className="mt-8">
      {activeTab === 'pendingPayment' && filteredMeetings?.length > 0 ? (
        filteredMeetings?.map((m) => renderMeetingCard(m, 'upcoming'))
      ) : (
        <Card className="overflow-hidden rounded-3xl border-white/5 bg-white/[0.02] backdrop-blur-sm">
          <CardContent className="py-16 text-center">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary-500/10 shadow-lg shadow-primary-500/5">
              <CreditCard className="h-10 w-10 text-primary-500" />
            </div>
            <h3 className="mb-2 font-serif text-2xl font-bold text-primary-300">
              No pending payments
            </h3>
            <p className="mx-auto max-w-sm text-sm tracking-wide text-primary-100/40">
              Sessions requiring payment will appear here after teacher
              approval.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderCompletedContent = () => (
    <div className="mt-8">
      {activeTab === 'completed' && filteredMeetings?.length > 0 ? (
        filteredMeetings?.map((m) => renderMeetingCard(m, 'completed'))
      ) : (
        <Card className="overflow-hidden rounded-3xl border-white/5 bg-white/[0.02] backdrop-blur-sm">
          <CardContent className="py-16 text-center">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary-500/10 shadow-lg shadow-primary-500/5">
              <CheckCircle className="h-10 w-10 text-primary-500" />
            </div>
            <h3 className="mb-2 font-serif text-2xl font-bold text-primary-300">
              No completed sessions
            </h3>
            <p className="text-sm tracking-wide text-primary-100/40">
              Your previous learning archives will appear here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderCancelledContent = () => (
    <div className="mt-8">
      {activeTab === 'cancelled' && filteredMeetings?.length > 0 ? (
        filteredMeetings?.map((m) => renderMeetingCard(m, 'cancelled'))
      ) : (
        <Card className="overflow-hidden rounded-3xl border-white/5 bg-white/[0.02] backdrop-blur-sm">
          <CardContent className="py-16 text-center">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary-500/10 shadow-lg shadow-primary-500/5">
              <XCircle className="h-10 w-10 text-primary-500" />
            </div>
            <h3 className="mb-2 font-serif text-2xl font-bold text-primary-300">
              No cancelled calls
            </h3>
            <p className="text-sm tracking-wide text-primary-100/40">
              Any sessions that were cancelled will be archived here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'pending':
        return renderPendingContent();
      case 'pendingPayment':
        return renderPendingPaymentContent();
      case 'upcoming':
        return renderUpcomingContent();
      case 'completed':
        return renderCompletedContent();
      case 'cancelled':
        return renderCancelledContent();
      default:
        return renderUpcomingContent();
    }
  };

  return (
    <>
      {/* Mobile Dropdown */}
      <div className="mb-8 block md:hidden">
        <Select value={activeTab} onValueChange={handleTabChange}>
          <SelectTrigger className="h-12 w-full rounded-xl border-white/10 bg-white/[0.03] font-bold text-primary-100 focus:ring-primary-500/30">
            <SelectValue>
              {activeTab === 'pending' && `Pending (${counts.pending})`}
              {activeTab === 'pendingPayment' &&
                `Payment (${counts.pendingPayment})`}
              {activeTab === 'upcoming' && `Upcoming (${counts.upcoming})`}
              {activeTab === 'completed' && `Completed (${counts.completed})`}
              {activeTab === 'cancelled' && `Cancelled (${counts.cancelled})`}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending ({counts.pending})</SelectItem>
            <SelectItem value="pendingPayment">
              Payment ({counts.pendingPayment})
            </SelectItem>
            <SelectItem value="upcoming">
              Upcoming ({counts.upcoming})
            </SelectItem>
            <SelectItem value="completed">
              Completed ({counts.completed})
            </SelectItem>
            <SelectItem value="cancelled">
              Cancelled ({counts.cancelled})
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Mobile Content */}
      <div className="block md:hidden">{renderContent()}</div>

      {/* Desktop Tabs */}
      <div className="hidden md:block">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-8 grid h-14 w-full grid-cols-5 rounded-2xl border border-white/[0.05] bg-white/[0.03] p-1">
            {[
              { id: 'pending', label: 'Pending', count: counts.pending },
              {
                id: 'pendingPayment',
                label: 'Payment',
                count: counts.pendingPayment,
              },
              { id: 'upcoming', label: 'Upcoming', count: counts.upcoming },
              { id: 'completed', label: 'Completed', count: counts.completed },
              { id: 'cancelled', label: 'Cancelled', count: counts.cancelled },
            ].map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  'h-full rounded-xl text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-300',
                  'data-[state=active]:bg-primary-500 data-[state=active]:text-primary-950 data-[state=active]:shadow-lg data-[state=active]:shadow-primary-500/20',
                  'text-primary-100/40 hover:text-primary-100'
                )}
              >
                {tab.label}{' '}
                <span className="ml-1 opacity-50">({tab.count})</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="pending">{renderPendingContent()}</TabsContent>

          <TabsContent value="pendingPayment">
            {renderPendingPaymentContent()}
          </TabsContent>

          <TabsContent value="upcoming">{renderUpcomingContent()}</TabsContent>

          <TabsContent value="completed">
            {renderCompletedContent()}
          </TabsContent>

          <TabsContent value="cancelled">
            {renderCancelledContent()}
          </TabsContent>
        </Tabs>
      </div>

      <CancelMeetingDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onConfirm={confirmCancel}
        isSubmitting={isCancelling}
        meeting={filteredMeetings.find((m) => m.id === cancelTargetId)}
        activeTab={activeTab}
      />

      <RescheduleDialog
        open={rescheduleOpen}
        onOpenChange={setRescheduleOpen}
        onConfirm={confirmReschedule}
        isSubmitting={isRescheduling}
        meetingTitle={
          rescheduleTargetId
            ? meetings.find((m) => m.id === rescheduleTargetId)?.subject ||
              'Meeting'
            : 'Meeting'
        }
      />
    </>
  );
}
