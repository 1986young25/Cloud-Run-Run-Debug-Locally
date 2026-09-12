
import React, { useState } from 'react';
import { AppTab } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ChatPanel from './components/ChatPanel';
import ImagePanel from './components/ImagePanel';
import VideoPanel from './components/VideoPanel';
import LivePanel from './components/LivePanel';
import VisionNodePanel from './components/VisionNodePanel';
import AssetsPanel from './components/AssetsPanel';
import OverlordPanel from './components/OverlordPanel';
import SentinelDashboard from './components/SentinelDashboard';
import NexusPortal from './components/NexusPortal';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.SENTINEL);

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.CHAT:
        return <ChatPanel />;
      case AppTab.IMAGES:
        return <ImagePanel />;
      case AppTab.VIDEOS:
        return <VideoPanel />;
      case AppTab.LIVE:
        return <LivePanel />;
      case AppTab.VISION_NODE:
        return <VisionNodePanel />;
      case AppTab.ASSETS:
        return <AssetsPanel />;
      case AppTab.OVERLORD:
        return <OverlordPanel />;
      case AppTab.SENTINEL:
        return <SentinelDashboard />;
      case AppTab.NEXUS:
        return <NexusPortal />;
      default:
        return <ChatPanel />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-950 text-gray-100">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex flex-col flex-1 relative overflow-hidden">
        <Header activeTab={activeTab} />
        <main className="flex-1 overflow-auto bg-gray-900/50">
          <div className="h-full w-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
