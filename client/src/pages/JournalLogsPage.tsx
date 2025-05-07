
// client/src/pages/JournalLogsPage.tsx

import React, { useState, useMemo } from "react";
import { useJournalLogs } from "@/hooks/use-journal-logs";
import { JournalLog, JournalLogEntry } from "@shared/schema";
import { JournalLogCard } from "@/components/journal/JournalLogCard";
import { JournalLogDialog } from "@/components/journal/JournalLogDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Search, FileText as FileTextIcon, Edit3Icon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";

interface JournalLogsPageProps {
  inTabView?: boolean;
}

type JournalLogFormData = Omit<JournalLog, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'date'> & { date: string | Date };

export default function JournalLogsPage({ inTabView = false }: JournalLogsPageProps) {
  const {
    journalLogs,
    isLoading,
    createJournalLog,
    updateJournalLog,
    deleteJournalLog,
    isCreating,
    isUpdating,
    isDeleting,
  } = useJournalLogs();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJournalLog, setEditingJournalLog] = useState<JournalLog | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState<number | null>(null);

  const handleCreateLog = (data: JournalLogFormData) => {
    createJournalLog({
      ...data,
      date: data.date instanceof Date ? data.date.toISOString() : new Date(data.date).toISOString(),
    } as any);
    setIsDialogOpen(false);
    setEditingJournalLog(null);
  };

  const handleUpdateLog = (data: Partial<JournalLogFormData>) => {
    if (editingJournalLog) {
      updateJournalLog({ 
        id: editingJournalLog.id, 
        ...(data.date && { date: data.date instanceof Date ? data.date.toISOString() : new Date(data.date).toISOString() }),
        ...data 
      } as any);
      setEditingJournalLog(null);
      setIsDialogOpen(false);
    }
  };

  const handleEdit = (journalLog: JournalLog) => {
    setEditingJournalLog(journalLog);
    setIsDialogOpen(true);
  };

  const handleDeleteInitiate = (id: number) => {
    setLogToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (logToDelete !== null) {
      deleteJournalLog(logToDelete);
      setLogToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };

  const filteredLogs = useMemo(() => {
    if (!journalLogs) return [];
    return journalLogs.filter((log) => {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const contentMatch = log.content?.toLowerCase().includes(lowerCaseQuery) || false;
      const moodMatch = typeof log.mood === 'string' && log.mood.toLowerCase().includes(lowerCaseQuery);
      const symptomsMatch = Array.isArray(log.symptoms) && log.symptoms.some(symptom => typeof symptom === 'string' && symptom.toLowerCase().includes(lowerCaseQuery));
      const medicationMatch = Array.isArray(log.medication) && log.medication.some(med => typeof med === 'string' && med.toLowerCase().includes(lowerCaseQuery));
      
      return contentMatch || moodMatch || symptomsMatch || medicationMatch;
    });
  }, [journalLogs, searchQuery]);

  const pageTitle = "My Wellness Journal";
  const pageDescription = "Reflect on your days, track symptoms, and note how you're feeling.";

  return (
    <div className={inTabView ? "py-6" : "container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-10 space-y-8 md:space-y-10"}>
      {!inTabView && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-sophera-text-heading flex items-center gap-3">
              <Edit3Icon className="h-8 w-8 lg:h-9 lg:w-9 text-sophera-brand-primary"/>
              {pageTitle}
            </h1>
            <p className="text-lg lg:text-xl text-sophera-text-body mt-1">{pageDescription}</p>
          </div>
          <Button
            onClick={() => { setEditingJournalLog(null); setIsDialogOpen(true); }}
            className="w-full sm:w-auto bg-sophera-accent-secondary text-white rounded-sophera-button py-3 px-6 text-base font-semibold tracking-wide hover:bg-sophera-accent-secondary-hover transform hover:scale-103 transition-all duration-200 ease-in-out shadow-md hover:shadow-lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            New Journal Entry
          </Button>
        </div>
      )}

      {inTabView && (
        <div className="flex justify-end mb-6">
          <Button
            onClick={() => { setEditingJournalLog(null); setIsDialogOpen(true); }}
            size="sm"
            className="bg-sophera-accent-secondary text-white rounded-sophera-button py-2.5 px-4 text-sm font-semibold tracking-wide hover:bg-sophera-accent-secondary-hover transform hover:scale-103 transition-all duration-200 ease-in-out shadow-md hover:shadow-lg"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            New Entry
          </Button>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-sophera-text-subtle pointer-events-none" />
        <Input
          type="search"
          placeholder="Search journal entries by content, mood, or symptoms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-11 pr-4 h-12 rounded-sophera-input text-base w-full bg-sophera-bg-card border-2 border-sophera-border-primary placeholder-sophera-text-subtle focus:border-sophera-brand-primary focus:ring-2 focus:ring-sophera-brand-primary-focusRing shadow-sm"
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] p-4">
          <Loader2 className="h-12 w-12 animate-spin text-sophera-brand-primary mb-4" />
          <h3 className="text-lg font-semibold text-sophera-text-heading">Loading your journal...</h3>
          <p className="text-sophera-text-body">One moment please.</p>
        </div>
      ) : filteredLogs.length > 0 ? (
        <div className="space-y-6">
          {filteredLogs.map((log) => (
            <JournalLogCard
              key={log.id}
              journalLog={log}
              onEdit={() => handleEdit(log)}
              onDelete={() => handleDeleteInitiate(log.id)}
            />
          ))}
        </div>
      ) : (
        <Card className="text-center py-16 md:py-24 bg-sophera-bg-card border border-sophera-border-primary rounded-sophera-card shadow-xl p-6 md:p-10">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-sophera-brand-primary-light rounded-full">
              <Edit3Icon className="h-12 w-12 text-sophera-brand-primary" />
            </div>
            <h3 className="text-xl lg:text-2xl font-semibold text-sophera-text-heading">
              {searchQuery ? "No Matching Journal Entries" : "Your Journal Awaits"}
            </h3>
            <p className="text-sophera-text-body mt-1 max-w-md text-base">
              {searchQuery
                ? "Try different keywords or clear your search to see all entries."
                : "Begin by capturing your thoughts, symptoms, and daily experiences. Your first entry is a step towards deeper understanding."}
            </p>
            {searchQuery ? (
              <Button 
                variant="outline" 
                className="mt-6 rounded-sophera-button border-2 border-sophera-brand-primary text-sophera-brand-primary hover:bg-sophera-brand-primary-light px-6 py-3 text-base" 
                onClick={() => setSearchQuery("")}
              >
                Clear Search
              </Button>
            ) : (
              <Button
                className="mt-6 bg-sophera-accent-secondary text-white rounded-sophera-button py-3 px-6 text-base font-semibold tracking-wide hover:bg-sophera-accent-secondary-hover transform hover:scale-105 transition-all duration-200 ease-in-out shadow-md hover:shadow-lg"
                onClick={() => { setEditingJournalLog(null); setIsDialogOpen(true); }}
              >
                <Plus className="mr-2 h-5 w-5" />
                Create Your First Entry
              </Button>
            )}
          </div>
        </Card>
      )}

      <JournalLogDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingJournalLog(null);
        }}
        onSave={editingJournalLog ? handleUpdateLog : handleCreateLog}
        initialData={editingJournalLog || undefined}
        isLoading={isCreating || isUpdating}
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="rounded-sophera-modal-outer bg-sophera-bg-card shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-sophera-text-heading">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-sophera-text-body pt-2 text-base">
              This action cannot be undone. This will permanently delete this journal entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-5">
            <AlertDialogCancel className="rounded-sophera-button h-11 px-5 text-base">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-sophera-destructive text-white rounded-sophera-button h-11 px-5 text-base hover:bg-red-700"
            >
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isDeleting ? "Deleting..." : "Yes, Delete Entry"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
