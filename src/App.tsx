/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { AppState, Student, Group, Session, MonthlyReport, ClassMetrics, SessionSkill, StudentSessionNote, Game, Skill, MetricDefinition } from "./types";
import { 
  initialStudents, initialGroups, initialSessions, 
  initialSkills, initialGames, initialGameSkills, initialMonthlyReports,
  initialClassMetrics, initialSessionSkills, initialStudentSessionNotes,
  initialMetrics, initialSessionMetrics
} from "./initialData";

// Components
import Dashboard from "./components/Dashboard";
import StudentList from "./components/StudentList";
import StudentDetail from "./components/StudentDetail";
import GroupList from "./components/GroupList";
import SessionForm from "./components/SessionForm";
import MonthlyReportForm from "./components/MonthlyReportForm";
import GameSuggester from "./components/GameSuggester";
import BackupExport from "./components/BackupExport";
import SkillsManager from "./components/SkillsManager";
import MetricsManager from "./components/MetricsManager";
import SessionsList from "./components/SessionsList";
import { StudentFormModal, GroupFormModal } from "./components/Forms";

// Icons
import { 
  LayoutDashboard, Users, GraduationCap, Compass, Database, Menu, X, Award, SlidersHorizontal, ClipboardList 
} from "lucide-react";

const STORAGE_KEY = "music_teacher_assistant_state_v2";

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Safe check for backward compatibility
        return {
          ...parsed,
          classMetrics: parsed.classMetrics || initialClassMetrics,
          sessionSkills: parsed.sessionSkills || initialSessionSkills,
          studentSessionNotes: parsed.studentSessionNotes || initialStudentSessionNotes,
          metrics: parsed.metrics || initialMetrics,
          sessionMetrics: parsed.sessionMetrics || initialSessionMetrics
        };
      }
    } catch (e) {
      console.error("Failed to load local state", e);
    }
    
    // Default seed data
    return {
      students: initialStudents,
      groups: initialGroups,
      sessions: initialSessions,
      monthlyReports: initialMonthlyReports,
      skills: initialSkills,
      games: initialGames,
      gameSkills: initialGameSkills,
      studentSkills: [],
      classMetrics: initialClassMetrics,
      sessionSkills: initialSessionSkills,
      studentSessionNotes: initialStudentSessionNotes,
      metrics: initialMetrics,
      sessionMetrics: initialSessionMetrics
    };
  });

  // Persist state to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  }, [appState]);

  // Navigation State
  const [currentTab, setCurrentTab] = useState<"dashboard" | "students" | "groups" | "games" | "skills" | "metrics" | "sessions" | "backup">("dashboard");
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  
  // Mobile navigation overlay toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Form overlay triggers
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [isLoggingSession, setIsLoggingSession] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [preselectedLogStudentId, setPreselectedLogStudentId] = useState("");
  const [preselectedLogGroupId, setPreselectedLogGroupId] = useState("");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [preselectedReportStudentId, setPreselectedReportStudentId] = useState("");

  const handleNavigation = (tabId: "dashboard" | "students" | "groups" | "games" | "skills" | "metrics" | "sessions" | "backup") => {
    setCurrentTab(tabId);
    setActiveStudentId(null);
    setActiveGroupId(null);
    setIsMobileMenuOpen(false);
    
    // Reset all overlay states
    setIsAddingStudent(false);
    setEditingStudent(null);
    setIsAddingGroup(false);
    setEditingGroup(null);
    setIsLoggingSession(false);
    setEditingSession(null);
    setPreselectedLogStudentId("");
    setPreselectedLogGroupId("");
    setIsGeneratingReport(false);
    setPreselectedReportStudentId("");
  };

  const handleEditSession = (session: Session) => {
    setEditingSession(session);
    setIsLoggingSession(true);
  };

  // Restore whole database callback
  const handleRestoreState = (newState: AppState) => {
    setAppState(newState);
    handleNavigation("dashboard");
  };

  // --- Student CRUD Handlers ---
  const handleSaveStudent = (payload: Omit<Student, "id"> & { id?: string }) => {
    if (payload.id) {
      // Editing
      setAppState(prev => ({
        ...prev,
        students: prev.students.map(st => st.id === payload.id ? { ...st, ...payload } as Student : st)
      }));
    } else {
      // Creation
      const newStudent: Student = {
        ...payload,
        id: `std-${Date.now()}`
      };
      setAppState(prev => ({
        ...prev,
        students: [...prev.students, newStudent]
      }));
    }
    setIsAddingStudent(false);
    setEditingStudent(null);
  };

  const handleDeleteStudent = (id: string) => {
    setAppState(prev => ({
      ...prev,
      students: prev.students.filter(st => st.id !== id),
      // Clean relationships to keep database integral
      sessions: prev.sessions.filter(s => s.studentId !== id),
      monthlyReports: prev.monthlyReports.filter(r => r.studentId !== id),
      studentSkills: prev.studentSkills.filter(sk => sk.studentId !== id),
      studentSessionNotes: (prev.studentSessionNotes || []).filter(sn => sn.studentId !== id)
    }));
    setActiveStudentId(null);
  };

  // --- Group CRUD Handlers ---
  const handleSaveGroup = (payload: Omit<Group, "id"> & { id?: string }) => {
    if (payload.id) {
      setAppState(prev => ({
        ...prev,
        groups: prev.groups.map(g => g.id === payload.id ? { ...g, ...payload } as Group : g)
      }));
    } else {
      const newGroup: Group = {
        ...payload,
        id: `grp-${Date.now()}`
      };
      setAppState(prev => ({
        ...prev,
        groups: [...prev.groups, newGroup]
      }));
    }
    setIsAddingGroup(false);
    setEditingGroup(null);
  };

  const handleDeleteGroup = (id: string) => {
    setAppState(prev => ({
      ...prev,
      groups: prev.groups.filter(g => g.id !== id),
      // Detach students without deleting them
      students: prev.students.map(st => st.groupId === id ? { ...st, groupId: undefined } : st),
      // Clean group sessions
      sessions: prev.sessions.filter(s => s.groupId !== id)
    }));
    setActiveGroupId(null);
  };

  // --- Relational Session CRUD Handlers ---
  const handleSaveSession = (
    sessionPayload: Omit<Session, "id">,
    metricsPayload: Omit<ClassMetrics, "sessionId">,
    selectedSkillIds: string[],
    studentNotes: { studentId: string; note: string }[]
  ) => {
    if (editingSession) {
      const sessionId = editingSession.id;

      const updatedSession: Session = {
        ...sessionPayload,
        id: sessionId
      };

      const updatedMetrics: ClassMetrics = {
        ...metricsPayload,
        sessionId: sessionId
      };

      setAppState((prev) => {
        const filteredSessionSkills = (prev.sessionSkills || []).filter((ss) => ss.sessionId !== sessionId);
        const newSessionSkills: SessionSkill[] = selectedSkillIds.map((skId) => ({
          sessionId: sessionId,
          skillId: skId
        }));

        const filteredNotes = (prev.studentSessionNotes || []).filter((sn) => sn.sessionId !== sessionId);
        const newNotes: StudentSessionNote[] = studentNotes.map((noteItem) => ({
          id: `sn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          sessionId: sessionId,
          studentId: noteItem.studentId,
          note: noteItem.note
        }));

        return {
          ...prev,
          sessions: prev.sessions.map((s) => s.id === sessionId ? updatedSession : s),
          classMetrics: (prev.classMetrics || []).some((m) => m.sessionId === sessionId)
            ? prev.classMetrics.map((m) => m.sessionId === sessionId ? updatedMetrics : m)
            : [...(prev.classMetrics || []), updatedMetrics],
          sessionSkills: [...filteredSessionSkills, ...newSessionSkills],
          studentSessionNotes: [...filteredNotes, ...newNotes]
        };
      });

      setEditingSession(null);
    } else {
      const newSessionId = `ses-${Date.now()}`;
      const newSession: Session = {
        ...sessionPayload,
        id: newSessionId
      };

      const newMetrics: ClassMetrics = {
        ...metricsPayload,
        sessionId: newSessionId
      };

      const newSessionSkills: SessionSkill[] = selectedSkillIds.map((skId) => ({
        sessionId: newSessionId,
        skillId: skId
      }));

      const newNotes: StudentSessionNote[] = studentNotes.map((noteItem) => ({
        id: `sn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sessionId: newSessionId,
        studentId: noteItem.studentId,
        note: noteItem.note
      }));

      setAppState((prev) => ({
        ...prev,
        sessions: [...prev.sessions, newSession],
        classMetrics: [...(prev.classMetrics || []), newMetrics],
        sessionSkills: [...(prev.sessionSkills || []), ...newSessionSkills],
        studentSessionNotes: [...(prev.studentSessionNotes || []), ...newNotes]
      }));
    }

    setIsLoggingSession(false);
    setPreselectedLogStudentId("");
    setPreselectedLogGroupId("");
  };

  const handleDeleteSession = (sessionId: string) => {
    setAppState((prev) => ({
      ...prev,
      sessions: prev.sessions.filter((s) => s.id !== sessionId),
      classMetrics: (prev.classMetrics || []).filter((m) => m.sessionId !== sessionId),
      sessionSkills: (prev.sessionSkills || []).filter((ss) => ss.sessionId !== sessionId),
      studentSessionNotes: (prev.studentSessionNotes || []).filter((sn) => sn.sessionId !== sessionId)
    }));
  };

  // --- Monthly Report Handlers ---
  const handleSaveReport = (payload: Omit<MonthlyReport, "id">) => {
    const newReport: MonthlyReport = {
      ...payload,
      id: `rep-${Date.now()}`
    };

    setAppState(prev => ({
      ...prev,
      monthlyReports: [...prev.monthlyReports, newReport]
    }));

    setIsGeneratingReport(false);
    setPreselectedReportStudentId("");
  };

  const handleDeleteReport = (reportId: string) => {
    setAppState(prev => ({
      ...prev,
      monthlyReports: prev.monthlyReports.filter(r => r.id !== reportId)
    }));
  };

  // --- Game CRUD Handlers ---
  const handleSaveGame = (
    gamePayload: Omit<Game, "id"> & { id?: string },
    selectedSkillIds: string[]
  ) => {
    const isEdit = !!gamePayload.id;
    const gameId = gamePayload.id || `gam-${Date.now()}`;

    const updatedGame: Game = {
      ...gamePayload,
      id: gameId
    } as Game;

    setAppState((prev) => {
      // 1. Update/Add game
      const updatedGames = isEdit
        ? prev.games.map((g) => (g.id === gameId ? updatedGame : g))
        : [...prev.games, updatedGame];

      // 2. Update linked skills
      // First, remove old associations for this game
      const filteredGameSkills = prev.gameSkills.filter((gs) => gs.gameId !== gameId);
      // Then, add new associations
      const newGameSkills = selectedSkillIds.map((skId) => ({
        gameId,
        skillId: skId
      }));

      return {
        ...prev,
        games: updatedGames,
        gameSkills: [...filteredGameSkills, ...newGameSkills]
      };
    });
  };

  const handleDeleteGame = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      games: prev.games.filter((g) => g.id !== id),
      gameSkills: prev.gameSkills.filter((gs) => gs.gameId !== id)
    }));
  };

  // --- Metric CRUD Handlers ---
  const handleSaveMetric = (
    metricPayload: Omit<MetricDefinition, "id"> & { id?: string }
  ) => {
    const isEdit = !!metricPayload.id;
    const metricId = metricPayload.id || `m-${Date.now()}`;

    const updatedMetric: MetricDefinition = {
      ...metricPayload,
      id: metricId
    } as MetricDefinition;

    setAppState((prev) => {
      const updatedMetrics = isEdit
        ? prev.metrics.map((m) => (m.id === metricId ? updatedMetric : m))
        : [...prev.metrics, updatedMetric];

      return {
        ...prev,
        metrics: updatedMetrics
      };
    });
  };

  const handleDeleteMetric = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      metrics: prev.metrics.filter((m) => m.id !== id),
      sessionMetrics: prev.sessionMetrics.filter((sm) => sm.metricId !== id)
    }));
  };

  // --- Skill CRUD Handlers ---
  const handleSaveSkill = (
    skillPayload: Omit<Skill, "id"> & { id?: string }
  ) => {
    const isEdit = !!skillPayload.id;
    const skillId = skillPayload.id || `skl-${Date.now()}`;

    const updatedSkill: Skill = {
      ...skillPayload,
      id: skillId
    } as Skill;

    setAppState((prev) => {
      const updatedSkills = isEdit
        ? prev.skills.map((s) => (s.id === skillId ? updatedSkill : s))
        : [...prev.skills, updatedSkill];

      return {
        ...prev,
        skills: updatedSkills
      };
    });
  };

  const handleDeleteSkill = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s.id !== id),
      // Clean up relationships
      studentSkills: prev.studentSkills.filter((ss) => ss.skillId !== id),
      gameSkills: prev.gameSkills.filter((gs) => gs.skillId !== id),
      sessionSkills: (prev.sessionSkills || []).filter((sc) => sc.skillId !== id)
    }));
  };

  // --- Student Skills Grid Handlers ---
  const handleUpdateSkillLevel = (skillId: string, level: number) => {
    if (!activeStudentId) return;

    setAppState(prev => {
      const matchIndex = prev.studentSkills.findIndex(
        sk => sk.studentId === activeStudentId && sk.skillId === skillId
      );

      let updatedSkills = [...prev.studentSkills];

      if (matchIndex > -1) {
        updatedSkills[matchIndex] = {
          ...updatedSkills[matchIndex],
          currentLevel: level
        };
      } else {
        updatedSkills.push({
          studentId: activeStudentId,
          skillId,
          currentLevel: level
        });
      }

      return {
        ...prev,
        studentSkills: updatedSkills
      };
    });
  };

  // Navigation router switch content
  const renderTabContent = () => {
    if (activeStudentId) {
      const activeStudent = appState.students.find(s => s.id === activeStudentId);
      if (activeStudent) {
        return (
          <StudentDetail
            student={activeStudent}
            groups={appState.groups}
            sessions={appState.sessions}
            monthlyReports={appState.monthlyReports}
            skills={appState.skills}
            studentSkills={appState.studentSkills}
            classMetrics={appState.classMetrics || []}
            sessionSkills={appState.sessionSkills || []}
            studentSessionNotes={appState.studentSessionNotes || []}
            onEditStudent={(st) => setEditingStudent(st)}
            onDeleteStudent={handleDeleteStudent}
            onLogSession={() => {
              setPreselectedLogStudentId(activeStudent.id);
              setIsLoggingSession(true);
            }}
            onGenerateReport={() => {
              setPreselectedReportStudentId(activeStudent.id);
              setIsGeneratingReport(true);
            }}
            onUpdateSkillLevel={handleUpdateSkillLevel}
            onEditSession={handleEditSession}
            onDeleteSession={handleDeleteSession}
            onDeleteReport={handleDeleteReport}
            onBack={() => setActiveStudentId(null)}
          />
        );
      }
    }

    if (activeGroupId) {
      const activeGroup = appState.groups.find(g => g.id === activeGroupId);
      if (activeGroup) {
        return (
          <GroupList
            groups={appState.groups}
            students={appState.students}
            sessions={appState.sessions}
            classMetrics={appState.classMetrics || []}
            skills={appState.skills}
            sessionSkills={appState.sessionSkills || []}
            studentSessionNotes={appState.studentSessionNotes || []}
            onAddGroup={() => setIsAddingGroup(true)}
            onEditGroup={(grp) => setEditingGroup(grp)}
            onDeleteGroup={handleDeleteGroup}
            onLogGroupSession={(groupId) => {
              setPreselectedLogGroupId(groupId);
              setIsLoggingSession(true);
            }}
            onEditSession={handleEditSession}
            onDeleteSession={handleDeleteSession}
          />
        );
      }
    }

    switch (currentTab) {
      case "dashboard":
        return (
          <Dashboard
            students={appState.students}
            groups={appState.groups}
            sessions={appState.sessions}
            classMetrics={appState.classMetrics || []}
            games={appState.games}
            onNavigateToTab={(tab) => {
              handleNavigation(tab);
            }}
            onSelectStudent={(id) => {
              handleNavigation("students");
              setActiveStudentId(id);
            }}
            onSelectGroup={(id) => {
              handleNavigation("groups");
              setActiveGroupId(id);
            }}
            onLogSession={() => setIsLoggingSession(true)}
          />
        );
      case "students":
        return (
          <StudentList
            students={appState.students}
            groups={appState.groups}
            onSelectStudent={(id) => setActiveStudentId(id)}
            onAddStudent={() => setIsAddingStudent(true)}
            onEditStudent={(st) => setEditingStudent(st)}
            onDeleteStudent={handleDeleteStudent}
          />
        );
      case "groups":
        return (
          <GroupList
            groups={appState.groups}
            students={appState.students}
            sessions={appState.sessions}
            classMetrics={appState.classMetrics || []}
            skills={appState.skills}
            sessionSkills={appState.sessionSkills || []}
            studentSessionNotes={appState.studentSessionNotes || []}
            onAddGroup={() => setIsAddingGroup(true)}
            onEditGroup={(grp) => setEditingGroup(grp)}
            onDeleteGroup={handleDeleteGroup}
            onLogGroupSession={(groupId) => {
              setPreselectedLogGroupId(groupId);
              setIsLoggingSession(true);
            }}
            onEditSession={handleEditSession}
            onDeleteSession={handleDeleteSession}
          />
        );
      case "games":
        return (
          <GameSuggester
            games={appState.games}
            skills={appState.skills}
            gameSkills={appState.gameSkills}
            students={appState.students}
            preselectedStudentId={activeStudentId || undefined}
            onSaveGame={handleSaveGame}
            onDeleteGame={handleDeleteGame}
          />
        );
      case "skills":
        return (
          <SkillsManager
            skills={appState.skills}
            gameSkills={appState.gameSkills}
            studentSkills={appState.studentSkills}
            sessionSkills={appState.sessionSkills || []}
            onSaveSkill={handleSaveSkill}
            onDeleteSkill={handleDeleteSkill}
          />
        );
      case "metrics":
        return (
          <MetricsManager
            metrics={appState.metrics}
            sessionMetrics={appState.sessionMetrics}
            onSaveMetric={handleSaveMetric}
            onDeleteMetric={handleDeleteMetric}
          />
        );
      case "sessions":
        return (
          <SessionsList
            sessions={appState.sessions}
            students={appState.students}
            groups={appState.groups}
            onEditSession={handleEditSession}
            onDeleteSession={handleDeleteSession}
            onLogSession={() => {
              setPreselectedLogStudentId("");
              setPreselectedLogGroupId("");
              setEditingSession(null);
              setIsLoggingSession(true);
            }}
          />
        );
      case "backup":
        return (
          <BackupExport
            appState={appState}
            onRestoreState={handleRestoreState}
          />
        );
      default:
        return null;
    }
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "students", label: "Students", icon: Users },
    { id: "groups", label: "Group Classes", icon: GraduationCap },
    { id: "sessions", label: "Session Logs", icon: ClipboardList },
    { id: "games", label: "Activity Suggester", icon: Compass },
    { id: "skills", label: "Music Skills", icon: Award },
    { id: "metrics", label: "Class Metrics", icon: SlidersHorizontal },
    { id: "backup", label: "Export & Backup", icon: Database }
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-850 antialiased font-sans">
      
      {/* 1. Sidebar Nav - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-200 shrink-0">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
            M
          </div>
          <div>
            <span className="font-extrabold text-white text-sm block tracking-tight uppercase">MuseAdmin</span>
            <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Music Studio</span>
          </div>
        </div>

        {/* Navigation lists */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isTabActive = currentTab === item.id && !activeStudentId && !activeGroupId;
            return (
              <button
                key={item.id}
                onClick={() => {
                  handleNavigation(item.id);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left ${
                  isTabActive
                    ? "bg-slate-850 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <item.icon className={`w-4 h-4 ${isTabActive ? "text-indigo-400" : "text-slate-500"}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Prof Profile at Sidebar Bottom */}
        <div className="p-6 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white text-sm">
              AT
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-white">Prof. Aris Thorne</span>
              <span className="text-[10px] text-slate-500">Music Instructor</span>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Top bar - Mobile */}
      <header className="md:hidden bg-slate-900 border-b border-slate-800 text-white p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-500 rounded flex items-center justify-center text-white font-bold text-xs">M</div>
          <span className="font-extrabold text-sm tracking-tight uppercase">MuseAdmin</span>
        </div>
        
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1 rounded-md hover:bg-slate-850 text-slate-300 focus:outline-none cursor-pointer"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile nav overlay menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[53px] bg-slate-900 border-b border-slate-850 z-35 flex flex-col p-4 space-y-1 shadow-lg animate-fade-in">
          {navItems.map((item) => {
            const isTabActive = currentTab === item.id && !activeStudentId && !activeGroupId;
            return (
              <button
                key={item.id}
                onClick={() => {
                  handleNavigation(item.id);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left ${
                  isTabActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-850"
                }`}
              >
                <item.icon className="w-4 h-4 text-slate-500" />
                {item.label}
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Main Workspace Container */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Rapid Session Form Overlay */}
        {isLoggingSession ? (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm animate-scale-up">
            <SessionForm
              students={appState.students}
              groups={appState.groups}
              skills={appState.skills}
              preselectedStudentId={preselectedLogStudentId}
              preselectedGroupId={preselectedLogGroupId}
              editingSession={editingSession || undefined}
              editingMetrics={editingSession ? (appState.classMetrics || []).find(m => m.sessionId === editingSession.id) : undefined}
              editingSkillIds={editingSession ? (appState.sessionSkills || []).filter(ss => ss.sessionId === editingSession.id).map(ss => ss.skillId) : undefined}
              editingStudentNotes={editingSession ? (appState.studentSessionNotes || []).filter(sn => sn.sessionId === editingSession.id) : undefined}
              onSave={handleSaveSession}
              onCancel={() => {
                setIsLoggingSession(false);
                setPreselectedLogStudentId("");
                setPreselectedLogGroupId("");
                setEditingSession(null);
              }}
            />
          </div>
        ) : isGeneratingReport ? (
          /* Report Form Generator Overlay */
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm animate-scale-up">
            <MonthlyReportForm
              students={appState.students}
              sessions={appState.sessions}
              classMetrics={appState.classMetrics || []}
              studentSessionNotes={appState.studentSessionNotes || []}
              existingReports={appState.monthlyReports}
              preselectedStudentId={preselectedReportStudentId}
              onSave={handleSaveReport}
              onCancel={() => {
                setIsGeneratingReport(false);
                setPreselectedReportStudentId("");
              }}
            />
          </div>
        ) : (
          /* Normal Tab workspace Routing */
          renderTabContent()
        )}
      </main>

      {/* Modals Overlays */}
      {isAddingStudent && (
        <StudentFormModal
          groups={appState.groups}
          onSave={handleSaveStudent}
          onClose={() => setIsAddingStudent(false)}
        />
      )}

      {editingStudent && (
        <StudentFormModal
          student={editingStudent}
          groups={appState.groups}
          onSave={handleSaveStudent}
          onClose={() => setEditingStudent(null)}
        />
      )}

      {isAddingGroup && (
        <GroupFormModal
          onSave={handleSaveGroup}
          onClose={() => setIsAddingGroup(false)}
        />
      )}

      {editingGroup && (
        <GroupFormModal
          group={editingGroup}
          onSave={handleSaveGroup}
          onClose={() => setEditingGroup(null)}
        />
      )}
    </div>
  );
}
