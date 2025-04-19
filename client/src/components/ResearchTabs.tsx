import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BookOpen, BarChart2, Compass, Beaker, ShieldCheck } from "lucide-react";

type ResearchTheme = {
  theme: string;
  evidence_summary: string;
  research_quality: "high" | "medium" | "low";
  consensus_level: string;
};

type ResearchComparison = {
  aspect: string;
  approach_a: string;
  approach_b: string;
  comparative_analysis: string;
};

export type DeepResearchContent = {
  synthesis: string;
  key_themes?: ResearchTheme[];
  comparisons?: ResearchComparison[];
  knowledge_gaps?: string[];
  sources?: {
    title: string;
    authors?: string;
    journal?: string;
    year?: string;
    key_contribution?: string;
  }[];
};

interface ResearchTabsProps {
  content: DeepResearchContent;
}

export default function ResearchTabs({ content }: ResearchTabsProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Extract data from the formatted content
  const { synthesis, key_themes = [], comparisons = [], knowledge_gaps = [], sources = [] } = content;

  // Determine which tabs to show based on available data
  const hasThemes = key_themes.length > 0;
  const hasComparisons = comparisons.length > 0;
  const hasGaps = knowledge_gaps.length > 0;
  const hasSources = sources.length > 0;

  return (
    <Tabs defaultValue="overview" className="w-full mt-4" onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview" className="text-xs">
          <BookOpen className="h-3 w-3 mr-1" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="themes" disabled={!hasThemes} className="text-xs">
          <BarChart2 className="h-3 w-3 mr-1" />
          Key Themes
        </TabsTrigger>
        <TabsTrigger value="comparisons" disabled={!hasComparisons} className="text-xs">
          <Compass className="h-3 w-3 mr-1" />
          Comparisons
        </TabsTrigger>
        <TabsTrigger value="gaps" disabled={!hasGaps} className="text-xs">
          <Beaker className="h-3 w-3 mr-1" />
          Research Gaps
        </TabsTrigger>
        <TabsTrigger value="sources" disabled={!hasSources} className="text-xs">
          <ShieldCheck className="h-3 w-3 mr-1" />
          Sources
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="mt-2">
        <Card>
          <CardHeader className="p-3">
            <CardTitle className="text-sm">Research Synthesis</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 text-sm">
            <p>{synthesis}</p>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="themes" className="mt-2">
        <Card>
          <CardHeader className="p-3">
            <CardTitle className="text-sm">Key Research Themes</CardTitle>
            <CardDescription className="text-xs">
              Major patterns and findings across multiple studies
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="space-y-3">
              {key_themes.map((theme, index) => (
                <div key={index} className="p-3 rounded border text-sm">
                  <h4 className="font-medium mb-2">{theme.theme}</h4>
                  <p className="text-sm text-gray-600 mb-1">{theme.evidence_summary}</p>
                  <div className="flex space-x-3 mt-2 text-xs">
                    <div className={cn(
                      "px-2 py-1 rounded-full",
                      theme.research_quality === "high" && "bg-green-100 text-green-800",
                      theme.research_quality === "medium" && "bg-yellow-100 text-yellow-800",
                      theme.research_quality === "low" && "bg-orange-100 text-orange-800"
                    )}>
                      Evidence: {theme.research_quality}
                    </div>
                    <div className="px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                      Consensus: {theme.consensus_level}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="comparisons" className="mt-2">
        <Card>
          <CardHeader className="p-3">
            <CardTitle className="text-sm">Comparative Analysis</CardTitle>
            <CardDescription className="text-xs">
              Side-by-side comparisons of different approaches or findings
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="space-y-3">
              {comparisons.map((comparison, index) => (
                <div key={index} className="p-3 rounded border text-sm">
                  <h4 className="font-medium mb-2">{comparison.aspect}</h4>
                  <div className="grid md:grid-cols-2 gap-3 mb-3">
                    <div className="bg-blue-50 p-2 rounded">
                      <div className="font-medium text-blue-800 mb-1 text-xs">Approach A</div>
                      <p className="text-sm">{comparison.approach_a}</p>
                    </div>
                    <div className="bg-purple-50 p-2 rounded">
                      <div className="font-medium text-purple-800 mb-1 text-xs">Approach B</div>
                      <p className="text-sm">{comparison.approach_b}</p>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700 mb-1 text-xs">Analysis</div>
                    <p className="text-sm text-gray-600">{comparison.comparative_analysis}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="gaps" className="mt-2">
        <Card>
          <CardHeader className="p-3">
            <CardTitle className="text-sm">Research Gaps</CardTitle>
            <CardDescription className="text-xs">
              Areas where more research is needed
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <ul className="list-disc pl-5 space-y-2 text-sm">
              {knowledge_gaps.map((gap, index) => (
                <li key={index} className="text-gray-700">{gap}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="sources" className="mt-2">
        <Card>
          <CardHeader className="p-3">
            <CardTitle className="text-sm">Research Sources</CardTitle>
            <CardDescription className="text-xs">
              Studies and publications referenced in this analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="space-y-3">
              {sources.map((source, index) => (
                <div key={index} className="border-b pb-2 last:border-b-0 text-sm">
                  <h4 className="font-medium">{source.title}</h4>
                  {source.authors && <p className="text-xs text-gray-600">{source.authors}</p>}
                  <div className="flex text-xs text-gray-500 mt-1">
                    {source.journal && <span className="mr-3">{source.journal}</span>}
                    {source.year && <span>{source.year}</span>}
                  </div>
                  {source.key_contribution && (
                    <p className="mt-1 text-xs italic">{source.key_contribution}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}