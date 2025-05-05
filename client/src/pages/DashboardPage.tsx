import React from 'react';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentLogsCard } from '@/components/dashboard/RecentLogsCard';
import { RecentDietLogsCard } from '@/components/dashboard/RecentDietLogsCard';
import { UpcomingPlanItemsCard } from '@/components/dashboard/UpcomingPlanItemsCard';
import { ActiveTreatmentsCard } from '@/components/dashboard/ActiveTreatmentsCard';
import { Loader2, BookOpen as JournalIcon, Utensils, Calendar, Activity, FileText, Pill } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export default function DashboardPage() {
  const {
    userData,
    recentJournalLogs,
    recentDietLogs,
    upcomingPlanItems,
    activeTreatments,
    isLoading,
    planCount,
    journalCount,
    dietCount,
    treatmentCount
  } = useDashboardData();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h3 className="text-lg font-medium">Loading your dashboard...</h3>
        <p className="text-gray-500">We're gathering your latest health information</p>
      </div>
    );
  }

  const displayName = userData && (userData.displayName || userData.username) || 'User';

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {displayName}</h1>
          <p className="text-gray-500 mt-1">
            Here's your personal health dashboard. Review your recent activities and upcoming plans.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/my-plan">
            <Button className="gap-2">
              <Calendar className="h-4 w-4" />
              Add to My Plan
            </Button>
          </Link>
          <Link href="/journal-logs">
            <Button variant="outline" className="gap-2">
              <JournalIcon className="h-4 w-4" />
              New Journal Entry
            </Button>
          </Link>
          <Link href="/diet-logs">
            <Button variant="outline" className="gap-2">
              <Utensils className="h-4 w-4" />
              Log a Meal
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Plan Items"
          value={planCount}
          icon={<Calendar className="h-5 w-5" />}
          description="Total scheduled items"
        />
        <StatCard
          title="Journal Entries"
          value={journalCount}
          icon={<JournalIcon className="h-5 w-5" />}
          description="Track your daily experiences"
        />
        <StatCard
          title="Diet Logs"
          value={dietCount}
          icon={<Utensils className="h-5 w-5" />}
          description="Monitor your nutrition"
        />
        <StatCard
          title="Active Treatments"
          value={activeTreatments.length}
          icon={<Pill className="h-5 w-5" />}
          description="Current treatment plans"
        />
      </div>

      {/* Upcoming Plan Items */}
      <div className="mb-8">
        <UpcomingPlanItemsCard
          planItems={upcomingPlanItems}
          title="Upcoming Plan Items"
          emptyMessage="No upcoming plan items. Schedule your next appointment or create a reminder."
        />
      </div>

      {/* Recent Logs and Treatments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <RecentLogsCard
          logs={recentJournalLogs}
          title="Recent Journal Entries"
          emptyMessage="You haven't created any journal entries yet."
          linkTo="/journal-logs"
        />
        <RecentDietLogsCard
          logs={recentDietLogs}
          title="Recent Meals"
          emptyMessage="You haven't logged any meals yet."
          linkTo="/diet-logs"
        />
        <ActiveTreatmentsCard
          treatments={activeTreatments}
          title="Active Treatments"
          emptyMessage="No active treatments. Add treatments in the Treatment Tracker."
        />
      </div>

      {/* Quick Links Section */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-medium mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Link href="/research-assistant">
            <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center cursor-pointer">
              <div className="flex justify-center mb-2">
                <div className="p-2 rounded-full bg-primary-50 text-primary-700">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
              <span className="text-sm font-medium">Research Assistant</span>
            </div>
          </Link>
          <Link href="/treatment-tracker">
            <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center cursor-pointer">
              <div className="flex justify-center mb-2">
                <div className="p-2 rounded-full bg-primary-50 text-primary-700">
                  <Activity className="h-5 w-5" />
                </div>
              </div>
              <span className="text-sm font-medium">Treatment Tracker</span>
            </div>
          </Link>
          <Link href="/documents">
            <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center cursor-pointer">
              <div className="flex justify-center mb-2">
                <div className="p-2 rounded-full bg-primary-50 text-primary-700">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
              <span className="text-sm font-medium">Documents</span>
            </div>
          </Link>
          <Link href="/multimodal-chat">
            <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center cursor-pointer">
              <div className="flex justify-center mb-2">
                <div className="p-2 rounded-full bg-primary-50 text-primary-700">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
              <span className="text-sm font-medium">Image Analysis</span>
            </div>
          </Link>
          <Link href="/clinical-trials">
            <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center cursor-pointer">
              <div className="flex justify-center mb-2">
                <div className="p-2 rounded-full bg-primary-50 text-primary-700">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
              <span className="text-sm font-medium">Clinical Trials</span>
            </div>
          </Link>
          <Link href="/alternative-treatments">
            <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center cursor-pointer">
              <div className="flex justify-center mb-2">
                <div className="p-2 rounded-full bg-primary-50 text-primary-700">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
              <span className="text-sm font-medium">Alternative Treatments</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
