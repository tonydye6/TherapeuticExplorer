import { useState } from "react";
import { useDietLogs } from "@/hooks/use-diet-logs";
import { DietLog } from "@shared/schema";
import { DietLogCard } from "@/components/diet/DietLogCard";
import { DietLogDialog } from "@/components/diet/DietLogDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Search, Utensils } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface DietLogsPageProps {
  inTabView?: boolean;
}

export default function DietLogsPage({ inTabView = false }: DietLogsPageProps) {
  const { dietLogs, isLoading, createDietLog, updateDietLog, deleteDietLog, isCreating, isUpdating, isDeleting } = useDietLogs();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDietLog, setEditingDietLog] = useState<DietLog | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState<number | null>(null);

  // Handle creating a new diet log
  const handleCreateLog = (data: any) => {
    createDietLog(data);
    setIsDialogOpen(false);
  };

  // Handle updating an existing diet log
  const handleUpdateLog = (data: any) => {
    if (editingDietLog) {
      updateDietLog({ id: editingDietLog.id, data });
      setEditingDietLog(null);
      setIsDialogOpen(false);
    }
  };

  // Handle opening the edit dialog
  const handleEdit = (dietLog: DietLog) => {
    setEditingDietLog(dietLog);
    setIsDialogOpen(true);
  };

  // Handle initiating the delete process
  const handleDeleteInitiate = (id: number) => {
    setLogToDelete(id);
    setDeleteConfirmOpen(true);
  };

  // Handle confirming the delete
  const handleDeleteConfirm = () => {
    if (logToDelete !== null) {
      deleteDietLog(logToDelete);
      setLogToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };

  // Filter diet logs based on search query
  const filteredLogs = !dietLogs ? [] : dietLogs.filter((log) => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    return (
      log.mealType.toLowerCase().includes(lowerCaseQuery) ||
      (log.notes && log.notes.toLowerCase().includes(lowerCaseQuery)) ||
      (log.foods && log.foods.some(item => item.toLowerCase().includes(lowerCaseQuery)))
    );
  });

  return (
    <div className={inTabView ? "" : "container py-6 space-y-6"}>
      {!inTabView && (
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Diet Logs</h1>
            <p className="text-gray-500">
              Track your meals, nutrition, and how different foods affect your health.
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Meal
          </Button>
        </div>
      )}
      
      {inTabView && (
        <div className="flex justify-end mb-4">
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Meal
          </Button>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search meals, food items, or notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-gray-500">Loading diet logs...</p>
        </div>
      ) : filteredLogs.length > 0 ? (
        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <DietLogCard
              key={log.id}
              dietLog={log}
              onEdit={handleEdit}
              onDelete={handleDeleteInitiate}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Utensils className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium">
            {searchQuery ? "No matching meal entries found" : "No meal entries yet"}
          </h3>
          <p className="text-gray-500 mt-1 max-w-md">
            {searchQuery
              ? "Try adjusting your search terms or clear the search to see all entries."
              : "Start tracking your meals, nutrition information, and how different foods affect your health."}
          </p>
          {searchQuery ? (
            <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>Clear Search</Button>
          ) : (
            <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Log Your First Meal
            </Button>
          )}
        </div>
      )}

      {/* Diet Log Dialog for Create/Edit */}
      <DietLogDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={editingDietLog ? handleUpdateLog : handleCreateLog}
        initialData={editingDietLog || undefined}
        isLoading={isCreating || isUpdating}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this meal entry
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
