'use client';

import { useEffect, useState } from 'react';
import {
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  XCircle,
} from 'lucide-react';

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
    const variant =
      status === 'PENDING'
        ? 'default'
        : status === 'CONFIRMED'
          ? 'secondary'
          : 'destructive';
    const label = overrideLabel
      ? overrideLabel
      : status === 'PENDING'
        ? 'pending'
        : status === 'CONFIRMED'
          ? 'confirmed'
          : 'cancelled';
    return (
      <Badge
        variant={variant as 'default' | 'secondary' | 'destructive'}
        className="capitalize"
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
    <Card key={meeting.id} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(meeting.status)}
            <CardTitle className="text-lg">
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
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>
              {formatDate(meeting.date)} at {formatTime(meeting.date)}
            </span>
            <span>({meeting.duration} min)</span>
          </div>

          {userRole === 'student' && meeting.teacherName && (
            <p className="text-sm text-gray-600">
              Teacher: {meeting.teacherName}
            </p>
          )}

          {userRole === 'teacher' && meeting.studentName && (
            <p className="text-sm text-gray-600">
              Student: {meeting.studentName}
            </p>
          )}

          {overrideLabel !== 'completed' &&
            ((meeting.status === 'PENDING' && !isFuture(meeting)) ||
              meeting.status === 'CONFIRMED') && (
              <div className="flex flex-wrap gap-2 pt-2">
                {/* Only teachers can approve pending */}
                {userRole === 'teacher' && meeting.status === 'PENDING' && (
                  <Button size="sm" onClick={() => approveBooking(meeting.id)}>
                    Approve
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
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleJoinMeeting(meeting)}
                        // Enable join only during the meeting window with grace
                        disabled={!canJoin(meeting)}
                      >
                        Join Meeting
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openReschedule(meeting.id)}
                      >
                        Reschedule
                      </Button>
                    </div>
                  )}

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => openCancel(meeting.id)}
                  className="ml-auto"
                >
                  Cancel
                </Button>
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );

  const renderPendingContent = () => (
    <div className="mt-6">
      {activeTab === 'pending' && filteredMeetings?.length > 0 ? (
        filteredMeetings?.map((m) => (
          <Card key={m.id} className="mb-4">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(m.status)}
                  <CardTitle className="text-lg">
                    {userRole === 'student'
                      ? `Lesson with ${m.teacherName ?? ''}`
                      : `Lesson with ${m.studentName ?? ''}`}
                  </CardTitle>
                </div>
                {getStatusBadge(m.status, 'pending')}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {formatDate(m.date)} at {formatTime(m.date)}
                  </span>
                </div>
                <div className="flex gap-2 pt-2">
                  {userRole === 'teacher' && (
                    <Button size="sm" onClick={() => approveBooking(m.id)}>
                      Approve
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => openCancel(m.id)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <Clock className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium">No pending meetings</h3>
            <p className="text-gray-600">New requests will appear here.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderUpcomingContent = () => (
    <div className="mt-6">
      {activeTab === 'upcoming' && filteredMeetings?.length > 0 ? (
        filteredMeetings?.map((m) => renderMeetingCard(m, 'upcoming'))
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <Clock className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium">No upcoming meetings</h3>
            <p className="text-gray-600">
              Schedule a meeting to get started with your language learning
              journey.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderPendingPaymentContent = () => (
    <div className="mt-6">
      {activeTab === 'pendingPayment' && filteredMeetings?.length > 0 ? (
        filteredMeetings?.map((m) => renderMeetingCard(m, 'upcoming'))
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <CreditCard className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium">No pending payments</h3>
            <p className="text-gray-600">
              Meetings requiring payment will appear here after teacher
              approval.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderCompletedContent = () => (
    <div className="mt-6">
      {activeTab === 'completed' && filteredMeetings?.length > 0 ? (
        filteredMeetings?.map((m) => renderMeetingCard(m, 'completed'))
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium">No completed meetings</h3>
            <p className="text-gray-600">
              Your completed meetings will appear here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderCancelledContent = () => (
    <div className="mt-6">
      {activeTab === 'cancelled' && filteredMeetings?.length > 0 ? (
        filteredMeetings?.map((m) => renderMeetingCard(m, 'cancelled'))
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <XCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium">No cancelled meetings</h3>
            <p className="text-gray-600">
              Cancelled meetings will appear here.
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
      <div className="mb-6 block md:hidden">
        <Select value={activeTab} onValueChange={handleTabChange}>
          <SelectTrigger className="w-full">
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="pending">
              Pending ({counts.pending})
            </TabsTrigger>
            <TabsTrigger value="pendingPayment">
              Payment ({counts.pendingPayment})
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Upcoming ({counts.upcoming})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({counts.completed})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({counts.cancelled})
            </TabsTrigger>
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
