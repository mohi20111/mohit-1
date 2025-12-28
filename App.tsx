
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Search, BookOpen, Award, Filter, Loader2, ChevronRight, Menu, X, BookMarked, Layers, Bookmark, CheckCircle2, History, ListChecks, MapPin, FileText, Zap, BarChart3, HelpCircle, Phone, GraduationCap, Building2, Mail, Star, Trophy, Map, LayoutList, Lock, User, Upload, LogOut, Camera } from 'lucide-react';
import { EXAM_CATEGORIES, HISTORY_ERAS, APP_STATS } from './constants';
import { Question, HistoryEra, DifficultyLevel } from './types';
import { fetchQuestionsByQuery } from './services/geminiService';
import QuestionCard from './components/QuestionCard';

const App: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [bookmarks, setBookmarks] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEra, setSelectedEra] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | ''>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'browse' | 'search' | 'bookmarks'>('browse');

  // Admin States
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [adminPhoto, setAdminPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load persisted data
    const savedBookmarks = localStorage.getItem('history_bookmarks');
    if (savedBookmarks) {
      try { setBookmarks(JSON.parse(savedBookmarks)); } catch (e) { console.error(e); }
    }

    const savedAdmin = localStorage.getItem('history_admin_auth');
    if (savedAdmin === 'true') setIsAdmin(true);

    const savedPhoto = localStorage.getItem('history_admin_photo');
    if (savedPhoto) setAdminPhoto(savedPhoto);
  }, []);

  useEffect(() => {
    localStorage.setItem('history_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const handleSearch = useCallback(async (e?: React.FormEvent, categoryId?: string, era?: string, difficulty?: DifficultyLevel | '', type?: string, customQuery?: string) => {
    if (e) e.preventDefault();
    setLoading(true);
    
    const cat = categoryId !== undefined ? categoryId : selectedCategoryId;
    const currentEra = era !== undefined ? era : selectedEra;
    const diff = difficulty !== undefined ? difficulty : selectedDifficulty;
    const qType = type !== undefined ? type : selectedType;
    const finalQuery = customQuery !== undefined ? customQuery : searchQuery;
    
    const categoryName = EXAM_CATEGORIES.find(c => c.id === cat)?.name || '';
    
    const results = await fetchQuestionsByQuery(finalQuery, currentEra, categoryName, diff, qType);
    setQuestions(results);
    setLoading(false);
    if (activeTab !== 'bookmarks') {
      setActiveTab(finalQuery || cat || currentEra || diff || qType ? 'search' : 'browse');
    }
  }, [searchQuery, selectedEra, selectedCategoryId, selectedDifficulty, selectedType, activeTab]);

  const toggleBookmark = (question: Question) => {
    setBookmarks(prev => {
      const isAlreadyBookmarked = prev.some(b => b.id === question.id);
      if (isAlreadyBookmarked) {
        return prev.filter(b => b.id !== question.id);
      } else {
        return [...prev, question];
      }
    });
  };

  const selectCategory = (id: string) => {
    const newId = selectedCategoryId === id ? '' : id;
    setSelectedCategoryId(newId);
    handleSearch(undefined, newId, selectedEra, selectedDifficulty, selectedType);
  };

  const selectEra = (era: string) => {
    const newEra = selectedEra === era ? '' : era;
    setSelectedEra(newEra);
    handleSearch(undefined, selectedCategoryId, newEra, selectedDifficulty, selectedType);
  };

  const selectDifficulty = (diff: DifficultyLevel) => {
    const newDiff = selectedDifficulty === diff ? '' : diff;
    setSelectedDifficulty(newDiff);
    handleSearch(undefined, selectedCategoryId, selectedEra, newDiff, selectedType);
  };

  const selectType = (type: string) => {
    const newType = selectedType === type ? '' : type;
    setSelectedType(newType);
    handleSearch(undefined, selectedCategoryId, selectedEra, selectedDifficulty, newType);
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const filteredQuestions = useMemo(() => {
    let result = questions;
    if (selectedDifficulty) {
      result = result.filter(q => q.difficulty === selectedDifficulty);
    }
    if (selectedType) {
      if (selectedType === 'Assertion/Reason') {
        result = result.filter(q => q.questionText.includes('कथन') && q.questionText.includes('कारण'));
      } else if (selectedType === 'Matching') {
        result = result.filter(q => q.questionText.includes('सूची') || q.questionText.includes('मिलान'));
      } else if (selectedType === 'Map-based') {
        result = result.filter(q => q.questionText.toLowerCase().includes('map') || q.questionText.includes('मानचित्र') || q.questionText.includes('स्थान'));
      } else if (selectedType === 'General') {
        result = result.filter(q => 
          !(q.questionText.includes('कथन') && q.questionText.includes('कारण')) &&
          !(q.questionText.includes('सूची') || q.questionText.includes('मिलान')) &&
          !(q.questionText.toLowerCase().includes('map') || q.questionText.includes('मानचित्र') || q.questionText.includes('स्थान'))
        );
      }
    }
    return result;
  }, [questions, selectedDifficulty, selectedType]);

  const fetchUPSCPre2008 = () => {
    setSearchQuery('');
    selectCategory('upsc-optional');
    handleSearch(undefined, 'upsc-optional', undefined, 'Hard', undefined, 'UPSC History Optional Pre-2008');
  };

  const fetchRPSCAsstProf = () => {
    setSearchQuery('');
    selectCategory('raj-ap');
    handleSearch(undefined, 'raj-ap', undefined, 'Hard', undefined, 'RPSC Rajasthan Assistant Professor History Papers');
  };

  // Admin Functions
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Updated Credentials as per request
    if (loginForm.username === 'mohit20111' && loginForm.password === 'Mohit@123') {
      setIsAdmin(true);
      localStorage.setItem('history_admin_auth', 'true');
      setShowLoginModal(false);
      setLoginError('');
    } else {
      setLoginError('गलत यूजरनेम या पासवर्ड।');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('history_admin_auth');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAdminPhoto(base64);
        localStorage.setItem('history_admin_photo', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-amber-100 selection:text-amber-900 bg-[#FDF6E3]">
      {/* Header */}
      <header className="bg-[#1A202C] text-white sticky top-0 z-50 shadow-xl border-b border-amber-500/30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => { setActiveTab('browse'); setSelectedCategoryId(''); setSelectedEra(''); setSelectedDifficulty(''); setSelectedType(''); setSearchQuery(''); handleSearch(); }}>
            <div className="p-1.5 bg-amber-500 rounded-lg group-hover:rotate-6 transition-transform shadow-lg shadow-amber-500/20">
              <BookMarked className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-black tracking-tight leading-tight flex items-center gap-2">
                Mohit Awasthi
                <span className="hidden md:inline text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30 font-bold uppercase tracking-widest">CSJMU Kanpur</span>
              </h1>
              <p className="text-[9px] opacity-70 uppercase tracking-widest leading-none font-black text-amber-500">History MCQ Preparation Hub</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => setActiveTab('bookmarks')} className={`flex items-center gap-2 font-bold transition-colors text-xs uppercase tracking-widest ${activeTab === 'bookmarks' ? 'text-amber-400' : 'hover:text-amber-400'}`}>
              <Bookmark size={16} fill={activeTab === 'bookmarks' ? "currentColor" : "none"} />
              बुकमार्क ({bookmarks.length})
            </button>
            <div className="h-4 w-px bg-slate-700"></div>
            {isAdmin ? (
               <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 font-bold transition-colors text-xs uppercase tracking-widest hover:text-red-300">
                <LogOut size={16} /> लॉगआउट
              </button>
            ) : (
              <a href="tel:+917007846241" className="flex items-center gap-2 hover:text-amber-400 font-bold transition-colors text-xs uppercase tracking-widest">
                <Phone size={14} /> 7007846241
              </a>
            )}
          </nav>

          <button className="md:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Admin Quick Control Bar (Visible only when logged in) */}
      {isAdmin && (
        <div className="bg-amber-500 text-slate-900 px-4 py-2 text-center text-[10px] font-black uppercase tracking-[0.2em] shadow-lg sticky top-16 z-50 flex items-center justify-center gap-4">
          <span>एडमिन मोड एक्टिव (मोहित अवस्थी)</span>
          <button onClick={triggerFileUpload} className="flex items-center gap-1 bg-slate-900 text-white px-3 py-1 rounded-full hover:bg-slate-800 transition-all">
            <Upload size={12} /> फोटो बदलें
          </button>
          <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
        </div>
      )}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#1A202C] text-white p-6 space-y-6 animate-fadeIn border-t border-slate-800 shadow-2xl">
          <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-2xl border border-amber-500/20">
             <div className="bg-amber-500 p-2 rounded-lg"><Phone size={20} className="text-slate-900"/></div>
             <div>
                <p className="text-[10px] uppercase font-black text-amber-500">Direct Contact</p>
                <p className="font-black text-lg">7007846241</p>
             </div>
          </div>
          <button onClick={() => { setActiveTab('bookmarks'); setIsMobileMenuOpen(false); }} className="w-full text-left py-2 flex items-center justify-between font-bold">
            <span className="flex items-center gap-3"><Bookmark size={20} /> बुकमार्क (Saved)</span>
            <span className="bg-amber-500 text-slate-900 px-3 py-1 rounded-full text-xs font-black">{bookmarks.length}</span>
          </button>
          {isAdmin && (
            <button onClick={handleLogout} className="w-full text-left py-2 flex items-center gap-3 font-bold text-red-400">
              <LogOut size={20} /> लॉगआउट
            </button>
          )}
        </div>
      )}

      <main className="flex-grow">
        {/* Hero Section */}
        {activeTab !== 'bookmarks' && (
          <section className="bg-gradient-to-b from-[#1A202C] to-[#2D3748] text-white py-12 md:py-24 relative overflow-hidden border-b-4 border-amber-600">
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
              <div className="absolute top-10 left-10 text-9xl font-black rotate-12 uppercase tracking-tighter">MCQ HUB</div>
            </div>

            <div className="container mx-auto px-4 text-center relative z-10">
              <div className="inline-flex items-center gap-4 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-full mb-8">
                {adminPhoto ? (
                  <img src={adminPhoto} alt="Mohit Awasthi" className="w-8 h-8 rounded-full object-cover border-2 border-amber-500 shadow-md" />
                ) : (
                  <GraduationCap className="text-amber-500 w-4 h-4" />
                )}
                <span className="text-amber-500 text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">Assistant Professor Mohit Awasthi | CSJMU Kanpur</span>
              </div>
              
              <h2 className="text-4xl md:text-7xl font-black mb-6 leading-tight tracking-tighter">
                प्रतियोगी <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-500 to-amber-200">इतिहास</span> प्रश्न बैंक
              </h2>

              <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-4xl mx-auto font-medium leading-relaxed italic border-l-4 border-amber-500/40 pl-6">
                भारत के सभी असिस्टेंट प्रोफेसर, NET/SET और सिविल सेवा परीक्षाओं के इतिहास प्रश्नों का प्रामाणिक हिन्दी संग्रह।
              </p>

              <div className="flex flex-wrap justify-center gap-4 mb-10 max-w-5xl mx-auto px-4">
                 <button 
                   onClick={fetchRPSCAsstProf}
                   className="flex-1 min-w-[280px] bg-emerald-700 hover:bg-emerald-600 text-white py-4 px-6 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-900/40 border-b-4 border-emerald-900 active:border-b-0 active:translate-y-1 uppercase text-xs"
                 >
                    <Map className="w-5 h-5" /> RPSC Rajasthan Asst. Professor Special
                 </button>
                 <button 
                   onClick={fetchUPSCPre2008}
                   className="flex-1 min-w-[280px] bg-amber-600 hover:bg-amber-500 text-slate-900 py-4 px-6 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-amber-900/40 border-b-4 border-amber-800 active:border-b-0 active:translate-y-1 uppercase text-xs"
                 >
                    <Star className="fill-slate-900 w-5 h-5" /> UPSC History Optional (Pre-2008)
                 </button>
              </div>

              <form onSubmit={handleSearch} className="max-w-3xl mx-auto relative group">
                <input 
                  type="text" 
                  placeholder="खोजें: RPSC Assistant Professor, कथन-कारण, सिंधु सभ्यता, UPSC Optional..." 
                  className="w-full pl-16 pr-36 py-5 md:py-7 rounded-2xl bg-white/10 backdrop-blur-md text-white placeholder-slate-400 border border-amber-500/20 shadow-2xl focus:ring-4 focus:ring-amber-500/20 focus:bg-white focus:text-slate-900 focus:placeholder-slate-400 outline-none transition-all text-lg font-bold"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-amber-500/50 w-7 h-7 group-focus-within:text-indigo-600 transition-colors" />
                <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 bg-amber-500 text-slate-900 px-6 md:px-12 py-3 md:py-4 rounded-xl font-black hover:bg-amber-400 transition-all shadow-xl active:scale-95 text-xs uppercase tracking-widest">
                  खोजें
                </button>
              </form>
            </div>
          </section>
        )}

        {/* PROMINENT CATEGORY TABS */}
        {activeTab !== 'bookmarks' && (
          <div className="bg-white border-b border-amber-100 shadow-sm sticky top-16 z-40 overflow-x-auto no-scrollbar">
            <div className="container mx-auto px-4 py-4 flex items-center gap-3 min-w-max">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4 flex items-center gap-1 shrink-0">
                <Award size={14} className="text-amber-500" /> परीक्षा चुनें:
              </span>
              
              <button 
                onClick={fetchRPSCAsstProf}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                  selectedCategoryId === 'raj-ap' 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg' 
                  : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-emerald-400'
                }`}
              >
                <Map size={14} /> RPSC Asst. Professor
              </button>

              <button 
                onClick={fetchUPSCPre2008}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                  selectedCategoryId === 'upsc-optional' 
                  ? 'bg-amber-500 text-slate-900 border-amber-500 shadow-lg' 
                  : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-amber-400'
                }`}
              >
                <Star size={14} fill={selectedCategoryId === 'upsc-optional' ? 'currentColor' : 'none'} /> UPSC Optional
              </button>

              {EXAM_CATEGORIES.filter(c => c.id !== 'upsc-optional' && c.id !== 'raj-ap').map(category => (
                <button 
                  key={category.id}
                  onClick={() => selectCategory(category.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                    selectedCategoryId === category.id 
                    ? 'bg-[#1A202C] text-white border-[#1A202C] shadow-lg' 
                    : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-amber-400'
                  }`}
                >
                  <span className="text-lg">{category.icon}</span> {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Sidebar */}
              {activeTab !== 'bookmarks' && (
                <aside className="lg:w-1/3 xl:w-1/4">
                  <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-slate-200/50 border border-amber-100 sticky top-48 space-y-10">
                    
                    {/* Mohit Awasthi Bio Card */}
                    <div className="p-6 bg-slate-900 rounded-2xl text-white shadow-xl relative overflow-hidden">
                       <div className="flex items-center gap-4 mb-4 relative z-10">
                          {adminPhoto ? (
                            <img src={adminPhoto} alt="Admin" className="w-14 h-14 rounded-full border-2 border-amber-500 object-cover shadow-lg" />
                          ) : (
                            <div className="w-14 h-14 bg-amber-500 rounded-full flex items-center justify-center font-black text-slate-900 text-xl shadow-lg">MA</div>
                          )}
                          <div>
                             <h4 className="font-black text-sm">मोहित अवस्थी</h4>
                             <p className="text-[10px] font-bold text-amber-500 uppercase">Assistant Professor</p>
                          </div>
                       </div>
                       <div className="space-y-2 text-[11px] font-medium opacity-80 border-t border-slate-700 pt-4 relative z-10">
                          <div className="flex items-start gap-2">
                             <Building2 size={14} className="text-amber-500 flex-shrink-0" />
                             <span>Atal Bihari Vajpayee School of Legal Studies, CSJMU Kanpur</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <Phone size={14} className="text-amber-500" />
                             <span>+91 7007846241</span>
                          </div>
                       </div>
                       {isAdmin && (
                         <button onClick={triggerFileUpload} className="absolute top-2 right-2 p-1.5 bg-slate-800 rounded-full text-amber-500 hover:text-amber-400 transition-colors">
                            <Camera size={14} />
                         </button>
                       )}
                    </div>

                    {/* Question Type Filter */}
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-[0.1em]">
                          <HelpCircle className="w-5 h-5 text-amber-600" />
                          <span>प्रश्न प्रकार</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {[
                          { id: 'General', name: 'सामान्य वस्तुनिष्ठ', icon: <LayoutList size={16} /> },
                          { id: 'Assertion/Reason', name: 'कथन और कारण', icon: <FileText size={16} /> },
                          { id: 'Matching', name: 'सूची मिलान', icon: <ListChecks size={16} /> },
                          { id: 'Map-based', name: 'मानचित्र आधारित', icon: <MapPin size={16} /> }
                        ].map((type) => (
                          <button key={type.id} onClick={() => selectType(type.id)} className={`w-full text-left p-4 rounded-xl transition-all flex items-center justify-between border ${selectedType === type.id ? 'bg-[#1A202C] text-white border-[#1A202C] shadow-lg' : 'bg-white border-slate-100 hover:border-amber-300 text-slate-600'}`}>
                            <div className="flex items-center gap-4">
                              <span className={selectedType === type.id ? 'text-amber-400' : 'text-slate-400'}>{type.icon}</span>
                              <span className="font-bold text-xs uppercase">{type.name}</span>
                            </div>
                            {selectedType === type.id && <CheckCircle2 size={16} className="text-amber-400" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </aside>
              )}

              {/* Feed Area */}
              <div className={`${activeTab === 'bookmarks' ? 'w-full max-w-4xl mx-auto' : 'lg:w-2/3 xl:w-3/4'}`}>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[3rem] border-2 border-dashed border-amber-200 shadow-inner">
                    <Loader2 className="w-20 h-20 animate-spin text-amber-600 mb-6" />
                    <p className="text-slate-600 font-black text-2xl tracking-tight">स्रोतों से प्रश्न लोड हो रहे हैं...</p>
                    <p className="text-amber-600/60 font-black text-[10px] uppercase tracking-[0.3em] mt-4 italic">Mohit Awasthi Academic Research Archive</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredQuestions.length > 0 ? (
                      <>
                        <div className="flex items-center justify-between mb-8 border-b-2 border-amber-100 pb-4">
                           <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg bg-amber-500`}>
                                <Trophy size={18} className="text-slate-900" />
                              </div>
                              <h3 className="text-xl font-black text-slate-800 tracking-tight">
                                {selectedCategoryId ? EXAM_CATEGORIES.find(c => c.id === selectedCategoryId)?.name : 'इतिहास प्रश्न संग्रह'}
                              </h3>
                           </div>
                           <div className="text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-widest border border-amber-200">
                             {filteredQuestions.length} प्रश्न मिले
                           </div>
                        </div>
                        {filteredQuestions.map(q => (
                          <QuestionCard key={q.id} question={q} isBookmarked={bookmarks.some(b => b.id === q.id)} onToggleBookmark={toggleBookmark} />
                        ))}
                      </>
                    ) : (
                      <div className="text-center py-32 bg-white rounded-[3rem] border border-amber-100 shadow-xl">
                        <HelpCircle size={64} className="mx-auto mb-6 text-slate-200" />
                        <p className="text-slate-400 font-black text-xl">कोई परिणाम नहीं मिला।</p>
                        <button onClick={() => { setSearchQuery(''); setSelectedCategoryId(''); handleSearch(); }} className="mt-4 text-amber-600 font-bold hover:underline">फ़िल्टर साफ़ करें</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#0F172A] text-slate-400 py-20 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-8 text-white">
                <div className="p-2 bg-amber-500 rounded-xl"><BookMarked className="w-8 h-8 text-slate-900" /></div>
                <span className="text-3xl font-black tracking-tighter">Mohit Awasthi | History</span>
              </div>
              <p className="mb-10 max-w-md leading-relaxed font-bold opacity-60">
                 Assistant Professor, School of Legal Studies, CSJMU Kanpur। यहाँ आपको भारत की सभी प्रतिष्ठित परीक्षाओं के इतिहास का प्रामाणिक संकलन मिलता है।
              </p>
            </div>
            <div>
              <h4 className="text-amber-500 font-black uppercase tracking-widest text-[10px] mb-8">Quick Links</h4>
              <ul className="space-y-4 text-xs font-black uppercase tracking-wider">
                <li><button onClick={fetchRPSCAsstProf} className="hover:text-white transition-colors">RPSC Asst. Professor</button></li>
                <li><button onClick={fetchUPSCPre2008} className="hover:text-white transition-colors">UPSC Optional</button></li>
                {!isAdmin && (
                  <li><button onClick={() => setShowLoginModal(true)} className="flex items-center gap-2 hover:text-white transition-colors text-amber-500/50">
                    <Lock size={12} /> एडमिन लॉगिन
                  </button></li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="text-amber-500 font-black uppercase tracking-widest text-[10px] mb-8">Contact Info</h4>
              <div className="space-y-4">
                 <p className="text-sm font-black text-white flex items-center gap-2">
                    <Phone size={14} className="text-amber-500" /> 7007846241
                 </p>
                 <p className="text-[10px] font-bold opacity-60 uppercase">Kanpur, Uttar Pradesh, India</p>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800/50 mt-20 pt-10 text-center">
             <div className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">
               © {new Date().getFullYear()} Curated by Asst. Prof. Mohit Awasthi. 25K+ MCQs.
             </div>
          </div>
        </div>
      </footer>

      {/* Admin Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl relative border border-amber-100">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors">
              <X size={24} />
            </button>
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-900 mx-auto mb-4 shadow-xl shadow-amber-500/20">
                <Lock size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">एडमिन लॉगिन</h3>
              <p className="text-slate-400 text-sm font-bold mt-2 uppercase tracking-widest">मोहित अवस्थी - आधिकारिक पोर्टल</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">यूजरनेम</label>
                <div className="relative">
                   <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <input 
                    type="text" 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-12 py-4 outline-none focus:border-amber-500 transition-all font-bold" 
                    placeholder="Username"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">पासवर्ड</label>
                <div className="relative">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <input 
                    type="password" 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-12 py-4 outline-none focus:border-amber-500 transition-all font-bold" 
                    placeholder="Password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  />
                </div>
              </div>

              {loginError && <p className="text-red-500 text-xs font-bold text-center">{loginError}</p>}

              <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all active:scale-95 border-b-4 border-slate-700">
                लॉगिन करें
              </button>
            </form>
            
            <p className="mt-8 text-center text-[10px] text-slate-300 font-black uppercase tracking-widest">
              Secured Academic Portal v2.5
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
