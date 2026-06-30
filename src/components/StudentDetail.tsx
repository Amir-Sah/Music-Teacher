/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Student, Session, MonthlyReport, Skill, StudentSkill, Group, SessionMetricValue, SessionSkill, StudentSessionNote } from "../types";
import { 
  User, Calendar, Clock, BookOpen, Star, Sparkles, Smile, MessageSquare, 
  Trash2, Edit, Copy, Check, Printer, Plus, Award, ChevronDown, ChevronUp, FileText, Phone, Users
} from "lucide-react";

interface StudentDetailProps {
  student: Student;
  groups: Group[];
  sessions: Session[];
  monthlyReports: MonthlyReport[];
  skills: Skill[];
  studentSkills: StudentSkill[];
  sessionMetrics: SessionMetricValue[];
  sessionSkills: SessionSkill[];
  studentSessionNotes: StudentSessionNote[];
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onLogSession: () => void;
  onGenerateReport: () => void;
  onUpdateSkillLevel: (skillId: string, level: number) => void;
  onEditSession: (session: Session) => void;
  onDeleteSession: (sessionId: string) => void;
  onDeleteReport: (reportId: string) => void;
  onBack: () => void;
}

export default function StudentDetail({
  student,
  groups,
  sessions,
  monthlyReports,
  skills,
  studentSkills,
  sessionMetrics,
  sessionSkills,
  studentSessionNotes,
  onEditStudent,
  onDeleteStudent,
  onLogSession,
  onGenerateReport,
  onUpdateSkillLevel,
  onEditSession,
  onDeleteSession,
  onDeleteReport,
  onBack
}: StudentDetailProps) {
  const [activeTab, setActiveTab] = useState<"sessions" | "reports" | "skills">("sessions");
  const [copiedReportId, setCopiedReportId] = useState<string | null>(null);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  // Group lookup
  const studentGroup = useMemo(() => {
    return groups.find((g) => g.id === student.groupId);
  }, [groups, student.groupId]);

  // Reverse chronological sessions (including both private and group sessions they belong to)
  const studentSessions = useMemo(() => {
    return sessions
      .filter((s) => s.studentId === student.id || (s.groupId && s.groupId === student.groupId))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [sessions, student.id, student.groupId]);

  // Reverse chronological monthly reports
  const studentReports = useMemo(() => {
    return monthlyReports
      .filter((r) => r.studentId === student.id)
      .sort((a, b) => b.month.localeCompare(a.month));
  }, [monthlyReports, student.id]);

  // Match existing skills current levels or default to 1
  const skillLevelsMap = useMemo(() => {
    const map: { [skillId: string]: number } = {};
    skills.forEach((s) => {
      const match = studentSkills.find(
        (sk) => sk.studentId === student.id && sk.skillId === s.id
      );
      map[s.id] = match ? match.currentLevel : 1;
    });
    return map;
  }, [skills, studentSkills, student.id]);

  // Copy report summary for Parent
  const handleCopyReport = (report: MonthlyReport) => {
    const monthName = new Date(
      parseInt(report.month.split("-")[0]),
      parseInt(report.month.split("-")[1]) - 1,
      1
    ).toLocaleString("default", { month: "long", year: "numeric" });

    const shareText = `🎵 *MUSIC LESSON PROGRESS REPORT* 🎵
-------------------------------------------
👤 *Student:* ${student.name}
📅 *Month:* ${monthName}
-------------------------------------------
📖 *What We Covered:*
${report.summary}

📈 *Progress & Behavior Summary:*
${report.progressSummary}

🏡 *Recommended Practice Homework:*
${report.recommendedPractice}

📝 *Teacher Evaluations & Comments:*
${report.teacherNotes}

-------------------------------------------
Thank you for supporting your child's musical journey! Let me know if you have any questions. 🎹✨`;

    navigator.clipboard.writeText(shareText);
    setCopiedReportId(report.id);
    setTimeout(() => setCopiedReportId(null), 3000);
  };

  const handlePrintReport = (report: MonthlyReport) => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button
          onClick={onBack}
          className="text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          ← Back to Students
        </button>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => onEditStudent(student)}
            className="flex-1 sm:flex-none px-3.5 py-1.5 border border-slate-200 hover:border-slate-300 rounded bg-white text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit Profile
          </button>
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to delete ${student.name}?`)) {
                onDeleteStudent(student.id);
              }
            }}
            className="flex-1 sm:flex-none px-3.5 py-1.5 border border-red-200 hover:bg-red-50 rounded text-xs font-bold text-red-600 hover:text-red-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Student
          </button>
        </div>
      </div>

      {/* Main Student Profile Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-150">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center text-slate-800 border border-slate-200 font-bold text-lg">
              {student.name[0]}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-sans">
                {student.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500 font-semibold">
                <span>Age {student.age} years old</span>
                <span className="text-slate-300">•</span>
                <span className="text-indigo-600">Level: {student.level}</span>
                {studentGroup && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      Group: {studentGroup.name}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onLogSession}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Log New Session
            </button>
            <button
              onClick={onGenerateReport}
              className="flex-1 sm:flex-none px-5 py-2.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-indigo-600" />
              Generate Report
            </button>
          </div>
        </div>

        {/* Contact info and Teacher notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest">
              Parent & Contact Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded border border-slate-200">
                <span className="text-slate-400 block font-semibold uppercase text-[9px] mb-1">Parent Name</span>
                <span className="font-bold text-slate-800 text-sm">{student.parentName || "Not Recorded"}</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded border border-slate-200">
                <span className="text-slate-400 block font-semibold uppercase text-[9px] mb-1">Parent Phone</span>
                <span className="font-bold text-slate-800 text-sm flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {student.parentPhone || "Not Recorded"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest">
              Permanent Teacher Notes
            </h3>
            <div className="bg-slate-50 p-3.5 rounded border border-slate-200 min-h-[76px] text-xs leading-relaxed text-slate-650">
              {student.notes || "No permanent notes. Edit student profile to add helpful pointers (e.g., student's favorite musical genre, specific learning style constraints)."}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="border-b border-slate-200 flex gap-6">
        <button
          onClick={() => setActiveTab("sessions")}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "sessions"
              ? "border-indigo-600 text-indigo-600 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Past Sessions ({studentSessions.length})
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "reports"
              ? "border-indigo-600 text-indigo-600 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Parent Monthly Reports ({studentReports.length})
        </button>
        <button
          onClick={() => setActiveTab("skills")}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "skills"
              ? "border-indigo-600 text-indigo-600 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Music Skills Matrix
        </button>
      </div>

      {/* TABS CONTENT */}
      {activeTab === "sessions" && (
        <div className="space-y-4">
          {studentSessions.length > 0 ? (
            studentSessions.map((session) => {
              const isExpanded = expandedSessionId === session.id;
              // Session metrics
              const metrics = sessionMetrics.filter((m) => m.sessionId === session.id);
              // Practiced skills mapping
              const linkedSkillIds = sessionSkills.filter((ss) => ss.sessionId === session.id).map((ss) => ss.skillId);
              const practicedSkills = skills.filter((sk) => linkedSkillIds.includes(sk.id));
              // Student specific session comment
              const specificNote = studentSessionNotes.find((n) => n.sessionId === session.id && n.studentId === student.id);

              return (
                <div
                  key={session.id}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-200 hover:border-slate-300"
                >
                  {/* Summary row */}
                  <div
                    onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                    className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 rounded text-slate-600 border border-slate-250">
                        <Calendar className="w-4 h-4 text-slate-450" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 text-xs sm:text-sm block">
                          {session.date}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 mt-0.5">
                          {session.groupId ? (
                            <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded text-[9px] font-bold uppercase">
                              Group Class
                            </span>
                          ) : (
                            <span className="bg-slate-100 border border-slate-200 text-slate-600 px-1.5 py-0.2 rounded text-[9px] font-bold uppercase">
                              Private Lesson
                            </span>
                          )}
                          <span className="font-medium line-clamp-1">{session.taughtTopic}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Ratings preview */}
                      {metrics.length > 0 && (
                        <div className="hidden sm:flex items-center gap-3">
                          {metrics.slice(0, 2).map((m) => (
                            <div key={m.metricId} className="flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-400 font-bold uppercase">{m.metricId.replace("m-", "").replace(/-/g, " ")}</span>
                              <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-bold rounded">
                                {m.value}/5
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="text-slate-400">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detail Body */}
                  {isExpanded && (
                    <div className="p-5 border-t border-slate-150 bg-slate-50/30 space-y-5 text-xs sm:text-sm animate-fade-in">
                      {/* Grid metrics */}
                      {metrics.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-2">Class Performance Metrics</span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded border border-slate-200">
                            {metrics.map((m) => (
                              <div key={m.metricId}>
                                <span className="text-[9px] font-bold uppercase text-slate-400 block">{m.metricId.replace("m-", "").replace(/-/g, " ")}</span>
                                <span className="block font-bold text-slate-800 text-sm mt-0.5">{m.value} / 5</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Main Texts */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5 mb-1 uppercase tracking-wide">
                              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                              Lesson Date
                            </span>
                            <span className="text-slate-600 pl-5 text-xs block font-semibold">{session.date}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5 mb-1 uppercase tracking-wide">
                              <Clock className="w-3.5 h-3.5 text-indigo-500" />
                              Session Time
                            </span>
                            <span className="text-slate-600 pl-5 text-xs block font-semibold">{session.startTime} – {session.endTime}</span>
                          </div>
                        </div>

                        <div>
                          <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5 mb-1 uppercase tracking-wide">
                            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                            Taught Topic
                          </span>
                          <p className="text-slate-600 pl-5 text-xs leading-relaxed font-medium">
                            {session.taughtTopic}
                          </p>
                        </div>

                        {session.practiceAssigned && (
                          <div>
                            <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5 mb-1 uppercase tracking-wide">
                              <Smile className="w-3.5 h-3.5 text-emerald-500" />
                              Practice Assigned (Home Homework)
                            </span>
                            <p className="text-slate-600 pl-5 text-xs whitespace-pre-line leading-relaxed">
                              {session.practiceAssigned}
                            </p>
                          </div>
                        )}

                        {practicedSkills.length > 0 && (
                          <div>
                            <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5 mb-1.5 uppercase tracking-wide">
                              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                              Skills Coverages
                            </span>
                            <div className="flex flex-wrap gap-1.5 pl-5">
                              {practicedSkills.map((sk) => (
                                <span key={sk.id} className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase">
                                  {sk.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {specificNote && (
                          <div className="p-3.5 bg-emerald-50/50 border border-emerald-150 rounded-xl space-y-1">
                            <span className="font-bold text-emerald-800 text-xs flex items-center gap-1 uppercase tracking-wide">
                              <Smile className="w-3.5 h-3.5 text-emerald-600" />
                              Feedback Comment (Recorded for {student.name})
                            </span>
                            <p className="text-emerald-900 text-xs leading-relaxed italic pl-5">
                              "{specificNote.note}"
                            </p>
                          </div>
                        )}

                        {session.nextLessonSuggestion && (
                          <div>
                            <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5 mb-1 uppercase tracking-wide">
                              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                              Next Lesson Suggestion
                            </span>
                            <p className="text-slate-650 pl-5 text-xs leading-relaxed italic">
                              {session.nextLessonSuggestion}
                            </p>
                          </div>
                        )}

                        {/* Reflections */}
                        {(session.teacherStrengths || session.teacherMistakes) && (
                          <div className="border-t border-slate-200 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {session.teacherStrengths && (
                              <div className="bg-slate-50 p-3 rounded border border-slate-150">
                                <span className="text-[10px] font-bold uppercase text-slate-450 tracking-wider block">Teacher Strengths Reflect</span>
                                <span className="text-slate-700 text-xs mt-0.5 block">{session.teacherStrengths}</span>
                              </div>
                            )}
                            {session.teacherMistakes && (
                              <div className="bg-slate-50 p-3 rounded border border-slate-150">
                                <span className="text-[10px] font-bold uppercase text-slate-450 tracking-wider block">Areas of Instruction Mistakes</span>
                                <span className="text-slate-700 text-xs mt-0.5 block">{session.teacherMistakes}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Private Notes */}
                        {session.privateNotes && (
                          <div className="bg-slate-100 p-3 rounded border border-slate-200">
                            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">🔒 Private Lesson Notes (Hidden from reports)</span>
                            <span className="text-slate-600 text-xs mt-0.5 block italic">{session.privateNotes}</span>
                          </div>
                        )}
                      </div>

                      {/* Delete Session action */}
                      <div className="flex justify-end gap-3 pt-2 border-t border-slate-150">
                        <button
                          type="button"
                          onClick={() => onEditSession(session)}
                          className="text-indigo-600 hover:text-indigo-700 font-bold text-xs flex items-center gap-1.5 py-1 px-2.5 rounded hover:bg-indigo-50 transition-colors cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Edit Log
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this session log?")) {
                              onDeleteSession(session.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-700 font-bold text-xs flex items-center gap-1.5 py-1 px-2.5 rounded hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete Log
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">No sessions logged yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Press "Log New Session" to record what was taught in today's lesson.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "reports" && (
        <div className="space-y-6">
          {studentReports.length > 0 ? (
            studentReports.map((report) => {
              const formattedMonth = new Date(
                parseInt(report.month.split("-")[0]),
                parseInt(report.month.split("-")[1]) - 1,
                1
              ).toLocaleString("default", { month: "long", year: "numeric" });

              return (
                <div
                  key={report.id}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden p-6 space-y-5"
                >
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-150 pb-4">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block font-sans">MONTHLY UPDATE</span>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">{formattedMonth}</h4>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopyReport(report)}
                        className={`px-3.5 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          copiedReportId === report.id
                            ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                            : "bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {copiedReportId === report.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy for parent (WhatsApp/Email)
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handlePrintReport(report)}
                        className="p-1.5 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 cursor-pointer"
                        title="Print Report"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this parent report?")) {
                            onDeleteReport(report.id);
                          }
                        }}
                        className="p-1.5 rounded border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer"
                        title="Delete Report"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Body Print Template */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm leading-relaxed text-slate-600">
                    <div className="md:col-span-2 space-y-4">
                      <div>
                        <span className="font-bold text-slate-800 text-xs block mb-1">Topics & Lessons covered</span>
                        <p className="whitespace-pre-line text-xs pl-2 border-l-2 border-indigo-150 text-slate-600">
                          {report.summary}
                        </p>
                      </div>

                      <div>
                        <span className="font-bold text-slate-800 text-xs block mb-1">Overall Progress & Engagement</span>
                        <p className="whitespace-pre-line text-xs pl-2 border-l-2 border-indigo-150 text-slate-600">
                          {report.progressSummary}
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-4">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Evaluations & Metrics Comments</span>
                        <p className="text-xs text-slate-700 leading-normal font-medium whitespace-pre-line bg-white border border-slate-200 p-2.5 rounded-lg">
                          {report.teacherNotes}
                        </p>
                      </div>

                      <div>
                        <span className="font-bold text-slate-800 text-[10px] uppercase tracking-wider block mb-1">Homework Recommendation</span>
                        <p className="text-xs text-slate-600 leading-normal whitespace-pre-line">
                          {report.recommendedPractice}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">No reports generated yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Press "Generate Report" above to aggregate past sessions into a beautiful summary sheet for parents.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "skills" && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div>
            <h3 className="text-sm font-bold uppercase text-slate-450 tracking-wider flex items-center gap-1.5">
              <Award className="w-5 h-5 text-indigo-600" />
              Music Skills Track & Progress
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Track the student's development level across musical skill areas. Values auto-save locally.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            {skills.map((skill) => {
              const currentLevel = skillLevelsMap[skill.id] || 1;
              return (
                <div
                  key={skill.id}
                  className="p-4 rounded bg-slate-50 border border-slate-150 flex flex-col justify-between gap-3 hover:border-slate-250 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 text-xs sm:text-sm">{skill.name}</span>
                    <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded">
                      Level {currentLevel} / 5
                    </span>
                  </div>

                  {/* Level dots clicker */}
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => onUpdateSkillLevel(skill.id, level)}
                        className={`h-2.5 flex-1 rounded transition-all duration-200 cursor-pointer ${
                          level <= currentLevel
                            ? "bg-indigo-600"
                            : "bg-slate-200 hover:bg-slate-300"
                        }`}
                        title={`Set to level ${level}`}
                      />
                    ))}
                  </div>

                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide flex justify-between">
                    <span>Beginner</span>
                    <span>Proficient</span>
                    <span>Expert</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
