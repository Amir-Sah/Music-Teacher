import { useState, useEffect } from "react";
import {
  AppState,
  Student,
  Group,
  Session,
  MonthlyReport,
  SessionSkill,
  StudentSessionNote,
  Game,
  Skill,
  MetricDefinition,
  SessionMetricValue,
} from "../types";
import {
  initialStudents,
  initialGroups,
  initialSessions,
  initialSkills,
  initialGames,
  initialGameSkills,
  initialMonthlyReports,
  initialSessionSkills,
  initialStudentSessionNotes,
  initialMetrics,
  initialSessionMetrics,
} from "../initialData";
import {
  deleteStudentCascade,
  deleteGroupCascade,
  deleteSessionCascade,
} from "../utils/cascadeDelete";

const STORAGE_KEY = "music_teacher_assistant_state_v2";

export interface UseAppStateReturn {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;

  // Student
  handleSaveStudent: (payload: Omit<Student, "id"> & { id?: string }) => void;
  handleDeleteStudent: (id: string) => void;

  // Group
  handleSaveGroup: (payload: Omit<Group, "id"> & { id?: string }) => void;
  handleDeleteGroup: (id: string) => void;

  // Session
  handleSaveSession: (
    sessionPayload: Omit<Session, "id">,
    metricsPayload: SessionMetricValue[],
    selectedSkillIds: string[],
    studentNotes: { studentId: string; note: string }[],
    editingSessionId?: string
  ) => void;
  handleDeleteSession: (sessionId: string) => void;

  // Report
  handleSaveReport: (payload: Omit<MonthlyReport, "id">) => void;
  handleDeleteReport: (reportId: string) => void;

  // Game
  handleSaveGame: (
    gamePayload: Omit<Game, "id"> & { id?: string },
    selectedSkillIds: string[]
  ) => void;
  handleDeleteGame: (id: string) => void;

  // Metric
  handleSaveMetric: (
    metricPayload: Omit<MetricDefinition, "id"> & { id?: string }
  ) => void;
  handleDeleteMetric: (id: string) => void;

  // Skill
  handleSaveSkill: (skillPayload: Omit<Skill, "id"> & { id?: string }) => void;
  handleDeleteSkill: (id: string) => void;

  // Student Skill Level
  handleUpdateSkillLevel: (skillId: string, level: number) => void;
  handleUpdateSkillLevelForStudent: (studentId: string, skillId: string, level: number) => void;

  // Restore
  handleRestoreState: (newState: AppState) => void;
}

