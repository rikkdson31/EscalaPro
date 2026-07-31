import { TabId } from '../../types';
import { AlertCircle, BarChart2, ArrowLeft } from 'lucide-react';

interface TopBarProps {
  currentTab: TabId;
  onChangeTab: (tab: TabId) => void;
}

export function TopBar({ currentTab, onChangeTab }: TopBarProps) {
  const titles: Record<TabId, string> = {
    dashboard: 'EscalaPro',
    calendar: 'Calendário',
    time: 'Ocorrências',
    timeline: 'Timeline',
    settings: 'Configurações',
    tasks: 'Pendências',
    statistics: 'Estatísticas',
  };

  const isSubPage = currentTab === 'tasks' || currentTab === 'statistics';

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-50 pt-safe h-16">
      <div className="flex items-center justify-between h-full px-4 max-w-4xl mx-auto">
        <div className="flex items-center">
          {isSubPage && (
            <button 
              onClick={() => onChangeTab('dashboard')}
              className="mr-3 text-slate-600 hover:text-slate-900 transition-colors"
              aria-label="Voltar"
            >
              <ArrowLeft size={24} />
            </button>
          )}
          <h1 className="text-xl font-bold text-slate-900">{titles[currentTab]}</h1>
        </div>
        
        {!isSubPage && (
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => onChangeTab('statistics')}
              className="text-slate-600 hover:text-slate-900 transition-colors"
              aria-label="Estatísticas"
            >
              <BarChart2 size={24} />
            </button>
            <button 
              onClick={() => onChangeTab('tasks')}
              className="text-slate-600 hover:text-slate-900 transition-colors relative"
              aria-label="Pendências"
            >
              <AlertCircle size={24} />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
