
import React from 'react';
import { AppTab } from '../types';

interface SidebarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: AppTab.CHAT, label: 'Master Intelligence', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
    { id: AppTab.IMAGES, label: 'Intel Imaging', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 0 002 2z' },
    { id: AppTab.VIDEOS, label: 'Tactical Recon', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
    { id: AppTab.LIVE, label: 'Resonance Link', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' },
    { id: AppTab.VISION_NODE, label: 'Sovereign Node', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { id: AppTab.ASSETS, label: 'Trust Ledger', icon: 'M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z' },
    { id: AppTab.SENTINEL, label: 'Sentinel Dashboard', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { id: AppTab.OVERLORD, label: 'Recursive Overlord', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { id: AppTab.NEXUS, label: 'Nexus Portal', icon: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01' },
  ];

  return (
    <aside className="w-20 md:w-64 flex flex-col bg-gray-950 border-r border-gray-800 transition-all duration-300">
      <div className="p-6 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
            <span className="text-white font-bold tracking-tighter">NY</span>
          </div>
          <span className="text-lg font-black bg-gradient-to-r from-amber-500 to-amber-200 bg-clip-text text-transparent hidden md:block uppercase italic leading-none">
            Sovereign<br/><span className="text-xs font-mono tracking-[0.2em] opacity-80">Command</span>
          </span>
        </div>
      </div>
      
      <nav className="flex-1 px-3 space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              activeTab === tab.id
                ? 'bg-amber-600/10 text-amber-500 border border-amber-500/20 shadow-sm'
                : 'text-gray-500 hover:bg-gray-900 hover:text-gray-200'
            }`}
          >
            <svg
              className={`w-6 h-6 shrink-0 ${activeTab === tab.id ? 'text-amber-500' : 'text-gray-600 group-hover:text-gray-400'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
            </svg>
            <span className="font-bold text-xs uppercase tracking-wider hidden md:block">{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 mt-auto">
        <div className="p-4 bg-gray-900/50 rounded-2xl border border-gray-800 hidden md:block">
          <p className="text-[10px] text-gray-500 mb-1 uppercase font-bold tracking-widest">Authority Lock</p>
          <p className="text-sm font-black text-amber-400 italic">EIN 41-6820289</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
