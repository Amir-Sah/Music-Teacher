import { z } from "zod";

export const StudentSchema = z.object({
  id: z.string(),
  name: z.string(),
  age: z.number(),
  level: z.string(),
  parentName: z.string(),
  parentPhone: z.string(),
  notes: z.string(),
  groupId: z.string().optional(),
});

export const GroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  location: z.string(),
  description: z.string(),
});

export const SessionSchema = z.object({
  id: z.string(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  studentId: z.string().optional(),
  groupId: z.string().optional(),
  taughtTopic: z.string(),
  practiceAssigned: z.string(),
  nextLessonSuggestion: z.string(),
  teacherMistakes: z.string(),
  teacherStrengths: z.string(),
  privateNotes: z.string(),
});

export const SkillSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const SessionSkillSchema = z.object({
  sessionId: z.string(),
  skillId: z.string(),
});

export const GameSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  ageMin: z.number(),
  ageMax: z.number(),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  materialsNeeded: z.string(),
});

export const GameSkillSchema = z.object({
  gameId: z.string(),
  skillId: z.string(),
});

export const StudentSessionNoteSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  studentId: z.string(),
  note: z.string(),
});

export const StudentSkillSchema = z.object({
  studentId: z.string(),
  skillId: z.string(),
  currentLevel: z.number(),
});

export const MonthlyReportSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  month: z.string(),
  summary: z.string(),
  progressSummary: z.string(),
  recommendedPractice: z.string(),
  teacherNotes: z.string(),
});

export const MetricDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  target: z.enum(["student", "group", "teacher", "all"]),
});

export const SessionMetricValueSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  metricId: z.string(),
  value: z.number(),
});

export const AppStateSchema = z.object({
  students: z.array(StudentSchema),
  groups: z.array(GroupSchema),
  sessions: z.array(SessionSchema),
  metrics: z.array(MetricDefinitionSchema),
  sessionMetrics: z.array(SessionMetricValueSchema),
  skills: z.array(SkillSchema),
  sessionSkills: z.array(SessionSkillSchema),
  games: z.array(GameSchema),
  gameSkills: z.array(GameSkillSchema),
  studentSkills: z.array(StudentSkillSchema),
  studentSessionNotes: z.array(StudentSessionNoteSchema),
  monthlyReports: z.array(MonthlyReportSchema),
});

export type ValidatedAppState = z.infer<typeof AppStateSchema>;