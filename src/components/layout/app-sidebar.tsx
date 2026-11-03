'use client';

import * as React from 'react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/auth-context';
import {
  ChevronDown,
  ChevronRight,
  Compass,
  GraduationCap,
  Home,
  LogOut,
  Users,
  Network,
} from 'lucide-react';

import type { NavItem } from '@/types/nav';
import { cn } from '@/lib/utils';
import { WORKSPACE_ANCHORS } from '@/constants/tour-steps';
import { GuideTourTrigger } from '@/components/guide/guide-tour-provider';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Logo } from '@/components/ui/logo';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';

import { UserMiniCard } from './user-mini-card';

interface AppSidebarProps {
  nav: NavItem[];
  activeTab: string;
  roleLabel: string;
  onLogout: () => void;
}

/** Consecutive items sharing a `section` collapse into one labelled group;
 *  items without one fall into an unlabelled leading group. */
const groupNavBySection = (nav: NavItem[]) => {
  const groups: { section: string | undefined; items: NavItem[] }[] = [];
  nav.forEach((item) => {
    const last = groups[groups.length - 1];
    if (last && last.section === item.section) last.items.push(item);
    else groups.push({ section: item.section, items: [item] });
  });
  return groups;
};

const badgeLabel = (badge: number | string) =>
  typeof badge === 'number' && badge > 99 ? '99+' : badge;

