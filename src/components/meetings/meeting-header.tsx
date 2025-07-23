import React from "react";

type Props = {
	title?: string;
	description?: string;
};

export default function MeetingHeader({
	title = "My Meetings",
	description = "View your upcoming, completed, and cancelled meetings.",
}: Props) {
	return (
		<div className="flex items-center justify-between">
			<div>
				<h1 className="text-2xl font-bold text-gray-900">{title}</h1>
				<p className="text-gray-600">{description}</p>
			</div>
		</div>
	);
}
