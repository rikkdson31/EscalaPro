import React from 'react';
import { motion } from 'motion/react';
import { TabId } from '../types';
import { useSchedule } from '../contexts/ScheduleContext';
import { pendingCenterService } from '../services/PendingCenterService';
import { timeRecordService } from '../services/TimeRecordService';
import { smartActionEngine } from '../services/SmartActionEngine';
import { dateService } from '../services/DateService';

import { DashboardGreeting } from '../components/dashboard/DashboardGreeting';
import { CycleOverviewCard } from '../components/dashboard/CycleOverviewCard';
import { PriorityActionCard } from '../components/dashboard/PriorityActionCard';
import { CycleSummaryCard } from '../components/dashboard/CycleSummaryCard';
import { NextEventsCard } from '../components/dashboard/NextEventsCard';
import { QuickStatsCard } from '../components/dashboard/QuickStatsCard';
import { Shortcuts } from '../components/dashboard/Shortcuts';
import { JourneyHealthCard } from '../components/actions/JourneyHealthCard';

interface DashboardProps {
  onNavigate: (tab: TabId) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { scheduleService, config, activeProfile } = useSchedule();
  
  if (!activeProfile || !scheduleService || !config) return null;

  const today = dateService.now();
  const todayStr = dateService.toISODate(today);
  
  const openPendings = pendingCenterService.getOpenPendings(activeProfile.id);
  const priorityItem = openPendings.sort((a, b) => {
    const priorityMap: Record<string, number> = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
    return (priorityMap[b.priority] || 0) - (priorityMap[a.priority] || 0);
  })[0];
  const priorityBlueprint = priorityItem ? smartActionEngine.generateBlueprint(activeProfile.id, priorityItem) : null;

  const journeyHealth = pendingCenterService.calculateJourneyHealth(activeProfile.id);
  
  const d30Ago = dateService.addDays(today, -30);
  const records30Days = timeRecordService.getRecordsByPeriod(activeProfile.id, dateService.toISODate(d30Ago), dateService.toISODate(today));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="p-4 sm:p-6 pb-24 md:pb-6 max-w-4xl mx-auto h-full overflow-y-auto"
    >
      <DashboardGreeting activeProfile={activeProfile} config={config} scheduleService={scheduleService} />
      
      <CycleOverviewCard 
        scheduleService={scheduleService} 
        config={config} 
        activeProfile={activeProfile} 
      />

      <PriorityActionCard 
        item={priorityItem} 
        blueprint={priorityBlueprint} 
        onActionClick={() => onNavigate('tasks')}
      />

      <Shortcuts onNavigate={onNavigate} openActionsCount={openPendings.length} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <div className="h-full">
          <JourneyHealthCard health={journeyHealth} />
        </div>
        <div>
          <CycleSummaryCard scheduleService={scheduleService} todayDate={today} config={config} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <NextEventsCard scheduleService={scheduleService} todayDate={today} />
        </div>
        <div>
          <QuickStatsCard records30Days={records30Days} pendenciesCount={openPendings.length} scheduleService={scheduleService} />
        </div>
      </div>
      
    </motion.div>
  );
}
