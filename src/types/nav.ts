export interface NavItem {
  id: string;
  label: string;
  href?: string; // Make href optional for parent items with sub-items
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  badge?: number | string;
  subItems?: NavItem[]; // Add support for sub-items
  /**
   * Heading this item sits under in the sidebar. Consecutive items sharing a
   * section render inside one group, so the section is a visual grouping of the
   * order below, not a tree.
   */
  section?: string;
}
