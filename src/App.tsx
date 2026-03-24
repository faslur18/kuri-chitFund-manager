import { useState } from 'react';
import Sidebar from './components/Sidebar';
import type { TabType } from './components/Sidebar';
import { KuriProvider } from './context/KuriContext';
import SetupTab from './components/tabs/SetupTab';
import ParticipantsTab from './components/tabs/ParticipantsTab';
import LedgerTab from './components/tabs/LedgerTab';
import DrawTab from './components/tabs/DrawTab';

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabType>('setup');

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-bg-canvas font-space text-structural-black selection:bg-accent-primary selection:text-structural-black overflow-x-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 px-4 py-8 pb-32 lg:pb-12 lg:px-12 lg:py-12 w-full lg:h-screen lg:overflow-y-auto overscroll-contain">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'setup' && <SetupTab />}
          {activeTab === 'participants' && <ParticipantsTab />}
          {activeTab === 'ledger' && <LedgerTab />}
          {activeTab === 'draw' && <DrawTab />}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <KuriProvider>
      <AppContent />
    </KuriProvider>
  );
}

export default App;
