'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, LogOut } from 'lucide-react';

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
                  'px-4 py-6 hover:bg-gradient-to-br hover:from-primary-500 hover:to-primary-600 hover:text-white',
                  isParentActive &&
                    'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
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
                            'px-4 py-6 hover:bg-gradient-to-br hover:from-primary-500 hover:to-primary-600 hover:text-white',
                            isSubActive &&
                              'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
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
            'px-4 py-6 hover:bg-gradient-to-br hover:from-primary-500 hover:to-primary-600 hover:text-white',
            isActive &&
              'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
          )}
        >
          <Link
            href={item.href!}
            className={cn(isCollapsed && 'justify-center')}
          >
            <item.icon className="shrink-0" />
            {!isCollapsed && <span>{item.label}</span>}
            {/* {!isCollapsed && item.badge && (
							<span className="ml-auto bg-primary-100 text-primary-600 dark:bg-primary-800 dark:text-primary-300 px-2 py-0.5 rounded-full text-xs font-medium">
								{item.badge}
							</span>
						)} */}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-none bg-white shadow-lg dark:bg-gray-800"
    >
      <SidebarHeader
        className={cn(
          'border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800',
          isCollapsed ? 'py-4' : 'p-4'
        )}
      >
        <Logo size="sm" isCollapsed={isCollapsed} />
      </SidebarHeader>

      <SidebarContent
        className={cn(
          'border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800',
          !isCollapsed ? 'px-2' : ''
        )}
      >
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>{nav.map(renderMenuItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-white p-4 dark:bg-gray-800">
        {roleLabel !== 'Agent' && (
          <UserMiniCard roleLabel={roleLabel} collapsed={isCollapsed} />
        )}
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300',
            isCollapsed && 'justify-center'
          )}
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && 'Sign Out'}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};
