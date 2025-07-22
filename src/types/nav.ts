export interface NavItem {
	id: string;
	label: string;
	href: string;
	icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	badge?: number | string;
}
