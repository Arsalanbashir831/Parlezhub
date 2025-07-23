"use client";

import { useState } from "react";
import {
	Search,
	Filter,
	Star,
	MapPin,
	Clock,
	MessageCircle,
	Calendar,
	Heart,
} from "lucide-react";
import cn from "classnames";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";

// Mock teacher data
const mockTeachers = [
	{
		id: "1",
		name: "Maria Rodriguez",
		avatar: "/placeholder.svg?height=80&width=80",
		languages: ["Spanish", "English"],
		specialties: ["Grammar", "Conversation", "Business Spanish"],
		rating: 4.9,
		reviewCount: 127,
		hourlyRate: 25,
		location: "Madrid, Spain",
		timezone: "CET",
		experience: "5+ years",
		description:
			"Native Spanish speaker with extensive experience teaching business professionals. Specializes in conversational Spanish and grammar fundamentals.",
		availability: "Available now",
		isOnline: true,
		isFavorite: false,
		completedLessons: 1250,
		responseTime: "Usually responds in 2 hours",
		calendlyLink: "https://calendly.com/maria-rodriguez/spanish-lesson",
	},
	{
		id: "2",
		name: "Jean Dubois",
		avatar: "/placeholder.svg?height=80&width=80",
		languages: ["French", "English"],
		specialties: ["Pronunciation", "Literature", "Exam Prep"],
		rating: 4.8,
		reviewCount: 89,
		hourlyRate: 30,
		location: "Paris, France",
		timezone: "CET",
		experience: "8+ years",
		description:
			"Certified French teacher with a passion for literature and culture. Helps students achieve fluency through immersive conversation practice.",
		availability: "Available tomorrow",
		isOnline: false,
		isFavorite: true,
		completedLessons: 890,
		responseTime: "Usually responds in 1 hour",
		calendlyLink: "https://calendly.com/jean-dubois/french-lesson",
	},
	{
		id: "3",
		name: "Yuki Tanaka",
		avatar: "/placeholder.svg?height=80&width=80",
		languages: ["Japanese", "English"],
		specialties: ["Beginner Friendly", "JLPT Prep", "Cultural Context"],
		rating: 4.9,
		reviewCount: 156,
		hourlyRate: 28,
		location: "Tokyo, Japan",
		timezone: "JST",
		experience: "6+ years",
		description:
			"Patient and encouraging Japanese teacher who makes learning fun. Specializes in helping beginners build confidence in speaking.",
		availability: "Available now",
		isOnline: true,
		isFavorite: false,
		completedLessons: 2100,
		responseTime: "Usually responds in 30 minutes",
		calendlyLink: "https://calendly.com/yuki-tanaka/japanese-lesson",
	},
];

