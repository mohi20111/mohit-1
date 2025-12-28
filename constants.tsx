
import React from 'react';
import { ExamType, ExamCategory, HistoryEra } from './types';

export const EXAM_CATEGORIES: ExamCategory[] = [
  { id: 'ugc-net', name: 'UGC NET History', type: ExamType.NET, icon: '🎓' },
  { id: 'upsc-optional', name: 'UPSC History Optional (Pre-2008)', type: ExamType.CIVILS, icon: '🏛️' },
  { id: 'uppsc-mains', name: 'UPPSC Mains MCQ (Pre-2017)', type: ExamType.AP, icon: '📜' },
  { id: 'up-ap', name: 'UPHESC Assistant Professor', type: ExamType.AP, icon: '🏛️' },
  { id: 'mp-ap', name: 'MPPSC Assistant Professor', type: ExamType.AP, icon: '📚' },
  { id: 'raj-ap', name: 'RPSC Assistant Professor', type: ExamType.AP, icon: '⚔️' },
  { id: 'mh-set', name: 'MH SET History', type: ExamType.SET, icon: '📖' },
  { id: 'various-psc', name: 'Other State PSCs (BPSC, JPSC, etc.)', type: ExamType.AP, icon: '🗺️' },
];

export const HISTORY_ERAS = Object.values(HistoryEra);

export const APP_STATS = {
  totalQuestions: '25,000+',
  examsCovered: '75+',
  activeUsers: '15K+',
  accuracy: '99.9%'
};
