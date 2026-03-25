import { Settings, Users, FileText, Trophy, Languages, Lock, LogOut } from 'lucide-react';
import logo from '../assets/logo.png';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export type TabType = 'setup' | 'participants' | 'ledger' | 'draw' | 'login';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const { t, language, setLanguage } = useLanguage();
  const { isAdmin, logout } = useAuth();

  const menuItems: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'setup', label: t('nav.setup'), icon: Settings },
    { id: 'participants', label: t('nav.members'), icon: Users },
    { id: 'ledger', label: t('nav.ledger'), icon: FileText },
    { id: 'draw', label: t('nav.draw'), icon: Trophy },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex flex-row bg-white border-t-4 border-structural-black lg:w-64 lg:top-0 lg:bottom-0 lg:border-t-0 lg:border-r-4 lg:flex-col shadow-[0_-4px_0_0_#000000] lg:shadow-[6px_0_0_0_#000000] lg:static">
      {/* Desktop Header */}
      <div className="hidden lg:block p-6 bg-accent-primary border-b-4 border-structural-black">
        <div className="flex items-center gap-3 mb-2">
           <div className="w-10 h-10 bg-structural-black text-white flex items-center justify-center border-2 border-structural-black shadow-[3px_3px_0_0_#000000] rounded-none overflow-hidden">
              <img src={logo} alt="Kuri Logo" className="w-full h-full object-cover" />
            </div>
           <h1 className="text-3xl font-black text-structural-black tracking-tighter italic underline decoration-4 underline-offset-4">KURI</h1>
        </div>
        <div className="flex justify-between items-center">
          <div className="bg-accent-pink text-white px-2 py-0.5 inline-block border-2 border-structural-black font-black text-[9px] uppercase tracking-widest shadow-[2px_2px_0_0_#000000] rounded-none">
            CHIT_MANAGER
          </div>
          
            {/* Language Toggle Desktop */}
            <button 
              onClick={() => setLanguage(language === 'en' ? 'ml' : 'en')}
              className="flex items-center gap-1 bg-white text-structural-black border-2 border-structural-black px-1.5 py-0.5 text-[9px] font-black shadow-[2px_2px_0_0_#000000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
            >
              <Languages className="w-2.5 h-2.5" />
              {language === 'en' ? 'മലയാളം' : 'ENGLISH'}
            </button>
          </div>
        </div>

      {/* Nav Items */}
      <div className="flex flex-row flex-1 justify-around items-center h-16 lg:flex-col lg:justify-start lg:h-auto lg:p-4 lg:gap-4">
        {/* Mobile Language Toggle */}
        <button 
          onClick={() => setLanguage(language === 'en' ? 'ml' : 'en')}
          className="lg:hidden flex flex-col items-center justify-center w-10 h-10 border-2 border-structural-black bg-bg-canvas text-structural-black font-black text-[8px] shadow-[2px_2px_0_0_#000000] hover:bg-structural-black hover:text-white transition-colors"
        >
          <Languages className="w-3.5 h-3.5 mb-1" />
          {language === 'en' ? 'മല' : 'EN'}
        </button>

        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center w-full h-full lg:flex-row lg:justify-start lg:gap-3 lg:px-4 lg:py-3 lg:h-auto transition-all focus-visible:outline-none rounded-none ${
                isActive
                  ? 'bg-accent-primary text-structural-black border-x-2 lg:border-4 border-structural-black shadow-[0_-4px_0_0_#000000] lg:shadow-[4px_4px_0_0_#000000] z-10 lg:-translate-x-1 lg:-translate-y-1'
                  : 'text-structural-black/50 hover:text-structural-black lg:hover:bg-bg-canvas'
              }`}
            >
              <span className={`transition-transform duration-100 ${isActive ? 'scale-110' : ''}`}>
                <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
              </span>
              <span className={`text-[9px] sm:text-[10px] lg:text-lg font-black uppercase tracking-tight lg:italic ${isActive ? 'text-structural-black' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Admin Login/Logout Button */}
        <button
          onClick={() => {
            if (isAdmin) {
               logout();
               setActiveTab('setup');
            } else {
               setActiveTab('login');
            }
          }}
          className={`flex flex-col items-center justify-center w-full h-full lg:flex-row lg:justify-start lg:gap-3 lg:px-4 lg:py-3 lg:h-auto transition-all focus-visible:outline-none rounded-none border-t-2 sm:border-t-0 sm:border-l-2 lg:border-l-0 lg:border-t-2 border-structural-black/10 ${
            activeTab === 'login'
              ? 'bg-accent-pink text-white border-x-2 lg:border-4 border-structural-black shadow-[0_-4px_0_0_#000000] lg:shadow-[4px_4px_0_0_#000000] z-10 lg:-translate-x-1 lg:-translate-y-1'
              : 'text-structural-black/50 hover:text-accent-pink lg:hover:bg-bg-canvas'
          }`}
        >
          <span className={`transition-transform duration-100 ${activeTab === 'login' ? 'scale-110' : ''}`}>
            {isAdmin ? <LogOut className="w-4 h-4 lg:w-5 lg:h-5" /> : <Lock className="w-4 h-4 lg:w-5 lg:h-5" />}
          </span>
          <span className={`text-[9px] sm:text-[10px] lg:text-lg font-black uppercase tracking-tight lg:italic ${activeTab === 'login' ? 'text-white' : ''}`}>
            {isAdmin ? 'Secure Exit' : 'Admin Login'}
          </span>
        </button>
      </div>

      {/* Desktop Footer */}
      <div className="hidden lg:block p-6 mt-auto border-t-4 border-structural-black bg-accent-blue text-white font-black uppercase italic text-[10px] shadow-[0_-4px_0_0_#000000]">
        &copy; {new Date().getFullYear()} {t('nav.footer')}
      </div>
    </nav>
  );
};

export default Sidebar;
