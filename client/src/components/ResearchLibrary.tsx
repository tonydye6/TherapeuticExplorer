import React, { useState } from "react";
import { Search, Filter, BookOpen, FileText, Beaker, Building, Calendar, Tag, Plus, X, Trash2, Check, Edit2 } from "lucide-react";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Define research item types
export type ResearchSource = {
  title: string;
  url?: string;
  type: string;
  date?: string;
  author?: string;
};

export type ResearchItem = {
  id: number;
  title: string;
  dateAdded: string;
  content: string;
  sources: ResearchSource[];
  tags: string[];
  category: string;
  isFavorite: boolean;
  notes?: string;
};

export type Collection = {
  id: number;
  name: string;
  description?: string;
  itemCount: number;
  items: number[]; // IDs of research items in the collection
};

type ResearchLibraryProps = {
  researchItems: ResearchItem[];
  collections: Collection[];
  onAddToCollection?: (itemId: number, collectionId: number) => Promise<void>;
  onCreateCollection?: (name: string, description?: string) => Promise<Collection>;
  onDeleteItem?: (itemId: number) => Promise<void>;
  onToggleFavorite?: (itemId: number) => Promise<void>;
  onAddNote?: (itemId: number, note: string) => Promise<void>;
  onAddTag?: (itemId: number, tag: string) => Promise<void>;
  onRemoveTag?: (itemId: number, tag: string) => Promise<void>;
};

