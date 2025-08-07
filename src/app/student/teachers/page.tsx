'use client';

import { useIsMobile } from '@/hooks/use-mobile';
import { useTeachers } from '@/hooks/useTeachers';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ServiceDetailsDrawer,
  ServiceDetailsModal,
  ServicesGrid,
  TeacherFilters,
  TeachersEmptyState,
  TeachersHeader,
} from '@/components/teachers';

export default function TeachersPage() {
  const {
    services,
    availableLanguages,
    searchQuery,
    selectedLanguage,
    priceRange,
    showFilters,
    selectedService,
    isDetailsPanelOpen,
    isLoading,
    error,
    handleSearchChange,
    handleLanguageChange,
    handlePriceRangeChange,
    handleToggleFilters,
    handleClearFilters,
    handleSelectService,
    handleCloseDetailsPanel,
    refreshTeachers,
  } = useTeachers();
  const isMobile = useIsMobile();

  if (error) {
    return (
      <div className="space-y-8">
        <TeachersHeader />
        <Card>
          <CardContent className="py-12 text-center">
            <p className="mb-4 text-red-600">Error loading services: {error}</p>
            <Button onClick={refreshTeachers}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <TeachersHeader />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="min-w-0 flex-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="mt-1 h-3 w-16" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <TeachersHeader />

      <TeacherFilters
        searchQuery={searchQuery}
        selectedLanguage={selectedLanguage}
        priceRange={priceRange}
        showFilters={showFilters}
        resultsCount={services.length}
        availableLanguages={availableLanguages}
        onSearchChange={handleSearchChange}
        onLanguageChange={handleLanguageChange}
        onPriceRangeChange={handlePriceRangeChange}
        onToggleFilters={handleToggleFilters}
        onClearFilters={handleClearFilters}
      />

      {services.length > 0 ? (
        <ServicesGrid
          services={services}
          onSelectService={handleSelectService}
        />
      ) : (
        <TeachersEmptyState onClearFilters={handleClearFilters} />
      )}

      {isMobile ? (
        <ServiceDetailsModal
          serviceCard={selectedService}
          isOpen={isDetailsPanelOpen}
          onClose={handleCloseDetailsPanel}
        />
      ) : (
        <ServiceDetailsDrawer
          serviceCard={selectedService}
          isOpen={isDetailsPanelOpen}
          onClose={handleCloseDetailsPanel}
        />
      )}
    </div>
  );
}
