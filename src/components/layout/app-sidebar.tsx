'use client';

import * as React from 'react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/auth-context';
import {
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Home,
  LogOut,
  Users,
} from 'lucide-react';

import type { NavItem } from '@/types/nav';
import { cn } from '@/lib/utils';
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
      <SidebarMenuItem>
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
          <SidebarMenuItem>
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
                      <SidebarMenuSubItem key={subItem.id}>
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
    return (
      <SidebarMenuItem key={item.id}>
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
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-white/5 bg-background shadow-2xl"
    >
      <SidebarHeader
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
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">{nav.map(renderMenuItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-primary-300/10 bg-background">
        {isAuthenticated ? (
          <>
            {roleLabel !== 'Agent' ? (
              <div className="space-y-3">
                {/* Dashboard Links - show opposite role dashboard */}
                <SidebarMenu>
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
                <SidebarMenu>
                  {renderMenuItem({
                    id: 'astrology',
                    label: 'Astrology Dashboard',
                    href: ROUTES.AGENT.ASTROLOGY,
                    icon: Home,
                  })}
                </SidebarMenu>
                <UserMiniCard roleLabel={roleLabel} collapsed={isCollapsed} />
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
