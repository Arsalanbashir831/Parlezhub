import type React from "react";
import { Logo } from "@/components/ui/logo";

interface AuthLayoutProps {
	children: React.ReactNode;
	title: string;
	subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
	return (
		<div className="min-h-screen gradient-bg flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<Logo className="justify-center mb-4" size="lg" />
					<h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
					{subtitle && <p className="text-gray-600">{subtitle}</p>}
				</div>

				<div className="glass-effect rounded-2xl p-8 shadow-soft">
					{children}
				</div>

				<div className="text-center mt-6">
					<p className="text-sm text-gray-500">
						© 2024 LinkguaFlex. All rights reserved.
					</p>
				</div>
			</div>
		</div>
	);
}
