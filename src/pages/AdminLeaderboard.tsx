import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, Download, RefreshCw, Search, Eye, CheckCircle2, 
  XCircle, Clock, Users, Lock, ShieldAlert, FileSpreadsheet, 
  ArrowLeft, Sun, Moon, Copy, Check, Sparkles, AlertTriangle, Trash2
} from 'lucide-react';
import { fetchLeaderboardEntries, clearAllSubmissions, deleteParticipantSubmission } from '../lib/supabase';
import { LeaderboardEntry } from '../types';
import { soundFX } from '../lib/audioService';
import { useLanguage } from '../lib/i18n';

interface AdminLeaderboardProps {
  onExit: () => void;
}

export const AdminLeaderboard: React.FC<AdminLeaderboardProps> = ({ onExit }) => {
  const { t, language, setLanguage } = useLanguage();

  // Passcode gate state
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('cz_admin_authed') === 'true';
  });
  const [authError, setAuthError] = useState('');

  // Data & UI states
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState<number>(5);
  const [selectedEntry, setSelectedEntry] = useState<LeaderboardEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<LeaderboardEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [actionFeedback, setActionFeedback] = useState<string>('');
  const [copiedExplanation, setCopiedExplanation] = useState<boolean>(false);
  const [isDarkProjectorMode, setIsDarkProjectorMode] = useState<boolean>(false);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  // Authentication check
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = passcode.trim().toLowerCase();
    if (clean === 'admin2026' || clean === 'frostpeak2026' || clean === 'casezero2026') {
      sessionStorage.setItem('cz_admin_authed', 'true');
      setIsAuthenticated(true);
      setAuthError('');
      soundFX.playClueFound();
    } else {
      setAuthError('Invalid Organizer Passcode. Access denied.');
      soundFX.playAlertBeep();
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('cz_admin_authed');
    setIsAuthenticated(false);
    setPasscode('');
  };

  // Fetch data
  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await fetchLeaderboardEntries();
      setEntries(data);
    } catch (e) {
      console.error('Error loading leaderboard:', e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Delete participant & allow retake with same name
  const handleConfirmDelete = async () => {
    if (!deletingEntry) return;
    setIsDeleting(true);
    soundFX.playAlertBeep();
    try {
      await deleteParticipantSubmission(
        deletingEntry.id,
        deletingEntry.participantName,
        deletingEntry.participantId,
        deletingEntry.sessionId
      );
      setActionFeedback(`Deleted "${deletingEntry.participantName}". 3-strike tab locks & submission records cleared — they can now register again with the same name.`);
      if (selectedEntry?.id === deletingEntry.id) {
        setSelectedEntry(null);
      }
      setDeletingEntry(null);
      await loadData(true);
      setTimeout(() => setActionFeedback(''), 8000);
    } catch (err) {
      console.error('Error deleting participant:', err);
      alert('Failed to delete participant record.');
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // Auto-refresh interval (5s countdown)
  useEffect(() => {
    if (!isAuthenticated || !autoRefresh) return;

    const timer = setInterval(() => {
      setSecondsUntilRefresh((prev) => {
        if (prev <= 1) {
          loadData(true);
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAuthenticated, autoRefresh]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const q = searchQuery.toLowerCase();
    return entries.filter(
      (e) =>
        e.participantName.toLowerCase().includes(q) ||
        e.accusedSuspect.toLowerCase().includes(q) ||
        e.confirmationCode?.toLowerCase().includes(q)
    );
  }, [entries, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = entries.length;
    if (total === 0) return { total: 0, topScore: 0, avgScore: 0, correctRate: 0 };
    const topScore = Math.max(...entries.map((e) => e.score));
    const avgScore = Math.round(entries.reduce((acc, curr) => acc + curr.score, 0) / total);
    const correctCount = entries.filter((e) => e.isCorrectCulprit).length;
    const correctRate = Math.round((correctCount / total) * 100);
    return { total, topScore, avgScore, correctRate };
  }, [entries]);

  // 1-Click Export CSV
  const handleExportCSV = () => {
    soundFX.playCameraSwitch();
    if (entries.length === 0) {
      alert('No submission records to export yet.');
      return;
    }

    const headers = [
      'Rank',
      'Participant Name',
      'Total Score (out of 100)',
      '1. Accused Murderer',
      '1. Murderer Correct?',
      '1. Murderer Score (out of 40)',
      '2. Evidence Attached',
      '2. Evidence Score (out of 30)',
      '3. Text Rationale Score (out of 30)',
      '4. Time Taken',
      '4. Time Taken Seconds',
      'Tab Switches',
      'Strikes (Out of 3)',
      'Integrity Status',
      'Critical Clues Count',
      'Confirmation Code',
      'Submitted At',
      'Investigative Deduction Explanation'
    ];

    const rows = entries.map((e) => [
      e.rank,
      `"${e.participantName.replace(/"/g, '""')}"`,
      e.score,
      `"${e.accusedSuspect.replace(/"/g, '""')}"`,
      e.isCorrectCulprit ? 'YES (Dr. Evelyn Hayes)' : 'NO',
      e.suspectScore ?? (e.isCorrectCulprit ? 40 : 0),
      `"${e.evidenceCodes.join('; ')}"`,
      e.evidenceScore ?? 0,
      e.explanationScore ?? 0,
      `"${e.timeTakenFormatted}"`,
      e.timeTakenSeconds,
      e.tabSwitches || 0,
      e.strikes || 0,
      e.flagged ? '"FLAGGED: EXTERNAL BROWSING DETECTED"' : '"CLEAN"',
      e.cluesCount,
      e.confirmationCode || '',
      `"${new Date(e.submittedAt).toLocaleString()}"`,
      `"${(e.explanation || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `case_zero_leaderboard_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedExplanation(true);
    setTimeout(() => setCopiedExplanation(false), 2000);
  };

  // PASSCODE LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#ede7dc] flex items-center justify-center p-4 font-sans text-[#1c1917]">
        <div className="w-full max-w-md bg-[#f5f0e6] border-2 border-[#cfc7b7] rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2 border-b border-[#cfc7b7] pb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-900 text-white flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-7 h-7" />
            </div>
            <div className="pt-2">
              <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950 font-bold border border-amber-300">
                RESTRICTED JURY ACCESS
              </span>
              <h1 className="text-2xl font-black font-display text-[#1c1917] mt-1.5">
                ORGANIZER CONSOLE
              </h1>
              <p className="text-xs text-stone-600 font-sans">
                Enter your organizer passcode to access the live event leaderboard.
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-stone-700 uppercase mb-1.5">
                Passcode
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (authError) setAuthError('');
                }}
                placeholder="Enter organizer passcode"
                className="w-full bg-[#fbf9f5] border-2 border-[#cfc7b7] focus:border-blue-800 focus:ring-2 focus:ring-blue-200 rounded-xl px-4 py-3 text-sm font-mono text-[#1c1917] font-semibold outline-none transition"
                autoFocus
              />
              {authError && (
                <p className="mt-2 text-xs font-mono text-red-700 font-bold flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{authError}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-mono text-xs font-bold uppercase tracking-wider transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              UNLOCK LEADERBOARD
            </button>
          </form>

          <div className="pt-2 text-center">
            <button
              onClick={onExit}
              className="text-xs font-mono text-stone-600 hover:text-stone-900 font-semibold underline"
            >
              ← Return to Case Zero Investigation
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE ADMIN LEADERBOARD (PROJECTOR READY)
  const isDark = isDarkProjectorMode;

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-[#ede7dc] text-[#1c1917]'
    }`}>
      
      {/* Top Admin Action Header */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-md px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-md ${
        isDark ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-[#f5f0e6]/95 border-[#cfc7b7] text-[#1c1917]'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-800 text-white flex items-center justify-center font-bold shadow-sm">
            <Trophy className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-xl font-black font-display tracking-tight leading-none">
                CASE ZERO // LIVE EVENT LEADERBOARD
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 font-bold hidden sm:inline">
                OFFICIAL JURY CONSOLE
              </span>
            </div>
            <p className={`text-xs mt-0.5 font-mono ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
              Frostpeak Conservatory Murder Investigation — Live Event Rankings
            </p>
          </div>
        </div>

        {/* Toolbar buttons */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          
          {/* 1-Click Export CSV */}
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center space-x-1.5 transition shadow-sm hover:shadow"
            title="Download formatted CSV spreadsheet for Excel"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">EXPORT TO CSV (EXCEL)</span>
            <span className="sm:hidden">CSV</span>
          </button>

          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-xl border font-bold flex items-center space-x-1.5 transition shadow-sm ${
              autoRefresh
                ? isDark
                  ? 'bg-blue-900/40 border-blue-500 text-blue-300'
                  : 'bg-blue-100 border-blue-300 text-blue-950'
                : isDark
                ? 'bg-slate-800 border-slate-700 text-slate-400'
                : 'bg-[#e6dfd2] border-[#cfc7b7] text-stone-600'
            }`}
            title="Toggle live 5-second automatic refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh && loading ? 'animate-spin' : ''}`} />
            <span>{autoRefresh ? `LIVE (${secondsUntilRefresh}s)` : 'PAUSED'}</span>
          </button>

          {/* Manual Refresh */}
          <button
            onClick={() => loadData()}
            className={`p-2 rounded-xl border transition shadow-sm ${
              isDark ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-[#e6dfd2] border-[#cfc7b7] text-stone-800 hover:bg-[#ded6c7]'
            }`}
            title="Refresh now"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Dark / Light Projector Mode Toggle */}
          <button
            onClick={() => setIsDarkProjectorMode(!isDarkProjectorMode)}
            className={`p-2 rounded-xl border transition shadow-sm ${
              isDark ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700' : 'bg-[#e6dfd2] border-[#cfc7b7] text-stone-800 hover:bg-[#ded6c7]'
            }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Projector Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Language Toggle: EN / ಕನ್ನಡ */}
          <div 
            title={t('lang_toggle_title', 'Switch Language / ಭಾಷೆಯನ್ನು ಬದಲಿಸಿ (English / ಕನ್ನಡ)')}
            className={`flex items-center p-0.5 rounded-lg border text-[11px] font-mono font-bold shadow-sm ${
              isDark ? 'bg-slate-800 border-slate-700' : 'bg-[#ded6c7] border-[#cfc7b7]'
            }`}
          >
            <button
              type="button"
              onClick={() => { setLanguage('en'); soundFX.playCameraSwitch(); }}
              className={`px-2 py-1 rounded-md transition-all ${language === 'en' ? 'bg-blue-800 text-white shadow-sm' : isDark ? 'text-slate-400 hover:text-white' : 'text-stone-700 hover:text-stone-950'}`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => { setLanguage('kn'); soundFX.playCameraSwitch(); }}
              className={`px-2 py-1 rounded-md transition-all ${language === 'kn' ? 'bg-blue-800 text-white shadow-sm' : isDark ? 'text-slate-400 hover:text-white' : 'text-stone-700 hover:text-stone-950'}`}
            >
              ಕನ್ನಡ
            </button>
          </div>

          {/* Logout & Exit */}
          <button
            onClick={handleLogout}
            className={`px-3 py-2 rounded-xl border transition font-bold ${
              isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-[#e6dfd2] border-[#cfc7b7] text-stone-700 hover:bg-[#ded6c7]'
            }`}
            title="Lock Console"
          >
            LOCK
          </button>

          <button
            onClick={onExit}
            className={`p-2 rounded-xl border transition ${
              isDark ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200' : 'bg-[#e6dfd2] border-[#cfc7b7] text-stone-600 hover:text-stone-900'
            }`}
            title="Return to case"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        
        {/* Deletion & Retake Feedback Notification Banner */}
        {actionFeedback && (
          <div className="p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950 border-2 border-emerald-400 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-mono text-xs font-bold flex items-center justify-between shadow-md animate-fade-in">
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <span>{actionFeedback}</span>
            </div>
            <button
              onClick={() => setActionFeedback('')}
              className="text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 font-bold px-2 py-1"
            >
              ✕
            </button>
          </div>
        )}
        
        {/* KPI Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-5 rounded-2xl border shadow-sm ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-[#f5f0e6] border-[#cfc7b7]'
          }`}>
            <span className={`text-xs font-mono uppercase block font-semibold ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
              TOTAL SUBMISSIONS
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl font-black font-display">{stats.total}</span>
              <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>competitors</span>
            </div>
          </div>

          <div className={`p-5 rounded-2xl border shadow-sm ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-[#f5f0e6] border-[#cfc7b7]'
          }`}>
            <span className={`text-xs font-mono uppercase block font-semibold ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
              TOP SCORE
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl font-black font-display text-blue-600 dark:text-blue-400">
                {stats.topScore}
              </span>
              <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>/ 100</span>
            </div>
          </div>

          <div className={`p-5 rounded-2xl border shadow-sm ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-[#f5f0e6] border-[#cfc7b7]'
          }`}>
            <span className={`text-xs font-mono uppercase block font-semibold ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
              AVERAGE SCORE
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl font-black font-display">{stats.avgScore}</span>
              <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>pts</span>
            </div>
          </div>

          <div className={`p-5 rounded-2xl border shadow-sm ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-[#f5f0e6] border-[#cfc7b7]'
          }`}>
            <span className={`text-xs font-mono uppercase block font-semibold ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
              SOLVED CULPRIT RATE
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl font-black font-display text-emerald-600 dark:text-emerald-400">
                {stats.correctRate}%
              </span>
              <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>Evelyn identified</span>
            </div>
          </div>
        </div>

        {/* Podium for Top 3 (if available) */}
        {entries.length >= 1 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Rank 2 (Silver) */}
            {entries[1] ? (
              <div className={`order-2 md:order-1 p-5 rounded-2xl border-2 flex flex-col justify-between shadow-md ${
                isDark ? 'bg-slate-900 border-slate-700' : 'bg-[#f5f0e6] border-[#cfc7b7]'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🥈</span>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500">
                    2ND PLACE
                  </span>
                </div>
                <div className="my-3">
                  <h3 className="text-xl font-black font-display truncate">{entries[1].participantName}</h3>
                  <p className="text-xs font-mono text-stone-500 mt-0.5">Time: {entries[1].timeTakenFormatted}</p>
                </div>
                <div className="flex items-center justify-between border-t border-[#cfc7b7]/50 pt-3 text-xs font-mono">
                  <span className="font-bold">{entries[1].score} PTS</span>
                  <span className="text-[11px] truncate max-w-[140px] font-semibold">{entries[1].accusedSuspect}</span>
                </div>
              </div>
            ) : (
              <div className="order-2 md:order-1 opacity-0"></div>
            )}

            {/* Rank 1 (Gold - Elevated) */}
            {entries[0] && (
              <div className={`order-1 md:order-2 p-6 rounded-2xl border-2 flex flex-col justify-between shadow-xl transform md:-translate-y-2 ${
                isDark 
                  ? 'bg-gradient-to-b from-amber-950/40 to-slate-900 border-amber-500/80 ring-2 ring-amber-500/30' 
                  : 'bg-gradient-to-b from-amber-100/90 to-[#f5f0e6] border-amber-500 ring-2 ring-amber-300'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-3xl">🥇</span>
                  <span className="text-xs font-mono font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-200/60 dark:bg-amber-900/60 px-3 py-1 rounded-full border border-amber-400">
                    EVENT CHAMPION
                  </span>
                </div>
                <div className="my-4">
                  <h3 className="text-2xl font-black font-display truncate text-stone-900 dark:text-white">
                    {entries[0].participantName}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1 text-xs font-mono text-stone-600 dark:text-stone-300">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Time Taken: <strong className="text-stone-900 dark:text-white">{entries[0].timeTakenFormatted}</strong></span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-amber-300 dark:border-amber-800 pt-3 text-xs font-mono">
                  <span className="text-base font-black text-blue-900 dark:text-blue-300">{entries[0].score} / 100 PTS</span>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 font-bold text-[11px] truncate max-w-[140px]">
                    {entries[0].accusedSuspect}
                  </span>
                </div>
              </div>
            )}

            {/* Rank 3 (Bronze) */}
            {entries[2] ? (
              <div className={`order-3 p-5 rounded-2xl border-2 flex flex-col justify-between shadow-md ${
                isDark ? 'bg-slate-900 border-slate-700' : 'bg-[#f5f0e6] border-[#cfc7b7]'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🥉</span>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800 dark:text-amber-500">
                    3RD PLACE
                  </span>
                </div>
                <div className="my-3">
                  <h3 className="text-xl font-black font-display truncate">{entries[2].participantName}</h3>
                  <p className="text-xs font-mono text-stone-500 mt-0.5">Time: {entries[2].timeTakenFormatted}</p>
                </div>
                <div className="flex items-center justify-between border-t border-[#cfc7b7]/50 pt-3 text-xs font-mono">
                  <span className="font-bold">{entries[2].score} PTS</span>
                  <span className="text-[11px] truncate max-w-[140px] font-semibold">{entries[2].accusedSuspect}</span>
                </div>
              </div>
            ) : (
              <div className="order-3 opacity-0"></div>
            )}
          </div>
        )}

        {/* Search & Control Filter Bar */}
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-[#f5f0e6] border-[#cfc7b7]'
        }`}>
          <div className="relative w-full sm:w-80">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-stone-500'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search participant name, suspect..."
              className={`w-full rounded-xl pl-9 pr-4 py-2 text-xs font-mono outline-none border transition ${
                isDark 
                  ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-blue-500' 
                  : 'bg-[#fbf9f5] border-[#cfc7b7] text-stone-900 placeholder-stone-400 focus:border-blue-800'
              }`}
            />
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className={isDark ? 'text-slate-400' : 'text-stone-600'}>
              SHOWING: <strong className={isDark ? 'text-slate-200' : 'text-stone-900'}>{filteredEntries.length}</strong> OF {entries.length}
            </span>
          </div>
        </div>

        {/* Official Ranking Criteria Indicator */}
        <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs font-mono shadow-sm ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-[#e6dfd2] border-[#cfc7b7] text-stone-800'
        }`}>
          <div className="flex items-center space-x-2 font-bold uppercase tracking-wider text-amber-900 dark:text-amber-400">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>OFFICIAL JURY RANKING ORDER:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
            <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-950 border border-blue-300 dark:bg-blue-950 dark:text-blue-200">
              1. Murderer Identification (40 pts)
            </span>
            <span className="text-stone-400">➔</span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-950 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200">
              2. Critical Evidence (30 pts)
            </span>
            <span className="text-stone-400">➔</span>
            <span className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-950 border border-purple-300 dark:bg-purple-950 dark:text-purple-200">
              3. Text Rationale (30 pts)
            </span>
            <span className="text-stone-400">➔</span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-950 border border-amber-300 dark:bg-amber-950 dark:text-amber-200">
              4. Time Taken (Speed)
            </span>
          </div>
        </div>

        {/* Master Projector Table */}
        <div className={`rounded-2xl border overflow-hidden shadow-lg ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-[#f5f0e6] border-[#cfc7b7]'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className={`border-b text-[11px] uppercase tracking-wider ${
                isDark ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-[#eae4d8] border-[#cfc7b7] text-stone-700 font-bold'
              }`}>
                <tr>
                  <th className="py-3.5 px-4 w-16 text-center">RANK</th>
                  <th className="py-3.5 px-4">PARTICIPANT / AGENT</th>
                  <th className="py-3.5 px-4 text-center">TOTAL</th>
                  <th className="py-3.5 px-4">1. MURDERER (40P)</th>
                  <th className="py-3.5 px-4 text-center">2. EVIDENCE (30P)</th>
                  <th className="py-3.5 px-4 text-center">3. TEXT (30P)</th>
                  <th className="py-3.5 px-4 text-center">4. TIME (SPEED)</th>
                  <th className="py-3.5 px-4 text-center">SUBMITTED AT</th>
                  <th className="py-3.5 px-4 text-right">TRANSCRIPT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-slate-800">
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-stone-500 font-sans">
                      {loading ? 'Refreshing leaderboard data...' : 'No competitor submissions found yet.'}
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((row) => {
                    const isTop1 = row.rank === 1;
                    const isTop2 = row.rank === 2;
                    const isTop3 = row.rank === 3;

                    return (
                      <tr
                        key={row.id}
                        className={`transition-colors ${
                          isTop1
                            ? isDark
                              ? 'bg-amber-950/20 hover:bg-amber-950/30'
                              : 'bg-amber-50 hover:bg-amber-100/60 font-semibold'
                            : isDark
                            ? 'hover:bg-slate-800/60'
                            : 'hover:bg-[#eae4d8]/60'
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-3.5 px-4 text-center font-bold">
                          {isTop1 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-amber-950 font-black shadow-sm">
                              1
                            </span>
                          ) : isTop2 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300 text-slate-900 font-black shadow-sm">
                              2
                            </span>
                          ) : isTop3 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700 text-white font-black shadow-sm">
                              3
                            </span>
                          ) : (
                            <span className="text-stone-500 font-semibold">#{row.rank}</span>
                          )}
                        </td>

                        {/* Name */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold font-sans text-sm text-[#1c1917] dark:text-slate-100 flex items-center space-x-2">
                            <span>{row.participantName}</span>
                            {isTop1 && <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-stone-500 dark:text-slate-500 font-mono">
                              {row.confirmationCode}
                            </span>
                            {row.flagged && (
                              <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 text-[9px] font-bold uppercase tracking-wider flex items-center space-x-1 animate-pulse">
                                <AlertTriangle className="w-3 h-3 text-red-600 dark:text-red-400" />
                                <span>FLAGGED: EXTERNAL BROWSING DETECTED</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Total Score */}
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-block px-3 py-1 rounded-xl font-black text-sm shadow-sm ${
                            row.score >= 90
                              ? 'bg-blue-100 text-blue-950 border border-blue-300 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800'
                              : row.score >= 70
                              ? 'bg-emerald-100 text-emerald-950 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800'
                              : 'bg-stone-200 text-stone-900 border border-stone-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                          }`}>
                            {row.score}
                          </span>
                        </td>

                        {/* Tier 1: Accused Murderer */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-1.5">
                            {row.isCorrectCulprit ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                            )}
                            <span className={`font-bold ${row.isCorrectCulprit ? 'text-emerald-900 dark:text-emerald-300' : 'text-red-900 dark:text-red-300'}`}>
                              {row.accusedSuspect}
                            </span>
                            <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-md font-mono font-bold ${
                              row.isCorrectCulprit 
                                ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' 
                                : 'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-300 border border-red-300 dark:border-red-800'
                            }`}>
                              +{row.suspectScore ?? (row.isCorrectCulprit ? 40 : 0)}
                            </span>
                          </div>
                        </td>

                        {/* Tier 2: Evidence Score */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="font-bold text-stone-800 dark:text-slate-200">
                              {row.matchedEvidenceCount ?? 0}/3 critical
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold mt-0.5">
                              +{row.evidenceScore ?? 0} pts
                            </span>
                          </div>
                        </td>

                        {/* Tier 3: Text Rationale Score */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-block text-[11px] font-mono px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-bold">
                            +{row.explanationScore ?? 0} pts
                          </span>
                        </td>

                        {/* Tier 4: Time Taken */}
                        <td className="py-3.5 px-4 text-center font-bold text-stone-700 dark:text-slate-300">
                          <div className="inline-flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span>{row.timeTakenFormatted}</span>
                          </div>
                        </td>

                        {/* Submitted At */}
                        <td className="py-3.5 px-4 text-center text-[11px] text-stone-600 dark:text-slate-400">
                          {new Date(row.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => setSelectedEntry(row)}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-800 hover:bg-blue-900 text-white font-mono text-[11px] font-bold flex items-center space-x-1 transition shadow-sm"
                              title="View Official Transcript"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>VIEW</span>
                            </button>
                            <button
                              onClick={() => setDeletingEntry(row)}
                              className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-950 dark:hover:bg-red-900 dark:text-red-300 border border-red-300 dark:border-red-800 transition shadow-sm"
                              title={`Delete participant "${row.participantName}" to allow retake with same name`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* 1-Click Explanation Viewer Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className={`relative w-full max-w-2xl rounded-3xl border p-6 sm:p-8 shadow-2xl space-y-5 font-mono text-xs ${
            isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-[#f5f0e6] border-[#cfc7b7] text-[#1c1917]'
          }`}>
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b pb-4 border-stone-300 dark:border-slate-800">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-base font-black px-2.5 py-0.5 rounded-md bg-blue-800 text-white">
                    RANK #{selectedEntry.rank}
                  </span>
                  <span className="text-xs font-bold text-stone-500 uppercase">
                    OFFICIAL DEDUCTION TRANSCRIPT
                  </span>
                </div>
                <h2 className="text-2xl font-black font-display mt-1">
                  {selectedEntry.participantName}
                </h2>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="p-2 rounded-xl bg-stone-200 dark:bg-slate-800 hover:bg-stone-300 text-stone-700 dark:text-slate-300 transition"
              >
                ✕
              </button>
            </div>

            {/* Quick Metrics Header inside modal */}
            {selectedEntry.flagged && (
              <div className="p-3.5 rounded-xl bg-red-100 dark:bg-red-950/80 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 text-xs font-mono font-bold flex items-center space-x-2 animate-pulse">
                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                <span>INTEGRITY AUDIT: FLAGGED: EXTERNAL BROWSING DETECTED ({selectedEntry.strikes || 3}/3 Strikes recorded)</span>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-[11px]">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                <span className="text-stone-500 dark:text-slate-400 block font-bold">TOTAL SCORE</span>
                <span className="text-lg font-black text-blue-800 dark:text-blue-400">{selectedEntry.score} / 100</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-200/60 dark:bg-slate-800/60 border border-stone-300 dark:border-slate-700">
                <span className="text-stone-500 dark:text-slate-400 block font-bold">1. MURDERER</span>
                <div className="flex items-center space-x-1 mt-0.5">
                  {selectedEntry.isCorrectCulprit ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  )}
                  <span className="font-bold text-xs truncate">
                    +{selectedEntry.suspectScore ?? (selectedEntry.isCorrectCulprit ? 40 : 0)}/40
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-stone-200/60 dark:bg-slate-800/60 border border-stone-300 dark:border-slate-700">
                <span className="text-stone-500 dark:text-slate-400 block font-bold">2. EVIDENCE</span>
                <span className="text-base font-black text-emerald-700 dark:text-emerald-400">
                  +{selectedEntry.evidenceScore ?? 0}/30
                </span>
                <span className="text-[10px] text-stone-500 block">
                  {selectedEntry.matchedEvidenceCount ?? 0}/3 clues
                </span>
              </div>
              <div className="p-3 rounded-xl bg-stone-200/60 dark:bg-slate-800/60 border border-stone-300 dark:border-slate-700">
                <span className="text-stone-500 dark:text-slate-400 block font-bold">3. TEXT</span>
                <span className="text-base font-black text-purple-700 dark:text-purple-400">
                  +{selectedEntry.explanationScore ?? 0}/30
                </span>
                <span className="text-[10px] text-stone-500 block">rationale</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-200/60 dark:bg-slate-800/60 border border-stone-300 dark:border-slate-700">
                <span className="text-stone-500 dark:text-slate-400 block font-bold">4. TIME (SPEED)</span>
                <span className="text-base font-black text-stone-900 dark:text-slate-100">{selectedEntry.timeTakenFormatted}</span>
                <span className="text-[10px] text-stone-500 block">rank #{selectedEntry.rank}</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-200/60 dark:bg-slate-800/60 border border-stone-300 dark:border-slate-700">
                <span className="text-stone-500 dark:text-slate-400 block font-bold">TAB SWITCHES</span>
                <span className={`text-base font-black ${(selectedEntry.tabSwitches || 0) > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {selectedEntry.tabSwitches || 0}
                </span>
                <span className="text-[10px] text-stone-500 block">{selectedEntry.strikes || 0}/3 strikes</span>
              </div>
            </div>

            {/* Evidence Attached */}
            <div>
              <span className="text-[11px] font-bold text-stone-500 block mb-1">
                CRITICAL FORENSIC EVIDENCE ATTACHED:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedEntry.evidenceCodes.map((code) => (
                  <span key={code} className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-950 dark:text-blue-200 border border-blue-300 dark:border-blue-800 font-bold text-xs">
                    {code}
                  </span>
                ))}
              </div>
            </div>

            {/* Typed Explanation Box */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-500 uppercase">
                  SUBMITTED INVESTIGATIVE EXPLANATION:
                </span>
                <button
                  onClick={() => copyToClipboard(selectedEntry.explanation)}
                  className="text-[11px] text-blue-800 dark:text-blue-400 hover:underline flex items-center space-x-1 font-bold"
                >
                  {copiedExplanation ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedExplanation ? 'COPIED!' : 'COPY TEXT'}</span>
                </button>
              </div>

              <div className={`p-4 rounded-2xl border text-sm font-sans leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-[#fbf9f5] border-[#cfc7b7] text-stone-900'
              }`}>
                {selectedEntry.explanation || 'No explanation provided.'}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex items-center justify-between border-t border-stone-300 dark:border-slate-800 mt-4">
              <button
                onClick={() => setDeletingEntry(selectedEntry)}
                className="px-4 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-950 dark:hover:bg-red-900 dark:text-red-300 border border-red-300 dark:border-red-800 font-bold text-xs uppercase transition flex items-center space-x-1.5 shadow-sm"
                title="Delete this submission and allow the student to retake"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>DELETE & ALLOW RETAKE</span>
              </button>
              <button
                onClick={() => setSelectedEntry(null)}
                className="px-5 py-2.5 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-bold uppercase transition"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in font-mono">
          <div className={`relative w-full max-w-md rounded-3xl border p-6 sm:p-7 shadow-2xl space-y-4 ${
            isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-[#f5f0e6] border-[#cfc7b7] text-[#1c1917]'
          }`}>
            <div className="flex items-center space-x-3 text-red-700 dark:text-red-400">
              <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950 border border-red-300 dark:border-red-800 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider block text-red-600 dark:text-red-400">
                  RESET / RETAKE AUTHORIZATION
                </span>
                <h3 className="text-lg font-black font-display leading-tight">
                  Delete Participant?
                </h3>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-200/60 dark:bg-slate-800/60 border border-stone-300 dark:border-slate-700 space-y-1.5 text-xs">
              <p>
                <strong>Participant:</strong> <span className="font-bold text-blue-800 dark:text-blue-400">{deletingEntry.participantName}</span>
              </p>
              <p>
                <strong>Rank:</strong> #{deletingEntry.rank} • <strong>Score:</strong> {deletingEntry.score} pts
              </p>
              {deletingEntry.flagged && (
                <p className="text-red-600 font-bold flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>3-Strike Browser Lockdown recorded</span>
                </p>
              )}
            </div>

            <p className="text-xs text-stone-600 dark:text-slate-400 leading-relaxed font-sans">
              Deleting this participant completely clears their submission, resets 3-strike tab locks, and permits the student to <strong>register again fresh with the exact same name</strong>.
            </p>

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingEntry(null)}
                className={`px-4 py-2.5 rounded-xl border font-bold text-xs uppercase transition ${
                  isDark ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-stone-300 hover:bg-stone-200 text-stone-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase transition shadow-md flex items-center space-x-1.5 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete & Reset</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
