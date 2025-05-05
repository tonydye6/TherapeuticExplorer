import { useState } from "react";
import { useJournalLogs } from "@/hooks/use-journal-logs";
import { JournalLog } from "@shared/schema";
import { JournalLogCard } from "@/components/journal/JournalLogCard";
import { JournalLogDialog } from "@/components/journal/JournalLogDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Search, FileText } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function JournalLogsPage() {
  const { journalLogs, isLoading, createJournalLog, updateJournalLog, deleteJournalLog, isCreating, isUpdating, isDeleting } = useJournalLogs();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJournalLog, setEditingJournalLog] = useState<JournalLog | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState<number | null>(null);

  // Handle creating a new journal log
  const handleCreateLog = (data: any) => {
    createJournalLog(data);
    setIsDialogOpen(false);
  };

  // Handle updating an existing journal log
  const handleUpdateLog = (data: any) => {
    if (editingJournalLog) {
      updateJournalLog({ id: editingJournalLog.id, data });
      setEditingJournalLog(null);
      setIsDialogOpen(false);
    }
  };

  // Handle opening the edit dialog
  const handleEdit = (journalLog: JournalLog) => {
    setEditingJournalLog(journalLog);
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
      deleteJournalLog(logToDelete);
      setLogToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };

  // Filter journal logs based on search query
  const filteredLogs = !journalLogs ? [] : journalLogs.filter((log) => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    return (
      log.content.toLowerCase().includes(lowerCaseQuery) ||
      log.mood.toLowerCase().includes(lowerCaseQuery) ||
      (log.symptoms && log.symptoms.some(symptom => symptom.toLowerCase().includes(lowerCaseQuery))) ||
      (log.medication && log.medication.some(med => med.toLowerCase().includes(lowerCaseQuery)))
    );
  });

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Journal Logs</h1>
          <p className="text-gray-500">
            Record and track how you're feeling, your symptoms, and your daily experiences.
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Entry
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search journal entries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-gray-500">Loading journal logs...</p>
        </div>
      ) : filteredLogs.length > 0 ? (
        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <JournalLogCard
              key={log.id}
              journalLog={log}
              onEdit={handleEdit}
              onDelete={handleDeleteInitiate}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <FileText className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium">
            {searchQuery ? "No matching journal entries found" : "No journal entries yet"}
          </h3>
          <p className="text-gray-500 mt-1 max-w-md">
            {searchQuery
              ? "Try adjusting your search terms or clear the search to see all entries."
              : "Start tracking how you feel, your symptoms, and your daily experiences by creating your first journal entry."}
          </p>
          {searchQuery ? (
            <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>Clear Search</Button>
          ) : (
            <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Entry
            </Button>
          )}
        </div>
      )}

      {/* Journal Log Dialog for Create/Edit */}
      <JournalLogDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={editingJournalLog ? handleUpdateLog : handleCreateLog}
        initialData={editingJournalLog || undefined}
        isLoading={isCreating || isUpdating}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this journal entry
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
