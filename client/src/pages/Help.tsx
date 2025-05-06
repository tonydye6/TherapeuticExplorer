import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertCircle, BookOpen, Info, Search, HelpCircle, MessageSquare, Play, Mail } from "lucide-react";

export default function Help() {
  const [searchQuery, setSearchQuery] = useState("");

  // Sample FAQ data
  const faqItems = [
    {
      question: "What is Sophera and how does it work?",
      answer: "Sophera (formerly THRIVE) is a human-centric AI healing companion designed specifically for cancer patients. It uses advanced AI models to help you research your condition, understand treatment options, find clinical trials, and organize your medical information in a compassionate way. Sophera connects to medical databases like PubMed and ClinicalTrials.gov to provide you with accurate, up-to-date information while focusing on the human elements of your healing journey."
    },
    {
      question: "How accurate is the information Sophera provides?",
      answer: "Sophera sources information from reputable medical databases and research publications. However, it's important to remember that Sophera is a healing companion and research tool, not a replacement for professional medical advice. Always consult with your healthcare providers before making medical decisions based on any information provided by Sophera."
    },
    {
      question: "Is my medical information secure?",
      answer: "Yes, security and privacy are top priorities. Your personal medical information is encrypted and stored securely. Sophera does not share your information with third parties without your explicit consent. You can review and adjust your privacy settings at any time in the Settings & Profile section."
    },
    {
      question: "How do I upload medical documents?",
      answer: "Navigate to the 'My Documents' section and click the 'Upload' button. You can upload various document types including lab reports, imaging results, and clinical notes. Sophera can analyze these documents to extract key information, but this is optional and you can choose to simply store them for reference."
    },
    {
      question: "How does clinical trial matching work?",
      answer: "Sophera compares your profile information (diagnosis, stage, treatment history, etc.) with eligibility criteria from thousands of active clinical trials. The system calculates a match score based on how well you meet the trial's requirements. You can explore matches in the Clinical Trials section and adjust filters to find trials that might be right for you."
    },
    {
      question: "Can I save and organize research information?",
      answer: "Yes, you can save any research information, treatments, or clinical trials you find interesting. Access your saved items in the 'Saved Research' section where you can organize them into collections, add notes, and export information to share with your healthcare team."
    },
    {
      question: "What AI models power Sophera?",
      answer: "Sophera utilizes multiple AI models including Claude, GPT-4o, and Gemini, selecting the optimal model based on your specific query type. For example, Claude excels at medical literature analysis and emotional support, while GPT-4o is used for structured data like clinical trial matching. This multi-model approach ensures you get the best possible answers with a human-centric approach."
    }
  ];
  
  // Filter FAQ items based on search query
  const filteredFaqItems = faqItems.filter(
    item => item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
            item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // No tutorials

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
          <p className="text-gray-500 mt-1">Find answers and learn how to make the most of Sophera</p>
        </div>
        
        {/* Search */}
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            className="pl-10"
            placeholder="Search for help topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="faq">
          <TabsList>
            <TabsTrigger value="faq" className="flex items-center gap-1">
              <HelpCircle className="h-4 w-4" />
              FAQs
            </TabsTrigger>
            <TabsTrigger value="guide" className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              User Guide
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              Contact Support
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="faq" className="pt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary-800" />
                  Frequently Asked Questions
                </CardTitle>
                <CardDescription>
                  Find answers to common questions about using Sophera
                </CardDescription>
              </CardHeader>
              <CardContent>
                {searchQuery && filteredFaqItems.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium">No results found</p>
                    <p className="text-sm text-gray-500 mt-1">Try a different search term or browse all FAQs</p>
                  </div>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {(searchQuery ? filteredFaqItems : faqItems).map((item, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-gray-700">{item.answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
                
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-center text-gray-500">
                    Can't find what you're looking for? <Button variant="link" className="p-0 h-auto text-primary-800">Contact Support</Button>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          

          
          <TabsContent value="guide" className="pt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary-800" />
                  User Guide
                </CardTitle>
                <CardDescription>
                  Comprehensive documentation on all Sophera features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Getting Started</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-medium flex items-center">
                            <span className="flex h-6 w-6 rounded-full bg-primary-100 text-primary-800 text-xs items-center justify-center mr-2">1</span>
                            Setting Up Your Profile
                          </h4>
                          <p className="text-sm text-gray-500 mt-2">
                            Complete your personal and medical profile to get the most personalized experience.
                          </p>
                          <Button variant="link" className="p-0 h-auto text-primary-800 mt-2">
                            Read More →
                          </Button>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-medium flex items-center">
                            <span className="flex h-6 w-6 rounded-full bg-primary-100 text-primary-800 text-xs items-center justify-center mr-2">2</span>
                            Using the Research Assistant
                          </h4>
                          <p className="text-sm text-gray-500 mt-2">
                            Learn how to ask effective questions and get the most helpful responses.
                          </p>
                          <Button variant="link" className="p-0 h-auto text-primary-800 mt-2">
                            Read More →
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Key Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-medium">Research & Analysis</h4>
                          <ul className="mt-2 space-y-1 text-sm text-gray-600">
                            <li className="flex items-start">
                              <span className="flex-shrink-0 text-primary-800 mr-2">•</span>
                              Medical Literature Search
                            </li>
                            <li className="flex items-start">
                              <span className="flex-shrink-0 text-primary-800 mr-2">•</span>
                              Treatment Comparison
                            </li>
                            <li className="flex items-start">
                              <span className="flex-shrink-0 text-primary-800 mr-2">•</span>
                              Evidence Quality Assessment
                            </li>
                          </ul>
                          <Button variant="link" className="p-0 h-auto text-primary-800 mt-2">
                            Read More →
                          </Button>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-medium">Treatment Tracking</h4>
                          <ul className="mt-2 space-y-1 text-sm text-gray-600">
                            <li className="flex items-start">
                              <span className="flex-shrink-0 text-primary-800 mr-2">•</span>
                              Treatment Timeline
                            </li>
                            <li className="flex items-start">
                              <span className="flex-shrink-0 text-primary-800 mr-2">•</span>
                              Side Effect Monitoring
                            </li>
                            <li className="flex items-start">
                              <span className="flex-shrink-0 text-primary-800 mr-2">•</span>
                              Effectiveness Metrics
                            </li>
                          </ul>
                          <Button variant="link" className="p-0 h-auto text-primary-800 mt-2">
                            Read More →
                          </Button>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-medium">Document Management</h4>
                          <ul className="mt-2 space-y-1 text-sm text-gray-600">
                            <li className="flex items-start">
                              <span className="flex-shrink-0 text-primary-800 mr-2">•</span>
                              Medical Document Upload
                            </li>
                            <li className="flex items-start">
                              <span className="flex-shrink-0 text-primary-800 mr-2">•</span>
                              Automatic Information Extraction
                            </li>
                            <li className="flex items-start">
                              <span className="flex-shrink-0 text-primary-800 mr-2">•</span>
                              Document Organization
                            </li>
                          </ul>
                          <Button variant="link" className="p-0 h-auto text-primary-800 mt-2">
                            Read More →
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Additional Resources</h3>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">Complete User Manual</h4>
                            <p className="text-sm text-gray-500">Comprehensive documentation of all Sophera features</p>
                          </div>
                          <Button className="bg-primary-800 hover:bg-primary-900">
                            <BookOpen className="h-4 w-4 mr-2" />
                            Download PDF
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="contact" className="pt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary-800" />
                  Contact Support
                </CardTitle>
                <CardDescription>
                  Need help? Our support team is ready to assist you.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <h3 className="text-lg font-medium mb-4">Contact Options</h3>
                  <div className="space-y-4">
                    <div className="flex items-start p-4 border rounded-lg">
                      <Mail className="h-5 w-5 text-primary-800 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Email Support</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Send us an email and we'll respond within 24 hours
                        </p>
                        <Button variant="link" className="p-0 h-auto text-primary-800 mt-1">
                          tony@sparqgames.com
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start">
                        <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-800">Important Reminder</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            For medical emergencies, please contact your healthcare provider or dial emergency services immediately. Sophera is a healing companion and research tool, not a substitute for professional medical advice.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
