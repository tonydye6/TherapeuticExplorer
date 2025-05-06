import React, { useState } from 'react';
import { useHopeSnippets } from '@/hooks/use-hope-snippets';
import { HopeSnippetCard } from '@/components/hope/HopeSnippetCard';
import { HopeSnippetDialog } from '@/components/hope/HopeSnippetDialog';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { PlusIcon, SearchIcon, RefreshCwIcon } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { HopeSuggest } from '@/components/hope/HopeSuggest';
import { toast } from '@/hooks/use-toast';

// Define categories
const CATEGORIES = [
  "All",
  "Quote",
  "Affirmation",
  "Story",
  "Poem",
  "Research",
  "Testimony",
  "Encouragement",
  "Other"
];

interface HopeSnippetsPageProps {
  inTabView?: boolean;
}

export default function HopeSnippetsPage({ inTabView }: HopeSnippetsPageProps) {
  const {
    snippets,
    isLoading,
    refetch,
    createSnippet,
    updateSnippet,
    deleteSnippet,
    isCreating,
    isUpdating,
    isDeleting,
    selectedCategory,
    setSelectedCategory,
    randomSnippet,
    refetchRandom
  } = useHopeSnippets();

  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<any>(null);
  const [snippetToDelete, setSnippetToDelete] = useState<number | null>(null);

  // Filter snippets by search term and category
  const filteredSnippets = React.useMemo(() => {
    if (!snippets?.length) return [];
    
    return snippets.filter(snippet => {
      const matchesSearch = searchTerm ? (
        snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        snippet.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (snippet.author && snippet.author.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (snippet.source && snippet.source.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (snippet.tags && snippet.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      ) : true;
      
      const matchesCategory = !selectedCategory || selectedCategory === "All" ? 
        true : 
        snippet.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [snippets, searchTerm, selectedCategory]);

  const handleOpenDialog = (snippet?: any) => {
    setEditingSnippet(snippet || null);
    setOpenDialog(true);
  };

  const handleDeleteClick = (id: number) => {
    setSnippetToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (snippetToDelete !== null) {
      try {
        await deleteSnippet(snippetToDelete);
        setOpenDeleteDialog(false);
        setSnippetToDelete(null);
        toast({
          title: "Success",
          description: "Hope snippet deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting snippet:", error);
      }
    }
  };

  const handleSaveSnippet = async (data: any) => {
    try {
      if (editingSnippet) {
        await updateSnippet({
          id: editingSnippet.id,
          ...data
        });
      } else {
        await createSnippet(data);
      }
      setOpenDialog(false);
      setEditingSnippet(null);
    } catch (error) {
      console.error("Error saving snippet:", error);
    }
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === "All" ? null : value);
  };
  
  return (
    <div className={`space-y-6 ${!inTabView ? 'container py-6' : ''}`}>
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hope Snippets</h1>
          <p className="text-muted-foreground">
            Inspirational quotes, affirmations, and stories to encourage your healing journey.
          </p>
        </div>

        <div className="space-y-2">
          <Button onClick={() => handleOpenDialog()} className="w-full md:w-auto">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Snippet
          </Button>
          <div className="flex justify-between">
            <Button 
              variant="ghost" 
              size="icon"
              className="flex-shrink-0"
              onClick={() => refetch()}
              title="Refresh snippets"
            >
              <RefreshCwIcon className="h-4 w-4" />
            </Button>
            <div className="flex gap-2">
              <div className="relative">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-full md:w-[200px] pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedCategory || "All"} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {!isLoading && randomSnippet && filteredSnippets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <p className="text-muted-foreground mb-4">
            No snippets found matching your search.
          </p>
          <Button variant="outline" onClick={() => {
            setSearchTerm('');
            setSelectedCategory(null);
          }}>
            Clear filters
          </Button>
        </div>
      )}

      {/* Featured Snippet */}
      {!searchTerm && (!selectedCategory || selectedCategory === "All") && randomSnippet && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Daily Inspiration</h2>
          <HopeSuggest />
        </div>
      )}

      {/* Grid of Snippets */}
      {filteredSnippets.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-3">All Snippets {selectedCategory && selectedCategory !== "All" ? `- ${selectedCategory}` : ''}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSnippets.map((snippet) => (
              <HopeSnippetCard
                key={snippet.id}
                snippet={snippet}
                onEdit={() => handleOpenDialog(snippet)}
                onDelete={() => handleDeleteClick(snippet.id)}
              />
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <div className="space-y-2">
                <div className="h-5 w-2/3 bg-muted rounded animate-pulse" />
                <div className="h-4 w-1/4 bg-muted rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-muted rounded animate-pulse" />
                <div className="h-4 w-full bg-muted rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <HopeSnippetDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        snippet={editingSnippet}
        onSave={handleSaveSnippet}
        isLoading={isCreating || isUpdating}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the hope snippet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
