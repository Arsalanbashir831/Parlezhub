"use client";

import type React from "react";
import { AuthProvider } from "@/contexts/auth-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { SessionProvider } from "@/contexts/session-context";

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider>
			<AuthProvider>
				<SessionProvider>{children}</SessionProvider>
			</AuthProvider>
		</ThemeProvider>
	);
}
