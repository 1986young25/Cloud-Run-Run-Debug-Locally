
import React, { useState, useEffect } from 'react';
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
import { ComplianceAuditPanel } from './components/ComplianceAuditPanel';
import { auditStore } from './utils/auditStore';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.SENTINEL);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Look for buttons, links, or inputs
      const interactive = target.closest('button, a, input, select, [role="button"], [role="tab"]');
      if (interactive) {
        let text = (interactive.textContent || (interactive as HTMLInputElement).value || '').trim();
        text = text.substring(0, 40).replace(/\s+/g, ' '); // Normalize and truncate
        
        if (text || interactive.id || interactive.className) {
          const actionText = text ? `Clicked '${text}'` : `Interacted with element ${interactive.tagName}`;
          const targetContext = window.location.pathname + ` (Tab: ${activeTab.toUpperCase()})`;
          
          // Generate a mock compliance code based on the tab
          const compCodes = ['UCC-CER-NYMT-10A', 'MCL § 700.7913-B', 'SEC-RULE-4A', 'DOD-ZT-800-53', 'ASC-350-40-CAP'];
          const randomCode = compCodes[Math.floor(Math.random() * compCodes.length)];
          
          auditStore.addLog('USER_ACTION', actionText, randomCode);
        }
      }
    };

    // Use capturing phase to ensure we get it even if propagation is stopped
    window.addEventListener('click', handleClick, true);
    return () => window.removeEventListener('click', handleClick, true);
  }, [activeTab]);

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
      case AppTab.COMPLIANCE_AUDIT:
        return <ComplianceAuditPanel />;
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