export default function TeachersPage() {
	const [teachers, setTeachers] = useState(mockTeachers);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedLanguage, setSelectedLanguage] = useState("all");
	const [priceRange, setPriceRange] = useState([0, 100]);
	const [showFilters, setShowFilters] = useState(false);

	const handleToggleFavorite = (teacherId: string) => {
		setTeachers(
			teachers.map((teacher) =>
				teacher.id === teacherId
					? { ...teacher, isFavorite: !teacher.isFavorite }
					: teacher
			)
		);
	};

	const filteredTeachers = teachers.filter((teacher) => {
		const matchesSearch =
			teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			teacher.languages.some((lang) =>
				lang.toLowerCase().includes(searchQuery.toLowerCase())
			) ||
			teacher.specialties.some((spec) =>
				spec.toLowerCase().includes(searchQuery.toLowerCase())
			);

		const matchesLanguage =
			selectedLanguage === "all" ||
			teacher.languages.includes(selectedLanguage);
		const matchesPrice =
			teacher.hourlyRate >= priceRange[0] &&
			teacher.hourlyRate <= priceRange[1];

		return matchesSearch && matchesLanguage && matchesPrice;
	});

	return (
		<div className="space-y-8">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold text-gray-900">Find Teachers</h1>
				<p className="text-gray-600 mt-2">
					Connect with qualified language teachers from around the world
				</p>
			</div>

			{/* Search and Filters */}
			<Card>
				<CardContent className="p-6">
					<div className="space-y-4">
						{/* Search Bar */}
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
							<Input
								placeholder="Search by name, language, or specialty..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10"
							/>
						</div>

						{/* Filter Toggle */}
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
							<Button
								variant="outline"
								onClick={() => setShowFilters(!showFilters)}
								className="gap-2 w-fit">
								<Filter className="h-4 w-4" />
								Filters
							</Button>
							<p className="text-sm text-gray-600">
								{filteredTeachers.length} teachers found
							</p>
						</div>

						{/* Filters */}
						{showFilters && (
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
								<div>
									<Label>Language</Label>
									<Select
										value={selectedLanguage}
										onValueChange={setSelectedLanguage}>
										<SelectTrigger className="mt-1">
											<SelectValue placeholder="All languages" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">All languages</SelectItem>
											<SelectItem value="Spanish">Spanish</SelectItem>
											<SelectItem value="French">French</SelectItem>
											<SelectItem value="Japanese">Japanese</SelectItem>
											<SelectItem value="German">German</SelectItem>
											<SelectItem value="Italian">Italian</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div>
									<Label>Price Range ($/hour)</Label>
									<div className="mt-3">
										<Slider
											value={priceRange}
											onValueChange={setPriceRange}
											max={100}
											min={0}
											step={5}
											className="w-full"
										/>
										<div className="flex justify-between text-sm text-gray-600 mt-1">
											<span>${priceRange[0]}</span>
											<span>${priceRange[1]}</span>
										</div>
									</div>
								</div>

								<div className="flex items-end">
									<Button
										variant="outline"
										onClick={() => {
											setSelectedLanguage("all");
											setPriceRange([0, 100]);
											setSearchQuery("");
										}}
										className="w-full">
										Clear Filters
									</Button>
								</div>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Teachers Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
				{filteredTeachers.map((teacher) => (
					<Card
						key={teacher.id}
						className="hover:shadow-lg transition-all duration-200 group">
						<CardHeader className="pb-4">
							<div className="flex items-start justify-between">
								<div className="flex items-center gap-4">
									<div className="relative">
										<Avatar className="h-16 w-16">
											<AvatarImage src={teacher.avatar || "/placeholder.svg"} />
											<AvatarFallback className="bg-primary-100 text-primary-700">
												{teacher.name
													.split(" ")
													.map((n) => n[0])
													.join("")}
											</AvatarFallback>
										</Avatar>
										{teacher.isOnline && (
											<div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
										)}
									</div>
									<div className="flex-1">
										<div className="flex items-center gap-2">
											<CardTitle className="text-lg">{teacher.name}</CardTitle>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleToggleFavorite(teacher.id)}
												className="p-1 h-auto opacity-0 group-hover:opacity-100 transition-opacity">
												<Heart
													className={cn(
														"h-4 w-4",
														teacher.isFavorite
															? "fill-red-500 text-red-500"
															: "text-gray-400"
													)}
												/>
											</Button>
										</div>
										<div className="flex items-center gap-2 mt-1">
											<div className="flex items-center gap-1">
												<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
												<span className="text-sm font-medium">
													{teacher.rating}
												</span>
												<span className="text-sm text-gray-500">
													({teacher.reviewCount})
												</span>
											</div>
										</div>
									</div>
								</div>
								<div className="text-right">
									<p className="text-lg font-bold text-primary-600">
										${teacher.hourlyRate}/hr
									</p>
									<p className="text-xs text-gray-500">
										{teacher.availability}
									</p>
								</div>
							</div>
						</CardHeader>

						<CardContent className="space-y-4">
							{/* Languages */}
							<div>
								<div className="flex flex-wrap gap-2">
									{teacher.languages.map((language) => (
										<Badge key={language} variant="secondary">
											{language}
										</Badge>
									))}
								</div>
							</div>

							{/* Specialties */}
							<div>
								<div className="flex flex-wrap gap-2">
									{teacher.specialties.map((specialty) => (
										<Badge
											key={specialty}
											variant="outline"
											className="text-xs">
											{specialty}
										</Badge>
									))}
								</div>
							</div>

							{/* Description */}
							<p className="text-sm text-gray-600 line-clamp-2">
								{teacher.description}
							</p>

							{/* Location and Experience */}
							<div className="flex items-center justify-between text-sm text-gray-500">
								<div className="flex items-center gap-1">
									<MapPin className="h-4 w-4" />
									<span>{teacher.location}</span>
								</div>
								<div className="flex items-center gap-1">
									<Clock className="h-4 w-4" />
									<span>{teacher.experience}</span>
								</div>
							</div>

							{/* Response Time */}
							<p className="text-xs text-gray-500">{teacher.responseTime}</p>

							{/* Action Buttons */}
							<div className="flex gap-2 pt-2">
								<Link href={ROUTES.STUDENT.CHAT + "?teacher=" + teacher.id}>
									<Button variant="outline" className="flex-1 bg-transparent">
										<MessageCircle className="h-4 w-4 mr-2" />
										Message
									</Button>
								</Link>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* No Results */}
			{filteredTeachers.length === 0 && (
				<Card className="text-center py-12">
					<CardContent>
						<div className="flex flex-col items-center gap-4">
							<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
								<Search className="h-8 w-8 text-gray-400" />
							</div>
							<div>
								<h3 className="text-lg font-semibold text-gray-900">
									No teachers found
								</h3>
								<p className="text-gray-600 mt-1">
									Try adjusting your search criteria or filters
								</p>
							</div>
							<Button
								variant="outline"
								onClick={() => {
									setSearchQuery("");
									setSelectedLanguage("all");
									setPriceRange([0, 100]);
								}}>
								Clear All Filters
							</Button>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
