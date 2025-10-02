import React from 'react';
import { BookingIcon } from './icons/BookingIcon';
import { ListIcon } from './icons/ListIcon';
import { SubjectsIcon } from './icons/SubjectsIcon';
import { SettingsIcon } from './icons/SettingsIcon';

type View = 'form' | 'list' | 'subjects' | 'settings';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isOpen: boolean;
  onClose: () => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-right transition-all duration-200 ${
      isActive
        ? 'bg-blue-600 text-white shadow-md'
        : 'text-gray-600 hover:bg-slate-200 hover:text-gray-900'
    }`}
  >
    {icon}
    <span className="font-bold">{label}</span>
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isOpen, onClose }) => {
  const handleNavigate = (view: View) => {
    setActiveView(view);
    onClose(); // Close sidebar on mobile after navigation
  };
  
  return (
    <aside className={`w-64 bg-white shadow-lg p-4 flex flex-col fixed md:relative inset-y-0 right-0 z-30 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0`}>
      <div className="flex items-center gap-3 mb-8 px-2">
         <div className="bg-blue-600 p-2 rounded-lg">
           <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494m-9-5.747h18" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494m-9-5.747h18" />
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
         </div>
        <h2 className="text-xl font-black text-gray-800">حجز الكتب</h2>
      </div>
      <nav className="flex flex-col gap-3">
        <NavItem
          icon={<BookingIcon className="h-6 w-6" />}
          label="حجز جديد"
          isActive={activeView === 'form'}
          onClick={() => handleNavigate('form')}
        />
        <NavItem
          icon={<ListIcon className="h-6 w-6" />}
          label="قائمة الحجوزات"
          isActive={activeView === 'list'}
          onClick={() => handleNavigate('list')}
        />
        <NavItem
          icon={<SubjectsIcon className="h-6 w-6" />}
          label="إدارة المواد"
          isActive={activeView === 'subjects'}
          onClick={() => handleNavigate('subjects')}
        />
        <NavItem
          icon={<SettingsIcon className="h-6 w-6" />}
          label="الإعدادات"
          isActive={activeView === 'settings'}
          onClick={() => handleNavigate('settings')}
        />
      </nav>
    </aside>
  );
};

export default Sidebar;
