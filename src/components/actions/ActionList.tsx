import React from 'react';
import { AnimatePresence } from 'motion/react';
import { PendingItem, ActionBlueprint } from '../../types';
import { ActionCard } from './ActionCard';
import { EmptyState } from './EmptyState';

interface ActionListProps {
  items: Array<{ item: PendingItem, blueprint: ActionBlueprint }>;
  onActionClick: (blueprint: ActionBlueprint, actionType: string) => void;
}

export function ActionList({ items, onActionClick }: ActionListProps) {
  return (
    <div className="flex flex-col gap-4 pb-20 md:pb-8">
      <AnimatePresence mode="popLayout">
        {items.length === 0 ? (
          <EmptyState />
        ) : (
          items.map(({ item, blueprint }) => (
            <ActionCard 
              key={item.id} 
              item={item} 
              blueprint={blueprint} 
              onActionClick={onActionClick} 
            />
          ))
        )}
      </AnimatePresence>
    </div>
  );
}
