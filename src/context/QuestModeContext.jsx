import React, { createContext, useContext, useState, useMemo } from 'react';
import { Colors } from '../constants';

const QuestModeContext = createContext(null);

export function QuestModeProvider({ children }) {
  // 'lazy' (ordering/requesting, Purple #7C3AED) or 'quester' (delivering/earning, Green #10B981)
  const [mode, setMode] = useState('lazy');

  // User hostel & point stats
  const [userProfile, setUserProfile] = useState({
    hostel: 'BH-2',
    room: '214',
    hostelBadge: 'BH-2 • Room 214',
    qpBalance: 450,
    name: 'Mohit',
  });

  const toggleMode = () => {
    setMode((prev) => (prev === 'lazy' ? 'quester' : 'lazy'));
  };

  const isLazyMode = mode === 'lazy';
  const isQuesterMode = mode === 'quester';

  const accentColor = isLazyMode ? Colors.lazyMode : Colors.questerMode;
  const accentColorLight = isLazyMode ? Colors.lazyModeLight : Colors.questerModeLight;
  const accentBg = isLazyMode ? Colors.lazyModeBg : Colors.questerModeBg;
  const accentBorder = isLazyMode ? Colors.lazyModeBorder : Colors.questerModeBorder;

  const value = useMemo(
    () => ({
      mode,
      setMode,
      toggleMode,
      isLazyMode,
      isQuesterMode,
      userProfile,
      setUserProfile,
      accentColor,
      accentColorLight,
      accentBg,
      accentBorder,
    }),
    [mode, userProfile, accentColor, accentColorLight, accentBg, accentBorder]
  );

  return (
    <QuestModeContext.Provider value={value}>
      {children}
    </QuestModeContext.Provider>
  );
}

export function useQuestMode() {
  const context = useContext(QuestModeContext);
  if (!context) {
    throw new Error('useQuestMode must be used within a QuestModeProvider');
  }
  return context;
}

export default QuestModeContext;
