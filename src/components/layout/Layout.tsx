import { ReactNode } from 'react';
import { TabId } from '../../types';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';

interface LayoutProps {
  currentTab: TabId;
  onChangeTab: (tab: TabId) => void;
  children: ReactNode;
}

export function Layout({ currentTab, onChangeTab, children }: LayoutProps) {
  // Ocultar a barra inferior se estiver em pendências ou estatísticas para dar mais foco,
  // ou manter. Pelo requisito vamos manter.
  const isSubPage = currentTab === 'tasks' || currentTab === 'statistics';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <TopBar currentTab={currentTab} onChangeTab={onChangeTab} />
      
      <main className="pt-20 pb-20 px-4 max-w-4xl mx-auto min-h-screen flex flex-col">
        {children}
      </main>

      {!isSubPage && <BottomNav currentTab={currentTab} onChangeTab={onChangeTab} />}
    </div>
  );
}
