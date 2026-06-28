/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Skill, Game, GameSkill, Student, Group, Session, ClassMetrics, SessionSkill, StudentSessionNote, MonthlyReport, MetricDefinition, SessionMetricValue } from "./types";

export const initialMetrics: MetricDefinition[] = [
  { id: "m-focus", name: "Focus Level", description: "How focused the student(s) were", target: "all" },
  { id: "m-engage", name: "Engagement Level", description: "How engaged the student(s) were", target: "all" },
  { id: "m-coop", name: "Cooperation Level", description: "How cooperative the student(s) were", target: "all" },
  { id: "m-group", name: "Group Dynamics", description: "How well the group interacted", target: "group" },
  { id: "m-eff", name: "Lesson Plan Efficiency", description: "How well the lesson plan was executed", target: "teacher" },
  { id: "m-time", name: "Time Management", description: "How well time was managed", target: "teacher" },
  { id: "m-prog", name: "Progress Level", description: "Overall progress made", target: "all" }
];

export const initialSessionMetrics: SessionMetricValue[] = [
  { id: "sm-1", sessionId: "session-1", metricId: "m-focus", value: 4 },
  { id: "sm-2", sessionId: "session-1", metricId: "m-engage", value: 5 },
  { id: "sm-3", sessionId: "session-1", metricId: "m-coop", value: 5 },
  { id: "sm-4", sessionId: "session-1", metricId: "m-eff", value: 4 },
  { id: "sm-5", sessionId: "session-1", metricId: "m-time", value: 5 },
  { id: "sm-6", sessionId: "session-1", metricId: "m-prog", value: 4 },
  { id: "sm-7", sessionId: "session-2", metricId: "m-focus", value: 5 },
  { id: "sm-8", sessionId: "session-2", metricId: "m-engage", value: 5 },
  { id: "sm-9", sessionId: "session-2", metricId: "m-coop", value: 4 },
  { id: "sm-10", sessionId: "session-2", metricId: "m-group", value: 4 },
  { id: "sm-11", sessionId: "session-2", metricId: "m-eff", value: 5 },
  { id: "sm-12", sessionId: "session-2", metricId: "m-time", value: 4 },
  { id: "sm-13", sessionId: "session-2", metricId: "m-prog", value: 4 },
];

export const initialSkills: Skill[] = [
  { id: "s-rhythm", name: "Rhythm" },
  { id: "s-tempo", name: "Tempo" },
  { id: "s-dynamics", name: "Dynamics" },
  { id: "s-note-rec", name: "Note Recognition" },
  { id: "s-coordination", name: "Coordination" },
  { id: "s-listening", name: "Listening" }
];

