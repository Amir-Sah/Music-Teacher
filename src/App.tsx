/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { useAppState } from "./hooks/useAppState";
import { useNavigation } from "./hooks/useNavigation";
import { Session, MonthlyReport, Student, Group, SessionMetricValue } from "./types";

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

export default function App() {
  const {
    appState,
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
    handleUpdateSkillLevelForStudent,
    handleRestoreState,
  } = useAppState();

  const {
    currentTab,
    activeStudentId,
    activeGroupId,
    isMobileMenuOpen,
    isAddingStudent,
    editingStudent,
    isAddingGroup,
    editingGroup,
    isLoggingSession,
    editingSession,
    preselectedLogStudentId,
    preselectedLogGroupId,
    isGeneratingReport,
    preselectedReportStudentId,
    handleNavigation,
    setActiveStudentId,
    setActiveGroupId,
    setIsMobileMenuOpen,
    setIsAddingStudent,
    setEditingStudent,
    setIsAddingGroup,
    setEditingGroup,
    setIsLoggingSession,
    setEditingSession,
    setPreselectedLogStudentId,
    setPreselectedLogGroupId,
    setIsGeneratingReport,
    setPreselectedReportStudentId,
    handleEditSession,
    closeSessionForm,
    closeReportForm,
  } = useNavigation();

  const handleSafeRestoreState = (newState: any) => {
    handleRestoreState(newState);
    handleNavigation("dashboard");
  };

  // Wrapped save handlers that also close forms/modals
  const handleSaveSessionWrapped = (
    session: Omit<Session, "id">,
    metrics: SessionMetricValue[],
    selectedSkillIds: string[],
    studentNotes: { studentId: string; note: string }[],
    editingSessionId?: string
  ) => {
    handleSaveSession(session, metrics, selectedSkillIds, studentNotes, editingSessionId);
    closeSessionForm();
  };

  const handleSaveReportWrapped = (
    report: Omit<MonthlyReport, "id"> & { id?: string }
  ) => {
    handleSaveReport(report);
    closeReportForm();
  };

  const handleSaveStudentWrapped = (student: Omit<Student, "id"> & { id?: string }) => {
    handleSaveStudent(student);
    setIsAddingStudent(false);
    setEditingStudent(null);
  };

  const handleSaveGroupWrapped = (group: Omit<Group, "id"> & { id?: string }) => {
    handleSaveGroup(group);
    setIsAddingGroup(false);
    setEditingGroup(null);
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
            sessionMetrics={appState.sessionMetrics || []}
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
            onUpdateSkillLevel={(skillId, level) => {
              handleUpdateSkillLevelForStudent(activeStudent.id, skillId, level);
            }}
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
            sessionMetrics={appState.sessionMetrics || []}
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
            sessionMetrics={appState.sessionMetrics || []}
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
            sessionMetrics={appState.sessionMetrics || []}
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
            onRestoreState={handleSafeRestoreState}
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
              metrics={appState.metrics}
              preselectedStudentId={preselectedLogStudentId}
              preselectedGroupId={preselectedLogGroupId}
              editingSession={editingSession || undefined}
              editingMetrics={editingSession ? (appState.sessionMetrics || []).filter(m => m.sessionId === editingSession.id) : undefined}
              editingSkillIds={editingSession ? (appState.sessionSkills || []).filter(ss => ss.sessionId === editingSession.id).map(ss => ss.skillId) : undefined}
              editingStudentNotes={editingSession ? (appState.studentSessionNotes || []).filter(sn => sn.sessionId === editingSession.id) : undefined}
              onSave={handleSaveSessionWrapped}
              onCancel={closeSessionForm}
            />
          </div>
        ) : isGeneratingReport ? (
          /* Report Form Generator Overlay */
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm animate-scale-up">
            <MonthlyReportForm
              students={appState.students}
              sessions={appState.sessions}
              sessionMetrics={appState.sessionMetrics || []}
              studentSessionNotes={appState.studentSessionNotes || []}
              existingReports={appState.monthlyReports}
              preselectedStudentId={preselectedReportStudentId}
              onSave={handleSaveReportWrapped}
              onCancel={closeReportForm}
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
          onSave={(student) => handleSaveStudentWrapped(student)}
          onClose={() => setIsAddingStudent(false)}
        />
      )}

      {editingStudent && (
        <StudentFormModal
          student={editingStudent}
          groups={appState.groups}
          onSave={(student) => handleSaveStudentWrapped({ ...student, id: editingStudent.id })}
          onClose={() => setEditingStudent(null)}
        />
      )}

      {isAddingGroup && (
        <GroupFormModal
          onSave={(group) => handleSaveGroupWrapped(group)}
          onClose={() => setIsAddingGroup(false)}
        />
      )}

      {editingGroup && (
        <GroupFormModal
          group={editingGroup}
          onSave={(group) => handleSaveGroupWrapped({ ...group, id: editingGroup.id })}
          onClose={() => setEditingGroup(null)}
        />
      )}
    </div>
  );
}
