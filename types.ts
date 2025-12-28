
export enum ExamType {
  NET = 'UGC NET/JRF',
  SET = 'State Eligibility Test (SET)',
  AP = 'Assistant Professor (PSC)',
  PGT = 'PGT/TGT History',
  CIVILS = 'Civil Services (History Optional)'
}

export enum HistoryEra {
  ANCIENT = 'प्राचीन भारत (Ancient India)',
  MEDIEVAL = 'मध्यकालीन भारत (Medieval India)',
  MODERN = 'आधुनिक भारत (Modern India)',
  WORLD = 'विश्व इतिहास (World History)',
  HISTORIOGRAPHY = 'इतिहास लेखन (Historiography)'
}

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export interface Question {
  id: string;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  examName: string;
  year: string;
  topic: HistoryEra;
  difficulty: DifficultyLevel;
}

export interface ExamCategory {
  id: string;
  name: string;
  type: ExamType;
  icon: string;
}