export const initialGames: Game[] = [
  {
    id: "g-rhythm-echo",
    name: "Rhythm Echo",
    ageMin: 4,
    ageMax: 8,
    difficulty: "Beginner",
    description: "The teacher claps a simple 4-beat rhythm, and the student(s) echo it back. Gradually introduce subdivision (eighth notes) or slight syncopation to test their accuracy.",
    materialsNeeded: "Clapping hands or hand drums."
  },
  {
    id: "g-dynamics-detective",
    name: "Dynamics Detective",
    ageMin: 5,
    ageMax: 10,
    difficulty: "Beginner",
    description: "One student leaves the room. The teacher hides a small music note shaker. When the student returns, the other students play or clap to guide them. They clap loudly (forte) as the detective gets closer to the object, and softly (piano) when far away.",
    materialsNeeded: "A small instrument or toy, shaker, or rhythm sticks."
  },
  {
    id: "g-tempo-freeze",
    name: "Tempo Freeze",
    ageMin: 4,
    ageMax: 12,
    difficulty: "Beginner",
    description: "Students move around the room based on the tempo of the teacher's drum. Fast drumbeats (accelerando) mean quick tip-toe walks, while slow beats (ritardando) mean giant slow-motion steps. When the drumbeat stops, they must instantly freeze!",
    materialsNeeded: "Hand drum, tambourine, or keyboard."
  },
  {
    id: "g-articulation-hop",
    name: "Staccato vs. Legato Hop",
    ageMin: 5,
    ageMax: 9,
    difficulty: "Intermediate",
    description: "The teacher plays a short piece or melody on the instrument. When playing staccato (detached, bouncy), the student hops around like a frog. When playing legato (smooth, connected), the student glides gracefully like a fish in water.",
    materialsNeeded: "Piano or other lead instrument, open floor space."
  },
  {
    id: "g-interval-bingo",
    name: "Interval Bingo",
    ageMin: 8,
    ageMax: 15,
    difficulty: "Intermediate",
    description: "Each student receives a simple bingo card containing intervals (Seconds, Thirds, Fifths, Octaves). The teacher plays two notes consecutively. The student identifies the interval aurally and marks it on their sheet.",
    materialsNeeded: "Interval Bingo cards, pencils, and keyboard."
  },
  {
    id: "g-sight-reading-speedrun",
    name: "Sight-Reading Speedrun",
    ageMin: 8,
    ageMax: 16,
    difficulty: "Advanced",
    description: "The student is handed a new, short 4-bar sight-reading exercise. They have exactly 30 seconds to scan it silently, air-tapping the rhythm. Once the pulse starts, they must play through without stopping or pausing, prioritizing steady pulse over perfect pitch.",
    materialsNeeded: "Short musical notation excerpts, metronome."
  }
];

export const initialGameSkills: GameSkill[] = [
  { gameId: "g-rhythm-echo", skillId: "s-rhythm" },
  { gameId: "g-rhythm-echo", skillId: "s-listening" },
  { gameId: "g-dynamics-detective", skillId: "s-dynamics" },
  { gameId: "g-dynamics-detective", skillId: "s-listening" },
  { gameId: "g-tempo-freeze", skillId: "s-tempo" },
  { gameId: "g-tempo-freeze", skillId: "s-coordination" },
  { gameId: "g-tempo-freeze", skillId: "s-listening" },
  { gameId: "g-articulation-hop", skillId: "s-dynamics" },
  { gameId: "g-articulation-hop", skillId: "s-coordination" },
  { gameId: "g-articulation-hop", skillId: "s-listening" },
  { gameId: "g-interval-bingo", skillId: "s-listening" },
  { gameId: "g-sight-reading-speedrun", skillId: "s-note-rec" },
  { gameId: "g-sight-reading-speedrun", skillId: "s-rhythm" },
  { gameId: "g-sight-reading-speedrun", skillId: "s-tempo" }
];

export const initialGroups: Group[] = [
  {
    id: "grp-keyboard-minis",
    name: "Monday Keyboard Minis",
    location: "Studio Room A",
    description: "Group keyboard class for ages 5-7. Focused on steady pulse, hand postures, and introducing treble clef basics."
  },
  {
    id: "grp-theory-foundation",
    name: "Saturday Theory & Aural",
    location: "Main Hall East",
    description: "Interactive theory and ear training circle for intermediate students (ages 8-12)."
  }
];

export const initialStudents: Student[] = [
  {
    id: "std-lucas",
    name: "Lucas Fletcher",
    age: 6,
    level: "Beginner (Level A)",
    parentName: "Sarah Fletcher",
    parentPhone: "+1 555-019-2834",
    notes: "Very energetic but has a great natural pulse. Enjoys physical games. Needs structured focus blocks.",
    groupId: "grp-keyboard-minis"
  },
  {
    id: "std-chloe",
    name: "Chloe Patel",
    age: 7,
    level: "Beginner (Level A)",
    parentName: "Anita Patel",
    parentPhone: "+1 555-017-4322",
    notes: "A bit shy initially. Sings very well in pitch. Responds wonderfully to encouraging dynamics games.",
    groupId: "grp-keyboard-minis"
  },
  {
    id: "std-emily",
    name: "Emily Chen",
    age: 11,
    level: "Intermediate (Grade 2 Piano)",
    parentName: "David Chen",
    parentPhone: "+1 555-014-9988",
    notes: "Private lesson student. Excellent sight-reading. Currently practicing legato touch in classical sonatinas.",
    groupId: ""
  }
];

