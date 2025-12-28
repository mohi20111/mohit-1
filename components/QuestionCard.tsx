
import React, { useState } from 'react';
import { Bookmark, BookmarkCheck, Lightbulb, FileText, ListChecks, Zap } from 'lucide-react';
import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  isBookmarked: boolean;
  onToggleBookmark: (question: Question) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, isBookmarked, onToggleBookmark }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleOptionClick = (option: string) => {
    if (selectedOption) return;
    setSelectedOption(option);
    setShowExplanation(true);
  };

  const isCorrect = selectedOption === question.correctOption;

  // Detect question type for icon markers
  const isAssertion = question.questionText.includes('कथन') && question.questionText.includes('कारण');
  const isMatching = question.questionText.includes('सूची') || question.questionText.includes('मिलान');

  return (
    <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-amber-100 overflow-hidden mb-8 transition-all hover:-translate-y-1 hover:shadow-2xl relative group">
      <div className="p-5 bg-slate-50 border-b border-amber-50 flex justify-between items-center">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[9px] font-black uppercase tracking-wider text-slate-900 bg-amber-400 px-3 py-1.5 rounded-lg border border-amber-500/20 shadow-sm">
            {question.examName} ({question.year})
          </span>
          <span className="text-[9px] text-slate-500 font-black bg-white px-3 py-1.5 rounded-lg border border-slate-100 uppercase tracking-widest shadow-sm">
            {question.topic}
          </span>
          <span className={`text-[9px] px-3 py-1.5 rounded-lg font-black uppercase tracking-widest shadow-sm flex items-center gap-1 border ${
            question.difficulty === 'Easy' ? 'bg-green-50 text-green-700 border-green-100' :
            question.difficulty === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
            'bg-red-50 text-red-700 border-red-100'
          }`}>
            <Zap size={10} /> {question.difficulty}
          </span>
          {isAssertion && <span className="text-[9px] bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg font-black border border-indigo-100 uppercase">कथन-कारण</span>}
          {isMatching && <span className="text-[9px] bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg font-black border border-emerald-100 uppercase tracking-widest">सूची मिलान</span>}
        </div>
        
        <button 
          onClick={() => onToggleBookmark(question)}
          className={`p-3 rounded-xl transition-all ${
            isBookmarked 
              ? 'text-amber-500 bg-amber-50 scale-110 shadow-inner' 
              : 'text-slate-300 hover:text-amber-600 hover:bg-amber-50'
          }`}
          title={isBookmarked ? "बुकमार्क हटाएं" : "बुकमार्क करें"}
        >
          {isBookmarked ? <BookmarkCheck size={22} fill="currentColor" /> : <Bookmark size={22} />}
        </button>
      </div>

      <div className="p-8 md:p-10">
        <div className="mb-8">
          <p className="text-slate-900 font-bold leading-relaxed whitespace-pre-wrap text-xl md:text-2xl font-serif">
            {question.questionText}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.entries(question.options) as [string, string][]).map(([key, value]) => (
            <button
              key={key}
              onClick={() => handleOptionClick(key)}
              disabled={!!selectedOption}
              className={`w-full text-left p-5 rounded-[1.25rem] border-2 transition-all flex items-start gap-4 shadow-sm group/opt ${
                selectedOption === key
                  ? isCorrect
                    ? 'bg-green-50 border-green-500 ring-4 ring-green-100'
                    : 'bg-red-50 border-red-500 ring-4 ring-red-100'
                  : selectedOption && key === question.correctOption
                  ? 'bg-green-50 border-green-200'
                  : 'bg-white border-slate-100 hover:border-amber-400 hover:shadow-lg'
              }`}
            >
              <span className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg font-black border-2 text-sm mt-0.5 transition-colors ${
                selectedOption === key
                  ? isCorrect ? 'bg-green-500 text-white border-green-600' : 'bg-red-500 text-white border-red-600'
                  : 'bg-slate-50 text-slate-500 border-slate-200 group-hover/opt:bg-amber-500 group-hover/opt:text-white group-hover/opt:border-amber-600'
              }`}>
                {key}
              </span>
              <span className={`text-slate-800 font-bold text-base md:text-lg whitespace-pre-wrap ${selectedOption === key ? 'text-slate-900' : ''}`}>{value}</span>
            </button>
          ))}
        </div>

        {showExplanation && (
          <div className={`mt-10 p-8 rounded-[2rem] border-2 shadow-2xl animate-fadeIn ${
            isCorrect ? 'bg-green-50/50 border-green-200 shadow-green-200/20' : 'bg-amber-50/30 border-amber-200 shadow-amber-200/20'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${isCorrect ? 'bg-green-500' : 'bg-amber-500'} text-white shadow-lg`}>
                 <Lightbulb size={20} fill="currentColor" />
              </div>
              <h4 className="font-black text-slate-900 text-sm uppercase tracking-[0.2em]">
                प्रामाणिक व्याख्या (Official Key)
              </h4>
            </div>
            <p className="text-slate-700 leading-relaxed text-lg whitespace-pre-wrap font-medium border-l-4 border-amber-500/20 pl-6 italic">
              {question.explanation}
            </p>
            <div className="mt-6 pt-6 border-t border-slate-200/50 flex flex-wrap justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span className="flex items-center gap-2"><FileText size={14} className="text-amber-500" /> Curated by Mohit Awasthi</span>
              <span className="bg-slate-100 px-3 py-1 rounded-full">Source: {question.examName} Key</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;
