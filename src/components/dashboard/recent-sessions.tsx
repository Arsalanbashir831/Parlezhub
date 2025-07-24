"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ROUTES } from "@/constants/routes";
import { ConversationData } from "@/components/history/conversation-card";

interface RecentSessionsProps {
	conversations: ConversationData[];
}

export default function RecentSessions({ conversations }: RecentSessionsProps) {
	return (
		<div className="lg:col-span-6">
			<Card className="h-full">
				<CardHeader className="pb-4">
					<div className="flex items-center justify-between">
						<CardTitle className="text-lg">Recent Sessions</CardTitle>
						<Link href={ROUTES.STUDENT.HISTORY}>
							<Button
								variant="ghost"
								size="sm"
								className="text-primary-600 hover:text-primary-700">
								<ArrowRight className="h-4 w-4" />
							</Button>
						</Link>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					{conversations.slice(0, 5).map((conversation) => (
						<div
							key={conversation.id}
							className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
							<Avatar className="h-12 w-12">
								<AvatarFallback className="bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-200 font-semibold">
									{conversation.language.charAt(0).toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1 min-w-0">
								<p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
									{conversation.topic}
								</p>
								<p className="text-xs text-gray-600 dark:text-gray-400">
									{conversation.language} • {conversation.duration}m
								</p>
							</div>
							<Badge
								variant={conversation.score >= 85 ? "default" : "secondary"}
								className="text-xs">
								{conversation.score}%
							</Badge>
						</div>
					))}
					<Link href={ROUTES.STUDENT.HISTORY}>
						<Button variant="outline" className="w-full mt-4 bg-transparent">
							View All Sessions
						</Button>
					</Link>
				</CardContent>
			</Card>
		</div>
	);
}
