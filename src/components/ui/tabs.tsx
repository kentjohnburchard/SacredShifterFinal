import React, { createContext, useState, useContext } from 'react';

type TabsContextType = {
  activeTab: string;
  setActiveTab: (value: string) => void;
};

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export const Tabs: React.FC<{
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}> = ({ defaultValue, value, onValueChange, children, className = '' }) => {
  const [activeTabInternal, setActiveTabInternal] = useState(defaultValue);
  
  const activeTab = value !== undefined ? value : activeTabInternal;
  
  const setActiveTab = (newValue: string) => {
    if (value === undefined) {
      setActiveTabInternal(newValue);
    }
    onValueChange?.(newValue);
  };
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabsList: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return <div className={className}>{children}</div>;
};

export const TabsTrigger: React.FC<{
  children: React.ReactNode;
  value: string;
  className?: string;
  activeClassName?: string;
  style?: React.CSSProperties;
}> = ({ children, value, className = '', activeClassName = '', style }) => {
  const context = useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsTrigger must be used within Tabs');
  }
  
  const { activeTab, setActiveTab } = context;
  const isActive = activeTab === value;
  
  return (
    <button
      type="button"
      className={`${className} ${isActive ? activeClassName : ''}`}
      onClick={() => setActiveTab(value)}
      style={style}
    >
      {children}
    </button>
  );
};

export const TabsContent: React.FC<{
  children: React.ReactNode;
  value: string;
  className?: string;
}> = ({ children, value, className = '' }) => {
  const context = useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsContent must be used within Tabs');
  }
  
  const { activeTab } = context;
  
  if (activeTab !== value) return null;
  
  return <div className={className}>{children}</div>;
};