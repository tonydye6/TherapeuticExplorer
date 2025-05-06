import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircleIcon, AlertTriangleIcon, CheckCircle2Icon, ClipboardCopyIcon, Mail, PlusIcon, ShieldIcon, TrashIcon, UserPlusIcon, X, XCircleIcon } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CaregiverConnectPageProps {
  inTabView?: boolean;
}

// Permission types
type PermissionType = 'view' | 'update' | 'manage';

// Permission categories
type PermissionCategory = 'medical' | 'careplan' | 'journal' | 'documents' | 'appointments';

// Permission interface
interface Permission {
  category: PermissionCategory;
  label: string;
  description: string;
  type: PermissionType;
  granted: boolean;
}

// Default permissions template
const DEFAULT_PERMISSIONS: Permission[] = [
  {
    category: 'medical',
    label: 'View Medical Information',
    description: 'Can view diagnosis, treatments, and medical history',
    type: 'view',
    granted: true
  },
  {
    category: 'medical',
    label: 'Update Medical Information',
    description: 'Can update medical information and track treatments',
    type: 'update',
    granted: false
  },
  {
    category: 'careplan',
    label: 'View Care Plan',
    description: 'Can view care plan items and schedules',
    type: 'view',
    granted: true
  },
  {
    category: 'careplan',
    label: 'Update Care Plan',
    description: 'Can add, edit, and mark care plan items as complete',
    type: 'update',
    granted: true
  },
  {
    category: 'journal',
    label: 'View Journal Entries',
    description: 'Can view journal entries, symptoms, and mood tracking',
    type: 'view',
    granted: true
  },
  {
    category: 'journal',
    label: 'Create Journal Notes',
    description: 'Can add caregiver notes to journal',
    type: 'update',
    granted: true
  },
  {
    category: 'documents',
    label: 'View Documents',
    description: 'Can view uploaded medical documents',
    type: 'view',
    granted: true
  },
  {
    category: 'documents',
    label: 'Manage Documents',
    description: 'Can upload and organize documents',
    type: 'manage',
    granted: false
  },
  {
    category: 'appointments',
    label: 'View Appointments',
    description: 'Can view upcoming medical appointments',
    type: 'view',
    granted: true
  },
  {
    category: 'appointments',
    label: 'Manage Appointments',
    description: 'Can add and edit appointment information',
    type: 'manage',
    granted: false
  }
];

// Caregiver interface
interface Caregiver {
  id: string;
  name: string;
  email: string;
  relationship: string;
  dateInvited: string;
  status: 'pending' | 'active' | 'declined';
  lastActive?: string;
  permissions: Permission[];
}

// Sample caregiver data
const CAREGIVERS: Caregiver[] = [
  {
    id: '1',
    name: 'Michael Johnson',
    email: 'michael.j@example.com',
    relationship: 'Spouse',
    dateInvited: '2025-01-15',
    status: 'active',
    lastActive: '2025-04-05',
    permissions: [
      ...DEFAULT_PERMISSIONS.map(p => ({ ...p }))
    ]
  },
  {
    id: '2',
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    relationship: 'Daughter',
    dateInvited: '2025-02-03',
    status: 'active',
    lastActive: '2025-04-03',
    permissions: [
      ...DEFAULT_PERMISSIONS.map(p => ({ ...p, granted: p.type === 'view' }))
    ]
  },
  {
    id: '3',
    name: 'Dr. Sarah Wilson',
    email: 'dr.wilson@example.com',
    relationship: 'Healthcare Provider',
    dateInvited: '2025-03-10',
    status: 'pending',
    permissions: [
      ...DEFAULT_PERMISSIONS.map(p => ({ ...p, granted: p.category === 'medical' || p.category === 'careplan' }))
    ]
  }
];

