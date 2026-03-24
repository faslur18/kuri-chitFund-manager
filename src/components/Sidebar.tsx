import { Settings, Users, FileText, Trophy } from 'lucide-react';

export type TabType = 'setup' | 'participants' | 'ledger' | 'draw';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const menuItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'setup', label: 'Setup', icon: <Settings className="w-5 h-5 md:w-4 md:h-4" /> },
    { id: 'participants', label: 'Members', icon: <Users className="w-5 h-5 md:w-4 md:h-4" /> },
    { id: 'ledger', label: 'Ledger', icon: <FileText className="w-5 h-5 md:w-4 md:h-4" /> },
    { id: 'draw', label: 'Draw', icon: <Trophy className="w-5 h-5 md:w-4 md:h-4" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex flex-row bg-white border-t border-zinc-200 md:w-64 md:top-0 md:bottom-0 md:border-t-0 md:border-r md:flex-col pb-safe">
      <div className="hidden md:block p-6 pb-2">
        <h1 className="text-2xl font-black text-zinc-900 tracking-tight">കുറി</h1>
        <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest font-bold">Chit Manager</p>
      </div>

      <div className="flex flex-row flex-1 justify-around items-center h-16 md:flex-col md:justify-start md:h-auto md:px-4 md:mt-4 md:space-y-1">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center w-full h-full md:flex-row md:justify-start md:gap-3 md:px-3 md:py-2 md:h-auto md:rounded-lg transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 ${
                isActive
                  ? 'text-zinc-900 md:bg-zinc-100 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-900 md:hover:bg-zinc-50 font-medium'
              }`}
            >
              <span className={`transition-transform duration-200 ${isActive ? 'scale-110 md:scale-100' : 'group-hover:scale-110 md:group-hover:scale-100'}`}>
                {item.icon}
              </span>
              <span className={`text-[10px] sm:text-xs md:text-sm mt-1 md:mt-0 ${isActive ? 'text-zinc-900' : 'text-zinc-500 group-hover:text-zinc-800'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="hidden md:block p-6 text-[10px] text-zinc-400 font-medium">
        &copy; {new Date().getFullYear()} Kuri App
      </div>
    </nav>
  );
};

export default Sidebar;
