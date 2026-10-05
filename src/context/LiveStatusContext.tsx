import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LiveStatusContextType {
  connected: boolean;
  setConnected: (status: boolean) => void;
}

const LiveStatusContext = createContext<LiveStatusContextType | null>(null);

export const LiveStatusProvider = ({ children }: { children: ReactNode }) => {
  const [connected, setConnected] = useState<boolean>(false);
  return (
    <LiveStatusContext.Provider value={{ connected, setConnected }}>
      {children}
    </LiveStatusContext.Provider>
  );
};

export const useLiveStatus = (): LiveStatusContextType => {
  const context = useContext(LiveStatusContext);
  if (!context) {
    throw new Error('useLiveStatus must be used within a LiveStatusProvider');
  }
  return context;
};