export default function CaregiverConnectPage({ inTabView }: CaregiverConnectPageProps) {
  const [activeTab, setActiveTab] = useState('current');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRelationship, setInviteRelationship] = useState('');
  const [openInviteDialog, setOpenInviteDialog] = useState(false);
  const [openPermissionsDialog, setOpenPermissionsDialog] = useState(false);
  const [selectedCaregiver, setSelectedCaregiver] = useState<Caregiver | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  
  const { toast } = useToast();
  
  // In a real implementation, these would fetch from the backend
  const { data: caregivers, isLoading } = useQuery({
    queryKey: ["/api/caregivers"],
    // This is a placeholder since we're using static data
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return CAREGIVERS;
    },
    refetchOnWindowFocus: false,
  });

  // Invitation mutation
  const { mutate: sendInvitation, isPending: isSending } = useMutation({
    mutationFn: async (data: { email: string, relationship: string }) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { success: true };
    },
    onSuccess: () => {
      setInviteEmail('');
      setInviteRelationship('');
      setOpenInviteDialog(false);
      toast({
        title: "Invitation sent",
        description: "The caregiver invitation has been sent successfully.",
      });
      // In a real app, we would invalidate the query here
      // queryClient.invalidateQueries({ queryKey: ["/api/caregivers"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to send invitation",
        description: "There was a problem sending the invitation. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update permissions mutation
  const { mutate: updatePermissions, isPending: isUpdatingPermissions } = useMutation({
    mutationFn: async (data: { caregiverId: string, permissions: Permission[] }) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      setOpenPermissionsDialog(false);
      toast({
        title: "Permissions updated",
        description: "Caregiver permissions have been updated successfully.",
      });
      // In a real app, we would invalidate the query here
      // queryClient.invalidateQueries({ queryKey: ["/api/caregivers"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update permissions",
        description: "There was a problem updating the permissions. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Remove caregiver mutation
  const { mutate: removeCaregiver, isPending: isRemoving } = useMutation({
    mutationFn: async (caregiverId: string) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Caregiver removed",
        description: "The caregiver has been removed successfully.",
      });
      // In a real app, we would invalidate the query here
      // queryClient.invalidateQueries({ queryKey: ["/api/caregivers"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to remove caregiver",
        description: "There was a problem removing the caregiver. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Filter caregivers based on status and active tab
  const filteredCaregivers = caregivers?.filter(caregiver => {
    if (activeTab === 'current') {
      return caregiver.status === 'active';
    } else if (activeTab === 'pending') {
      return caregiver.status === 'pending';
    }
    return true; // 'all' tab
  });

  // Handle opening the permissions dialog
  const handleOpenPermissions = (caregiver: Caregiver) => {
    setSelectedCaregiver(caregiver);
    setPermissions([...caregiver.permissions]);
    setOpenPermissionsDialog(true);
  };

  // Handle toggling a permission
  const handleTogglePermission = (index: number) => {
    setPermissions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], granted: !updated[index].granted };
      return updated;
    });
  };

  // Handle saving the permissions
  const handleSavePermissions = () => {
    if (selectedCaregiver) {
      updatePermissions({
        caregiverId: selectedCaregiver.id,
        permissions: permissions
      });
    }
  };

  // Handle invitation submission
  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteEmail && inviteRelationship) {
      sendInvitation({
        email: inviteEmail,
        relationship: inviteRelationship
      });
    }
  };

  // Copy invitation link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://sophera.replit.app/invitation?code=ABC123`);
    toast({
      title: "Link copied",
      description: "The invitation link has been copied to your clipboard.",
    });
  };

  // Handle remove caregiver
  const handleRemoveCaregiver = (id: string) => {
    if (confirm("Are you sure you want to remove this caregiver? They will no longer have access to your information.")) {
      removeCaregiver(id);
    }
  };

  return (
    <div className={`space-y-6 ${!inTabView ? 'container py-6' : ''}`}>
      {!inTabView && (
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Caregiver Connect</h1>
          <p className="text-muted-foreground">
            Invite and manage caregivers to help support your care journey.
          </p>
        </div>
      )}
      
      {/* Action buttons */}
      <div className="flex justify-between items-center">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
          <TabsList>
            <TabsTrigger value="current">Active</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Dialog open={openInviteDialog} onOpenChange={setOpenInviteDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlusIcon className="mr-2 h-4 w-4" />
              Invite Caregiver
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite a Caregiver</DialogTitle>
              <DialogDescription>
                Send an invitation to someone who helps with your care. They'll receive an email with instructions to create an account.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleInviteSubmit} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="caregiver@example.com" 
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship</Label>
                <Input 
                  id="relationship" 
                  placeholder="Spouse, Friend, Nurse, etc." 
                  value={inviteRelationship}
                  onChange={(e) => setInviteRelationship(e.target.value)}
                  required
                />
              </div>
              
              <DialogFooter className="pt-4">
                <Button type="submit" disabled={isSending}>
                  {isSending ? "Sending..." : "Send Invitation"}
                </Button>
              </DialogFooter>
            </form>
            
            <Separator className="my-4" />
            
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Or share an invitation link:</p>
              <Button variant="outline" size="sm" onClick={handleCopyLink}>
                <ClipboardCopyIcon className="mr-2 h-3.5 w-3.5" />
                Copy Link
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-1/3 mb-1" />
                <Skeleton className="h-4 w-1/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCaregivers?.length === 0 ? (
        <Card className="text-center p-8">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="bg-primary/10 p-3 rounded-full">
              <UserPlusIcon className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>No caregivers found</CardTitle>
            <CardDescription>
              {activeTab === 'pending' 
                ? "You don't have any pending caregiver invitations."
                : activeTab === 'current'
                  ? "You haven't added any caregivers yet."
                  : "No caregivers have been added to your account."}
            </CardDescription>
            <Button onClick={() => setOpenInviteDialog(true)} className="mt-4">
              <UserPlusIcon className="mr-2 h-4 w-4" />
              Invite Caregiver
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCaregivers?.map(caregiver => (
            <Card key={caregiver.id} className="overflow-hidden">
              <div className={`h-1 ${caregiver.status === 'active' ? 'bg-green-500' : caregiver.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'}`} />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center">
                      {caregiver.name}
                      {caregiver.status === 'pending' && (
                        <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400">
                          Pending
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <span>{caregiver.relationship}</span>
                      <span className="text-xs">•</span>
                      <span>{caregiver.email}</span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog open={openPermissionsDialog && selectedCaregiver?.id === caregiver.id} onOpenChange={isOpen => {
                      setOpenPermissionsDialog(isOpen);
                      if (!isOpen) setSelectedCaregiver(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => handleOpenPermissions(caregiver)} disabled={caregiver.status !== 'active'}>
                          <ShieldIcon className="mr-1 h-3.5 w-3.5" />
                          Permissions
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Caregiver Permissions</DialogTitle>
                          <DialogDescription>
                            Manage what information {selectedCaregiver?.name} can access and modify.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 my-4">
                          <div className="space-y-4">
                            <h3 className="text-sm font-medium">Medical Information</h3>
                            <div className="grid gap-3">
                              {permissions
                                .filter(p => p.category === 'medical')
                                .map((permission, index) => {
                                  const originalIndex = permissions.findIndex(p => p === permission);
                                  return (
                                    <div key={permission.label} className="flex items-center justify-between">
                                      <div>
                                        <p className="text-sm font-medium">{permission.label}</p>
                                        <p className="text-xs text-muted-foreground">{permission.description}</p>
                                      </div>
                                      <Switch
                                        checked={permission.granted}
                                        onCheckedChange={() => handleTogglePermission(originalIndex)}
                                      />
                                    </div>
                                  );
                                })}
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-4">
                            <h3 className="text-sm font-medium">Care Plan</h3>
                            <div className="grid gap-3">
                              {permissions
                                .filter(p => p.category === 'careplan')
                                .map((permission, index) => {
                                  const originalIndex = permissions.findIndex(p => p === permission);
                                  return (
                                    <div key={permission.label} className="flex items-center justify-between">
                                      <div>
                                        <p className="text-sm font-medium">{permission.label}</p>
                                        <p className="text-xs text-muted-foreground">{permission.description}</p>
                                      </div>
                                      <Switch
                                        checked={permission.granted}
                                        onCheckedChange={() => handleTogglePermission(originalIndex)}
                                      />
                                    </div>
                                  );
                                })}
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-4">
                            <h3 className="text-sm font-medium">Journal & Documents</h3>
                            <div className="grid gap-3">
                              {permissions
                                .filter(p => p.category === 'journal' || p.category === 'documents')
                                .map((permission, index) => {
                                  const originalIndex = permissions.findIndex(p => p === permission);
                                  return (
                                    <div key={permission.label} className="flex items-center justify-between">
                                      <div>
                                        <p className="text-sm font-medium">{permission.label}</p>
                                        <p className="text-xs text-muted-foreground">{permission.description}</p>
                                      </div>
                                      <Switch
                                        checked={permission.granted}
                                        onCheckedChange={() => handleTogglePermission(originalIndex)}
                                      />
                                    </div>
                                  );
                                })}
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-4">
                            <h3 className="text-sm font-medium">Appointments</h3>
                            <div className="grid gap-3">
                              {permissions
                                .filter(p => p.category === 'appointments')
                                .map((permission, index) => {
                                  const originalIndex = permissions.findIndex(p => p === permission);
                                  return (
                                    <div key={permission.label} className="flex items-center justify-between">
                                      <div>
                                        <p className="text-sm font-medium">{permission.label}</p>
                                        <p className="text-xs text-muted-foreground">{permission.description}</p>
                                      </div>
                                      <Switch
                                        checked={permission.granted}
                                        onCheckedChange={() => handleTogglePermission(originalIndex)}
                                      />
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        </div>

                        <DialogFooter>
                          <Button variant="outline" onClick={() => setOpenPermissionsDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleSavePermissions} disabled={isUpdatingPermissions}>
                            {isUpdatingPermissions ? "Saving..." : "Save Permissions"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemoveCaregiver(caregiver.id)}>
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Remove caregiver</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <div className="flex items-center text-muted-foreground mb-2">
                    <span className="mr-2">Invited:</span>
                    <span>{new Date(caregiver.dateInvited).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    {caregiver.lastActive && (
                      <>
                        <span className="mx-2">•</span>
                        <span className="mr-2">Last active:</span>
                        <span>{new Date(caregiver.lastActive).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {caregiver.permissions
                      .filter(p => p.granted)
                      .slice(0, 3)
                      .map(permission => (
                        <Badge key={permission.label} variant="secondary" className="text-xs">
                          {permission.label}
                        </Badge>
                      ))}
                    {caregiver.permissions.filter(p => p.granted).length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{caregiver.permissions.filter(p => p.granted).length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Help section */}
      <Card className="bg-primary/5 border-primary/10">
        <CardHeader>
          <CardTitle className="text-lg">About Caregiver Connect</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <p>
              <strong>Caregiver Connect</strong> allows you to invite trusted family members, friends, or healthcare professionals to help manage your care. Each caregiver can be given specific permissions to access different parts of your Sophera account.
            </p>
            
            <div className="grid gap-2">
              <div className="flex items-start gap-2">
                <ShieldIcon className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Customizable Permissions</p>
                  <p className="text-muted-foreground">Control exactly what information each caregiver can view or edit</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <CheckCircle2Icon className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Easy Invitation Process</p>
                  <p className="text-muted-foreground">Caregivers receive an email invitation to create their account</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <AlertCircleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium">Revoke Access Anytime</p>
                  <p className="text-muted-foreground">You can remove a caregiver's access at any time if needed</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
