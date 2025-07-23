"use client";

import React, { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AccountStatusProps {
	accountType: string;
	verificationStatus: "verified" | "pending" | "unverified";
	memberSince: string;
}

const AccountStatus = memo(
	({ accountType, verificationStatus, memberSince }: AccountStatusProps) => {
		const getVerificationBadge = () => {
			switch (verificationStatus) {
				case "verified":
					return (
						<Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
							Verified
						</Badge>
					);
				case "pending":
					return (
						<Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
							Pending
						</Badge>
					);
				case "unverified":
					return (
						<Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
							Unverified
						</Badge>
					);
				default:
					return <Badge variant="secondary">Unknown</Badge>;
			}
		};

		return (
			<Card className="dark:bg-gray-800 dark:border-gray-700">
				<CardHeader>
					<CardTitle className="text-lg dark:text-gray-100">
						Account Status
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium dark:text-gray-200">
							Account Type
						</span>
						<Badge variant="secondary">{accountType}</Badge>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium dark:text-gray-200">
							Verification
						</span>
						{getVerificationBadge()}
					</div>
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium dark:text-gray-200">
							Member Since
						</span>
						<span className="text-sm text-gray-600 dark:text-gray-400">
							{memberSince}
						</span>
					</div>
				</CardContent>
			</Card>
		);
	}
);

AccountStatus.displayName = "AccountStatus";

export default AccountStatus;
