export type InvestigationStage = 0 | 1 | 2 | 3 | 4 | 5;

export interface Participant {
  id: string;
  participant_name: string;
  client_token: string;
  created_at?: string;
}

export interface MysteryCase {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  incident_time: string;
  location: string;
  published: boolean;
}

export interface SuspectPublicProfile {
  background: string;
  clothing: string;
  belongings: string;
  statement: string;
  alibi: string;
  possible_motive: string;
}

export interface Suspect {
  id: string;
  case_id: string;
  display_name: string;
  role: string;
  portrait_url: string;
  public_profile: SuspectPublicProfile;
  display_order: number;
}

export interface EvidenceMetadata {
  source?: string;
  critical_timestamp?: string;
  metric?: string;
  indicator_state?: string;
  panel?: string;
  trip_time?: string;
  restore_time?: string;
  duration?: string;
  type?: string;
  station?: string;
  grid_voltage?: string;
  conclusion?: string;
  camera?: string;
  timecode?: string;
  apparel_observed?: string;
  carried_item?: string;
  vault_location?: string;
  lock_operated?: string;
  key_id?: string;
  authorized_holder?: string;
  speaker?: string;
  alibi_status?: string;
  device?: string;
  exif_timestamps?: string;
  location?: string;
  materials_found?: string;
  match_source?: string;
  [key: string]: any;
}

export interface Evidence {
  id: string;
  case_id: string;
  code: string;
  title: string;
  description: string;
  evidence_type: 'telemetry' | 'cctv_frame' | 'access_log' | 'physical_trace' | 'statement_contradiction' | 'audio_log';
  media_url: string;
  metadata: EvidenceMetadata;
  display_order: number;
}

export interface InvestigationSession {
  id: string;
  participant_id: string;
  case_id: string;
  started_at: string;
  last_activity_at: string;
  status: 'in_progress' | 'submitted' | 'abandoned';
  stage_reached: number;
  collected_evidence_ids: string[];
  connected_links: { suspectId: string; evidenceCode: string; note?: string }[];
  suspect_notes: Record<string, string>;
}

export interface CaseZeroSubmission {
  id: string;
  session_id: string;
  participant_id: string;
  case_id: string;
  selected_suspect: string;
  selected_suspect_id: string;
  incident_explanation: string;
  selected_evidence: string[];
  submitted_at: string;
  submission_status: string;
  score: number;
  evaluation_details?: any;
}

export interface SubmissionReceipt {
  success: boolean;
  submission_id: string;
  session_id: string;
  participant_id: string;
  status: string;
  submitted_at: string;
  confirmation_code: string;
}

export interface CCTVFeed {
  id: string;
  camCode: string;
  title: string;
  location: string;
  videoUrl: string;
  posterUrl: string;
  timestamp: string;
  status: string;
  hotspots?: {
    x: number;
    y: number;
    title: string;
    description: string;
    clueCode?: string;
  }[];
}

export interface AudioLog {
  id: string;
  code: string;
  title: string;
  duration: string;
  timestamp: string;
  speaker: string;
  transcript: string;
  synthesizedFrequency: number;
}

export interface TimelineEntry {
  timestamp: string;
  timeCodeSeconds: number;
  location: string;
  title: string;
  detail: string;
  involvedParty: string;
  sourceType: 'cctv' | 'grid' | 'telemetry' | 'access';
  isAnomaly: boolean;
}
