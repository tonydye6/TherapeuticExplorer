import { useQuery } from "@tanstack/react-query";
import { useJournalLogs } from "./use-journal-logs";
import { useDietLogs } from "./use-diet-logs";
import { usePlanItems } from "./use-plan-items";
import { formatISO, subDays, isAfter } from "date-fns";

/**
 * A hook that aggregates data from various sources for the dashboard
 */
export function useDashboardData() {
  // Fetch user data
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["/api/user"],
  });

  // Fetch journal logs
  const { journalLogs, isLoading: journalLoading } = useJournalLogs();

  // Fetch diet logs
  const { dietLogs, isLoading: dietLoading } = useDietLogs();

  // Fetch plan items (appointments, tasks, etc.)
  const { planItems, isLoading: planLoading } = usePlanItems();

  // Fetch treatment data
  const { data: treatments, isLoading: treatmentsLoading } = useQuery({
    queryKey: ["/api/treatments"],
  });

  // Calculate recent logs (last 7 days)
  const sevenDaysAgo = subDays(new Date(), 7);
  
  const recentJournalLogs = Array.isArray(journalLogs) 
    ? journalLogs.filter(log => {
        const entryDate = new Date(log.entryDate);
        return isAfter(entryDate, sevenDaysAgo);
      })
    : [];

  const recentDietLogs = Array.isArray(dietLogs)
    ? dietLogs.filter(log => {
        const mealDate = new Date(log.mealDate);
        return isAfter(mealDate, sevenDaysAgo);
      })
    : [];

  // Get upcoming plan items
  const upcomingPlanItems = Array.isArray(planItems)
    ? planItems
        .filter(item => {
          const startDate = new Date(item.startDate);
          return isAfter(startDate, new Date()) && !item.isCompleted;
        })
        .sort((a, b) => {
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        })
        .slice(0, 5)
    : [];

  // Get active treatments
  const activeTreatments = Array.isArray(treatments) 
    ? treatments.filter(treatment => treatment.active) 
    : [];

  const isLoading = userLoading || journalLoading || dietLoading || planLoading || treatmentsLoading;

  return {
    userData,
    recentJournalLogs,
    recentDietLogs,
    upcomingPlanItems,
    activeTreatments,
    isLoading,
    planCount: Array.isArray(planItems) ? planItems.length : 0,
    journalCount: Array.isArray(journalLogs) ? journalLogs.length : 0,
    dietCount: Array.isArray(dietLogs) ? dietLogs.length : 0,
    treatmentCount: Array.isArray(treatments) ? treatments.length : 0,
  };
}
