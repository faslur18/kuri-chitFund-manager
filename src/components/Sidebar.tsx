import { Settings, Users, FileText, Trophy, Layers } from 'lucide-react';

export type TabType = 'setup' | 'participants' | 'ledger' | 'draw';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const menuItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'setup', label: 'Setup', icon: <Settings className="w-5 h-5 lg:w-6 lg:h-6" /> },
    { id: 'participants', label: 'Members', icon: <Users className="w-5 h-5 lg:w-6 lg:h-6" /> },
    { id: 'ledger', label: 'Ledger', icon: <FileText className="w-5 h-5 lg:w-6 lg:h-6" /> },
    { id: 'draw', label: 'Draw', icon: <Trophy className="w-5 h-5 lg:w-6 lg:h-6" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex flex-row bg-white border-t-4 border-structural-black lg:w-80 lg:top-0 lg:bottom-0 lg:border-t-0 lg:border-r-4 lg:flex-col shadow-[0_-4px_0_0_#000000] lg:shadow-[10px_0_0_0_#000000] lg:static">
      {/* Desktop Header */}
      <div className="hidden lg:block p-8 bg-accent-primary border-b-4 border-structural-black">
        <div className="flex items-center gap-4 mb-2">
           <div className="w-12 h-12 bg-structural-black text-white flex items-center justify-center border-2 border-structural-black shadow-[4px_4px_0_0_#000000] rounded-none">
             <Layers className="w-7 h-7" />
           </div>
           <h1 className="text-4xl font-black text-structural-black tracking-tighter italic underline decoration-4 underline-offset-4">KURI</h1>
        </div>
        <div className="bg-accent-pink text-white px-2 py-0.5 inline-block border-2 border-structural-black font-black text-[10px] uppercase tracking-widest shadow-[2px_2px_0_0_#000000] rounded-none">
          CHIT_MANAGER_V1
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex flex-row flex-1 justify-around items-center h-20 lg:flex-col lg:justify-start lg:h-auto lg:p-6 lg:gap-6">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center w-full h-full lg:flex-row lg:justify-start lg:gap-4 lg:px-6 lg:py-5 lg:h-auto transition-all focus-visible:outline-none rounded-none ${
                isActive
                  ? 'bg-accent-primary text-structural-black border-x-2 lg:border-4 border-structural-black shadow-[0_-4px_0_0_#000000] lg:shadow-[6px_6px_0_0_#000000] z-10 lg:-translate-x-1 lg:-translate-y-1'
                  : 'text-structural-black/50 hover:text-structural-black lg:hover:bg-bg-canvas'
              }`}
            >
              <span className={`transition-transform duration-100 ${isActive ? 'scale-110' : ''}`}>
                {item.icon}
              </span>
              <span className={`text-[10px] sm:text-xs lg:text-xl font-black uppercase tracking-tight lg:italic ${isActive ? 'text-structural-black' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Desktop Footer */}
      <div className="hidden lg:block p-8 mt-auto border-t-4 border-structural-black bg-accent-blue text-white font-black uppercase italic text-xs shadow-[0_-4px_0_0_#000000]">
        &copy; {new Date().getFullYear()} KURI_LABS_SYSTEM
      </div>
    </nav>
  );
};

export default Sidebar;
