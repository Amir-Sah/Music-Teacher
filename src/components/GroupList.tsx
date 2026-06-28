/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Group, Student, Session, ClassMetrics, Skill, SessionSkill, StudentSessionNote } from "../types";
import { Users, Plus, Edit2, Trash2, Calendar, BookOpen, PlusCircle, ClipboardList, MapPin, Clock, Star, Sparkles, Smile } from "lucide-react";

interface GroupListProps {
  groups: Group[];
  students: Student[];
  sessions: Session[];
  classMetrics: ClassMetrics[];
  skills: Skill[];
  sessionSkills: SessionSkill[];
  studentSessionNotes: StudentSessionNote[];
  onAddGroup: () => void;
  onEditGroup: (group: Group) => void;
  onDeleteGroup: (id: string) => void;
  onLogGroupSession: (groupId: string) => void;
  onEditSession: (session: Session) => void;
  onDeleteSession: (sessionId: string) => void;
}

export default function GroupList({
  groups,
  students,
  sessions,
  classMetrics,
  skills,
  sessionSkills,
  studentSessionNotes,
  onAddGroup,
  onEditGroup,
  onDeleteGroup,
  onLogGroupSession,
  onEditSession,
  onDeleteSession
}: GroupListProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const activeGroup = useMemo(() => {
    return groups.find((g) => g.id === selectedGroupId) || null;
  }, [groups, selectedGroupId]);

  // Roster of students in the currently selected group
  const groupStudents = useMemo(() => {
    if (!selectedGroupId) return [];
    return students.filter((st) => st.groupId === selectedGroupId);
  }, [students, selectedGroupId]);

  // Session logs linked to this group
  const groupSessions = useMemo(() => {
    if (!selectedGroupId) return [];
    return sessions
      .filter((s) => s.groupId === selectedGroupId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [sessions, selectedGroupId]);

  return (
    <div className="space-y-8">
      {/* Directory Main List (when no group is selected) */}
      {!selectedGroupId ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Users className="w-6 h-6 text-slate-800" />
                Group Classes & Ensembles
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Manage your groups, band assemblies, and music circles. Log sessions taught to multiple students.
              </p>
            </div>

            <button
              onClick={onAddGroup}
              className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-md shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create Group Class
            </button>
          </div>

          {groups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              {groups.map((group) => {
                const rosterCount = students.filter((s) => s.groupId === group.id).length;
                const groupSesCount = sessions.filter((s) => s.groupId === group.id).length;

                return (
                  <div
                    key={group.id}
                    className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="p-6 space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <h3 className="font-bold text-slate-900 tracking-tight text-sm sm:text-base">
                            {group.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            <span>{rosterCount} {rosterCount === 1 ? "Student" : "Students"}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-450" />
                              {group.location}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => onEditGroup(group)}
                            className="p-1.5 rounded border border-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
                            title="Edit class"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  `Are you sure you want to delete ${group.name}? Students registered will be detached but not deleted.`
                                )
                              ) {
                                onDeleteGroup(group.id);
                              }
                            }}
                            className="p-1.5 rounded border border-red-100 text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                            title="Delete class"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-3">
                        {group.description || "No class description registered. Tap view to add curriculum directions."}
                      </p>
                    </div>

                    <div className="px-6 py-4 border-t border-slate-150 bg-slate-50/50 flex items-center justify-between gap-4">
                      <span className="text-[11px] text-slate-400 font-semibold">
                        {groupSesCount} logged group lessons
                      </span>
                      <button
                        onClick={() => setSelectedGroupId(group.id)}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                      >
                        Manage & Log
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">No group classes active</p>
              <p className="text-xs text-slate-500 mt-1">
                Ensembles allow you to organize students into keyboard groups or vocal choirs. Click create to start.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Expanded Single Group View */
        <div className="space-y-6 animate-fade-in">
          {/* Back Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <button
              onClick={() => setSelectedGroupId(null)}
              className="text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              ← Back to Group Roster
            </button>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => onLogGroupSession(activeGroup!.id)}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Log Group Session
              </button>
            </div>
          </div>

          {/* Group Info Header */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3 shadow-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Class Workspace</span>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {activeGroup?.name}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase">
                <MapPin className="w-4 h-4 text-indigo-500" />
                <span>Room: {activeGroup?.location || "N/A"}</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-650 max-w-3xl leading-relaxed">
              {activeGroup?.description || "No curriculum description."}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Roster column */}
            <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-6 space-y-4 h-fit shadow-xs">
              <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest pb-2 border-b border-slate-150">
                Roster ({groupStudents.length} Students)
              </h3>
              {groupStudents.length > 0 ? (
                <div className="space-y-2.5">
                  {groupStudents.map((st) => (
                    <div
                      key={st.id}
                      className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded border border-transparent hover:border-slate-150 transition-colors"
                    >
                      <div className="w-8 h-8 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold text-xs">
                        {st.name[0]}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 text-xs block">{st.name}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">Age {st.age} • {st.level}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No students currently assigned to this group. Edit student profiles to assign them here.</p>
              )}
            </div>

            {/* Session timeline column */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest">
                Taught Sessions History ({groupSessions.length})
              </h3>

              {groupSessions.length > 0 ? (
                <div className="space-y-4 animate-fade-in">
                  {groupSessions.map((ses) => {
                    // Match class metrics
                    const metrics = classMetrics.find((m) => m.sessionId === ses.id);
                    // Match skills practiced
                    const linkedSkillIds = sessionSkills.filter((ss) => ss.sessionId === ses.id).map((ss) => ss.skillId);
                    const practicedSkills = skills.filter((sk) => linkedSkillIds.includes(sk.id));
                    // Match student comments
                    const studentComments = studentSessionNotes.filter((n) => n.sessionId === ses.id);

                    return (
                      <div
                        key={ses.id}
                        className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-150 pb-3">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded">
                              <Calendar className="w-3.5 h-3.5 text-slate-550" />
                              {ses.date}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-150">
                              <Clock className="w-3 h-3" />
                              {ses.startTime} – {ses.endTime}
                            </span>
                          </div>

                          {metrics && (
                            <div className="flex flex-wrap gap-1.5">
                              <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-700 text-[9px] font-bold rounded uppercase">
                                Focus: {metrics.focusLevel}/5
                              </span>
                              <span className="px-2 py-0.5 bg-sky-50 border border-sky-100 text-sky-700 text-[9px] font-bold rounded uppercase">
                                Engagement: {metrics.engagementLevel}/5
                              </span>
                              <span className="px-2 py-0.5 bg-amber-50 border border-amber-100 text-amber-700 text-[9px] font-bold rounded uppercase">
                                Cooperation: {metrics.cooperationLevel}/5
                              </span>
                              <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[9px] font-bold rounded uppercase">
                                Dynamics: {metrics.groupDynamics}/5
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Taught & Practice Grid */}
                        <div className="space-y-3.5 text-xs sm:text-sm text-slate-650">
                          <div>
                            <span className="font-bold text-slate-800 text-xs block mb-1">Topics Taught</span>
                            <p className="pl-3 border-l-2 border-indigo-150 text-slate-600 font-medium">{ses.taughtTopic}</p>
                          </div>
                          
                          {ses.practiceAssigned && (
                            <div>
                              <span className="font-bold text-slate-800 text-xs block mb-1">Homework Practice Assigned</span>
                              <p className="pl-3 border-l-2 border-indigo-150 text-slate-600 whitespace-pre-line text-xs">{ses.practiceAssigned}</p>
                            </div>
                          )}

                          {practicedSkills.length > 0 && (
                            <div className="space-y-1">
                              <span className="font-bold text-slate-800 text-xs block">Skills Exercised</span>
                              <div className="flex flex-wrap gap-1 pt-0.5">
                                {practicedSkills.map((sk) => (
                                  <span key={sk.id} className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9px] font-bold uppercase px-2 py-0.5 rounded">
                                    {sk.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Individual Student Feedback Cards from StudentSessionNotes */}
                          {studentComments.length > 0 && (
                            <div className="space-y-2 pt-2 border-t border-slate-100">
                              <span className="font-bold text-slate-800 text-xs flex items-center gap-1">
                                <Smile className="w-3.5 h-3.5 text-emerald-500" />
                                Individual Student Comments
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {studentComments.map((note) => {
                                  const s = students.find((st) => st.id === note.studentId);
                                  return (
                                    <div key={note.id} className="bg-slate-50 border border-slate-150 rounded-lg p-2.5 space-y-1">
                                      <span className="font-bold text-xs text-slate-800 block">{s ? s.name : "Student"}</span>
                                      <p className="text-[11px] text-slate-600 leading-relaxed italic">"{note.note}"</p>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          
                          {ses.nextLessonSuggestion && (
                            <div>
                              <span className="font-bold text-slate-800 text-xs block mb-1">Suggestion for next lesson</span>
                              <p className="pl-3 border-l-2 border-slate-200 text-slate-550 text-xs italic">{ses.nextLessonSuggestion}</p>
                            </div>
                          )}

                          {ses.privateNotes && (
                            <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-slate-500 italic text-[11px]">
                              🔒 Private Notes: {ses.privateNotes}
                            </div>
                          )}
                        </div>

                        {/* Session CRUD controls */}
                        <div className="flex justify-end gap-3 pt-3 border-t border-slate-150">
                          <button
                            type="button"
                            onClick={() => onEditSession(ses)}
                            className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-bold hover:bg-indigo-50 px-2.5 py-1.5 rounded transition-all cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Edit Log
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this session log?")) {
                                onDeleteSession(ses.id);
                              }
                            }}
                            className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-bold hover:bg-red-50 px-2.5 py-1.5 rounded transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete Log
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 border border-dashed rounded-xl border-slate-200">
                  <ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600">No group sessions recorded yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Click "Log Group Session" to input your first curriculum log.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
