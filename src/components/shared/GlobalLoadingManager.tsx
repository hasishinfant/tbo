// Global loading manager component
import React, { ReactNode } from 'react';

interface GlobalLoadingManagerProps {
  children: ReactNode;
}

export const GlobalLoadingManager: React.FC<GlobalLoadingManagerProps> = ({ children }) => {
  return <>{children}</>;
};