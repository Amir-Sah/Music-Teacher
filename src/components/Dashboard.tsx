/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import { Student, Group, Session, Game, SessionMetricValue } from "../types";
import { 
  Users, Calendar, Clock, ChevronRight, 
  BookOpen, Star, ClipboardList
} from "lucide-react";

interface DashboardProps {
  students: Student[];
  groups: Group[];
  sessions: Session[];
  sessionMetrics: SessionMetricValue[];
  games: Game[];
  onNavigateToTab: (tab: "students" | "groups" | "games" | "sessions") => void;
  onSelectStudent: (id: string) => void;
  onSelectGroup: (id: string) => void;
  onLogSession: () => void;
}

export default function Dashboard({
  students,
  groups,
  sessions,
  sessionMetrics,
  games,
  onNavigateToTab,
  onSelectStudent,
  onSelectGroup,
  onLogSession
}: DashboardProps) {
  // Current month string YYYY-MM
  const currentMonthStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  // Filter sessions logged this month
  const monthlySessions = useMemo(() => {
    return sessions.filter((s) => s.date.startsWith(currentMonthStr));
  }, [sessions, currentMonthStr]);

  // Focus level average this month from sessionMetrics
  const monthlyFocusAvg = useMemo(() => {
    const sessionIds = monthlySessions.map((s) => s.id);
    // Find focus level metrics (id format usually is m-focus or similar, let's look for "focus" in id)
    const metricsForThisMonth = sessionMetrics.filter((m) => 
      sessionIds.includes(m.sessionId) && m.metricId.toLowerCase().includes("focus")
    );
    
    if (metricsForThisMonth.length === 0) return 0;
    const sum = metricsForThisMonth.reduce((acc, m) => acc + m.value, 0);
    return parseFloat((sum / metricsForThisMonth.length).toFixed(1));
  }, [monthlySessions, sessionMetrics]);

  // Last 3 sessions logged
  const recentSessions = useMemo(() => {
    return [...sessions]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 3);
  }, [sessions]);

  // Music activity of the day: deterministic based on date index
  const gameOfTheDay = useMemo(() => {
    if (games.length === 0) return null;
    const day = new Date().getDate();
    const index = day % games.length;
    return games[index];
  }, [games]);

  // Quick lookup name for a session target (student or group)
  const getSessionTargetName = (session: Session) => {
    if (session.studentId) {
      const student = students.find((s) => s.id === session.studentId);
      return student ? { name: student.name, isGroup: false, id: student.id } : { name: "Unknown Student", isGroup: false, id: "" };
    } else if (session.groupId) {
      const group = groups.find((g) => g.id === session.groupId);
      return group ? { name: group.name, isGroup: true, id: group.id } : { name: "Unknown Group", isGroup: true, id: "" };
    }
    return { name: "System Log", isGroup: false, id: "" };
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Hello, Maestro 🎵
          </h1>
          <p className="text-xs text-slate-500 mt-1.5">
            Let's make today's music lessons creative and unforgettable.
          </p>
        </div>

        <button
          onClick={onLogSession}
          className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white font-bold text-xs sm:text-sm rounded-md shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <PlusIcon className="w-4 h-4" />
          Log After-Class Session
        </button>
      </div>

      {/* KPI Stats Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* KPI 1: Active students */}
        <div 
          onClick={() => onNavigateToTab("students")}
          className="bg-white border border-slate-200 hover:border-slate-300 p-6 rounded-xl cursor-pointer transition-all hover:shadow-sm group"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Roster Size</span>
            <Users className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
          </div>
          <div className="flex items-baseline gap-1 mt-3">
            <span className="text-2xl font-black text-slate-900">{students.length}</span>
            <span className="text-xs text-slate-400 font-bold">Students</span>
          </div>
        </div>

        {/* KPI 2: Active groups */}
        <div 
          onClick={() => onNavigateToTab("groups")}
          className="bg-white border border-slate-200 hover:border-slate-300 p-6 rounded-xl cursor-pointer transition-all hover:shadow-sm group"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Class Groups</span>
            <Calendar className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
          </div>
          <div className="flex items-baseline gap-1 mt-3">
            <span className="text-2xl font-black text-slate-900">{groups.length}</span>
            <span className="text-xs text-slate-400 font-bold">Groups</span>
          </div>
        </div>

        {/* KPI 3: Monthly Session Log Count */}
        <div 
          onClick={() => onNavigateToTab("sessions")}
          className="bg-white border border-slate-200 hover:border-slate-300 p-6 rounded-xl cursor-pointer transition-all hover:shadow-sm group"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Month Logs</span>
            <ClipboardList className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
          </div>
          <div className="flex items-baseline gap-1 mt-3">
            <span className="text-2xl font-black text-slate-900">{monthlySessions.length}</span>
            <span className="text-xs text-slate-400 font-bold">Sessions</span>
          </div>
        </div>

        {/* KPI 4: Month Focus Score Average */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Avg Focus</span>
          <div className="flex items-baseline gap-1.5 mt-3">
            <span className="text-2xl font-black text-slate-900">{monthlyFocusAvg || "—"}</span>
            <span className="text-xs text-slate-400 font-bold">/ 5 pts</span>
          </div>
        </div>
      </div>

      {/* Main Grid section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Columns: Recent logs & Agenda */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Recent Lesson Logs */}
          <div className="space-y-4">
            <h2 className="text-xs uppercase tracking-widest font-bold text-slate-400">Recent Lesson History</h2>

            {recentSessions.length > 0 ? (
              <div className="space-y-3">
                {recentSessions.map((session) => {
                  const target = getSessionTargetName(session);
                  // Find related session metrics Focus rating
                  const focusMetric = sessionMetrics.find((m) => m.sessionId === session.id && m.metricId.toLowerCase().includes("focus"));
                  const focusVal = focusMetric ? focusMetric.value : 4;

                  return (
                    <div
                      key={session.id}
                      onClick={() => {
                        if (target.id) {
                          if (target.isGroup) {
                            onSelectGroup(target.id);
                          } else {
                            onSelectStudent(target.id);
                          }
                        }
                      }}
                      className="bg-white border border-slate-200 hover:border-slate-300 p-5 rounded-xl cursor-pointer transition-all flex justify-between items-center gap-4 hover:translate-x-0.5 hover:shadow-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-xs sm:text-sm">
                            {target.name}
                          </span>
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                            target.isGroup 
                              ? "bg-indigo-50 text-indigo-700"
                              : "bg-slate-50 border text-slate-600"
                          }`}>
                            {target.isGroup ? "Group Class" : "Private"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {session.taughtTopic}
                        </p>
                        <span className="text-[10px] text-slate-400 font-semibold block">
                          Date: {session.date}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Focus:</span>
                          <span className="w-6 h-6 rounded bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                            {focusVal}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-100/30 border border-dashed rounded-xl border-slate-300">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">No sessions logged yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Click "Log After-Class Session" to start your gradebook logs.</p>
              </div>
            )}
          </div>

          {/* Quick actions agenda */}
          <div className="space-y-4">
            <h2 className="text-xs uppercase tracking-widest font-bold text-slate-400">Quick Student Profiles</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {students.slice(0, 4).map((st) => (
                <div
                  key={st.id}
                  onClick={() => onSelectStudent(st.id)}
                  className="bg-white border border-slate-200 hover:border-slate-300 p-5 rounded-xl flex items-center justify-between gap-4 cursor-pointer transition-all hover:translate-x-0.5 hover:shadow-xs"
                >
                  <div>
                    <span className="font-bold text-slate-800 text-xs sm:text-sm block">{st.name}</span>
                    <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider mt-1 block">{st.level}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
            
            <button
              onClick={() => onNavigateToTab("students")}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 mt-1 transition-colors cursor-pointer"
            >
              View entire student directory →
            </button>
          </div>
        </div>

        {/* Right Column: Educational Game of the Day */}
        <div className="lg:col-span-4 space-y-6">
          {gameOfTheDay && (
            <div className="bg-indigo-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[300px]">
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500 border-2 border-indigo-300 flex items-center justify-center text-xl font-bold font-serif italic">
                    G
                  </div>
                  <div>
                    <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block">Maestro Inspiration</span>
                    <h3 className="font-bold text-base leading-tight">Game of the Day</h3>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-extrabold text-white text-sm leading-tight">
                      {gameOfTheDay.name}
                    </h4>
                    <span className="px-1.5 py-0.5 bg-indigo-500 text-indigo-100 text-[8px] font-bold rounded uppercase border border-indigo-400/50 flex-shrink-0">
                      {gameOfTheDay.difficulty}
                    </span>
                  </div>

                  <p className="text-xs text-indigo-200 leading-relaxed line-clamp-4">
                    {gameOfTheDay.description}
                  </p>

                  {gameOfTheDay.materialsNeeded && (
                    <div className="text-[10px] bg-indigo-950/40 p-2.5 rounded border border-indigo-800 text-indigo-200">
                      <span className="font-bold text-indigo-100">Needs: </span>
                      {gameOfTheDay.materialsNeeded}
                    </div>
                  )}
                </div>
              </div>

              <div className="relative z-10 pt-4 mt-4 border-t border-indigo-800">
                <button
                  onClick={() => onNavigateToTab("games")}
                  className="w-full py-2 bg-indigo-800 hover:bg-indigo-700 text-white font-bold text-xs rounded transition-colors text-center cursor-pointer uppercase tracking-wider"
                >
                  Browse Games Library
                </button>
              </div>

              {/* Decorative Geometry */}
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-800 rounded-full opacity-50"></div>
              <div className="absolute -left-8 -top-8 w-20 h-20 bg-indigo-700 rounded-full opacity-20"></div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// Simple local SVG PlusIcon to avoid package import issues
function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
