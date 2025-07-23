"use client";

import React from "react";
import { Star, MapPin, Heart, ChevronRight } from "lucide-react";
import cn from "classnames";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface TeacherData {
	id: string;
	name: string;
	avatar: string;
	languages: string[];
	specialties: string[];
	rating: number;
	reviewCount: number;
	hourlyRate: number;
	location: string;
	timezone: string;
	experience: string;
	description: string;
	availability: string;
	isOnline: boolean;
	isFavorite: boolean;
	completedLessons: number;
	responseTime: string;
	calendlyLink: string;
}

interface TeacherCardProps {
	teacher: TeacherData;
	onSelectTeacher: (teacher: TeacherData) => void;
}

export const TeacherCard = React.memo<TeacherCardProps>(
	({ teacher, onSelectTeacher }) => {
		const handleSelectTeacher = React.useCallback(() => {
			onSelectTeacher(teacher);
		}, [teacher, onSelectTeacher]);

		return (
			<Card
				className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
				onClick={handleSelectTeacher}>
				<CardContent className="p-4">
					<div className="flex items-center justify-between mb-3">
						<div className="flex items-center gap-3">
							<div className="relative">
								<Avatar className="h-12 w-12">
									<AvatarImage src={teacher.avatar || "/placeholder.svg"} />
									<AvatarFallback className="bg-primary-100 text-primary-700">
										{teacher.name
											.split(" ")
											.map((n) => n[0])
											.join("")}
									</AvatarFallback>
								</Avatar>
								{teacher.isOnline && (
									<div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
								)}
							</div>
							<div className="flex-1 min-w-0">
								<h3 className="font-semibold text-sm truncate">
									{teacher.name}
								</h3>
								<div className="flex items-center gap-1 mt-1">
									<Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
									<span className="text-xs font-medium">{teacher.rating}</span>
									<span className="text-xs text-gray-500">
										({teacher.reviewCount})
									</span>
								</div>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<ChevronRight className="h-4 w-4 text-gray-400" />
						</div>
					</div>

					<div className="space-y-2">
						{/* Primary Languages */}
						<div className="flex flex-wrap gap-1">
							{teacher.languages.slice(0, 2).map((language) => (
								<Badge
									key={language}
									variant="secondary"
									className="text-xs py-0.5 px-2">
									{language}
								</Badge>
							))}
							{teacher.languages.length > 2 && (
								<Badge variant="outline" className="text-xs py-0.5 px-2">
									+{teacher.languages.length - 2}
								</Badge>
							)}
						</div>

						{/* Location and Price */}
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-1 text-gray-500">
								<MapPin className="h-3 w-3" />
								<span className="text-xs truncate">{teacher.location}</span>
							</div>
							<p className="text-sm font-bold text-primary-600">
								${teacher.hourlyRate}/hr
							</p>
						</div>

						{/* Description Preview */}
						<p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
							{teacher.description}
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}
);

TeacherCard.displayName = "TeacherCard";
