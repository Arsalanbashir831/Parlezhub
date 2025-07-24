"use client";

import { Check } from "lucide-react";
import { SETUP_STEPS } from "@/constants/ai-session";

interface SetupStepperProps {
	currentStep: number;
}

export default function SetupStepper({ currentStep }: SetupStepperProps) {
	return (
		<div className="flex items-center justify-center mb-6 sm:mb-8 px-4 sm:px-0">
			{SETUP_STEPS.map((step, index) => (
				<div key={index} className="flex items-center">
					<div
						className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full border-2 transition-all duration-200 ${
							index <= currentStep
								? "bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/30"
								: "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400"
						}`}>
						{index < currentStep ? (
							<Check className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
						) : (
							<step.icon className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
						)}
					</div>
					{index < SETUP_STEPS.length - 1 && (
						<div
							className={`w-6 sm:w-12 md:w-16 lg:w-20 h-0.5 mx-1 sm:mx-2 transition-all duration-300 ${
								index < currentStep
									? "bg-primary-500 shadow-sm shadow-primary-500/20"
									: "bg-gray-300 dark:bg-gray-600"
							}`}
						/>
					)}
				</div>
			))}
		</div>
	);
}
