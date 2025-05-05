import { useState } from "react";
import { usePlanItems } from "@/hooks/use-plan-items";
import { PlanItemCard } from "@/components/PlanItemCard";
import { AddPlanItemDialog } from "@/components/AddPlanItemDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, ListFilter, Search } from "lucide-react";

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
  { value: "exercise", label: "Exercise" },
  { value: "nutrition", label: "Nutrition" },
  { value: "other", label: "Other" },
];

export default function MyPlanPage() {
  const { planItems, isLoading } = usePlanItems();
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    category: "all",
    status: "all",
    sortBy: "date",
  });

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Apply filters and sorting to plan items
  const filteredItems = planItems
    .filter((item) => {
      // Filter by search term
      if (
        filters.search &&
        !item.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !(item.description?.toLowerCase() || '').includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      // Filter by category
      if (filters.category !== "all" && item.category !== filters.category) {
        return false;
      }

      // Filter by status
      if (
        (filters.status === "completed" && !item.isCompleted) ||
        (filters.status === "active" && item.isCompleted)
      ) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Sort by selected sort method
      if (filters.sortBy === "date") {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      } else if (filters.sortBy === "priority") {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return (
          priorityOrder[a.priority as keyof typeof priorityOrder] -
          priorityOrder[b.priority as keyof typeof priorityOrder]
        );
      } else {
        return 0;
      }
    });

  const activeItems = filteredItems.filter((item) => !item.isCompleted);
  const completedItems = filteredItems.filter((item) => item.isCompleted);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Plan</h1>
          <p className="text-gray-600 mt-1">
            Track and manage your treatments, medications, and appointments in one place.
          </p>
        </div>
        <div className="mt-4 lg:mt-0">
          <AddPlanItemDialog />
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search plan items..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-3">
            <Select
              value={filters.category}
              onValueChange={(value) => handleFilterChange("category", value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              value={filters.sortBy}
              onValueChange={(value) => handleFilterChange("sortBy", value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="date">Sort by Date</SelectItem>
                  <SelectItem value="priority">Sort by Priority</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="active" className="flex gap-2">
            <CalendarIcon className="h-4 w-4" />
            Active Items 
            <span className="ml-1 bg-primary-100 text-primary-700 rounded-full px-2 py-0.5 text-xs font-medium">
              {activeItems.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed Items
            <span className="ml-1 bg-gray-100 text-gray-700 rounded-full px-2 py-0.5 text-xs font-medium">
              {completedItems.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="all">All Items</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="px-1">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : activeItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeItems.map((item) => (
                <PlanItemCard key={item.id} planItem={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900">No active plan items</h3>
              <p className="mt-1 text-gray-500">Add a new plan item to get started.</p>
              <div className="mt-5">
                <AddPlanItemDialog trigger={
                  <Button>
                    Add Your First Plan Item
                  </Button>
                } />
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="px-1">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : completedItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedItems.map((item) => (
                <PlanItemCard key={item.id} planItem={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900">No completed plan items</h3>
              <p className="mt-1 text-gray-500">Items will appear here when you mark them as completed.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="px-1">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <PlanItemCard key={item.id} planItem={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900">No plan items found</h3>
              <p className="mt-1 text-gray-500">
                {filters.search || filters.category !== "all"
                  ? "Try changing your search or filter criteria."
                  : "Add a new plan item to get started."}
              </p>
              {!filters.search && filters.category === "all" && (
                <div className="mt-5">
                  <AddPlanItemDialog trigger={
                    <Button>
                      Add Your First Plan Item
                    </Button>
                  } />
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
