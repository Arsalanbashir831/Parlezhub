"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ServiceForm } from "@/components/services";
import { useServices } from "@/hooks/useServices";
import { ServiceFormData, ServiceType } from "@/types/service";
import { ROUTES } from "@/constants/routes";

export default function CreateServicePage() {
	const router = useRouter();
	const { createNewService, canCreateType, isLoading } = useServices();

	const getAvailableServiceTypes = (): ServiceType[] => {
		const allTypes: ServiceType[] = ["consultancy", "chirologist"];
		return allTypes.filter(type => canCreateType(type));
	};

	const availableTypes = getAvailableServiceTypes();

	const handleSubmit = async (data: ServiceFormData) => {
		try {
			const newService = await createNewService(data);
			toast({
				title: "Success!",
				description: "Your service has been created successfully.",
			});
			router.push(ROUTES.TEACHER.SERVICES);
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to create service. Please try again.",
				variant: "destructive",
			});
		}
	};

	const handleCancel = () => {
		router.push(ROUTES.TEACHER.SERVICES);
	};

	// If no types are available, redirect back
	if (availableTypes.length === 0) {
		router.push(ROUTES.TEACHER.SERVICES);
		return null;
	}

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button
					variant="ghost"
					size="sm"
					onClick={handleCancel}
					className="flex items-center gap-2"
				>
					<ArrowLeft className="h-4 w-4" />
					Back to Services
				</Button>
			</div>

			<div>
				<h1 className="text-3xl font-bold">Create New Service</h1>
				<p className="text-gray-600 dark:text-gray-400 mt-2">
					Set up your service offering and start earning from your expertise
				</p>
			</div>

			{/* Form */}
			<ServiceForm
				onSubmit={handleSubmit}
				onCancel={handleCancel}
				isLoading={isLoading}
				mode="create"
				availableTypes={availableTypes}
			/>
		</div>
	);
} 