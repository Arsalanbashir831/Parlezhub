import AstrologyDashboard from '@/components/agents/astrology/astrology-dashboard';

export default function AstrologyPage({
  searchParams,
}: {
  searchParams: { student_id?: string };
}) {
  const studentId = searchParams.student_id;
  const readOnly = !!studentId;

  return <AstrologyDashboard studentId={studentId} readOnly={readOnly} />;
}
