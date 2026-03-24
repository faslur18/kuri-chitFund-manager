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
    <div className="flex min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-zinc-200 selection:text-zinc-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="md:ml-64 flex-1 px-4 py-8 pb-24 md:p-8 h-screen w-full transition-all overflow-y-auto overscroll-contain">
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
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
