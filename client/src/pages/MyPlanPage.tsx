// client/src/pages/MyPlanPage.tsx

import React, { useState, useMemo } from "react";
import { usePlanItems } from "@/hooks/use-plan-items";
import { PlanItemCard } from "@/components/PlanItemCard";
import { AddPlanItemDialog } from "@/components/AddPlanItemDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, ListFilter, Search, AlertTriangle, PlusIcon, CheckCircle2, CircleDotDashed, SlidersHorizontal, SortAscIcon } from "lucide-react";
import ErrorMessage from "@/components/ErrorMessage";
import { PlanItem } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { NeoButton } from "@/components/ui/neo-button";
import { NeoCard, NeoCardHeader, NeoCardContent, NeoCardTitle, NeoCardDescription, NeoCardFooter, NeoCardDecoration } from "@/components/ui/neo-card";

type FilterOptions = {
  search: string;
  category: string;
  status: string;
  sortBy: string;
};

const categories = [
  { value: "all", label: "All Categories" },
  { value: "medication", label: "Medication" },
  { value: "appointment", label: "Appointment" },
  { value: "exercise", label: "Exercise/Activity" },
  { value: "nutrition", label: "Nutrition/Diet" },
  { value: "supplement", label: "Supplement" },
  { value: "therapy", label: "Therapy/Session" },
  { value: "self_care", label: "Self-Care" },
  { value: "other", label: "Other" },
];

interface MyPlanPageProps {
  inTabView?: boolean;
}

