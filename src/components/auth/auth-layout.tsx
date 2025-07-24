import type React from "react";
import { Logo } from "@/components/ui/logo";

interface AuthLayoutProps {
	children: React.ReactNode;
	title: string;
	subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
	return (
		<div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
			<div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-6">
				<div className="text-center">
					<Logo className="justify-center mt-4 mb-8" size="lg" />
					<h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
					{subtitle && <p className="text-gray-600">{subtitle}</p>}
				</div>

				<div className="glass-effect rounded-2xl p-8 shadow-soft">
					{children}
				</div>

				<div className="text-center">
					<p className="text-sm text-gray-500">
						© {new Date().getFullYear()} LinkguaFlex. All rights reserved.
					</p>
				</div>
			</div>
		</div>
	);
}
