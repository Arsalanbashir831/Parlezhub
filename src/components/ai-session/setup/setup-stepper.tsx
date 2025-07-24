"use client";

import { Check } from "lucide-react";
import { SETUP_STEPS } from "@/constants/ai-session";

interface SetupStepperProps {
	currentStep: number;
}

export default function SetupStepper({ currentStep }: SetupStepperProps) {
	return (
		<div className="flex items-center justify-center mb-8">
			{SETUP_STEPS.map((step, index) => (
				<div key={index} className="flex items-center">
					<div
						className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
							index <= currentStep
								? "bg-primary-500 border-primary-500 text-white"
								: "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400"
						}`}>
						{index < currentStep ? (
							<Check className="h-5 w-5" />
						) : (
							<step.icon className="h-5 w-5" />
						)}
					</div>
					{index < SETUP_STEPS.length - 1 && (
						<div
							className={`w-12 sm:w-20 h-0.5 mx-2 ${
								index < currentStep
									? "bg-primary-500"
									: "bg-gray-300 dark:bg-gray-600"
							}`}
						/>
					)}
				</div>
			))}
		</div>
	);
}
