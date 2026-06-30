/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Session, Student, Group, Skill, MetricDefinition, SessionMetricValue } from "../types";
import { Save, X, Sparkles, Star, ClipboardList, Clock, Check } from "lucide-react";

interface SessionFormProps {
  students: Student[];
  groups: Group[];
  skills: Skill[];
  metrics: MetricDefinition[];
  preselectedStudentId?: string;
  preselectedGroupId?: string;
  editingSession?: Session;
  editingMetrics?: SessionMetricValue[];
  editingSkillIds?: string[];
  editingStudentNotes?: { studentId: string; note: string }[];
  onSave: (
    session: Omit<Session, "id">,
    metrics: SessionMetricValue[],
    selectedSkillIds: string[],
    studentNotes: { studentId: string; note: string }[],
    editingSessionId?: string
  ) => void;
  onCancel: () => void;
}

export default function SessionForm({
  students,
  groups,
  skills,
  metrics,
  preselectedStudentId = "",
  preselectedGroupId = "",
  editingSession,
  editingMetrics,
  editingSkillIds,
  editingStudentNotes,
  onSave,
  onCancel
}: SessionFormProps) {
  const editingSessionId = editingSession?.id;
  const [type, setType] = useState<"private" | "group">(
    editingSession ? (editingSession.groupId ? "group" : "private") : (preselectedGroupId ? "group" : "private")
  );
  const [studentId, setStudentId] = useState(editingSession?.studentId || preselectedStudentId);
  const [groupId, setGroupId] = useState(editingSession?.groupId || preselectedGroupId);
  const [date, setDate] = useState(editingSession?.date || new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState(editingSession?.startTime || "15:00");
  const [endTime, setEndTime] = useState(editingSession?.endTime || "15:45");
  const [taughtTopic, setTaughtTopic] = useState(editingSession?.taughtTopic || "");
  const [practiceAssigned, setPracticeAssigned] = useState(editingSession?.practiceAssigned || "");
  const [nextLessonSuggestion, setNextLessonSuggestion] = useState(editingSession?.nextLessonSuggestion || "");
  const [teacherMistakes, setTeacherMistakes] = useState(editingSession?.teacherMistakes || "");
  const [teacherStrengths, setTeacherStrengths] = useState(editingSession?.teacherStrengths || "");
  const [privateNotes, setPrivateNotes] = useState(editingSession?.privateNotes || "");

  // Metric States (1-5)
  const [metricValues, setMetricValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    if (editingMetrics && editingMetrics.length > 0) {
      editingMetrics.forEach((m) => {
        initial[m.metricId] = m.value;
      });
    } else {
      metrics.forEach((m) => {
        initial[m.id] = m.id.includes("prog") ? 3 : 4; // default values
      });
    }
    return initial;
  });

  const handleMetricChange = (metricId: string, val: number) => {
    setMetricValues((prev) => ({ ...prev, [metricId]: val }));
  };

  // Selected Skills checklist state
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>(editingSkillIds || []);

  // Student comments map state
  const [studentNotesMap, setStudentNotesMap] = useState<Record<string, string>>(() => {
    if (editingStudentNotes) {
      const initialMap: Record<string, string> = {};
      editingStudentNotes.forEach((n) => {
        initialMap[n.studentId] = n.note;
      });
      return initialMap;
    }
    return {};
  });

  // Get active roster list based on selection
  const activeStudents = useMemo(() => {
    if (type === "private") {
      const found = students.find((s) => s.id === studentId);
      return found ? [found] : [];
    } else {
      return students.filter((s) => s.groupId === groupId);
    }
  }, [type, studentId, groupId, students]);

  const handleToggleSkill = (skillId: string) => {
    setSelectedSkillIds((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );
  };

  const handleStudentNoteChange = (sId: string, comment: string) => {
    setStudentNotesMap((prev) => ({
      ...prev,
      [sId]: comment
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === "private" && !studentId) {
      alert("Please select a student");
      return;
    }
    if (type === "group" && !groupId) {
      alert("Please select a group");
      return;
    }
    if (!taughtTopic.trim()) {
      alert("Please enter the taught topic");
      return;
    }

    const sessionData: Omit<Session, "id"> = {
      date,
      startTime,
      endTime,
      studentId: type === "private" ? studentId : undefined,
      groupId: type === "group" ? groupId : undefined,
      taughtTopic: taughtTopic.trim(),
      practiceAssigned: practiceAssigned.trim(),
      nextLessonSuggestion: nextLessonSuggestion.trim(),
      teacherMistakes: teacherMistakes.trim(),
      teacherStrengths: teacherStrengths.trim(),
      privateNotes: privateNotes.trim()
    };

    const metricsData: SessionMetricValue[] = metrics
      .filter((m) => type === "group" || m.target !== "group")
      .map((m) => ({
        id: crypto.randomUUID(),
        sessionId: editingSessionId || "", // will be filled correctly in useAppState
        metricId: m.id,
        value: metricValues[m.id] || 5, // default to 5 if somehow missing
      }));

    // Format individual student notes array
    const studentNotesArray = activeStudents
      .map((st) => ({
        studentId: st.id,
        note: (studentNotesMap[st.id] || "").trim()
      }))
      .filter((n) => n.note.length > 0);

    onSave(sessionData, metricsData, selectedSkillIds, studentNotesArray, editingSessionId);
  };

  const RatingSelector = ({
    value,
    onChange,
    label
  }: {
    value: number;
    onChange: (val: number) => void;
    label: string;
  }) => (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        {label}
      </label>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className={`w-9 h-9 rounded font-bold transition-all duration-200 border flex items-center justify-center text-xs cursor-pointer ${
              value === num
                ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
            }`}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {/* Tab Selectors */}
      <div className="flex items-center justify-between border-b border-slate-150 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-indigo-600" />
            {editingSession ? "Edit Class Session Log" : "Log Class Session"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {editingSession ? "Update topics, select practiced skills, rate quality metrics, and log feedback notes." : "Input topics, select practiced skills, rate quality metrics, and log feedback notes."}
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => {
            setType("private");
            setGroupId("");
          }}
          disabled={!!preselectedStudentId || !!preselectedGroupId || !!editingSession}
          className={`px-4 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
            type === "private"
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Private Lesson
        </button>
        <button
          type="button"
          onClick={() => {
            setType("group");
            setStudentId("");
          }}
          disabled={!!preselectedStudentId || !!preselectedGroupId || !!editingSession}
          className={`px-4 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
            type === "group"
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Group Class
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-5 rounded-xl border border-slate-200">
        {/* Selection */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            {type === "private" ? "Student" : "Class Group"}
          </label>
          {type === "private" ? (
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              disabled={!!preselectedStudentId || !!editingSession}
              className="w-full px-3.5 py-2 border border-slate-200 rounded text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
              required
            >
              <option value="">-- Choose Student --</option>
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.level})
                </option>
              ))}
            </select>
          ) : (
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              disabled={!!preselectedGroupId || !!editingSession}
              className="w-full px-3.5 py-2 border border-slate-200 rounded text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
              required
            >
              <option value="">-- Choose Group --</option>
              {groups.map((grp) => (
                <option key={grp.id} value={grp.id}>
                  {grp.name} ({grp.location})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Date & Time Selectors */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Lesson Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs text-slate-900 bg-white focus:outline-none cursor-pointer font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" /> Start
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs text-slate-900 bg-white focus:outline-none cursor-pointer font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" /> End
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs text-slate-900 bg-white focus:outline-none cursor-pointer font-bold"
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Topic Covered */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            What was taught? (Taught Topic)
          </label>
          <input
            type="text"
            value={taughtTopic}
            onChange={(e) => setTaughtTopic(e.target.value)}
            placeholder="e.g. Treble clef reading, dynamics matching, scale coordination..."
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            required
          />
        </div>

        {/* Practice Assigned */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Practice Assigned for home
          </label>
          <textarea
            value={practiceAssigned}
            onChange={(e) => setPracticeAssigned(e.target.value)}
            placeholder="Instructions for home practicing..."
            rows={2}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-y"
          />
        </div>
      </div>

      {/* Musical Skills Checkboxes */}
      <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-200 space-y-3">
        <h3 className="text-xs uppercase tracking-widest font-bold text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Skills Covered & Practiced
        </h3>
        <p className="text-xs text-slate-500">
          Check all musical core elements targeted during this session's exercises or games.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-1">
          {skills.map((skill) => {
            const isSelected = selectedSkillIds.includes(skill.id);
            return (
              <button
                key={skill.id}
                type="button"
                onClick={() => handleToggleSkill(skill.id)}
                className={`flex items-center justify-between p-2.5 border text-left rounded-lg transition-all cursor-pointer ${
                  isSelected
                    ? "bg-indigo-50 border-indigo-200 text-indigo-800"
                    : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                }`}
              >
                <span className="text-xs font-bold truncate">{skill.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Class Metrics Evaluation Grid */}
      <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-200 space-y-4">
        <h3 className="text-xs uppercase tracking-widest font-bold text-slate-400 flex items-center gap-1.5">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          Class Quality & Metrics Evaluation
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {metrics
            .filter((m) => type === "group" || m.target !== "group")
            .map((m) => (
              <RatingSelector
                key={m.id}
                value={metricValues[m.id] || 4}
                onChange={(val) => handleMetricChange(m.id, val)}
                label={m.name}
              />
            ))}
        </div>
      </div>

      {/* Student Session Notes (Specific behavioral reports for each student) */}
      <div className="space-y-4 border-t border-slate-150 pt-5">
        <h3 className="text-sm font-bold text-slate-850 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          Individual Student Feedback & Progress Notes
        </h3>
        {activeStudents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeStudents.map((st) => (
              <div key={st.id} className="p-4 bg-white border border-slate-200 rounded-xl space-y-2.5 shadow-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                    {st.name[0]}
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 text-xs block">{st.name}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">Level: {st.level}</span>
                  </div>
                </div>
                <textarea
                  value={studentNotesMap[st.id] || ""}
                  onChange={(e) => handleStudentNoteChange(st.id, e.target.value)}
                  placeholder={`Write comments specifically about ${st.name}'s response, posture, challenges, or focus...`}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-y"
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">
            Please select a student or a group to record student-specific feedback notes.
          </p>
        )}
      </div>

      {/* Reflection & Suggestion Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Suggestion for next lesson
          </label>
          <textarea
            value={nextLessonSuggestion}
            onChange={(e) => setNextLessonSuggestion(e.target.value)}
            placeholder="What should we target next session?"
            rows={2.5}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-y"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Teacher Strengths in this lesson
          </label>
          <textarea
            value={teacherStrengths}
            onChange={(e) => setTeacherStrengths(e.target.value)}
            placeholder="What went particularly well in my instruction?"
            rows={2.5}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-y"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Teacher Mistakes / Improvement Areas
          </label>
          <textarea
            value={teacherMistakes}
            onChange={(e) => setTeacherMistakes(e.target.value)}
            placeholder="What mistakes did I make or how could I improve pacing/explanation?"
            rows={2.5}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-y"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            🔒 Private Notes (Hidden from parents & monthly reports)
          </label>
          <textarea
            value={privateNotes}
            onChange={(e) => setPrivateNotes(e.target.value)}
            placeholder="Family updates, payment statuses, general behavioral background info..."
            rows={2.5}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-y"
          />
        </div>
      </div>

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
          <Save className="w-4 h-4" />
          Save Session Log
        </button>
      </div>
    </form>
  );
}
