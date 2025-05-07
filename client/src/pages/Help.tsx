import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertCircle, BookOpen, Info, Search, HelpCircle, MessageSquare, Play, Mail, ExternalLinkIcon } from "lucide-react";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredFaqItems = faqItems.filter(
    item => item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex flex-col gap-8 md:gap-10">
        <div className="text-center md:text-left">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-sophera-text-heading mb-2">Help & Support</h1>
          <p className="text-lg text-sophera-text-body">
            Find answers, guides, and assistance to make the most of Sophera.
          </p>
        </div>

        <div className="relative max-w-2xl mx-auto md:mx-0">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-sophera-text-subtle pointer-events-none" />
          <Input
            type="search"
            className="pl-12 pr-4 h-14 rounded-sophera-input text-base w-full bg-sophera-bg-card border-2 border-sophera-border-primary placeholder-sophera-text-subtle focus:border-sophera-brand-primary focus:ring-2 focus:ring-sophera-brand-primary-focusRing shadow-sm"
            placeholder="Search help topics, FAQs, or guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs defaultValue="faq" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto p-1.5 bg-sophera-gradient-start rounded-xl shadow-md gap-1.5 mb-8">
            <TabsTrigger value="faq" className="text-base data-[state=active]:bg-sophera-bg-card data-[state=active]:text-sophera-brand-primary data-[state=active]:shadow-lg rounded-lg h-12 flex items-center justify-center gap-2 font-medium transition-all">
              <HelpCircle className="h-5 w-5" /> FAQs
            </TabsTrigger>
            <TabsTrigger value="guide" className="text-base data-[state=active]:bg-sophera-bg-card data-[state=active]:text-sophera-brand-primary data-[state=active]:shadow-lg rounded-lg h-12 flex items-center justify-center gap-2 font-medium transition-all">
              <BookOpen className="h-5 w-5" /> User Guide
            </TabsTrigger>
            <TabsTrigger value="contact" className="text-base data-[state=active]:bg-sophera-bg-card data-[state=active]:text-sophera-brand-primary data-[state=active]:shadow-lg rounded-lg h-12 flex items-center justify-center gap-2 font-medium transition-all">
              <MessageSquare className="h-5 w-5" /> Contact Support
            </TabsTrigger>
          </TabsList>

          <TabsContent value="faq" className="pt-2">
            <Card className="bg-sophera-bg-card border border-sophera-border-primary rounded-sophera-card shadow-xl">
              <CardHeader className="p-6 border-b border-sophera-border-primary">
                <CardTitle className="text-xl lg:text-2xl font-semibold text-sophera-text-heading flex items-center gap-2.5">
                  <HelpCircle className="h-6 w-6 text-sophera-brand-primary" />
                  Frequently Asked Questions
                </CardTitle>
                <CardDescription className="text-sophera-text-body pt-1">
                  Find quick answers to common questions about using Sophera.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {searchQuery && filteredFaqItems.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="h-16 w-16 mx-auto mb-5 text-sophera-text-subtle/80" />
                    <p className="text-xl font-semibold text-sophera-text-heading">No FAQs Found</p>
                    <p className="text-sophera-text-body mt-2">No questions match your search for "{searchQuery}".</p>
                    <Button variant="outline" onClick={() => setSearchQuery("")} className="mt-6 rounded-sophera-button border-sophera-brand-primary text-sophera-brand-primary hover:bg-sophera-brand-primary-light">
                        Clear Search & View All FAQs
                    </Button>
                  </div>
                ) : (
                  <Accordion type="single" collapsible className="w-full space-y-3">
                    {(searchQuery ? filteredFaqItems : faqItems).map((item, index) => (
                      <AccordionItem key={index} value={`item-${index}`} className="border border-sophera-border-primary rounded-xl bg-sophera-gradient-start/50 overflow-hidden">
                        <AccordionTrigger className="text-left font-medium text-sophera-text-heading hover:no-underline px-5 py-4 text-base hover:bg-sophera-brand-primary-light/50 transition-colors">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="px-5 py-4 text-sophera-text-body bg-sophera-bg-card/50">
                          <p className="leading-relaxed">{item.answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
                <div className="mt-10 pt-8 border-t border-sophera-border-primary/70">
                  <p className="text-center text-sophera-text-body">
                    Can't find what you're looking for?{' '}
                    <Button variant="link" className="p-0 h-auto text-sophera-brand-primary font-semibold hover:text-sophera-brand-primary-hover">
                      Contact Support
                    </Button>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guide" className="pt-2">
            <Card className="bg-sophera-bg-card border border-sophera-border-primary rounded-sophera-card shadow-xl">
              <CardHeader className="p-6 border-b border-sophera-border-primary">
                <CardTitle className="text-xl lg:text-2xl font-semibold text-sophera-text-heading flex items-center gap-2.5">
                  <BookOpen className="h-6 w-6 text-sophera-brand-primary" />
                  Sophera User Guide
                </CardTitle>
                <CardDescription className="text-sophera-text-body pt-1">
                  Explore comprehensive documentation on all Sophera features.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-10">
                  <div>
                    <h3 className="text-lg font-semibold text-sophera-text-heading mb-4 border-b-2 border-sophera-accent-tertiary pb-2">Getting Started</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="bg-sophera-gradient-start/50 border-sophera-border-primary rounded-sophera-card hover:shadow-lg transition-shadow">
                        <CardContent className="p-5">
                          <h4 className="font-semibold text-sophera-text-heading flex items-center text-base mb-1">
                            <span className="flex h-7 w-7 rounded-full bg-sophera-brand-primary text-white text-sm items-center justify-center mr-3 font-bold">1</span>
                            Setting Up Your Profile
                          </h4>
                          <p className="text-sm text-sophera-text-body mt-2">
                            Complete your personal and medical profile to get the most personalized experience from Sophera.
                          </p>
                          <Button variant="link" className="p-0 h-auto text-sophera-brand-primary mt-3 text-sm font-semibold">
                            Learn More <ExternalLinkIcon className="ml-1 h-3.5 w-3.5"/>
                          </Button>
                        </CardContent>
                      </Card>
                      <Card className="bg-sophera-gradient-start/50 border-sophera-border-primary rounded-sophera-card hover:shadow-lg transition-shadow">
                        <CardContent className="p-5">
                          <h4 className="font-semibold text-sophera-text-heading flex items-center text-base mb-1">
                            <span className="flex h-7 w-7 rounded-full bg-sophera-brand-primary text-white text-sm items-center justify-center mr-3 font-bold">2</span>
                            Navigating Sophera
                          </h4>
                          <p className="text-sm text-sophera-text-body mt-2">
                            Understand the main sections and how to find what you need quickly.
                          </p>
                          <Button variant="link" className="p-0 h-auto text-sophera-brand-primary mt-3 text-sm font-semibold">
                            Explore Features <ExternalLinkIcon className="ml-1 h-3.5 w-3.5"/>
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-sophera-text-heading mb-4 border-b-2 border-sophera-accent-secondary pb-2">Key Features In-Depth</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[
                        { title: "AI Explainer", items: ["Understanding Terms", "Treatment Concepts", "Evidence Levels"] },
                        { title: "My Journey Tracking", items: ["Managing Your Plan", "Daily Journaling", "Diet Logging", "Viewing Trends"] },
                        { title: "Document Hub", items: ["Secure Uploads", "AI Summaries", "Asking Questions"] },
                        { title: "Explore Options", items: ["Guided Research", "Clinical Trial Finder", "Creative Sandbox"] },
                        { title: "Connect & Hope", items: ["Survivor Stories", "Mindfulness Resources", "Caregiver Connect"] },
                        { title: "Interaction Checker", items: ["Understanding Risks", "Dietary Interactions", "Talking to Your Doctor"] }
                      ].map(feature => (
                        <Card key={feature.title} className="bg-sophera-bg-card border-sophera-border-primary rounded-sophera-card hover:shadow-lg transition-shadow">
                          <CardHeader className="pb-3 pt-5 px-5">
                            <CardTitle className="font-semibold text-sophera-text-heading text-base">{feature.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="px-5 pb-4">
                            <ul className="space-y-1.5 text-sm text-sophera-text-body">
                              {feature.items.map(item => (
                                <li key={item} className="flex items-start">
                                  <span className="flex-shrink-0 text-sophera-brand-primary mr-2 mt-1">&bull;</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                            <Button variant="link" className="p-0 h-auto text-sophera-brand-primary mt-3 text-sm font-semibold">
                              Read Guide <ExternalLinkIcon className="ml-1 h-3.5 w-3.5"/>
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                  <div>
                     <h3 className="text-lg font-semibold text-sophera-text-heading mb-4 border-b-2 border-sophera-accent-tertiary pb-2">Complete User Manual</h3>
                    <Card className="bg-sophera-gradient-start border-sophera-border-primary rounded-sophera-card">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                          <div className="text-center sm:text-left">
                            <h4 className="text-lg font-semibold text-sophera-text-heading">Download Full Guide</h4>
                            <p className="text-sm text-sophera-text-body mt-1">Get the comprehensive PDF manual for all Sophera features.</p>
                          </div>
                          <Button className="w-full sm:w-auto bg-sophera-brand-primary text-white rounded-sophera-button py-3 px-6 text-base font-semibold tracking-wide hover:bg-sophera-brand-primary-hover transform hover:scale-105 transition-all duration-200 ease-in-out shadow-md hover:shadow-lg">
                            <BookOpen className="h-5 w-5 mr-2" />
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

          <TabsContent value="contact" className="pt-2">
            <Card className="bg-sophera-bg-card border border-sophera-border-primary rounded-sophera-card shadow-xl">
              <CardHeader className="p-6 border-b border-sophera-border-primary">
                <CardTitle className="text-xl lg:text-2xl font-semibold text-sophera-text-heading flex items-center gap-2.5">
                  <MessageSquare className="h-6 w-6 text-sophera-brand-primary" />
                  Contact Our Support Team
                </CardTitle>
                <CardDescription className="text-sophera-text-body pt-1">
                  We're here to help! Reach out if you have questions or need assistance.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div>
                  <h3 className="text-lg font-semibold text-sophera-text-heading mb-5">Contact Options</h3>
                  <div className="space-y-6">
                    <Card className="bg-sophera-gradient-start/50 border-sophera-border-primary rounded-sophera-card p-5 hover:shadow-lg transition-shadow">
                      <div className="flex items-start gap-4">
                        <Mail className="h-7 w-7 text-sophera-brand-primary mt-1 shrink-0" />
                        <div>
                          <h4 className="font-semibold text-sophera-text-heading text-base">Email Support</h4>
                          <p className="text-sm text-sophera-text-body mt-1">
                            Send us an email at <a href="mailto:tony@sparqgames.com" className="text-sophera-brand-primary font-medium hover:underline">tony@sparqgames.com</a> and we'll typically respond within 24 hours.
                          </p>
                           <Button variant="outline" asChild className="mt-3 rounded-sophera-button border-sophera-brand-primary text-sophera-brand-primary hover:bg-sophera-brand-primary-light">
                             <a href="mailto:tony@sparqgames.com">Send Email</a>
                           </Button>
                        </div>
                      </div>
                    </Card>
                  </div>

                  <div className="mt-10 pt-8 border-t border-sophera-border-primary/70">
                    <Card className="p-5 bg-sophera-brand-primary-light border-sophera-brand-primary/50 rounded-sophera-card">
                      <div className="flex items-start gap-3">
                        <Info className="h-6 w-6 text-sophera-brand-primary mt-1 shrink-0" />
                        <div>
                          <h4 className="font-semibold text-sophera-brand-primary text-base">Important Reminder</h4>
                          <p className="text-sm text-sophera-text-body mt-1 leading-relaxed">
                            For any medical emergencies, please contact your healthcare provider or dial emergency services immediately. Sophera is designed as a healing companion and research tool, and is not a substitute for professional medical advice or treatment.
                          </p>
                        </div>
                      </div>
                    </Card>
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