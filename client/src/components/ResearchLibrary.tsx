import React, { useState } from "react";
import { Search, Filter, Calendar, Book, FileText, Flask, Beaker, Clock, Bookmark, BookmarkCheck, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// Define research item types
export type ResearchSourceType = 
  | "journal" 
  | "book" 
  | "clinical_trial" 
  | "news" 
  | "medical_website"
  | "conference"
  | "other";

export type ResearchItem = {
  id: string;
  title: string;
  sourceType: ResearchSourceType;
  authors?: string[];
  publicationDate?: Date;
  url?: string;
  summary: string;
  keywords?: string[];
  isBookmarked?: boolean;
  addedDate: Date;
  lastViewedDate?: Date;
  notes?: string;
  relevanceScore?: number; // 0-100
};

// Organize research by categories
export type ResearchCollection = {
  id: string;
  name: string;
  description?: string;
  items: ResearchItem[];
};

type ResearchLibraryProps = {
  collections: ResearchCollection[];
  recentItems: ResearchItem[];
  onItemClick: (item: ResearchItem) => void;
  onBookmark: (item: ResearchItem, bookmark: boolean) => void;
  onAddToCollection?: (item: ResearchItem, collectionId: string) => void;
};

export default function ResearchLibrary({
  collections,
  recentItems,
  onItemClick,
  onBookmark,
  onAddToCollection
}: ResearchLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  // Get source icon based on source type
  const getSourceIcon = (sourceType: ResearchSourceType) => {
    switch (sourceType) {
      case "journal":
        return <FileText className="h-5 w-5 text-blue-600" />;
      case "book":
        return <Book className="h-5 w-5 text-purple-600" />;
      case "clinical_trial":
        return <Beaker className="h-5 w-5 text-green-600" />;
      case "news":
        return <Clock className="h-5 w-5 text-orange-600" />;
      case "conference":
        return <Calendar className="h-5 w-5 text-indigo-600" />;
      case "medical_website":
        return <FileText className="h-5 w-5 text-teal-600" />;
      default:
        return <Flask className="h-5 w-5 text-gray-600" />;
    }
  };

  // Format source type for display
  const formatSourceType = (sourceType: ResearchSourceType) => {
    return sourceType
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Filter items based on search query
  const filterItems = (items: ResearchItem[]) => {
    if (!searchQuery.trim()) return items;
    
    const query = searchQuery.toLowerCase();
    return items.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.summary.toLowerCase().includes(query) ||
      item.authors?.some(author => author.toLowerCase().includes(query)) ||
      item.keywords?.some(keyword => keyword.toLowerCase().includes(query))
    );
  };

  // Get items to display based on selected collection or all recent items
  const displayedItems = selectedCollection
    ? filterItems(collections.find(c => c.id === selectedCollection)?.items || [])
    : filterItems(recentItems);

  return (
    <div className="research-library w-full">
      {/* Header and search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Research Library</h2>
        
        <div className="relative w-full md:w-auto">
          <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-300">
            <div className="pl-3 pr-1">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search research..."
              className="w-full md:w-[300px] py-2 px-1 border-none focus:ring-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="pr-3 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchQuery("")}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex items-center space-x-1 overflow-x-auto pb-2">
          <button
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-t-lg",
              activeFilter === null
                ? "text-blue-600 bg-blue-50 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            )}
            onClick={() => setActiveFilter(null)}
          >
            All
          </button>
          
          <button
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-t-lg",
              activeFilter === "journal"
                ? "text-blue-600 bg-blue-50 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            )}
            onClick={() => setActiveFilter("journal")}
          >
            Journals
          </button>
          
          <button
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-t-lg",
              activeFilter === "clinical_trial"
                ? "text-blue-600 bg-blue-50 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            )}
            onClick={() => setActiveFilter("clinical_trial")}
          >
            Clinical Trials
          </button>
          
          <button
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-t-lg",
              activeFilter === "book"
                ? "text-blue-600 bg-blue-50 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            )}
            onClick={() => setActiveFilter("book")}
          >
            Books
          </button>
          
          <button
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-t-lg",
              activeFilter === "bookmarked"
                ? "text-blue-600 bg-blue-50 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50",
              "flex items-center"
            )}
            onClick={() => setActiveFilter("bookmarked")}
          >
            <BookmarkCheck className="mr-1 h-4 w-4" />
            Bookmarked
          </button>
          
          <button
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-t-lg flex items-center",
              activeFilter === "filter"
                ? "text-blue-600 bg-blue-50 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            )}
            onClick={() => setActiveFilter("filter")}
          >
            <Filter className="mr-1 h-4 w-4" />
            More Filters
          </button>
        </div>
      </div>

      {/* Research collections */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Collections</h3>
        
        <div className="grid grid-flow-col auto-cols-max gap-4 overflow-x-auto pb-4">
          {collections.map(collection => (
            <div
              key={collection.id}
              className={cn(
                "min-w-[200px] max-w-[280px] p-4 rounded-lg shadow-sm cursor-pointer transition-all",
                selectedCollection === collection.id
                  ? "bg-blue-50 border border-blue-200"
                  : "bg-white border border-gray-200 hover:bg-gray-50"
              )}
              onClick={() => setSelectedCollection(
                selectedCollection === collection.id ? null : collection.id
              )}
            >
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-gray-900">{collection.name}</h4>
                <span className="text-sm text-gray-500">{collection.items.length}</span>
              </div>
              
              {collection.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {collection.description}
                </p>
              )}
              
              <div className="mt-2 flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {collection.items.length} {collection.items.length === 1 ? 'item' : 'items'}
                </span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Research items */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {selectedCollection 
            ? collections.find(c => c.id === selectedCollection)?.name || "Research Items"
            : "Recent Findings"}
        </h3>
        
        {displayedItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedItems.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onItemClick(item)}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      {getSourceIcon(item.sourceType)}
                      <span className="text-xs font-medium ml-1 text-gray-500">
                        {formatSourceType(item.sourceType)}
                      </span>
                    </div>
                    <button
                      className="text-gray-400 hover:text-yellow-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookmark(item, !item.isBookmarked);
                      }}
                    >
                      <Bookmark
                        className="h-5 w-5"
                        fill={item.isBookmarked ? "currentColor" : "none"}
                      />
                    </button>
                  </div>
                  
                  <h4 className="font-medium text-gray-900 mt-2 line-clamp-2">
                    {item.title}
                  </h4>
                  
                  {item.authors && item.authors.length > 0 && (
                    <p className="text-xs text-gray-600 mt-1">
                      {item.authors.slice(0, 2).join(", ")}
                      {item.authors.length > 2 && " et al."}
                    </p>
                  )}
                  
                  <p className="text-sm text-gray-700 mt-2 line-clamp-3">
                    {item.summary}
                  </p>
                  
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      {item.publicationDate && format(item.publicationDate, "MMM yyyy")}
                    </div>
                    
                    {item.relevanceScore !== undefined && (
                      <div className="flex items-center">
                        <div className="h-2 w-12 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              item.relevanceScore >= 80
                                ? "bg-green-500"
                                : item.relevanceScore >= 50
                                ? "bg-blue-500"
                                : "bg-orange-500"
                            )}
                            style={{ width: `${item.relevanceScore}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 ml-1">
                          {item.relevanceScore}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Flask className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900">No results found</h4>
            <p className="text-gray-500 mt-1">
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}