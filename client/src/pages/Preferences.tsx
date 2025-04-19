import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { 
  Save, 
  User as UserIcon, 
  Bell, 
  Eye, 
  Lock, 
  Share2,
  Settings,
  BookOpen,
  MessageSquare
} from "lucide-react";

// Form schema for profile update
const profileSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters."),
  diagnosis: z.string().optional(),
  diagnosisStage: z.string().optional(),
  diagnosisDate: z.string().optional(),
});

// Form schema for preferences update
const preferencesSchema = z.object({
  emailNotifications: z.boolean(),
  researchUpdates: z.boolean(),
  clinicalTrialAlerts: z.boolean(),
  dataUsage: z.boolean(),
});

// Type for user preferences
export type UserPreferences = {
  emailNotifications: boolean;
  researchUpdates: boolean;
  clinicalTrialAlerts: boolean;
  dataUsage: boolean;
};

// Extend the User type to include preferences
declare module '@shared/schema' {
  interface User {
    preferences?: UserPreferences;
  }
}

export default function Preferences() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");
  
  // Fetch user profile and preferences
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['/api/user/profile'],
    // If API doesn't exist yet, use dummy data
    queryFn: async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (!response.ok) throw new Error('Failed to fetch user profile');
        return await response.json();
      } catch (error) {
        console.error("Error fetching user profile:", error);
        // Return a placeholder user
        return {
          id: 1,
          username: "mattculligan",
          displayName: "Matt Culligan",
          diagnosis: "Esophageal Cancer",
          diagnosisStage: "Stage 4",
          diagnosisDate: "2023-09-15T00:00:00.000Z",
          preferences: {
            emailNotifications: true,
            researchUpdates: true,
            clinicalTrialAlerts: true,
            dataUsage: true
          }
        };
      }
    },
  });
  
  // Create form for profile update
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || "",
      diagnosis: user?.diagnosis || "",
      diagnosisStage: user?.diagnosisStage || "",
      diagnosisDate: user?.diagnosisDate ? new Date(user.diagnosisDate).toISOString().split('T')[0] : "",
    },
  });
  
  // Create form for preferences update
  const preferencesForm = useForm<z.infer<typeof preferencesSchema>>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      emailNotifications: user?.preferences?.emailNotifications || false,
      researchUpdates: user?.preferences?.researchUpdates || false,
      clinicalTrialAlerts: user?.preferences?.clinicalTrialAlerts || false,
      dataUsage: user?.preferences?.dataUsage || false,
    },
  });
  
  // Update forms when user data is loaded
  useEffect(() => {
    if (user) {
      profileForm.reset({
        displayName: user.displayName || "",
        diagnosis: user.diagnosis || "",
        diagnosisStage: user.diagnosisStage || "",
        diagnosisDate: user.diagnosisDate ? new Date(user.diagnosisDate).toISOString().split('T')[0] : "",
      });
      
      preferencesForm.reset({
        emailNotifications: user.preferences?.emailNotifications || false,
        researchUpdates: user.preferences?.researchUpdates || false,
        clinicalTrialAlerts: user.preferences?.clinicalTrialAlerts || false,
        dataUsage: user.preferences?.dataUsage || false,
      });
    }
  }, [user, profileForm, preferencesForm]);
  
  // Mutation for updating profile
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: z.infer<typeof profileSchema>) => {
      const response = await apiRequest('PATCH', '/api/user/profile', profileData);
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : 'An error occurred while updating your profile.',
        variant: "destructive",
      });
    },
  });
  
  // Mutation for updating preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferencesData: z.infer<typeof preferencesSchema>) => {
      const response = await apiRequest('PATCH', '/api/user/preferences', preferencesData);
      if (!response.ok) throw new Error('Failed to update preferences');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      toast({
        title: "Preferences Updated",
        description: "Your preferences have been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : 'An error occurred while updating your preferences.',
        variant: "destructive",
      });
    },
  });
  
  // Submit handlers
  const onProfileSubmit = (data: z.infer<typeof profileSchema>) => {
    updateProfileMutation.mutate(data);
  };
  
  const onPreferencesSubmit = (data: z.infer<typeof preferencesSchema>) => {
    updatePreferencesMutation.mutate(data);
  };
  
  // Toggle a setting and save it immediately
  const handleToggleSetting = (key: keyof UserPreferences, value: boolean) => {
    if (!user?.preferences) return;
    
    const updatedPreferences = {
      ...user.preferences,
      [key]: value
    };
    
    // Update form
    preferencesForm.setValue(key, value);
    
    // Save to server
    updatePreferencesMutation.mutate(updatedPreferences as z.infer<typeof preferencesSchema>);
  };

  return (
    <div className="container max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Preferences</h1>
        </div>
      
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="profile" className="flex items-center gap-1">
              <UserIcon className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-1">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              AI Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and medical details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <FormField
                      control={profileForm.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="diagnosis"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Diagnosis</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Esophageal Cancer" {...field} />
                          </FormControl>
                          <FormDescription>
                            This helps us tailor research to your specific condition.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="diagnosisStage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stage</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select stage" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Stage 1">Stage 1</SelectItem>
                                <SelectItem value="Stage 2">Stage 2</SelectItem>
                                <SelectItem value="Stage 3">Stage 3</SelectItem>
                                <SelectItem value="Stage 4">Stage 4</SelectItem>
                                <SelectItem value="Unknown">Unknown</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="diagnosisDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Diagnosis Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="bg-primary-800 hover:bg-primary-900"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? (
                        <span className="flex items-center gap-1">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Save className="h-4 w-4" />
                          Save Profile
                        </span>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Manage how and when you receive updates from THRIVE.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...preferencesForm}>
                  <form onSubmit={preferencesForm.handleSubmit(onPreferencesSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <FormField
                        control={preferencesForm.control}
                        name="emailNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Email Notifications</FormLabel>
                              <FormDescription>
                                Receive updates and important notifications via email.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked);
                                  handleToggleSetting('emailNotifications', checked);
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={preferencesForm.control}
                        name="researchUpdates"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Research Updates</FormLabel>
                              <FormDescription>
                                Get notified about new research findings related to your condition.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked);
                                  handleToggleSetting('researchUpdates', checked);
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={preferencesForm.control}
                        name="clinicalTrialAlerts"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Clinical Trial Alerts</FormLabel>
                              <FormDescription>
                                Be alerted when new clinical trials match your profile.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked);
                                  handleToggleSetting('clinicalTrialAlerts', checked);
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="bg-primary-800 hover:bg-primary-900"
                      disabled={updatePreferencesMutation.isPending}
                    >
                      {updatePreferencesMutation.isPending ? (
                        <span className="flex items-center gap-1">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Save className="h-4 w-4" />
                          Save Notification Settings
                        </span>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Control how your data is used and who can access it.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={preferencesForm.control}
                      name="dataUsage"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Data Usage for Research</FormLabel>
                            <FormDescription>
                              Allow anonymized data to be used to improve cancer research.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                                handleToggleSetting('dataUsage', checked);
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Data Export</FormLabel>
                        <FormDescription>
                          Download all your personal data stored in THRIVE.
                        </FormDescription>
                      </div>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Share2 className="h-4 w-4" />
                        Export Data
                      </Button>
                    </div>
                    
                    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Delete Account</FormLabel>
                        <FormDescription>
                          Permanently delete your account and all associated data.
                        </FormDescription>
                      </div>
                      <Button variant="destructive" size="sm" className="flex items-center gap-1">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-medium mb-2">Privacy Policy</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      THRIVE is committed to protecting your privacy and ensuring your personal information remains confidential.
                    </p>
                    <Button variant="link" className="p-0 h-auto text-primary-800">
                      View Full Privacy Policy
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="ai">
            <Card>
              <CardHeader>
                <CardTitle>AI and Research Settings</CardTitle>
                <CardDescription>
                  Customize how the AI research assistant works for you.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-medium mb-3">AI Model Preferences</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col items-center p-4 border rounded-lg hover:border-primary-300 cursor-pointer bg-primary-50">
                          <MessageSquare className="h-8 w-8 text-primary-800 mb-2" />
                          <h4 className="font-medium">Claude</h4>
                          <p className="text-xs text-center text-gray-500 mt-1">Best for medical research and nuanced explanations</p>
                        </div>
                        <div className="flex flex-col items-center p-4 border rounded-lg hover:border-primary-300 cursor-pointer">
                          <MessageSquare className="h-8 w-8 text-gray-400 mb-2" />
                          <h4 className="font-medium text-gray-700">GPT-4</h4>
                          <p className="text-xs text-center text-gray-500 mt-1">Best for clinical trial matching and structured data</p>
                        </div>
                        <div className="flex flex-col items-center p-4 border rounded-lg hover:border-primary-300 cursor-pointer">
                          <MessageSquare className="h-8 w-8 text-gray-400 mb-2" />
                          <h4 className="font-medium text-gray-700">Gemini</h4>
                          <p className="text-xs text-center text-gray-500 mt-1">Best for complex document analysis and deep research</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">
                        THRIVE automatically selects the optimal AI model for each query, but you can set a preference here.
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h3 className="text-base font-medium mb-3">Research Sources</h3>
                    <div className="space-y-4">
                      <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">PubMed Articles</p>
                          <p className="text-xs text-gray-500">
                            Medical literature from the National Library of Medicine
                          </p>
                        </div>
                        <Switch defaultChecked={true} />
                      </div>
                      
                      <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">ClinicalTrials.gov</p>
                          <p className="text-xs text-gray-500">
                            Database of publicly and privately supported clinical studies
                          </p>
                        </div>
                        <Switch defaultChecked={true} />
                      </div>
                      
                      <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">Cancer Research Organizations</p>
                          <p className="text-xs text-gray-500">
                            Content from major cancer research and advocacy groups
                          </p>
                        </div>
                        <Switch defaultChecked={true} />
                      </div>
                      
                      <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">My Uploaded Books</p>
                          <p className="text-xs text-gray-500">
                            Information from books you've added to your library
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">11 books</span>
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            Manage
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h3 className="text-base font-medium mb-3">Response Settings</h3>
                    <div className="space-y-4">
                      <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">Response Detail Level</p>
                          <p className="text-xs text-gray-500">
                            Set the level of detail in AI responses
                          </p>
                        </div>
                        <Select defaultValue="balanced">
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="concise">Concise</SelectItem>
                            <SelectItem value="balanced">Balanced</SelectItem>
                            <SelectItem value="detailed">Detailed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">Always Show Sources</p>
                          <p className="text-xs text-gray-500">
                            Include citation sources for all information
                          </p>
                        </div>
                        <Switch defaultChecked={true} />
                      </div>
                    </div>
                  </div>
                  
                  <Button className="bg-primary-800 hover:bg-primary-900">
                    <Save className="h-4 w-4 mr-2" />
                    Save AI Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
