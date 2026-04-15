type Props = {
  title?: string;
  description?: string;
};

export default function MeetingHeader({
  title = 'My Meetings',
  description = 'View your upcoming, completed, and cancelled meetings.',
}: Props) {
  return (
    <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
      <div>
        <h1 className="font-serif text-4xl font-bold tracking-tight text-white">
          My <span className="text-primary-500">Meetings</span>
        </h1>
        <p className="mt-2 text-primary-100/60 font-medium">
          Manage your schedule, track your progress, and stay connected with your students.
        </p>
      </div>
    </div>
  );
}
