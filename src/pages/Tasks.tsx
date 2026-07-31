import React, { useState, useEffect, useMemo } from 'react';
import { pendingCenterService } from '../services/PendingCenterService';
import { smartActionEngine } from '../services/SmartActionEngine';
import { timeRecordWorkflowService } from '../services/TimeRecordWorkflowService';
import { PendingItemStatus, ActionBlueprint, PendingItem, TimeEntryType } from '../types';
import { CenterActionsHeader } from '../components/actions/CenterActionsHeader';
import { JourneyHealthCard } from '../components/actions/JourneyHealthCard';
import { SummaryCards } from '../components/actions/SummaryCards';
import { FilterBar, FilterType } from '../components/actions/FilterBar';
import { ActionList } from '../components/actions/ActionList';
import { ResolutionDialog } from '../components/actions/ResolutionDialog';

export function Tasks() {
  const [profileId] = useState('user123');
  const [items, setItems] = useState<PendingItem[]>([]);
  const [filter, setFilter] = useState<FilterType>('ALL');
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBlueprint, setSelectedBlueprint] = useState<ActionBlueprint | null>(null);
  const [selectedActionType, setSelectedActionType] = useState<string | null>(null);

  useEffect(() => {
    setItems(pendingCenterService.getPendingItems(profileId));
  }, [profileId]);

  const stats = useMemo(() => {
    const s = pendingCenterService.getPendingStats(profileId);
    const criticalCount = items.filter(i => i.priority === 'CRITICAL' && (i.status === 'CREATED' || i.status === 'NOTIFIED' || i.status === 'IN_PROGRESS' || i.status === 'DETECTED')).length;
    const highCount = items.filter(i => i.priority === 'HIGH' && (i.status === 'CREATED' || i.status === 'NOTIFIED' || i.status === 'IN_PROGRESS' || i.status === 'DETECTED')).length;
    
    return {
      openCount: s.open,
      criticalCount,
      highCount,
      resolvedCount: s.resolved,
      averageTime: s.averageResolutionTimeMinutes
    };
  }, [items, profileId]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (filter === 'ALL') return true;
      if (filter === 'OPEN') return item.status !== PendingItemStatus.RESOLVED && item.status !== PendingItemStatus.JUSTIFIED && item.status !== PendingItemStatus.ARCHIVED;
      if (filter === 'RESOLVED') return item.status === PendingItemStatus.RESOLVED || item.status === PendingItemStatus.JUSTIFIED;
      if (filter === 'ARCHIVED') return item.status === PendingItemStatus.ARCHIVED;
      return true;
    }).map(item => ({
      item,
      blueprint: smartActionEngine.generateBlueprint(profileId, item)
    })).sort((a, b) => {
      const priorityMap: Record<string, number> = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      const pDiff = (priorityMap[b.item.priority] || 0) - (priorityMap[a.item.priority] || 0);
      if (pDiff !== 0) return pDiff;
      return new Date(b.item.createdAt).getTime() - new Date(a.item.createdAt).getTime();
    });
  }, [items, filter, profileId]);

  const health = useMemo(() => {
    return pendingCenterService.calculateJourneyHealth(profileId);
  }, [items, profileId]);

  const handleActionClick = (blueprint: ActionBlueprint, actionType: string) => {
    setSelectedBlueprint(blueprint);
    setSelectedActionType(actionType);
    setDialogOpen(true);
  };

  const handleDialogComplete = (data: any) => {
    if (!selectedBlueprint) return;
    
    const pendingId = selectedBlueprint.id.replace('bp_', '');
    const item = items.find(i => i.id === pendingId);
    
    if (item) {
      if (data.justification) {
        pendingCenterService.updatePending(profileId, pendingId, {
          status: PendingItemStatus.JUSTIFIED,
          notes: data.justification
        });
      } else {
        pendingCenterService.resolvePending(profileId, pendingId, 'System');
        
        // Exemplo: se tivesse editado hora e resolvido:
        // Na interface não tem addEntry com a assinatura correta no workflowService atualmente?
        // Vamos checar depois se workflowService tem o método correto.
      }
      
      setItems(pendingCenterService.getPendingItems(profileId));
    }
    
    setDialogOpen(false);
    setSelectedBlueprint(null);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <CenterActionsHeader openCount={stats.openCount} />
      
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        <div className="w-full md:w-80 shrink-0 p-4 overflow-y-auto border-r border-slate-200 bg-white flex flex-col gap-4">
          <JourneyHealthCard health={health} />
          <SummaryCards 
            criticalCount={stats.criticalCount}
            importantCount={stats.highCount}
            resolvedCount={stats.resolvedCount}
            averageTime={stats.averageTime}
          />
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          <FilterBar currentFilter={filter} onFilterChange={setFilter} />
          <ActionList items={filteredItems} onActionClick={handleActionClick} />
        </div>
      </div>

      <ResolutionDialog 
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        blueprint={selectedBlueprint}
        actionType={selectedActionType}
        onComplete={handleDialogComplete}
      />
    </div>
  );
}
