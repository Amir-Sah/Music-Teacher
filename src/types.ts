/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Student {
  id: string;
  name: string;
  age: number;
  level: string; // e.g. "Beginner", "Prep A", "Grade 1 Piano"
  parentName: string;
  parentPhone: string;
  notes: string;
  groupId?: string; // Optional Group relationship (foreign key to Group.id)
}

export interface Group {
  id: string;
  name: string;
  location: string; // New field
  description: string;
}

export interface Session {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // New field
  endTime: string; // New field
  studentId?: string; // Optional Student relationship (for private lesson)
  groupId?: string; // Optional Group relationship (for group lesson)
  taughtTopic: string;
  practiceAssigned: string;
  nextLessonSuggestion: string;
  teacherMistakes: string;
  teacherStrengths: string;
  privateNotes: string;
}

export interface Skill {
  id: string;
  name: string;
}

export interface SessionSkill {
  sessionId: string; // foreign key to Session.id
  skillId: string; // foreign key to Skill.id
}

export interface Game {
  id: string;
  name: string;
  description: string;
  ageMin: number; // New structure (replacing ageRange)
  ageMax: number; // New structure (replacing ageRange)
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  materialsNeeded: string;
}

export interface GameSkill {
  gameId: string; // foreign key to Game.id
  skillId: string; // foreign key to Skill.id
}

export interface StudentSessionNote {
  id: string;
  sessionId: string; // foreign key to Session.id
  studentId: string; // foreign key to Student.id
  note: string;
}

export interface StudentSkill {
  studentId: string;
  skillId: string;
  currentLevel: number;
}

export interface MonthlyReport {
  id: string;
  studentId: string; // foreign key to Student.id
  month: string; // YYYY-MM format
  summary: string;
  progressSummary: string;
  recommendedPractice: string;
  teacherNotes: string; // New field instead of focusAverage
}

export interface MetricDefinition {
  id: string;
  name: string;
  description: string;
  target: "student" | "group" | "teacher" | "all";
}

export interface SessionMetricValue {
  id: string;
  sessionId: string;
  metricId: string;
  value: number; // 1-5
}

export interface AppState {
  students: Student[];
  groups: Group[];
  sessions: Session[];
  metrics: MetricDefinition[]; // New dynamic metrics
  sessionMetrics: SessionMetricValue[]; // New dynamic metric values
  skills: Skill[];
  sessionSkills: SessionSkill[]; // New Table
  games: Game[];
  gameSkills: GameSkill[];
  studentSkills: StudentSkill[];
  studentSessionNotes: StudentSessionNote[]; // New Table
  monthlyReports: MonthlyReport[];
}
