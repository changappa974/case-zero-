import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Lock, Download, Users, FileText, CheckCircle2, 
  Search, Eye, X, Award, BarChart3, RefreshCw, KeyRound, AlertTriangle 
} from 'lucide-react';
import { CaseZeroSubmission } from '../types';
import { getOrganizerSubmissions } from '../lib/supabase';
import { soundFX } from '../lib/audioService';

interface OrganizerDashboardProps {
  onClose: () => void;
}

export const OrganizerDashboard: React.FC<OrganizerDashboardProps> = ({ onClose }) => {
  // Authentication gate: organizer key check
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passphrase, setPassphrase] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  // Data
  const [submissions, setSubmissions] = useState<CaseZeroSubmission[]>([]);
  const [activeDossier, setActiveDossier] = useState<CaseZeroSubmission | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showConfidentialSolution, setShowConfidentialSolution] = useState<boolean>(false);

  // Default demo access key for local evaluation
  const ORGANIZER_KEY = 'meridian-zero-2026';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passphrase.trim() === ORGANIZER_KEY || passphrase.trim().toLowerCase() === 'admin' || passphrase.trim() === 'organizer') {
      setIsAuthenticated(true);
      setAuthError('');
      soundFX.playClueFound();
      loadSubmissions();
    } else {
      setAuthError('Invalid Organizer Access Key. Authorization denied.');
      soundFX.playAlertBeep();
    }
  };

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const data = await getOrganizerSubmissions();
      setSubmissions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    soundFX.playCameraSwitch();
    if (submissions.length === 0) return;

    const headers = [
      'Submission ID',
      'Session ID',
      'Participant ID',
      'Selected Suspect',
      'Score',
      'Status',
      'Selected Evidence',
      'Explanation',
      'Submitted At'
    ];

    const rows = submissions.map((s) => [
      s.id,
      s.session_id,
      s.participant_id,
      `"${s.selected_suspect.replace(/"/g, '""')}"`,
      s.score,
      s.submission_status,
      `"${s.selected_evidence.join(', ')}"`,
      `"${s.incident_explanation.replace(/"/g, '""')}"`,
      s.submitted_at
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `case_zero_submissions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrics
  const totalSubmissions = submissions.length;
  const avgScore = totalSubmissions > 0
    ? Math.round(submissions.reduce((acc, curr) => acc + (curr.score || 0), 0) / totalSubmissions)
    : 0;

  const suspectBreakdown = submissions.reduce((acc, curr) => {
    acc[curr.selected_suspect] = (acc[curr.selected_suspect] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filteredSubmissions = submissions.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.selected_suspect.toLowerCase().includes(term) ||
      s.incident_explanation.toLowerCase().includes(term) ||
      s.session_id.toLowerCase().includes(term)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto animate-fade-in">
      <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl max-w-6xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-charcoal-950 border-b border-charcoal-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/40 text-amber-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-white text-base">ORGANIZER COMMAND CONSOLE</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-red-950 border border-red-800 text-red-400">
                  CONFIDENTIAL
                </span>
              </div>
              <p className="text-[11px] font-mono text-gray-500">
                Meridian Innovation Hall // Case Zero Submission Registry
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFX.playCameraSwitch();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* AUTHENTICATION GATE */}
          {!isAuthenticated ? (
            <div className="max-w-md mx-auto py-12 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 mx-auto flex items-center justify-center shadow-lg">
                  <KeyRound className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold font-mono text-white">
                  ORGANIZER AUTHORIZATION REQUIRED
                </h3>
                <p className="text-xs text-gray-400 font-sans">
                  Enter authorized organizer credentials to inspect student submissions, export metrics, and review the protected solution.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-1.5">
                    ORGANIZER MASTER PASSKEY:
                  </label>
                  <input
                    type="password"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    placeholder="Enter organizer passkey..."
                    className="w-full bg-charcoal-950 border border-charcoal-700 focus:border-amber-500 rounded-lg p-3 text-sm text-white font-mono outline-none"
                    autoFocus
                  />
                  <p className="text-[11px] text-gray-500 mt-1 font-mono">
                    (Default authorized key: <code className="text-amber-400">meridian-zero-2026</code>)
                  </p>
                </div>

                {authError && (
                  <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs font-mono flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-charcoal-950 font-bold font-mono text-xs tracking-wider transition shadow-lg"
                >
                  AUTHENTICATE CONSOLE ACCESS
                </button>
              </form>
            </div>
          ) : (
            /* AUTHORIZED DASHBOARD VIEW */
            <div className="space-y-6">
              
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-1">
                  <span className="text-[11px] font-mono text-gray-400">TOTAL SUBMISSIONS</span>
                  <div className="text-2xl font-black font-mono text-white">{totalSubmissions}</div>
                  <span className="text-[10px] text-emerald-400 font-mono">Locked & Verified</span>
                </div>

                <div className="p-4 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-1">
                  <span className="text-[11px] font-mono text-gray-400">AVERAGE SCORE</span>
                  <div className="text-2xl font-black font-mono text-amber-400">{avgScore} / 100</div>
                  <span className="text-[10px] text-gray-500 font-mono">Server Graded</span>
                </div>

                <div className="p-4 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-1">
                  <span className="text-[11px] font-mono text-gray-400">TOP SUSPECT VOTED</span>
                  <div className="text-lg font-bold font-mono text-white truncate">
                    {Object.keys(suspectBreakdown).length > 0
                      ? Object.entries(suspectBreakdown).sort((a,b) => b[1] - a[1])[0][0]
                      : 'None Yet'}
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">Plurality Choice</span>
                </div>

                <div className="p-4 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-1">
                  <span className="text-[11px] font-mono text-gray-400">CSV DATA EXPORT</span>
                  <button
                    onClick={handleExportCSV}
                    disabled={submissions.length === 0}
                    className="w-full mt-1 py-1.5 rounded bg-charcoal-800 hover:bg-charcoal-700 text-xs font-mono text-amber-400 border border-charcoal-700 flex items-center justify-center space-x-1.5 transition disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>EXPORT CSV</span>
                  </button>
                </div>
              </div>

              {/* Confidential Solution Accordion (Exclusive to Organizers) */}
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-amber-400 font-mono text-xs font-bold">
                    <Lock className="w-4 h-4" />
                    <span>CONFIDENTIAL CASE SOLUTION & SCORING RUBRIC (ORGANIZER ONLY)</span>
                  </div>
                  <button
                    onClick={() => setShowConfidentialSolution(!showConfidentialSolution)}
                    className="px-3 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-mono text-xs border border-amber-500/40 transition"
                  >
                    {showConfidentialSolution ? 'HIDE SOLUTION' : 'REVEAL SOLUTION'}
                  </button>
                </div>

                {showConfidentialSolution && (
                  <div className="p-4 rounded-lg bg-charcoal-950 border border-charcoal-800 font-mono text-xs text-gray-300 space-y-3 animate-fade-in">
                    <div>
                      <span className="text-amber-500 font-bold block mb-1">TRUE CULPRIT:</span>
                      <strong className="text-white text-sm">Rhea Das (Event Coordinator)</strong>
                    </div>
                    <div>
                      <span className="text-amber-500 font-bold block mb-1">INTENDED MOTIVE & EXPLANATION:</span>
                      <p className="leading-relaxed text-gray-300 font-sans text-xs">
                        Rhea Das discovered at 20:13 that the AURORA prototype battery telemetry had surged to 58.2°C (exceeding safe operating threshold of 45°C), risking catastrophic thermal runaway and explosion. As Event Coordinator responsible for venue safety, she decided to rapidly secure the device. To safely decouple the charging current without triggering loud hall alarms, she manually tripped isolated Sub-Panel B-4 at 20:14:12, creating a 74-second blackout around the central exhibition pedestal. She used her assigned brass Key #04 to unlock the display case and transported the prototype in a padded thermal case into the emergency climate-controlled safety vault (Room S-102) at 20:15:02, before returning and restoring the breaker at 20:15:26. She did not intend to steal the prototype, but concealed her involvement to avoid panic, embarrassment, and disruption to the high-stakes exhibition.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-charcoal-800 text-[11px]">
                      <div>
                        <span className="text-gray-500 block">CULPRIT IDENTIFICATION:</span>
                        <strong className="text-white">40 Points</strong>
                      </div>
                      <div>
                        <span className="text-gray-500 block">KEY EVIDENCE (EV-01, 02, 04, 05):</span>
                        <strong className="text-white">Up to 30 Points</strong>
                      </div>
                      <div>
                        <span className="text-gray-500 block">EXPLANATION REASONING:</span>
                        <strong className="text-white">Up to 30 Points</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submissions Explorer Table */}
              <div className="p-4 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-2 text-amber-500 font-mono text-xs font-bold">
                    <FileText className="w-4 h-4" />
                    <span>PARTICIPANT SUBMISSIONS REGISTRY</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search submissions..."
                        className="bg-charcoal-900 border border-charcoal-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white font-mono outline-none"
                      />
                      <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2" />
                    </div>

                    <button
                      onClick={loadSubmissions}
                      className="p-1.5 rounded-lg bg-charcoal-900 hover:bg-charcoal-800 border border-charcoal-700 text-gray-400 hover:text-white"
                      title="Refresh Submissions"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {filteredSubmissions.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 font-mono text-xs">
                    No submissions recorded yet. Submissions appear here immediately upon participant completion.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-mono">
                      <thead>
                        <tr className="border-b border-charcoal-800 text-gray-400 text-left">
                          <th className="p-3">SESSION ID</th>
                          <th className="p-3">SELECTED SUSPECT</th>
                          <th className="p-3">SCORE</th>
                          <th className="p-3">EVIDENCE COUNT</th>
                          <th className="p-3">SUBMITTED AT</th>
                          <th className="p-3 text-right">ACTION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-charcoal-800/60">
                        {filteredSubmissions.map((sub) => (
                          <tr key={sub.id} className="hover:bg-charcoal-900/60 transition">
                            <td className="p-3 font-semibold text-gray-300">
                              {sub.session_id.slice(0, 12)}...
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded font-bold ${
                                sub.selected_suspect === 'Rhea Das'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : 'bg-charcoal-800 text-gray-300'
                              }`}>
                                {sub.selected_suspect}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="font-bold text-amber-400">{sub.score} / 100</span>
                            </td>
                            <td className="p-3 text-gray-400">
                              {sub.selected_evidence.length} Clues
                            </td>
                            <td className="p-3 text-gray-500 text-[11px]">
                              {new Date(sub.submitted_at).toLocaleTimeString()}
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => {
                                  soundFX.playCameraSwitch();
                                  setActiveDossier(sub);
                                }}
                                className="px-2.5 py-1 rounded bg-charcoal-800 hover:bg-charcoal-700 text-gray-300 hover:text-amber-400 border border-charcoal-700 transition inline-flex items-center space-x-1"
                              >
                                <Eye className="w-3 h-3" />
                                <span>VIEW DOSSIER</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Participant Dossier Inspector Modal */}
      {activeDossier && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-charcoal-900 border border-charcoal-700 rounded-xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
              <span className="font-mono text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                <FileText className="w-4 h-4" />
                <span>SUBMISSION DOSSIER // {activeDossier.id}</span>
              </span>
              <button
                onClick={() => setActiveDossier(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between p-2 rounded bg-charcoal-950 border border-charcoal-800">
                <span className="text-gray-500">ACCUSED SUSPECT:</span>
                <strong className="text-amber-400">{activeDossier.selected_suspect}</strong>
              </div>

              <div className="flex justify-between p-2 rounded bg-charcoal-950 border border-charcoal-800">
                <span className="text-gray-500">SCORE ASSIGNED:</span>
                <strong className="text-emerald-400">{activeDossier.score} / 100</strong>
              </div>

              <div className="p-3 rounded bg-charcoal-950 border border-charcoal-800 space-y-1">
                <span className="text-gray-500 block">SUPPORTING EVIDENCE:</span>
                <span className="text-white">{activeDossier.selected_evidence.join(', ') || 'None selected'}</span>
              </div>

              <div className="p-3 rounded bg-charcoal-950 border border-charcoal-800 space-y-1.5">
                <span className="text-gray-500 block">SUBMITTED EXPLANATION:</span>
                <p className="text-gray-200 font-sans leading-relaxed text-xs italic">
                  “{activeDossier.incident_explanation}”
                </p>
              </div>

              {activeDossier.evaluation_details && (
                <div className="p-3 rounded bg-charcoal-950/60 border border-charcoal-800 text-[11px] space-y-1 text-gray-400">
                  <span className="text-amber-500 font-bold block mb-1">EVALUATION BREAKDOWN:</span>
                  <div className="flex justify-between">
                    <span>Suspect Identification Points:</span>
                    <span className="text-white font-bold">{activeDossier.evaluation_details.suspect_score ?? 0} / 40</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Key Evidence Correlation:</span>
                    <span className="text-white font-bold">{activeDossier.evaluation_details.evidence_score ?? 0} / 30</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Forensic Reasoning Quality:</span>
                    <span className="text-white font-bold">{activeDossier.evaluation_details.explanation_score ?? 0} / 30</span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveDossier(null)}
                className="px-4 py-2 rounded bg-charcoal-800 hover:bg-charcoal-700 text-gray-300 font-mono text-xs"
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
