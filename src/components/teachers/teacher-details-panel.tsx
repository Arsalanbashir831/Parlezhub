"use client";

import React from "react";
import {
	Star,
	MapPin,
	MessageCircle,
	Award,
	Users,
	Timer,
	Globe,
} from "lucide-react";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { TeacherData } from "./teacher-card";

interface TeacherDetailsPanelProps {
	teacher: TeacherData | null;
	isOpen: boolean;
	onClose: () => void;
}

export const TeacherDetailsPanel = React.memo<TeacherDetailsPanelProps>(
	({ teacher, isOpen, onClose }) => {
		if (!teacher) return null;

		return (
			<Sheet open={isOpen} onOpenChange={onClose}>
				<SheetContent className="w-full sm:max-w-md overflow-y-auto">
					<SheetHeader className="space-y-4">
						<div className="flex items-center justify-between">
							<SheetTitle className="text-xl">Teacher Profile</SheetTitle>
						</div>

						{/* Teacher Header */}
						<div className="flex items-start gap-4">
							<div className="relative">
								<Avatar className="h-20 w-20">
									<AvatarImage src={teacher.avatar || "/placeholder.svg"} />
									<AvatarFallback className="bg-primary-100 text-primary-700 text-lg">
										{teacher.name
											.split(" ")
											.map((n) => n[0])
											.join("")}
									</AvatarFallback>
								</Avatar>
								{teacher.isOnline && (
									<div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
										<div className="w-2 h-2 bg-white rounded-full"></div>
									</div>
								)}
							</div>
							<div className="flex-1">
								<div className="flex items-center justify-between">
									<h2 className="text-xl font-bold">{teacher.name}</h2>
								</div>
								<div className="flex items-center gap-2 mt-1">
									<div className="flex items-center gap-1">
										<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
										<span className="font-semibold">{teacher.rating}</span>
										<span className="text-gray-500">
											({teacher.reviewCount} reviews)
										</span>
									</div>
								</div>
								<div className="flex items-center gap-1 text-gray-600 mt-2">
									<MapPin className="h-4 w-4" />
									<span className="text-sm">{teacher.location}</span>
									{teacher.isOnline && (
										<Badge variant="secondary" className="ml-2 text-xs">
											Online now
										</Badge>
									)}
								</div>
							</div>
						</div>

						{/* Price and Availability */}
						<div className="bg-gray-50 rounded-lg p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-2xl font-bold text-primary-600">
										${teacher.hourlyRate}
									</p>
									<p className="text-sm text-gray-500">per hour</p>
								</div>
								<div className="text-right">
									<p className="text-sm font-medium">{teacher.availability}</p>
									<p className="text-xs text-gray-500">{teacher.timezone}</p>
								</div>
							</div>
						</div>
					</SheetHeader>

					<div className="space-y-6 mt-6">
						{/* Quick Stats */}
						<div className="grid grid-cols-2 gap-4">
							<div className="bg-gray-50 rounded-lg p-3 text-center">
								<Users className="h-5 w-5 mx-auto text-primary-600 mb-1" />
								<p className="text-lg font-bold">{teacher.completedLessons}</p>
								<p className="text-xs text-gray-500">Lessons completed</p>
							</div>
							<div className="bg-gray-50 rounded-lg p-3 text-center">
								<Award className="h-5 w-5 mx-auto text-primary-600 mb-1" />
								<p className="text-lg font-bold">{teacher.experience}</p>
								<p className="text-xs text-gray-500">Experience</p>
							</div>
						</div>

						{/* Languages */}
						<div>
							<h3 className="font-semibold mb-3 flex items-center gap-2">
								<Globe className="h-4 w-4" />
								Languages
							</h3>
							<div className="flex flex-wrap gap-2">
								{teacher.languages.map((language) => (
									<Badge
										key={language}
										variant="secondary"
										className="px-3 py-1">
										{language}
									</Badge>
								))}
							</div>
						</div>

						{/* Specialties */}
						<div>
							<h3 className="font-semibold mb-3">Specialties</h3>
							<div className="flex flex-wrap gap-2">
								{teacher.specialties.map((specialty) => (
									<Badge
										key={specialty}
										variant="outline"
										className="px-3 py-1">
										{specialty}
									</Badge>
								))}
							</div>
						</div>

						{/* Description */}
						<div>
							<h3 className="font-semibold mb-3">About</h3>
							<p className="text-gray-700 leading-relaxed">
								{teacher.description}
							</p>
						</div>

						{/* Response Time */}
						<div className="bg-blue-50 rounded-lg p-3">
							<div className="flex items-center gap-2">
								<Timer className="h-4 w-4 text-blue-600" />
								<span className="text-sm font-medium text-blue-900">
									{teacher.responseTime}
								</span>
							</div>
						</div>

						<Separator />

						{/* Action Buttons */}
						<div className="space-y-3 pb-6">
							<Link
								href={ROUTES.STUDENT.CHAT + "?teacher=" + teacher.id}
								className="block">
								<Button className="w-full" size="lg">
									<MessageCircle className="h-4 w-4 mr-2" />
									Start Chatting
								</Button>
							</Link>
						</div>
					</div>
				</SheetContent>
			</Sheet>
		);
	}
);

TeacherDetailsPanel.displayName = "TeacherDetailsPanel";