export function useAppState(): UseAppStateReturn {
  const [appState, setAppState] = useState<AppState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          sessionSkills: parsed.sessionSkills || initialSessionSkills,
          studentSessionNotes: parsed.studentSessionNotes || initialStudentSessionNotes,
          metrics: parsed.metrics || initialMetrics,
          sessionMetrics: parsed.sessionMetrics || initialSessionMetrics,
        };
      }
    } catch (e) {
      console.error("Failed to load local state", e);
    }

    return {
      students: initialStudents,
      groups: initialGroups,
      sessions: initialSessions,
      monthlyReports: initialMonthlyReports,
      skills: initialSkills,
      games: initialGames,
      gameSkills: initialGameSkills,
      studentSkills: [],
      sessionSkills: initialSessionSkills,
      studentSessionNotes: initialStudentSessionNotes,
      metrics: initialMetrics,
      sessionMetrics: initialSessionMetrics,
    };
  });

  // Persist state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  }, [appState]);

  // --- Student CRUD ---
  const handleSaveStudent = (payload: Omit<Student, "id"> & { id?: string }) => {
    if (payload.id) {
      setAppState((prev) => ({
        ...prev,
        students: prev.students.map((st) =>
          st.id === payload.id ? ({ ...st, ...payload } as Student) : st
        ),
      }));
    } else {
      const newStudent: Student = {
        ...payload,
        id: crypto.randomUUID(),
      };
      setAppState((prev) => ({
        ...prev,
        students: [...prev.students, newStudent],
      }));
    }
  };

  const handleDeleteStudent = (id: string) => {
    setAppState((prev) => deleteStudentCascade(prev, id));
  };

  // --- Group CRUD ---
  const handleSaveGroup = (payload: Omit<Group, "id"> & { id?: string }) => {
    if (payload.id) {
      setAppState((prev) => ({
        ...prev,
        groups: prev.groups.map((g) =>
          g.id === payload.id ? ({ ...g, ...payload } as Group) : g
        ),
      }));
    } else {
      const newGroup: Group = {
        ...payload,
        id: crypto.randomUUID(),
      };
      setAppState((prev) => ({
        ...prev,
        groups: [...prev.groups, newGroup],
      }));
    }
  };

  const handleDeleteGroup = (id: string) => {
    setAppState((prev) => deleteGroupCascade(prev, id));
  };

  // --- Session CRUD ---
  const handleSaveSession = (
    sessionPayload: Omit<Session, "id">,
    metricsPayload: SessionMetricValue[],
    selectedSkillIds: string[],
    studentNotes: { studentId: string; note: string }[],
    editingSessionId?: string
  ) => {
    setAppState((prev) => {
      // Editing existing session
      if (editingSessionId) {
        const sessionId = editingSessionId;

        const updatedSession: Session = {
          ...sessionPayload,
          id: sessionId,
        };

        const updatedSessionMetrics = metricsPayload.map((metric) => ({
          ...metric,
          sessionId,
        }));

        const filteredSessionSkills = (prev.sessionSkills || []).filter(
          (ss) => ss.sessionId !== sessionId
        );
        const newSessionSkills: SessionSkill[] = selectedSkillIds.map((skId) => ({
          sessionId,
          skillId: skId,
        }));

        const filteredNotes = (prev.studentSessionNotes || []).filter(
          (sn) => sn.sessionId !== sessionId
        );
        const newNotes: StudentSessionNote[] = studentNotes.map((noteItem) => ({
          id: crypto.randomUUID(),
          sessionId,
          studentId: noteItem.studentId,
          note: noteItem.note,
        }));

        return {
          ...prev,
          sessions: prev.sessions.map((s) =>
            s.id === sessionId ? updatedSession : s
          ),
          sessionMetrics: [
            ...prev.sessionMetrics.filter((m) => m.sessionId !== sessionId),
            ...updatedSessionMetrics,
          ],
          sessionSkills: [...filteredSessionSkills, ...newSessionSkills],
          studentSessionNotes: [...filteredNotes, ...newNotes],
        };
      }

      // Creating new session
      const newSessionId = crypto.randomUUID();
      const newSession: Session = {
        ...sessionPayload,
        id: newSessionId,
      };

      const newSessionMetrics = metricsPayload.map((metric) => ({
        ...metric,
        sessionId: newSessionId,
      }));

      const newSessionSkills: SessionSkill[] = selectedSkillIds.map((skId) => ({
        sessionId: newSessionId,
        skillId: skId,
      }));

      const newNotes: StudentSessionNote[] = studentNotes.map((noteItem) => ({
        id: crypto.randomUUID(),
        sessionId: newSessionId,
        studentId: noteItem.studentId,
        note: noteItem.note,
      }));

      return {
        ...prev,
        sessions: [...prev.sessions, newSession],
        sessionMetrics: [...prev.sessionMetrics, ...newSessionMetrics],
        sessionSkills: [...(prev.sessionSkills || []), ...newSessionSkills],
        studentSessionNotes: [...(prev.studentSessionNotes || []), ...newNotes],
      };
    });
  };

  const handleDeleteSession = (sessionId: string) => {
    setAppState((prev) => deleteSessionCascade(prev, sessionId));
  };

  // --- Report CRUD ---
  const handleSaveReport = (payload: Omit<MonthlyReport, "id">) => {
    const newReport: MonthlyReport = {
      ...payload,
      id: crypto.randomUUID(),
    };
    setAppState((prev) => ({
      ...prev,
      monthlyReports: [...prev.monthlyReports, newReport],
    }));
  };

  const handleDeleteReport = (reportId: string) => {
    setAppState((prev) => ({
      ...prev,
      monthlyReports: prev.monthlyReports.filter((r) => r.id !== reportId),
    }));
  };

  // --- Game CRUD ---
  const handleSaveGame = (
    gamePayload: Omit<Game, "id"> & { id?: string },
    selectedSkillIds: string[]
  ) => {
    const isEdit = !!gamePayload.id;
    const gameId = gamePayload.id || crypto.randomUUID();

    const updatedGame: Game = {
      ...gamePayload,
      id: gameId,
    } as Game;

    setAppState((prev) => {
      const updatedGames = isEdit
        ? prev.games.map((g) => (g.id === gameId ? updatedGame : g))
        : [...prev.games, updatedGame];

      const filteredGameSkills = prev.gameSkills.filter((gs) => gs.gameId !== gameId);
      const newGameSkills = selectedSkillIds.map((skId) => ({ gameId, skillId: skId }));

      return {
        ...prev,
        games: updatedGames,
        gameSkills: [...filteredGameSkills, ...newGameSkills],
      };
    });
  };

  const handleDeleteGame = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      games: prev.games.filter((g) => g.id !== id),
      gameSkills: prev.gameSkills.filter((gs) => gs.gameId !== id),
    }));
  };

  // --- Metric CRUD ---
  const handleSaveMetric = (
    metricPayload: Omit<MetricDefinition, "id"> & { id?: string }
  ) => {
    const isEdit = !!metricPayload.id;
    const metricId = metricPayload.id || crypto.randomUUID();

    const updatedMetric: MetricDefinition = {
      ...metricPayload,
      id: metricId,
    } as MetricDefinition;

    setAppState((prev) => {
      const updatedMetrics = isEdit
        ? prev.metrics.map((m) => (m.id === metricId ? updatedMetric : m))
        : [...prev.metrics, updatedMetric];

      return { ...prev, metrics: updatedMetrics };
    });
  };

  const handleDeleteMetric = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      metrics: prev.metrics.filter((m) => m.id !== id),
      sessionMetrics: prev.sessionMetrics.filter((sm) => sm.metricId !== id),
    }));
  };

  // --- Skill CRUD ---
  const handleSaveSkill = (skillPayload: Omit<Skill, "id"> & { id?: string }) => {
    const isEdit = !!skillPayload.id;
    const skillId = skillPayload.id || crypto.randomUUID();

    const updatedSkill: Skill = {
      ...skillPayload,
      id: skillId,
    } as Skill;

    setAppState((prev) => {
      const updatedSkills = isEdit
        ? prev.skills.map((s) => (s.id === skillId ? updatedSkill : s))
        : [...prev.skills, updatedSkill];

      return { ...prev, skills: updatedSkills };
    });
  };

  const handleDeleteSkill = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s.id !== id),
      studentSkills: prev.studentSkills.filter((ss) => ss.skillId !== id),
      gameSkills: prev.gameSkills.filter((gs) => gs.skillId !== id),
      sessionSkills: (prev.sessionSkills || []).filter((sc) => sc.skillId !== id),
    }));
  };

  // --- Student Skill Level ---
  const handleUpdateSkillLevel = (skillId: string, level: number) => {
    setAppState((prev) => {
      // We need the active student id from outside. For now we keep the original behavior
      // by expecting the caller to manage activeStudentId.
      // This hook version keeps the same signature as before.
      // The original implementation used activeStudentId from App state.
      // We'll expose a version that accepts studentId instead.
      return prev;
    });
  };

  // Overload version that accepts studentId
  const handleUpdateSkillLevelForStudent = (studentId: string, skillId: string, level: number) => {
    setAppState((prev) => {
      const matchIndex = prev.studentSkills.findIndex(
        (sk) => sk.studentId === studentId && sk.skillId === skillId
      );

      let updatedSkills = [...prev.studentSkills];

      if (matchIndex > -1) {
        updatedSkills[matchIndex] = {
          ...updatedSkills[matchIndex],
          currentLevel: level,
        };
      } else {
        updatedSkills.push({
          studentId,
          skillId,
          currentLevel: level,
        });
      }

      return {
        ...prev,
        studentSkills: updatedSkills,
      };
    });
  };

  // --- Restore State ---
  const handleRestoreState = (newState: AppState) => {
    setAppState(newState);
  };

  return {
    appState,
    setAppState,

    handleSaveStudent,
    handleDeleteStudent,

    handleSaveGroup,
    handleDeleteGroup,

    handleSaveSession,
    handleDeleteSession,

    handleSaveReport,
    handleDeleteReport,

    handleSaveGame,
    handleDeleteGame,

    handleSaveMetric,
    handleDeleteMetric,

    handleSaveSkill,
    handleDeleteSkill,

    handleUpdateSkillLevel,
    handleUpdateSkillLevelForStudent,

    handleRestoreState,
  };
}