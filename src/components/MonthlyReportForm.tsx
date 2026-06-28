/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Student, Session, ClassMetrics, StudentSessionNote, MonthlyReport } from "../types";
import { Calendar, RefreshCw, Check, ArrowLeft, Star, FileText } from "lucide-react";

interface MonthlyReportFormProps {
  students: Student[];
  sessions: Session[];
  classMetrics: ClassMetrics[];
  studentSessionNotes: StudentSessionNote[];
  existingReports: MonthlyReport[];
  preselectedStudentId?: string;
  onSave: (report: Omit<MonthlyReport, "id">) => void;
  onCancel: () => void;
}

export default function MonthlyReportForm({
  students,
  sessions,
  classMetrics,
  studentSessionNotes,
  existingReports,
  preselectedStudentId = "",
  onSave,
  onCancel
}: MonthlyReportFormProps) {
  const [studentId, setStudentId] = useState(preselectedStudentId);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const [summary, setSummary] = useState("");
  const [progressSummary, setProgressSummary] = useState("");
  const [recommendedPractice, setRecommendedPractice] = useState("");
  const [teacherNotes, setTeacherNotes] = useState("");
  
  const [isGenerated, setIsGenerated] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleAutoGenerate = () => {
    if (!studentId) {
      alert("Please select a student first");
      return;
    }

    const student = students.find((st) => st.id === studentId);

    // Filter sessions matching student (either private or their assigned group) and selected month
    const studentSessions = sessions.filter((s) => {
      const isPrivate = s.studentId === studentId;
      const isGroup = s.groupId && student && student.groupId === s.groupId;
      if (!isPrivate && !isGroup) return false;
      return s.date.startsWith(month);
    });

    if (studentSessions.length === 0) {
      setFeedback("⚠️ No sessions logged for this student (or their group) in this month. Using standard templates.");
      setSummary("Overall excellent focus. No specific session topics to pull.");
      setProgressSummary("Steadily advancing through current repertoire.");
      setRecommendedPractice("Continue daily piano practices for 15-20 minutes.");
      setTeacherNotes("Averages: N/A. Student was highly cooperative during sessions.");
      setIsGenerated(true);
      return;
    }

    setFeedback(`✨ Successfully aggregated data from ${studentSessions.length} total sessions (private & group) in ${month}!`);

    // 1. Calculate Metrics Averages
    const sessionIds = studentSessions.map((s) => s.id);
    const metricsList = classMetrics.filter((m) => sessionIds.includes(m.sessionId));
    
    let avgFocus = 0;
    let avgEngagement = 0;
    let avgProgress = 0;
    let avgCooperation = 0;

    if (metricsList.length > 0) {
      const focusSum = metricsList.reduce((sum, m) => sum + m.focusLevel, 0);
      const engageSum = metricsList.reduce((sum, m) => sum + m.engagementLevel, 0);
      const progressSum = metricsList.reduce((sum, m) => sum + m.progressLevel, 0);
      const coopSum = metricsList.reduce((sum, m) => sum + m.cooperationLevel, 0);

      avgFocus = parseFloat((focusSum / metricsList.length).toFixed(1));
      avgEngagement = parseFloat((engageSum / metricsList.length).toFixed(1));
      avgProgress = parseFloat((progressSum / metricsList.length).toFixed(1));
      avgCooperation = parseFloat((coopSum / metricsList.length).toFixed(1));
    } else {
      avgFocus = 4.0;
      avgEngagement = 4.0;
      avgProgress = 4.0;
      avgCooperation = 4.0;
    }

    setTeacherNotes(
      `Average Focus: ${avgFocus}/5 • Engagement: ${avgEngagement}/5 • Cooperation: ${avgCooperation}/5 • Progress: ${avgProgress}/5\nExcellent work ethic. Highly receptive to feedback during class sessions.`
    );

    // 2. Aggregate Topics Covered
    const topics = studentSessions
      .map((s) => s.taughtTopic)
      .filter((v, i, self) => self.indexOf(v) === i) // unique
      .map((topic) => `• ${topic}`)
      .join("\n");

    const generatedSummary = `During ${getMonthName(month)}, we had ${studentSessions.length} productive sessions. We focused on building foundational skills, and the core topics covered included:\n${topics}`;
    setSummary(generatedSummary);

    // 3. Aggregate Student Session Notes (Specific behavioral feedback)
    const notesList = studentSessionNotes.filter(
      (n) => n.studentId === studentId && sessionIds.includes(n.sessionId)
    );
    const noteTexts = notesList.map((n) => n.note).filter(Boolean);
    
    const generatedProgress = noteTexts.length > 0
      ? `Progress level is strong. Notes aggregated from individual sessions:\n${noteTexts.map((n) => `• ${n}`).join("\n")}`
      : `Steadily building rhythmic coordination, sight-reading skills, and musical expressiveness. Moving through current level smoothly with positive attitudes and solid reception of feedback.`;
    setProgressSummary(generatedProgress);

    // 4. Recommended Practice
    const practices = studentSessions
      .map((s) => s.practiceAssigned)
      .filter(Boolean)
      .filter((v, i, self) => self.indexOf(v) === i)
      .map((p) => `• ${p}`)
      .join("\n");

    const generatedPractice = practices
      ? `For this coming month, please focus on:\n${practices}`
      : `Practice 15 minutes daily. Focus on steady counting and curved hand posture.`;
    setRecommendedPractice(generatedPractice);

    setIsGenerated(true);
  };

  const getMonthName = (monthStr: string) => {
    if (!monthStr) return "";
    const [year, m] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(m) - 1, 1);
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) {
      alert("Please select a student");
      return;
    }
    if (!summary.trim() || !progressSummary.trim() || !recommendedPractice.trim() || !teacherNotes.trim()) {
      alert("Please fill in or auto-generate report content.");
      return;
    }

    onSave({
      studentId,
      month,
      summary: summary.trim(),
      progressSummary: progressSummary.trim(),
      recommendedPractice: recommendedPractice.trim(),
      teacherNotes: teacherNotes.trim()
    });
  };

  useEffect(() => {
    if (preselectedStudentId) {
      handleAutoGenerate();
    }
  }, [preselectedStudentId]);

  return (
    <form id="monthly-report-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-150 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Generate Monthly Report
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Produce a beautiful parent communication update. Auto-sum student progress in seconds.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-slate-50/50 p-5 rounded-xl border border-slate-200">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Select Student
          </label>
          <select
            value={studentId}
            onChange={(e) => {
              setStudentId(e.target.value);
              setIsGenerated(false);
            }}
            disabled={!!preselectedStudentId}
            className="w-full text-xs font-bold px-3.5 py-2 border border-slate-200 rounded text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            required
          >
            <option value="">-- Select Student --</option>
            {students.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name} ({st.level})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Report Month
          </label>
          <input
            type="month"
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              setIsGenerated(false);
            }}
            className="w-full text-xs font-bold px-3.5 py-2 border border-slate-200 rounded text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            required
          />
        </div>

        <div>
          <button
            type="button"
            onClick={handleAutoGenerate}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
            Auto-Generate Data
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded text-xs font-bold uppercase tracking-wider ${
          feedback.startsWith("⚠️") ? "bg-amber-50 text-amber-800 border border-amber-200/50" : "bg-emerald-50 text-emerald-800 border border-emerald-200/50"
        }`}>
          {feedback}
        </div>
      )}

      {isGenerated && (
        <div className="space-y-6 animate-fade-in">
          {/* Averages Summary Row */}
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Report Period</span>
                <span className="text-sm font-bold text-slate-800">{getMonthName(month)}</span>
              </div>
              <Calendar className="w-8 h-8 text-slate-300" />
            </div>
          </div>

          {/* Form Editing Blocks */}
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                1. Lesson Summary & Topics Covered
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={5}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-y"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                2. Student Progress & Behavioral Updates
              </label>
              <textarea
                value={progressSummary}
                onChange={(e) => setProgressSummary(e.target.value)}
                rows={5}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-y"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                3. Recommended Homework & Practice Plan
              </label>
              <textarea
                value={recommendedPractice}
                onChange={(e) => setRecommendedPractice(e.target.value)}
                rows={4}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-y"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                4. Teacher's General Notes & Session Evaluation (e.g. Averages)
              </label>
              <textarea
                value={teacherNotes}
                onChange={(e) => setTeacherNotes(e.target.value)}
                rows={4}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-y"
                required
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-150">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs rounded transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Save Monthly Report
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
