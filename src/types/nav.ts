export interface NavItem {
	id: string;
	label: string;
	href?: string; // Make href optional for parent items with sub-items
	icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	badge?: number | string;
	subItems?: NavItem[]; // Add support for sub-items
}
