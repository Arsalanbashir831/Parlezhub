import AstrologyDashboard from '@/components/agents/astrology/astrology-dashboard';

export default async function AstrologyPage({
  searchParams,
}: {
  searchParams: Promise<{ student_id?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const studentId = resolvedSearchParams.student_id;
  const readOnly = !!studentId;

  return <AstrologyDashboard studentId={studentId} readOnly={readOnly} />;
}
