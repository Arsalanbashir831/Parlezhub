import AppShellClient from "@/components/layout/app-shell-client";

export default function Layout({ children }: { children: React.ReactNode }) {
	return <AppShellClient role="teacher">{children}</AppShellClient>;
}
