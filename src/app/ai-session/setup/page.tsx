"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AiSessionHeader from "@/components/ai-session/ai-session-header";
import { SessionProvider, useSession } from "@/contexts/session-context";
import { ROUTES } from "@/constants/routes";
import { SETUP_STEPS } from "@/constants/ai-session";
import { saveSessionConfig } from "@/lib/ai-session-utils";
import {
	LanguageSelection,
	TutorSettings,
	SessionDetails,
	SessionSummary,
	SetupStepper,
} from "@/components/ai-session/setup";

function SessionSetupContent() {
	const router = useRouter();
	const { config } = useSession();
	const [currentStep, setCurrentStep] = useState(0);

	const handleNext = () => {
		if (currentStep < SETUP_STEPS.length - 1) {
			setCurrentStep(currentStep + 1);
		}
	};

	const handlePrevious = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
		}
	};

	const handleStartSession = () => {
		saveSessionConfig(config);
		router.push(ROUTES.AI_SESSION.START);
	};

	const renderStepContent = () => {
		switch (currentStep) {
			case 0:
				return <LanguageSelection />;
			case 1:
				return <TutorSettings />;
			case 2:
				return <SessionDetails />;
			case 3:
				return <SessionSummary />;
			default:
				return null;
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center">
			<AiSessionHeader>
				<div className="flex justify-center">
					<div className="text-center">
						<h1 className="text-xl font-bold text-gray-900 dark:text-white">
							{SETUP_STEPS[currentStep].title}
						</h1>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							Step {currentStep + 1} of {SETUP_STEPS.length}
						</p>
					</div>
				</div>
			</AiSessionHeader>

			<div className="w-full max-w-4xl p-6">
				<SetupStepper currentStep={currentStep} />

				{/* Content */}
				<Card className="dark:bg-gray-800 dark:border-gray-700 mb-8">
					<CardContent className="p-8">{renderStepContent()}</CardContent>
				</Card>

				{/* Navigation */}
				<div className="flex justify-between">
					<Button
						variant="outline"
						onClick={handlePrevious}
						disabled={currentStep === 0}
						className="flex items-center gap-2">
						<ChevronLeft className="h-4 w-4" />
						Previous
					</Button>

					{currentStep === SETUP_STEPS.length - 1 ? (
						<Button
							onClick={handleStartSession}
							size="lg"
							className="flex items-center gap-2">
							<Play className="h-4 w-4" />
							Start Session
						</Button>
					) : (
						<Button onClick={handleNext} className="flex items-center gap-2">
							Next
							<ChevronRight className="h-4 w-4" />
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}

export default function SessionSetupPage() {
	return (
		<SessionProvider>
			<SessionSetupContent />
		</SessionProvider>
	);
}
