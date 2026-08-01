import { useState } from 'react';
import { TabId } from './types';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { CalendarView } from './pages/CalendarView';
import { TimeTracking } from './pages/TimeTracking';
import { Timeline } from './pages/Timeline';
import { Settings } from './pages/Settings';
import { Tasks } from './pages/Tasks';
import { Statistics } from './pages/Statistics';
import { AnimatePresence } from 'motion/react';
import { useSchedule } from './contexts/ScheduleContext';
import { SetupWizard } from './pages/SetupWizard';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabId>('dashboard');
  const { config, isLoaded } = useSchedule();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!config) {
    return <SetupWizard />;
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentTab} />;
      case 'calendar':
        return <CalendarView />;
      case 'time':
        return <TimeTracking />;
      case 'timeline':
        return <Timeline />;
      case 'settings':
        return <Settings />;
      case 'tasks':
        return <Tasks />;
      case 'statistics':
        return <Statistics />;
      default:
        return <Dashboard onNavigate={setCurrentTab} />;
    }
  };

  return (
    <Layout currentTab={currentTab} onChangeTab={setCurrentTab}>
      <AnimatePresence mode="wait">
        <div key={currentTab} className="h-full">
          {renderContent()}
        </div>
      </AnimatePresence>
    </Layout>
  );
}