export const AppSidebar: React.FC<AppSidebarProps> = ({
  nav,
  activeTab,
  roleLabel,
  onLogout,
}) => {
  const {
    isAuthenticated,
    activeRole,
    hasTeacherRole,
    hasStudentRole,
    becomeConsultant,
    becomeStudent,
    switchRole,
  } = useAuth();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  // A nav that already lists the observatory (the consultant's My Observatory
  // section) does not also need the single door in the footer.
  const navHasObservatory = nav.some(
    (item) => item.href === ROUTES.AGENT.ASTROLOGY.ROOT
  );

  // Initialize dropdown state based on active tab
  const [openDropdowns, setOpenDropdowns] = React.useState<Set<string>>(() => {
    const initialOpen = new Set<string>();

    // Check if any sub-item is active and open its parent dropdown
    nav.forEach((item) => {
      if (item.subItems?.some((subItem) => subItem.id === activeTab)) {
        initialOpen.add(item.id);
      }
    });

    return initialOpen;
  });

  // Update dropdown state when activeTab changes
  React.useEffect(() => {
    setOpenDropdowns((prev) => {
      const newSet = new Set(prev);

      // Check if any sub-item is active and ensure its parent dropdown is open
      nav.forEach((item) => {
        if (item.subItems?.some((subItem) => subItem.id === activeTab)) {
          newSet.add(item.id);
        }
      });

      return newSet;
    });
  }, [activeTab, nav]);

  const toggleDropdown = (itemId: string) => {
    setOpenDropdowns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const renderRoleSwitchMenuItem = (
    role: 'TEACHER' | 'STUDENT',
    label: string,
    IconComponent: React.ComponentType<{ className?: string }>,
    action: () => void
  ) => {
    return (
      <SidebarMenuItem data-tour={WORKSPACE_ANCHORS.roleSwitch}>
        <SidebarMenuButton
          tooltip={isCollapsed ? label : undefined}
          className={cn(
            'px-4 py-6 font-bold uppercase tracking-widest text-[10px] transition-all hover:bg-primary-500 hover:text-primary-950',
            role === 'TEACHER' && 'text-primary-300',
            role === 'STUDENT' && 'text-primary-400'
          )}
          onClick={action}
        >
          <IconComponent className="shrink-0 h-5 w-5" />
          {!isCollapsed && <span>{label}</span>}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  const isSubItemActive = (item: NavItem): boolean => {
    if (!item.subItems) return false;
    return item.subItems.some((subItem) => activeTab === subItem.id);
  };

  const renderMenuItem = (item: NavItem) => {
    const isActive = activeTab === item.id;
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isDropdownOpen = openDropdowns.has(item.id);
    const isParentActive = isSubItemActive(item);

    if (hasSubItems) {
      return (
        <Collapsible
          key={item.id}
          open={isDropdownOpen}
          onOpenChange={() => toggleDropdown(item.id)}
        >
          <SidebarMenuItem data-tour={WORKSPACE_ANCHORS.nav(item.id)}>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                tooltip={isCollapsed ? item.label : undefined}
                className={cn(
                  'px-4 py-6 transition-all hover:bg-primary-500/10 hover:text-primary-300',
                  isParentActive && 'bg-primary-500 font-bold text-primary-950'
                )}
              >
                <item.icon className="shrink-0" />
                {!isCollapsed && (
                  <>
                    <span>{item.label}</span>
                    {isDropdownOpen ? (
                      <ChevronDown className="ml-auto h-4 w-4" />
                    ) : (
                      <ChevronRight className="ml-auto h-4 w-4" />
                    )}
                  </>
                )}
              </SidebarMenuButton>
            </CollapsibleTrigger>
            {!isCollapsed && (
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.subItems?.map((subItem) => {
                    const isSubActive = activeTab === subItem.id;
                    return (
                      <SidebarMenuSubItem key={subItem.id} data-tour={WORKSPACE_ANCHORS.nav(subItem.id)}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isSubActive}
                          className={cn(
                            'px-4 py-6 transition-all hover:bg-primary-500/10 hover:text-primary-300',
                            isSubActive &&
                            'border-r-2 border-primary-500 bg-primary-500/20 font-bold text-primary-300'
                          )}
                        >
                          <Link href={subItem.href!}>
                            <subItem.icon className="shrink-0" />
                            <span>{subItem.label}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    );
                  })}
                </SidebarMenuSub>
              </CollapsibleContent>
            )}
          </SidebarMenuItem>
        </Collapsible>
      );
    }

    // Regular menu item without sub-items
    const hasBadge =
      item.badge !== undefined && item.badge !== 0 && item.badge !== '';

    return (
      <SidebarMenuItem key={item.id} data-tour={WORKSPACE_ANCHORS.nav(item.id)}>
        <SidebarMenuButton
          asChild
          isActive={isActive}
          tooltip={isCollapsed ? item.label : undefined}
          className={cn(
            'px-5 py-7 rounded-2xl text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300',
            'hover:bg-primary-500/5 hover:text-primary-300',
            isActive &&
            'bg-primary-500 text-primary-950 shadow-lg shadow-primary-500/20 hover:bg-primary-600 hover:text-primary-950'
          )}
        >
          <Link
            href={item.href!}
            className={cn(isCollapsed && 'justify-center')}
          >
            <item.icon className={cn("shrink-0 h-5 w-5", isActive ? "text-primary-950" : "text-primary-500/60")} />
            {!isCollapsed && <span>{item.label}</span>}
            {!isCollapsed && hasBadge && (
              <span
                className={cn(
                  'ml-auto inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[10px] font-bold tabular-nums',
                  isActive
                    ? 'bg-primary-950/25 text-primary-950'
                    : 'bg-primary-500/20 text-primary-300'
                )}
                aria-hidden="true"
              >
                {badgeLabel(item.badge!)}
              </span>
            )}
            {!isCollapsed && hasBadge && typeof item.badge === 'number' && (
              <span className="sr-only">{item.badge} unread</span>
            )}
          </Link>
        </SidebarMenuButton>
        {isCollapsed && hasBadge && (
          <span
            className="pointer-events-none absolute right-1 top-1 h-2 w-2 rounded-full bg-primary-500 ring-2 ring-background"
            aria-hidden="true"
          />
        )}
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-white/5 bg-background shadow-2xl"
    >
      <SidebarHeader
        data-tour={WORKSPACE_ANCHORS.brand}
        className={cn(
          'border-b border-white/5 bg-background',
          isCollapsed ? 'py-4' : 'p-6'
        )}
      >
        <Logo size="sm" isCollapsed={isCollapsed} />
      </SidebarHeader>

      <SidebarContent
        className={cn(
          'border-b border-white/5 bg-background',
          !isCollapsed ? 'px-3' : ''
        )}
      >
        {groupNavBySection(nav).map((group) => (
          <SidebarGroup
            key={group.section ?? '_'}
            className={cn('py-0', !group.section && 'pt-2')}
          >
            {group.section &&
              (isCollapsed ? (
                <span
                  className="mx-auto my-3 block h-px w-8 bg-white/10"
                  aria-hidden="true"
                />
              ) : (
                <SidebarGroupLabel className="px-5 pb-2 pt-7 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-100/40">
                  {group.section}
                </SidebarGroupLabel>
              ))}
            <SidebarGroupContent>
              <SidebarMenu className="gap-2">
                {group.items.map(renderMenuItem)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-primary-300/10 bg-background">
        {isAuthenticated ? (
          <>
            {roleLabel !== 'Agent' ? (
              <div className="space-y-3">
                {/* Dashboard Links - show opposite role dashboard */}
                <SidebarMenu>
                  {/* {renderMenuItem({
                    id: 'family-tree',
                    label: 'Family Tree',
                    href: ROUTES.FAMILY_TREE,
                    icon: Network,
                  })} */}
                  {activeRole === 'STUDENT' &&
                    hasTeacherRole &&
                    renderRoleSwitchMenuItem(
                      'TEACHER',
                      'Consultant Dashboard',
                      Users,
                      () => switchRole('TEACHER')
                    )}
                  {activeRole === 'TEACHER' &&
                    hasStudentRole &&
                    renderRoleSwitchMenuItem(
                      'STUDENT',
                      'Student Dashboard',
                      GraduationCap,
                      () => switchRole('STUDENT')
                    )}
                  {/* Become Consultant Button - show if student but not consultant */}
                  {activeRole === 'STUDENT' &&
                    !hasTeacherRole &&
                    renderRoleSwitchMenuItem(
                      'TEACHER',
                      'Become Consultant',
                      Users,
                      becomeConsultant
                    )}
                  {/* Become Student Button - show if consultant but not student */}
                  {activeRole === 'TEACHER' &&
                    !hasStudentRole &&
                    renderRoleSwitchMenuItem(
                      'STUDENT',
                      'Become Student',
                      GraduationCap,
                      becomeStudent
                    )}
                </SidebarMenu>
                {!navHasObservatory && (
                  <SidebarMenu>
                    {renderMenuItem({
                      id: 'astrology',
                      label: 'Astrology Dashboard',
                      href: ROUTES.AGENT.ASTROLOGY.ROOT,
                      icon: Home,
                    })}
                  </SidebarMenu>
                )}
                <GuideTourTrigger
                  anchor={WORKSPACE_ANCHORS.guide}
                  className="w-full"
                  aria-label="Start the guided tour"
                >
                  {isCollapsed ? (
                    <Compass className="h-4 w-4 shrink-0" aria-hidden="true" />
                  ) : (
                    <>
                      <Compass className="h-4 w-4 shrink-0" aria-hidden="true" />
                      Guided tour
                    </>
                  )}
                </GuideTourTrigger>
                <div data-tour={WORKSPACE_ANCHORS.userCard}>
                  <UserMiniCard roleLabel={roleLabel} collapsed={isCollapsed} />
                </div>
              </div>
            ) : (
              <SidebarMenu>
                {renderMenuItem({
                  id: 'dashboard',
                  label: 'Dashboard',
                  href: ROUTES.STUDENT.DASHBOARD,
                  icon: Home,
                })}
              </SidebarMenu>
            )}
            <Button
              data-tour={WORKSPACE_ANCHORS.signOut}
              variant="ghost"
              className={cn(
                'w-full justify-start gap-3 text-red-400 hover:bg-red-500/10 hover:text-red-300',
                isCollapsed && 'justify-center'
              )}
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4" />
              {!isCollapsed && 'Sign Out'}
            </Button>
          </>
        ) : (
          <SidebarMenu>
            {renderMenuItem({
              id: 'login',
              label: 'Sign In',
              href: ROUTES.AUTH.LOGIN,
              icon: Home,
            })}
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};
