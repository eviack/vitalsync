import React from 'react';
import { TimelineView } from './TimelineView';
import { ChatPanel } from './ChatPanel';

export const DoctorDashboard = () => {
  return (
    <div className="flex h-screen w-screen bg-white overflow-hidden">
      
      {/* LEFT: Patient Timeline (Context) */}
      {/* Flex-1 allows it to take up available space, roughly 65-70% usually */}
      <div className="flex-1 h-full border-r border-gray-200 relative z-0">
        <TimelineView />
      </div>

      {/* RIGHT: AI Doctor Assistant (Interaction) */}
      {/* Fixed width or percentage based width */}
      <div className="w-[400px] h-full relative z-10 shadow-2xl">
        <ChatPanel />
      </div>

    </div>
  );
};