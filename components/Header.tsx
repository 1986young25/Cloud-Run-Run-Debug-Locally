
import React from 'react';
import { AppTab } from '../types';

interface HeaderProps {
  activeTab: AppTab;
}

const Header: React.FC<HeaderProps> = ({ activeTab }) => {
  const getInfo = () => {
    switch (activeTab) {
      case AppTab.CHAT:
        return { title: 'Multimodal Workspace', subtitle: 'Advanced reasoning with Search & Maps grounding' };
      case AppTab.IMAGES:
        return { title: 'Imaging Studio', subtitle: 'State-of-the-art vision generation and editing' };
      case AppTab.VIDEOS:
        return { title: 'Cinematic Lab', subtitle: 'Veo-powered text-to-video generation' };
      case AppTab.LIVE:
        return { title: 'Voice Concierge', subtitle: 'Low-latency natural audio conversations' };
      case AppTab.VISION_NODE:
        return { title: 'Sovereign Vision Node', subtitle: 'ARK-SIGMA 2026 Fiduciary Intelligence' };
      default:
        return { title: 'Dashboard', subtitle: '' };
    }
  };

  const info = getInfo();

  return (
    <header className="h-20 px-8 flex items-center justify-between border-b border-gray-800/50 glass z-10">
      <div>
        <h1 className="text-lg font-semibold text-white tracking-tight">{info.title}</h1>
        <p className="text-sm text-gray-500 font-medium">{info.subtitle}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex -space-x-2">
          <div className="w-8 h-8 rounded-full border-2 border-gray-950 bg-blue-500 flex items-center justify-center text-[10px] font-bold">G</div>
          <div className="w-8 h-8 rounded-full border-2 border-gray-950 bg-purple-500 flex items-center justify-center text-[10px] font-bold">L</div>
        </div>
        <div className="h-4 w-px bg-gray-800"></div>
        <span className="text-xs font-mono text-blue-400 bg-blue-400/10 px-2 py-1 rounded">API_KEY ACTIVE</span>
      </div>
    </header>
  );
};

export default Header;
