/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Session, Student, Group } from "../types";
import { ClipboardList, Search, Edit2, Trash2, X, Calendar, Clock } from "lucide-react";

interface SessionsListProps {
  sessions: Session[];
  students: Student[];
  groups: Group[];
  onEditSession: (session: Session) => void;
  onDeleteSession: (sessionId: string) => void;
  onLogSession: () => void;
}

export default function SessionsList({
  sessions,
  students,
  groups,
  onEditSession,
  onDeleteSession,
  onLogSession
}: SessionsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "private" | "group">("all");

  const getTargetName = (session: Session) => {
    if (session.studentId) {
      const st = students.find((s) => s.id === session.studentId);
      return st ? st.name : "Unknown Student";
    }
    if (session.groupId) {
      const g = groups.find((g) => g.id === session.groupId);
      return g ? g.name : "Unknown Group";
    }
    return "System Log";
  };

  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const matchesType = 
        filterType === "all" || 
        (filterType === "private" && !!session.studentId) ||
        (filterType === "group" && !!session.groupId);

      const matchesSearch = 
        getTargetName(session).toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.taughtTopic.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesType && matchesSearch;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [sessions, filterType, searchTerm, students, groups]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-indigo-500" />
            All Session Logs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            View, search, and manage all your past class logs.
          </p>
        </div>

        <button
          onClick={onLogSession}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-750 text-white rounded font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
        >
          <ClipboardList className="w-4 h-4" />
          Log New Session
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student, group, or topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 bg-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 bg-white"
            >
              <option value="all">All Classes</option>
              <option value="private">Private Only</option>
              <option value="group">Group Only</option>
            </select>
          </div>
        </div>

        {filteredSessions.length > 0 ? (
          <div className="divide-y divide-slate-150">
            {filteredSessions.map((session) => (
              <div key={session.id} className="p-5 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        session.groupId ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {session.groupId ? "Group Class" : "Private Lesson"}
                      </span>
                      <span className="font-bold text-slate-800 text-sm">
                        {getTargetName(session)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {session.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {session.startTime} - {session.endTime}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditSession(session)}
                      className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-bold hover:bg-indigo-50 px-2.5 py-1.5 rounded transition-all cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this session log?")) {
                          onDeleteSession(session.id);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-bold hover:bg-red-50 px-2.5 py-1.5 rounded transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="mt-3 text-sm text-slate-700 bg-white border border-slate-100 p-3 rounded-lg shadow-xs">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Topic Taught</span>
                  {session.taughtTopic}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 text-sm">
            No session logs found.
          </div>
        )}
      </div>
    </div>
  );
}
