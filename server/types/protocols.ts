export type ProtocolStatus = "not_started" | "in_progress" | "completed";

export interface Protocol {
  id: number;
  name: string;
  status: ProtocolStatus;
  progress: number; // 0-1
  last_session: string | null; // ISO date string
  notes: string;
  next_focus: string;
}

export interface ProtocolSession {
  id: string; // UUID
  protocol_id: number;
  date: string; // YYYY-MM-DD
  piece_title: string;
  composer: string;
  duration_minutes: number;
  subjective_progress_score: number; // 1-5
  notes: string;
  next_time_hint: string;
}

export interface ProtocolSummary {
  total: number;
  not_started: number;
  in_progress: number;
  completed: number;
  average_progress: number;
}

export interface CreateSessionRequest {
  date: string;
  piece_title: string;
  composer: string;
  duration_minutes: number;
  subjective_progress_score: number;
  notes: string;
  next_time_hint: string;
}

export interface UpdateProtocolStatusRequest {
  status?: ProtocolStatus;
  progress?: number;
  notes?: string;
  next_focus?: string;
}
