import { AppState } from "../types";

/**
 * Removes a student and all related data (sessions, reports, skills, notes).
 */
export function deleteStudentCascade(state: AppState, studentId: string): AppState {
  return {
    ...state,
    students: state.students.filter((st) => st.id !== studentId),
    sessions: state.sessions.filter((s) => s.studentId !== studentId),
    monthlyReports: state.monthlyReports.filter((r) => r.studentId !== studentId),
    studentSkills: state.studentSkills.filter((sk) => sk.studentId !== studentId),
    studentSessionNotes: (state.studentSessionNotes || []).filter((sn) => sn.studentId !== studentId),
  };
}

/**
 * Removes a group and detaches students from it. Also removes group sessions.
 */
export function deleteGroupCascade(state: AppState, groupId: string): AppState {
  return {
    ...state,
    groups: state.groups.filter((g) => g.id !== groupId),
    students: state.students.map((st) =>
      st.groupId === groupId ? { ...st, groupId: undefined } : st
    ),
    sessions: state.sessions.filter((s) => s.groupId !== groupId),
  };
}

/**
 * Removes a session and all related metrics, skills, and notes.
 */
export function deleteSessionCascade(state: AppState, sessionId: string): AppState {
  return {
    ...state,
    sessions: state.sessions.filter((s) => s.id !== sessionId),
    sessionMetrics: (state.sessionMetrics || []).filter((m) => m.sessionId !== sessionId),
    sessionSkills: (state.sessionSkills || []).filter((ss) => ss.sessionId !== sessionId),
    studentSessionNotes: (state.studentSessionNotes || []).filter((sn) => sn.sessionId !== sessionId),
  };
}