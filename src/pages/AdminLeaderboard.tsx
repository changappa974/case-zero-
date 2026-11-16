import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, Download, RefreshCw, Search, Eye, CheckCircle2, 
  XCircle, Clock, Users, Lock, ShieldAlert, FileSpreadsheet, 
  ArrowLeft, Sun, Moon, Copy, Check, Sparkles, AlertTriangle
} from 'lucide-react';
import { fetchLeaderboardEntries, clearAllSubmissions } from '../lib/supabase';
import { LeaderboardEntry } from '../types';
import { soundFX } from '../lib/audioService';

interface AdminLeaderboardProps {
  onExit: () => void;
}

export const AdminLeaderboard: React.FC<AdminLeaderboardProps> = ({ onExit }) => {
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
      'Score (out of 100)',
      'Time Taken',
      'Time Taken (Seconds)',
      'Accused Suspect',
      'Correct Culprit?',
      'Critical Clues Found',
      'Confirmation Code',
      'Submitted At',
      'Investigative Deduction Explanation'
    ];

    const rows = entries.map((e) => [
      e.rank,
      `"${e.participantName.replace(/"/g, '""')}"`,
      e.score,
      `"${e.timeTakenFormatted}"`,
      e.timeTakenSeconds,
      `"${e.accusedSuspect.replace(/"/g, '""')}"`,
      e.isCorrectCulprit ? 'YES (Dr. Evelyn Hayes)' : 'NO',
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
                placeholder="Enter passcode (e.g. frostpeak2026)"
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
                  <th className="py-3.5 px-4 text-center">SCORE</th>
                  <th className="py-3.5 px-4 text-center">TIME TAKEN</th>
                  <th className="py-3.5 px-4">ACCUSED SUSPECT</th>
                  <th className="py-3.5 px-4 text-center">CLUES</th>
                  <th className="py-3.5 px-4 text-center">SUBMITTED AT</th>
                  <th className="py-3.5 px-4 text-right">EXPLANATION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-slate-800">
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-stone-500 font-sans">
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
                          <span className="text-[10px] text-stone-500 dark:text-slate-500 font-mono">
                            {row.confirmationCode}
                          </span>
                        </td>

                        {/* Score */}
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

                        {/* Time Taken */}
                        <td className="py-3.5 px-4 text-center font-bold text-stone-700 dark:text-slate-300">
                          {row.timeTakenFormatted}
                        </td>

                        {/* Accused Suspect */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-1.5 font-bold">
                            {row.isCorrectCulprit ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                            )}
                            <span className={row.isCorrectCulprit ? 'text-emerald-900 dark:text-emerald-300' : 'text-red-900 dark:text-red-300'}>
                              {row.accusedSuspect}
                            </span>
                          </div>
                        </td>

                        {/* Clues */}
                        <td className="py-3.5 px-4 text-center font-bold">
                          <span className="text-stone-700 dark:text-slate-300">{row.cluesCount} / 4</span>
                        </td>

                        {/* Submitted At */}
                        <td className="py-3.5 px-4 text-center text-[11px] text-stone-600 dark:text-slate-400">
                          {new Date(row.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedEntry(row)}
                            className="px-3 py-1.5 rounded-lg bg-blue-800 hover:bg-blue-900 text-white font-mono text-[11px] font-bold flex items-center space-x-1.5 ml-auto transition shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>VIEW</span>
                          </button>
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
              <div className="p-3 rounded-xl bg-stone-200/60 dark:bg-slate-800/60 border border-stone-300 dark:border-slate-700">
                <span className="text-stone-500 block">TOTAL SCORE</span>
                <span className="text-lg font-black text-blue-800 dark:text-blue-400">{selectedEntry.score} / 100</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-200/60 dark:bg-slate-800/60 border border-stone-300 dark:border-slate-700">
                <span className="text-stone-500 block">TIME TAKEN</span>
                <span className="text-lg font-black">{selectedEntry.timeTakenFormatted}</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-200/60 dark:bg-slate-800/60 border border-stone-300 dark:border-slate-700 col-span-2">
                <span className="text-stone-500 block">ACCUSED SUSPECT</span>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  {selectedEntry.isCorrectCulprit ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="font-bold text-sm truncate">{selectedEntry.accusedSuspect}</span>
                </div>
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
            <div className="pt-2 flex justify-end">
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

    </div>
  );
};
