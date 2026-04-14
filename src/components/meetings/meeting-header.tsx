type Props = {
  title?: string;
  description?: string;
};

export default function MeetingHeader({
  title = 'My Meetings',
  description = 'View your upcoming, completed, and cancelled meetings.',
}: Props) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-primary-500">{title}</h1>
        <p className="mt-2 text-primary-100/60">{description}</p>
      </div>
    </div>
  );
}