export default function MyPlanPage({ inTabView = false }: MyPlanPageProps) {
  const { planItems, isLoading, isError } = usePlanItems();

  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    category: "all",
    status: "all",
    sortBy: "date",
  });

  const handleFilterChange = (name: keyof FilterOptions, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filteredAndSortedItems = useMemo(() => {
    if (isError || !planItems || !Array.isArray(planItems)) return [];
    
    let items = planItems.filter((item: PlanItem) => {
      if (
        filters.search &&
        !item.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !(item.description?.toLowerCase() || '').includes(filters.search.toLowerCase())
      ) {
        return false;
      }
      if (filters.category !== "all" && item.category !== filters.category) {
        return false;
      }
      return true;
    });

    return items.sort((a: PlanItem, b: PlanItem) => {
      if (filters.sortBy === "date") {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      } else if (filters.sortBy === "priority") {
        const priorityOrder = { high: 0, medium: 1, low: 2, none: 3 };
        return (
          priorityOrder[a.priority as keyof typeof priorityOrder || 'none'] -
          priorityOrder[b.priority as keyof typeof priorityOrder || 'none']
        );
      }
      return 0;
    });
  }, [planItems, filters, isError]);

  const activeItems = filteredAndSortedItems.filter((item: PlanItem) => !item.isCompleted);
  const completedItems = filteredAndSortedItems.filter((item: PlanItem) => item.isCompleted);

  const pageTitle = "MY WELLNESS PLAN";
  const pageDescription = "Organize your treatments, appointments, self-care, and more.";

  const renderPlanItems = (items: PlanItem[]) => {
    if (items.length === 0) {
      let message = "No items found for your current filters.";
      if (!filters.search && filters.category === "all" && filters.status === "all") {
        message = "Your plan is looking clear! Add a new item to get started.";
      } else if (filters.status === "active" && !filters.search && filters.category === "all") {
        message = "No active items in your plan right now. Time to add something or relax!";
      } else if (filters.status === "completed" && !filters.search && filters.category === "all") {
        message = "No completed items yet. Keep up the great work!";
      }
      
      return (
        <NeoCard className="h-auto text-center py-16">
          <NeoCardContent>
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-4 bg-sophera-brand-primary/10 rounded-full shadow-[0.2rem_0.2rem_0_#05060f] border-3 border-sophera-text-heading">
                <CalendarIcon className="h-12 w-12 text-sophera-brand-primary" />
              </div>
              <h3 className="text-xl lg:text-2xl font-extrabold text-sophera-text-heading mt-2">{message.includes("clear!") ? "PLAN LOOKS CLEAR!" : "NO ITEMS FOUND"}</h3>
              <p className="text-sophera-text-body mt-1 max-w-md text-base">{message}</p>
              {(!filters.search && filters.category === "all" && (filters.status === "all" || filters.status === "active")) && (
                <AddPlanItemDialog trigger={
                  <NeoButton 
                    buttonText="Add First Plan Item"
                    color="primary"
                    icon={<PlusIcon className="h-5 w-5" />}
                    className="mt-6"
                  />
                }/>
              )}
            </div>
          </NeoCardContent>
        </NeoCard>
      );
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
        {items.map((item: PlanItem) => (
          <PlanItemCard key={item.id} planItem={item} />
        ))}
      </div>
    );
  };

  return (
    <div className={inTabView ? "py-6" : "container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-10 space-y-8 md:space-y-10"}>
      {!inTabView && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-sophera-text-heading flex items-center gap-3">
              <CalendarIcon className="h-8 w-8 lg:h-9 lg:w-9 text-sophera-brand-primary"/>
              {pageTitle}
            </h1>
            <p className="text-lg lg:text-xl text-sophera-text-body mt-1">{pageDescription}</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <AddPlanItemDialog trigger={
              <NeoButton 
                buttonText="Add Plan Item"
                color="primary"
                icon={<PlusIcon className="h-5 w-5" />}
              />
            }/>
          </div>
        </div>
      )}
      {inTabView && (
        <div className="flex justify-end mb-6">
          <AddPlanItemDialog trigger={
            <NeoButton 
              buttonText="New Item"
              color="primary"
              size="sm"
              icon={<PlusIcon className="h-4 w-4" />}
            />
          }/>
        </div>
      )}

      <NeoCard className="h-auto">
        <NeoCardDecoration />
        <NeoCardHeader>
          <NeoCardTitle>FILTER & SORT</NeoCardTitle>
          <NeoCardDescription>
            Manage your wellness plan items with custom filters
          </NeoCardDescription>
        </NeoCardHeader>
        <NeoCardContent>
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            <div className="relative flex-grow w-full lg:w-auto">
              <Label htmlFor="planSearch" className="block text-sm font-bold text-sophera-text-heading mb-1.5">Search Plan</Label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-sophera-text-subtle pointer-events-none" />
                <Input
                  id="planSearch"
                  type="search"
                  placeholder="Search by title or description..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-11 pr-4 h-12 border-3 border-sophera-text-heading rounded-lg bg-sophera-bg-card"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
              <div className="flex-grow sm:w-auto">
                <Label htmlFor="categoryFilter" className="block text-sm font-bold text-sophera-text-heading mb-1.5">Category</Label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => handleFilterChange("category", value)}
                >
                  <SelectTrigger id="categoryFilter" className="w-full sm:w-[200px] h-12 border-3 border-sophera-text-heading rounded-lg bg-sophera-bg-card">
                    <ListFilter className="h-5 w-5 mr-2 text-sophera-text-subtle" />
                    <SelectValue placeholder="Filter by Category" />
                  </SelectTrigger>
                  <SelectContent className="border-3 border-sophera-text-heading rounded-lg bg-sophera-bg-card">
                    <SelectGroup>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-grow sm:w-auto">
                <Label htmlFor="sortFilter" className="block text-sm font-bold text-sophera-text-heading mb-1.5">Sort By</Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => handleFilterChange("sortBy", value)}
                >
                  <SelectTrigger id="sortFilter" className="w-full sm:w-[180px] h-12 border-3 border-sophera-text-heading rounded-lg bg-sophera-bg-card">
                    <SortAscIcon className="h-5 w-5 mr-2 text-sophera-text-subtle" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="border-3 border-sophera-text-heading rounded-lg bg-sophera-bg-card">
                    <SelectGroup>
                      <SelectItem value="date">Date (Soonest First)</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </NeoCardContent>
      </NeoCard>

      <Tabs defaultValue="active" className="w-full" onValueChange={(value) => handleFilterChange("status", value)}>
        <TabsList className="grid w-full grid-cols-3 h-auto p-1.5 border-3 border-sophera-text-heading rounded-xl gap-1.5 mb-8 md:mb-10 bg-white">
          <TabsTrigger 
            value="active" 
            className="text-base data-[state=active]:bg-sophera-brand-primary data-[state=active]:text-white data-[state=active]:border-sophera-text-heading rounded-lg h-12 flex items-center justify-center gap-2 font-bold"
          >
            <CircleDotDashed className="h-5 w-5"/>
            Active 
            <Badge className="ml-1.5 h-6 px-2.5 rounded-md bg-white text-sophera-text-heading border-2 border-sophera-text-heading shadow-[0.1rem_0.1rem_0_#05060f] font-bold">{activeItems.length}</Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="completed" 
            className="text-base data-[state=active]:bg-sophera-brand-primary data-[state=active]:text-white data-[state=active]:border-sophera-text-heading rounded-lg h-12 flex items-center justify-center gap-2 font-bold"
          >
            <CheckCircle2 className="h-5 w-5"/>
            Completed
            <Badge className="ml-1.5 h-6 px-2.5 rounded-md bg-white text-sophera-text-heading border-2 border-sophera-text-heading shadow-[0.1rem_0.1rem_0_#05060f] font-bold">{completedItems.length}</Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="all" 
            className="text-base data-[state=active]:bg-sophera-brand-primary data-[state=active]:text-white data-[state=active]:border-sophera-text-heading rounded-lg h-12 flex items-center justify-center gap-2 font-bold"
          >
            <ListFilter className="h-5 w-5"/>
            All Items
            <Badge className="ml-1.5 h-6 px-2.5 rounded-md bg-white text-sophera-text-heading border-2 border-sophera-text-heading shadow-[0.1rem_0.1rem_0_#05060f] font-bold">{filteredAndSortedItems.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-12 w-12 border-4 border-sophera-brand-primary border-t-transparent rounded-full"></div>
            </div>
          ) : isError ? (
            <NeoCard className="h-auto">
              <NeoCardContent className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 rounded-full bg-red-100 border-3 border-sophera-text-heading shadow-[0.2rem_0.2rem_0_#05060f]">
                    <AlertTriangle className="h-10 w-10 text-red-600" />
                  </div>
                  <h3 className="text-xl font-extrabold text-sophera-text-heading mt-2">UNABLE TO LOAD ACTIVE PLAN ITEMS</h3>
                  <p className="text-sophera-text-body text-base max-w-md">
                    Please check your connection and try again.
                  </p>
                  <NeoButton 
                    buttonText="Retry"
                    color="cyan"
                    className="mt-4"
                  />
                </div>
              </NeoCardContent>
            </NeoCard>
          ) : (
            renderPlanItems(activeItems)
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-12 w-12 border-4 border-sophera-brand-primary border-t-transparent rounded-full"></div>
            </div>
          ) : isError ? (
            <NeoCard className="h-auto">
              <NeoCardContent className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 rounded-full bg-red-100 border-3 border-sophera-text-heading shadow-[0.2rem_0.2rem_0_#05060f]">
                    <AlertTriangle className="h-10 w-10 text-red-600" />
                  </div>
                  <h3 className="text-xl font-extrabold text-sophera-text-heading mt-2">UNABLE TO LOAD COMPLETED PLAN ITEMS</h3>
                  <p className="text-sophera-text-body text-base max-w-md">
                    Please check your connection and try again.
                  </p>
                  <NeoButton 
                    buttonText="Retry"
                    color="cyan"
                    className="mt-4"
                  />
                </div>
              </NeoCardContent>
            </NeoCard>
          ) : (
            renderPlanItems(completedItems)
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-12 w-12 border-4 border-sophera-brand-primary border-t-transparent rounded-full"></div>
            </div>
          ) : isError ? (
            <NeoCard className="h-auto">
              <NeoCardContent className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 rounded-full bg-red-100 border-3 border-sophera-text-heading shadow-[0.2rem_0.2rem_0_#05060f]">
                    <AlertTriangle className="h-10 w-10 text-red-600" />
                  </div>
                  <h3 className="text-xl font-extrabold text-sophera-text-heading mt-2">UNABLE TO LOAD PLAN ITEMS</h3>
                  <p className="text-sophera-text-body text-base max-w-md">
                    Please check your connection and try again.
                  </p>
                  <NeoButton 
                    buttonText="Retry"
                    color="cyan"
                    className="mt-4"
                  />
                </div>
              </NeoCardContent>
            </NeoCard>
          ) : (
            renderPlanItems(filteredAndSortedItems)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}