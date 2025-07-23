import React from "react";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";
import { CurrentTime } from "./current-time";

type Props = {
	title?: string;
	subtitle?: string;
	showButton?: boolean;
	buttonText?: string;
	buttonLink?: string;
};

export default function WelcomeSection({
	title = "Welcome back! 👋",
	subtitle = "Ready to continue your language learning journey?",
	showButton = true,
	buttonText = "Start AI Session",
	buttonLink = ROUTES.STUDENT.AI_TUTOR,
}: Props) {
	return (
		<div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-3xl p-8 text-white relative overflow-hidden">
			<div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
			<div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
			<div className="relative z-10">
				<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
					<div className="space-y-2">
						<h1 className="text-3xl lg:text-4xl font-bold">{title}</h1>
						<p className="text-primary-100 text-lg">{subtitle}</p>
					</div>
					<div className="flex flex-col sm:flex-row gap-4">
						{showButton && (
							<Link href={buttonLink}>
								<Button
									size="lg"
									variant="secondary"
									className="bg-white text-primary-600 hover:bg-white/90 font-semibold">
									<Plus className="h-5 w-5 mr-2" />
									{buttonText}
								</Button>
							</Link>
						)}
						<div className="text-right lg:text-left">
							<p className="text-primary-100 text-sm">Current Time</p>
							<CurrentTime />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
