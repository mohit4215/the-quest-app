import React, { createContext, useContext, useState, useMemo } from 'react';
import { Colors } from '../constants';

const QuestModeContext = createContext(null);

export const DEFAULT_ACTIVE_QUEST = {
  id: 'q_active_default',
  item: '2× Butter Maggi & Cold Coffee',
  pickupSpot: 'Night Canteen (Nescafe Booth)',
  dropOffHostelRoom: 'BH-2 • Room 214',
  recipientName: 'Aman Sharma',
  recipientPhone: '+91 98765 43210',
  cashTip: '₹30',
  qpReward: '+50 QP',
  rewardQPNumber: 50,
  otpCode: '4821',
  countdown: '15 mins left',
  notes: 'Extra seasoning in Maggi. Call when reaching 2nd floor.',
  status: 'active',
};

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

  // Active quest tracker state
  const [activeQuest, setActiveQuest] = useState(DEFAULT_ACTIVE_QUEST);
  const [activeStep, setActiveStep] = useState(0); // 0: Claimed, 1: At Shop/Gate, 2: Walking to Hostel, 3: Delivered

  const toggleMode = () => {
    setMode((prev) => (prev === 'lazy' ? 'quester' : 'lazy'));
  };

  const isLazyMode = mode === 'lazy';
  const isQuesterMode = mode === 'quester';

  const accentColor = isLazyMode ? Colors.lazyMode : Colors.questerMode;
  const accentColorLight = isLazyMode ? Colors.lazyModeLight : Colors.questerModeLight;
  const accentBg = isLazyMode ? Colors.lazyModeBg : Colors.questerModeBg;
  const accentBorder = isLazyMode ? Colors.lazyModeBorder : Colors.questerModeBorder;

  // Accept a quest from Home Feed
  const acceptQuest = (quest) => {
    // Extract numerical QP
    let qpNum = 50;
    if (quest?.qpReward) {
      const parsed = parseInt(quest.qpReward.replace(/[^0-9]/g, ''), 10);
      if (!isNaN(parsed)) qpNum = parsed;
    }

    const formattedQuest = {
      ...quest,
      rewardQPNumber: qpNum,
      otpCode: quest?.otpCode || quest?.otp || '4821',
      recipientName: quest?.posterName || quest?.recipientName || 'Hostel Peer',
      status: 'active',
    };

    setActiveQuest(formattedQuest);
    setActiveStep(0); // Start at "Quest Claimed"
    setMode('quester'); // Auto flip to Quester mode
  };

  // Add QP to top wallet
  const addQP = (amount) => {
    setUserProfile((prev) => ({
      ...prev,
      qpBalance: (prev.qpBalance || 0) + amount,
    }));
  };

  // Advance tracker step
  const advanceStep = () => {
    setActiveStep((prev) => Math.min(3, prev + 1));
  };

  // Reset or clear active quest
  const clearActiveQuest = () => {
    setActiveQuest(null);
    setActiveStep(0);
  };

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
      activeQuest,
      setActiveQuest,
      activeStep,
      setActiveStep,
      acceptQuest,
      advanceStep,
      addQP,
      clearActiveQuest,
    }),
    [
      mode,
      userProfile,
      accentColor,
      accentColorLight,
      accentBg,
      accentBorder,
      activeQuest,
      activeStep,
    ]
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