export const initialSessions: Session[] = [
  {
    id: "ses-emily-1",
    date: "2026-06-10",
    startTime: "15:00",
    endTime: "15:45",
    studentId: "std-emily",
    taughtTopic: "Treble Clef Sight-reading & Legato Articulation",
    practiceAssigned: "Clementi Sonatina in C, Op. 36 No. 1: first 8 measures with hands separate, focusing on keeping fingers curved and smooth legato transitions.",
    nextLessonSuggestion: "Review first 8 measures hands together. Introduce the left-hand chord changes in measures 9-16.",
    teacherMistakes: "I spent slightly too long on the sight-reading game and had to rush the scaling exercises at the end.",
    teacherStrengths: "The fish gliding analogy worked extremely well for demonstrating smooth legato vs finger-stabbing.",
    privateNotes: "Parent mentioned Emily had a busy school exam week. Keep assignments light and focus on micro-steps."
  },
  {
    id: "ses-group-1",
    date: "2026-06-15",
    startTime: "16:00",
    endTime: "16:50",
    groupId: "grp-keyboard-minis",
    taughtTopic: "Introduction to Quarter and Half Notes",
    practiceAssigned: "Page 14 of primer: Clap and count out loud 1-2-3-4. Practice the 'Quarter Note Waltz' on black keys.",
    nextLessonSuggestion: "Test individual clapping accuracy. Move to playing quarters on white keys.",
    teacherMistakes: "Did not have the sheet music pages bookmarked, wasted about 2 minutes looking for the primer.",
    teacherStrengths: "Using 'Tempo Freeze' game at the beginning got them both physically aligned and counting the pulse nicely.",
    privateNotes: "Might need to separate Lucas and Chloe if Lucas gets too distracted."
  }
];

export const initialClassMetrics: ClassMetrics[] = [
  {
    sessionId: "ses-emily-1",
    focusLevel: 4,
    engagementLevel: 4,
    cooperationLevel: 5,
    groupDynamics: 4,
    lessonPlanEfficiency: 5,
    timeManagement: 4,
    progressLevel: 4
  },
  {
    sessionId: "ses-group-1",
    focusLevel: 3,
    engagementLevel: 3,
    cooperationLevel: 4,
    groupDynamics: 4,
    lessonPlanEfficiency: 4,
    timeManagement: 3,
    progressLevel: 3
  }
];

export const initialSessionSkills: SessionSkill[] = [
  { sessionId: "ses-emily-1", skillId: "s-listening" },
  { sessionId: "ses-emily-1", skillId: "s-coordination" },
  { sessionId: "ses-group-1", skillId: "s-rhythm" },
  { sessionId: "ses-group-1", skillId: "s-tempo" },
  { sessionId: "ses-group-1", skillId: "s-listening" }
];

export const initialStudentSessionNotes: StudentSessionNote[] = [
  {
    id: "ssn-1",
    sessionId: "ses-group-1",
    studentId: "std-lucas",
    note: "Very wiggly today; the drum freeze game helped channel his energy."
  },
  {
    id: "ssn-2",
    sessionId: "ses-group-1",
    studentId: "std-chloe",
    note: "Chloe followed directions quietly and sang very well."
  }
];

export const initialMonthlyReports: MonthlyReport[] = [
  {
    id: "rep-emily-june",
    studentId: "std-emily",
    month: "2026-06",
    summary: "Emily made great strides in her expressive articulation this month, particularly with the transition from staccato to legato playing. She is highly attentive and responds beautifully to touch adjustments.",
    progressSummary: "Learned the opening of the Clementi Sonatina. Scaled up her metronome reading speed from 70bpm to 88bpm with excellent finger curves.",
    recommendedPractice: "Practice 15 minutes daily. Focus on relaxed wrist lifts at phrase endings in Clementi.",
    teacherNotes: "Emily showed great focus and cooperation in all private sessions."
  }
];