export default function ResearchLibrary({
  researchItems = [],
  collections = [],
  onAddToCollection,
  onCreateCollection,
  onDeleteItem,
  onToggleFavorite,
  onAddNote,
  onAddTag,
  onRemoveTag
}: ResearchLibraryProps) {
  // State for search and filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSourceType, setSelectedSourceType] = useState<string | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // State for managing dialogs
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [isNewCollectionDialogOpen, setIsNewCollectionDialogOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDescription, setNewCollectionDescription] = useState("");
  const [isAddToCollectionDialogOpen, setIsAddToCollectionDialogOpen] = useState(false);
  const [itemToAddToCollection, setItemToAddToCollection] = useState<number | null>(null);
  
  // State for note and tag editing
  const [newTag, setNewTag] = useState("");
  const [noteText, setNoteText] = useState("");
  const [isEditingNote, setIsEditingNote] = useState(false);
  
  // Helper functions for filtering research items
  const filteredItems = researchItems.filter(item => {
    // Filter by search term
    const matchesSearch = 
      searchTerm === "" || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by category
    const matchesCategory = 
      selectedCategory === null || 
      item.category === selectedCategory;
    
    // Filter by source type
    const matchesSourceType = 
      selectedSourceType === null || 
      item.sources.some(source => source.type === selectedSourceType);
    
    // Filter by collection
    const matchesCollection = 
      selectedCollection === null || 
      collections.find(c => c.id === selectedCollection)?.items.includes(item.id);
    
    // Filter by tags
    const matchesTags = 
      selectedTags.length === 0 || 
      selectedTags.every(tag => item.tags.includes(tag));
    
    return matchesSearch && matchesCategory && matchesSourceType && matchesCollection && matchesTags;
  });
  
  // Helper to get unique categories, source types, and tags for filtering
  const categories = Array.from(new Set(researchItems.map(item => item.category)));
  const sourceTypes = Array.from(new Set(researchItems.flatMap(item => item.sources.map(source => source.type))));
  const allTags = Array.from(new Set(researchItems.flatMap(item => item.tags)));
  
  // Helper to get selected item details
  const selectedItem = selectedItemId ? researchItems.find(item => item.id === selectedItemId) : null;
  
  // Helper to format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  // Get the source type icon
  const getSourceTypeIcon = (sourceType: string) => {
    switch (sourceType.toLowerCase()) {
      case 'clinical trial':
        return <Building className="h-4 w-4" />;
      case 'journal':
        return <FileText className="h-4 w-4" />;
      case 'study':
        return <Beaker className="h-4 w-4" />;
      case 'book':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };
  
  // Create a new collection
  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    
    try {
      if (onCreateCollection) {
        const newCollection = await onCreateCollection(newCollectionName, newCollectionDescription);
        setNewCollectionName("");
        setNewCollectionDescription("");
        setIsNewCollectionDialogOpen(false);
      }
    } catch (error) {
      console.error("Error creating collection:", error);
    }
  };
  
  // Add an item to a collection
  const handleAddToCollection = async (collectionId: number) => {
    if (itemToAddToCollection === null) return;
    
    try {
      if (onAddToCollection) {
        await onAddToCollection(itemToAddToCollection, collectionId);
        setIsAddToCollectionDialogOpen(false);
        setItemToAddToCollection(null);
      }
    } catch (error) {
      console.error("Error adding to collection:", error);
    }
  };
  
  // Handle toggling favorite status
  const handleToggleFavorite = async (itemId: number) => {
    try {
      if (onToggleFavorite) {
        await onToggleFavorite(itemId);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };
  
  // Handle deleting an item
  const handleDeleteItem = async (itemId: number) => {
    try {
      if (onDeleteItem) {
        await onDeleteItem(itemId);
        if (selectedItemId === itemId) {
          setIsDetailDialogOpen(false);
          setSelectedItemId(null);
        }
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };
  
  // Handle saving a note
  const handleSaveNote = async () => {
    if (!selectedItemId || !noteText.trim()) return;
    
    try {
      if (onAddNote) {
        await onAddNote(selectedItemId, noteText);
        setIsEditingNote(false);
      }
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };
  
  // Handle adding a tag
  const handleAddTag = async () => {
    if (!selectedItemId || !newTag.trim()) return;
    
    try {
      if (onAddTag) {
        await onAddTag(selectedItemId, newTag);
        setNewTag("");
      }
    } catch (error) {
      console.error("Error adding tag:", error);
    }
  };
  
  // Handle removing a tag
  const handleRemoveTag = async (tag: string) => {
    if (!selectedItemId) return;
    
    try {
      if (onRemoveTag) {
        await onRemoveTag(selectedItemId, tag);
      }
    } catch (error) {
      console.error("Error removing tag:", error);
    }
  };
  
  // Open item detail dialog
  const openItemDetail = (itemId: number) => {
    const item = researchItems.find(item => item.id === itemId);
    if (item) {
      setSelectedItemId(itemId);
      setNoteText(item.notes || "");
      setIsDetailDialogOpen(true);
    }
  };
  
  // Render the research library
  return (
    <div className="research-library w-full">
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search research library..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <div className="p-2">
                <h4 className="text-sm font-medium mb-1">Categories</h4>
                <div className="space-y-1">
                  <DropdownMenuItem onClick={() => setSelectedCategory(null)}>
                    <Check className={cn("h-4 w-4 mr-2", selectedCategory === null ? "opacity-100" : "opacity-0")} />
                    All Categories
                  </DropdownMenuItem>
                  {categories.map(category => (
                    <DropdownMenuItem key={category} onClick={() => setSelectedCategory(category)}>
                      <Check className={cn("h-4 w-4 mr-2", selectedCategory === category ? "opacity-100" : "opacity-0")} />
                      {category}
                    </DropdownMenuItem>
                  ))}
                </div>
                
                <h4 className="text-sm font-medium mt-3 mb-1">Source Types</h4>
                <div className="space-y-1">
                  <DropdownMenuItem onClick={() => setSelectedSourceType(null)}>
                    <Check className={cn("h-4 w-4 mr-2", selectedSourceType === null ? "opacity-100" : "opacity-0")} />
                    All Sources
                  </DropdownMenuItem>
                  {sourceTypes.map(type => (
                    <DropdownMenuItem key={type} onClick={() => setSelectedSourceType(type)}>
                      <Check className={cn("h-4 w-4 mr-2", selectedSourceType === type ? "opacity-100" : "opacity-0")} />
                      {type}
                    </DropdownMenuItem>
                  ))}
                </div>
                
                <h4 className="text-sm font-medium mt-3 mb-1">Collections</h4>
                <div className="space-y-1">
                  <DropdownMenuItem onClick={() => setSelectedCollection(null)}>
                    <Check className={cn("h-4 w-4 mr-2", selectedCollection === null ? "opacity-100" : "opacity-0")} />
                    All Collections
                  </DropdownMenuItem>
                  {collections.map(collection => (
                    <DropdownMenuItem key={collection.id} onClick={() => setSelectedCollection(collection.id)}>
                      <Check className={cn("h-4 w-4 mr-2", selectedCollection === collection.id ? "opacity-100" : "opacity-0")} />
                      {collection.name}
                    </DropdownMenuItem>
                  ))}
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="default" onClick={() => setIsNewCollectionDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Collection
          </Button>
        </div>
      </div>
      
      {/* Active Filters Display */}
      {(selectedCategory || selectedSourceType || selectedCollection || selectedTags.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedCategory && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Category: {selectedCategory}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setSelectedCategory(null)} 
              />
            </Badge>
          )}
          
          {selectedSourceType && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Source: {selectedSourceType}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setSelectedSourceType(null)} 
              />
            </Badge>
          )}
          
          {selectedCollection && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Collection: {collections.find(c => c.id === selectedCollection)?.name}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setSelectedCollection(null)} 
              />
            </Badge>
          )}
          
          {selectedTags.map(tag => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              Tag: {tag}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))} 
              />
            </Badge>
          ))}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs" 
            onClick={() => {
              setSelectedCategory(null);
              setSelectedSourceType(null);
              setSelectedCollection(null);
              setSelectedTags([]);
            }}
          >
            Clear All
          </Button>
        </div>
      )}
      
      {/* Research Items Display */}
      <Tabs defaultValue="grid" className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Research Library</h2>
          <TabsList>
            <TabsTrigger value="grid">Grid</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="collections">Collections</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="grid">
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map(item => (
                <Card key={item.id} className="h-full flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-8 w-8 text-gray-400",
                          item.isFavorite && "text-yellow-400"
                        )}
                        onClick={() => handleToggleFavorite(item.id)}
                      >
                        <svg 
                          width="15"
                          height="15"
                          viewBox="0 0 15 15"
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                          className={cn(item.isFavorite ? "fill-yellow-400" : "fill-none stroke-current")}
                        >
                          <path
                            d="M7.5 1.5L9.54 5.42L14 6.12L10.75 9.21L11.58 13.5L7.5 11.48L3.42 13.5L4.25 9.21L1 6.12L5.46 5.42L7.5 1.5Z"
                            strokeWidth="1.5"
                          />
                        </svg>
                      </Button>
                    </div>
                    <CardDescription>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span className="text-xs">{formatDate(item.dateAdded)}</span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="py-2 flex-grow">
                    <p className="text-sm text-gray-600 line-clamp-3">{item.content}</p>
                    
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {item.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter className="pt-0 flex justify-between items-center">
                    <div className="flex items-center">
                      {item.sources.length > 0 && (
                        <div className="flex items-center text-xs text-gray-500">
                          {getSourceTypeIcon(item.sources[0].type)}
                          <span className="ml-1">{item.sources[0].type}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Plus className="h-3 w-3 mr-1" />
                            Add to
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {collections.length > 0 ? (
                            collections.map(collection => (
                              <DropdownMenuItem 
                                key={collection.id}
                                onClick={() => {
                                  if (onAddToCollection) {
                                    onAddToCollection(item.id, collection.id);
                                  }
                                }}
                              >
                                {collection.name}
                              </DropdownMenuItem>
                            ))
                          ) : (
                            <DropdownMenuItem disabled>No collections</DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => {
                              setItemToAddToCollection(item.id);
                              setIsNewCollectionDialogOpen(true);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            New Collection
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      <Button 
                        variant="secondary"
                        size="sm"
                        onClick={() => openItemDetail(item.id)}
                      >
                        View
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-gray-50">
              <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No research items found</h3>
              <p className="text-gray-500 mt-1">
                {researchItems.length > 0 
                  ? "Try adjusting your filters or search terms"
                  : "Start by saving research articles, studies, or clinical trials"}
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="list">
          {filteredItems.length > 0 ? (
            <div className="space-y-2">
              {filteredItems.map(item => (
                <div 
                  key={item.id} 
                  className="flex items-center p-3 hover:bg-gray-50 rounded-lg border cursor-pointer"
                  onClick={() => openItemDetail(item.id)}
                >
                  <div className="mr-4">
                    {getSourceTypeIcon(item.sources[0]?.type || 'other')}
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="font-medium">{item.title}</h3>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{formatDate(item.dateAdded)}</span>
                      {item.category && (
                        <>
                          <span className="mx-1">•</span>
                          <span>{item.category}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    {item.isFavorite && (
                      <svg 
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        className="fill-yellow-400 mr-2"
                      >
                        <path
                          d="M7.5 1.5L9.54 5.42L14 6.12L10.75 9.21L11.58 13.5L7.5 11.48L3.42 13.5L4.25 9.21L1 6.12L5.46 5.42L7.5 1.5Z"
                        />
                      </svg>
                    )}
                    
                    <Button variant="outline" size="sm" className="ml-2">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-gray-50">
              <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No research items found</h3>
              <p className="text-gray-500 mt-1">
                {researchItems.length > 0 
                  ? "Try adjusting your filters or search terms"
                  : "Start by saving research articles, studies, or clinical trials"}
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="collections">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map(collection => (
              <Card 
                key={collection.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedCollection(collection.id)}
              >
                <CardHeader>
                  <CardTitle>{collection.name}</CardTitle>
                  <CardDescription>
                    {collection.itemCount} items
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {collection.description && (
                    <p className="text-sm text-gray-600 mb-3">{collection.description}</p>
                  )}
                  
                  {/* Display a sample of items in this collection */}
                  {researchItems
                    .filter(item => collection.items.includes(item.id))
                    .slice(0, 3)
                    .map(item => (
                      <div key={item.id} className="text-sm py-1 border-b last:border-0">
                        {item.title}
                      </div>
                    ))}
                </CardContent>
              </Card>
            ))}
            
            {/* Add New Collection Card */}
            <Card 
              className="border-dashed cursor-pointer hover:bg-gray-50"
              onClick={() => setIsNewCollectionDialogOpen(true)}
            >
              <CardContent className="flex flex-col items-center justify-center h-full py-8">
                <div className="rounded-full bg-gray-100 p-3 mb-3">
                  <Plus className="h-6 w-6 text-gray-500" />
                </div>
                <h3 className="font-medium text-gray-900">Create New Collection</h3>
                <p className="text-sm text-gray-500 text-center mt-2">
                  Organize your research by creating custom collections
                </p>
              </CardContent>
            </Card>
          </div>
          
          {collections.length === 0 && (
            <div className="text-center py-12 border rounded-lg bg-gray-50 mt-4">
              <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No collections yet</h3>
              <p className="text-gray-500 mt-1">
                Create collections to organize your research
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsNewCollectionDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Collection
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Item Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <div className="flex justify-between items-start">
              <div className="flex-grow pr-8">
                <DialogTitle className="text-xl">{selectedItem?.title}</DialogTitle>
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  {selectedItem && formatDate(selectedItem.dateAdded)}
                  {selectedItem?.category && (
                    <>
                      <span className="mx-1">•</span>
                      <span>{selectedItem.category}</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8",
                    selectedItem?.isFavorite && "text-yellow-400"
                  )}
                  onClick={() => selectedItem && handleToggleFavorite(selectedItem.id)}
                >
                  <svg 
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className={cn(selectedItem?.isFavorite ? "fill-yellow-400" : "fill-none stroke-current")}
                  >
                    <path
                      d="M7.5 1.5L9.54 5.42L14 6.12L10.75 9.21L11.58 13.5L7.5 11.48L3.42 13.5L4.25 9.21L1 6.12L5.46 5.42L7.5 1.5Z"
                      strokeWidth="1.5"
                    />
                  </svg>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                      if (selectedItem) {
                        setItemToAddToCollection(selectedItem.id);
                        setIsAddToCollectionDialogOpen(true);
                      }
                    }}>
                      Add to Collection
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 text-red-500"
                  onClick={() => selectedItem && handleDeleteItem(selectedItem.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex-grow overflow-hidden grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-4 overflow-y-auto pr-4">
              <ScrollArea className="h-[calc(80vh-220px)]">
                <div className="space-y-6 p-1">
                  {/* Content section */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">CONTENT</h3>
                    <div className="text-gray-900 whitespace-pre-line">
                      {selectedItem?.content}
                    </div>
                  </div>
                  
                  {/* Sources section */}
                  {selectedItem?.sources && selectedItem.sources.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">SOURCES</h3>
                      <div className="space-y-3">
                        {selectedItem.sources.map((source, index) => (
                          <div key={index} className="border rounded-md p-3 bg-gray-50">
                            <div className="flex items-center">
                              {getSourceTypeIcon(source.type)}
                              <span className="text-xs font-medium ml-1 text-gray-500">{source.type}</span>
                            </div>
                            <h4 className="font-medium mt-1">{source.title}</h4>
                            {source.author && <p className="text-sm text-gray-600 mt-1">Author: {source.author}</p>}
                            {source.date && <p className="text-sm text-gray-600">Date: {formatDate(source.date)}</p>}
                            {source.url && (
                              <a 
                                href={source.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800 hover:underline mt-1 inline-block"
                              >
                                View Source
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
            
            {/* Sidebar */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-6 h-[calc(80vh-220px)] overflow-y-auto">
              {/* Tags section */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2 flex justify-between items-center">
                  <span>TAGS</span>
                </h3>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedItem?.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleRemoveTag(tag)} 
                      />
                    </Badge>
                  ))}
                  
                  {selectedItem?.tags.length === 0 && (
                    <span className="text-sm text-gray-500">No tags added yet</span>
                  )}
                </div>
                
                <div className="flex items-center">
                  <Input 
                    type="text" 
                    placeholder="Add a tag..." 
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newTag.trim()) {
                        handleAddTag();
                      }
                    }}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="ml-2"
                    onClick={handleAddTag}
                    disabled={!newTag.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Notes section */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2 flex justify-between items-center">
                  <span>NOTES</span>
                  <Button variant="ghost" size="sm" className="h-7" onClick={() => setIsEditingNote(!isEditingNote)}>
                    {isEditingNote ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Edit2 className="h-4 w-4" />
                    )}
                  </Button>
                </h3>
                
                {isEditingNote ? (
                  <div className="space-y-2">
                    <textarea
                      className="w-full h-32 p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Add your notes here..."
                    />
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setNoteText(selectedItem?.notes || "");
                          setIsEditingNote(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={handleSaveNote}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-md p-3 min-h-[100px] text-sm">
                    {selectedItem?.notes ? (
                      <p className="whitespace-pre-line">{selectedItem.notes}</p>
                    ) : (
                      <p className="text-gray-500 italic">No notes added yet</p>
                    )}
                  </div>
                )}
              </div>
              
              {/* Collections section */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">IN COLLECTIONS</h3>
                <div className="space-y-2">
                  {collections
                    .filter(collection => selectedItem && collection.items.includes(selectedItem.id))
                    .map(collection => (
                      <div key={collection.id} className="bg-white rounded-md p-2 text-sm">
                        {collection.name}
                      </div>
                    ))}
                  
                  {selectedItem && 
                   collections.filter(c => c.items.includes(selectedItem.id)).length === 0 && (
                    <p className="text-sm text-gray-500">Not in any collections</p>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={() => {
                      if (selectedItem) {
                        setItemToAddToCollection(selectedItem.id);
                        setIsAddToCollectionDialogOpen(true);
                      }
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add to Collection
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* New Collection Dialog */}
      <Dialog open={isNewCollectionDialogOpen} onOpenChange={setIsNewCollectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Collection</DialogTitle>
            <DialogDescription>
              Create a new collection to organize your research.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="collectionName" className="block text-sm font-medium text-gray-700 mb-1">
                Collection Name *
              </label>
              <Input
                id="collectionName"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Enter collection name"
              />
            </div>
            
            <div>
              <label htmlFor="collectionDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                id="collectionDescription"
                className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newCollectionDescription}
                onChange={(e) => setNewCollectionDescription(e.target.value)}
                placeholder="Enter a description for this collection"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewCollectionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCollection} disabled={!newCollectionName.trim()}>
              Create Collection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add to Collection Dialog */}
      <Dialog open={isAddToCollectionDialogOpen} onOpenChange={setIsAddToCollectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Collection</DialogTitle>
            <DialogDescription>
              Choose a collection to add this research item to.
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {collections.length > 0 ? (
              collections.map(collection => (
                <div 
                  key={collection.id} 
                  className="flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleAddToCollection(collection.id)}
                >
                  <div className="mr-3">
                    <BookOpen className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <h4 className="font-medium">{collection.name}</h4>
                    {collection.description && (
                      <p className="text-sm text-gray-500">{collection.description}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">No collections created yet</p>
              </div>
            )}
          </div>
          
          <div className="pt-2 border-t">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setIsNewCollectionDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Collection
            </Button>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddToCollectionDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}