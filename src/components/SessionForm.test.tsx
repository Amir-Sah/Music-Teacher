import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SessionForm from "./SessionForm";
import { Student, Group, Skill, Session, SessionMetricValue, MetricDefinition } from "../types";

const mockStudents: Student[] = [
  { id: "student-1", name: "Alice", age: 10, level: "Beginner", parentName: "Mom", parentPhone: "123", notes: "", groupId: "group-1" },
  { id: "student-2", name: "Bob", age: 12, level: "Intermediate", parentName: "Dad", parentPhone: "456", notes: "", groupId: "group-1" },
];

const mockGroups: Group[] = [
  { id: "group-1", name: "Beginner Piano", location: "Studio A", description: "Kids class" },
];

const mockSkills: Skill[] = [
  { id: "skill-1", name: "Scales" },
  { id: "skill-2", name: "Sight Reading" },
];

const mockEditingSession: Session = {
  id: "session-1",
  date: "2026-01-15",
  startTime: "10:00",
  endTime: "11:00",
  studentId: "student-1",
  groupId: undefined,
  taughtTopic: "C Major Scale",
  practiceAssigned: "Practice hands separately",
  nextLessonSuggestion: "Arpeggios",
  teacherMistakes: "Went too fast",
  teacherStrengths: "Good pacing",
  privateNotes: "Student was tired",
};

const mockMetrics: MetricDefinition[] = [
  { id: "m-focus", name: "Focus", description: "", target: "all" },
  { id: "m-understanding", name: "Understanding", description: "", target: "all" }
];

const mockEditingMetrics: SessionMetricValue[] = [
  { id: "sm-1", sessionId: "session-1", metricId: "m-focus", value: 4 },
  { id: "sm-2", sessionId: "session-1", metricId: "m-understanding", value: 4 }
];

describe("SessionForm", () => {
  const onSave = vi.fn();
  const onCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form with correct title for new session", () => {
    render(
      <SessionForm
        students={mockStudents}
        groups={mockGroups}
        skills={mockSkills}
        metrics={mockMetrics}
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    expect(screen.getByText("Log Class Session")).toBeInTheDocument();
    expect(screen.getByText("Input topics, select practiced skills, rate quality metrics, and log feedback notes.")).toBeInTheDocument();
  });

  it("renders form with correct title for editing session", () => {
    render(
      <SessionForm
        students={mockStudents}
        groups={mockGroups}
        skills={mockSkills}
        metrics={mockMetrics}
        editingSession={mockEditingSession}
        editingMetrics={mockEditingMetrics}
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    expect(screen.getByText("Edit Class Session Log")).toBeInTheDocument();
    expect(screen.getByText("Update topics, select practiced skills, rate quality metrics, and log feedback notes.")).toBeInTheDocument();
  });

  it("pre-fills form fields when editing a session", () => {
    render(
      <SessionForm
        students={mockStudents}
        groups={mockGroups}
        skills={mockSkills}
        metrics={mockMetrics}
        editingSession={mockEditingSession}
        editingMetrics={mockEditingMetrics}
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    expect(screen.getByDisplayValue("2026-01-15")).toBeInTheDocument();
    expect(screen.getByDisplayValue("10:00")).toBeInTheDocument();
    expect(screen.getByDisplayValue("11:00")).toBeInTheDocument();
    expect(screen.getByDisplayValue("C Major Scale")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Practice hands separately")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Arpeggios")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Went too fast")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Good pacing")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Student was tired")).toBeInTheDocument();
  });

  it("pre-selects student when editing a private session", () => {
    render(
      <SessionForm
        students={mockStudents}
        groups={mockGroups}
        skills={mockSkills}
        metrics={mockMetrics}
        editingSession={mockEditingSession}
        editingMetrics={mockEditingMetrics}
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    const studentSelect = screen.getAllByRole("combobox")[0];
    expect(studentSelect).toHaveValue("student-1");
  });

  it("submits new session with all required fields", async () => {
    render(
      <SessionForm
        students={mockStudents}
        groups={mockGroups}
        skills={mockSkills}
        metrics={mockMetrics}
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    // Fill required fields
    fireEvent.change(screen.getAllByRole("combobox")[0], { target: { value: "student-1" } });
    fireEvent.change(screen.getByDisplayValue(screen.getByDisplayValue(/\d{4}-\d{2}-\d{2}/).getAttribute("value") || ""), { target: { value: "2026-02-01" } });
    fireEvent.change(screen.getByDisplayValue("15:00"), { target: { value: "14:00" } });
    fireEvent.change(screen.getByDisplayValue("15:45"), { target: { value: "15:00" } });
    fireEvent.change(screen.getByPlaceholderText(/Treble clef reading/i), { target: { value: "New Topic" } });

    // Submit
    fireEvent.click(screen.getByText("Save Session Log"));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledTimes(1);
    });

    const [sessionData, metricsData, selectedSkillIds, studentNotesArray, editingSessionId] = onSave.mock.calls[0];
    
    expect(sessionData).toMatchObject({
      date: "2026-02-01",
      startTime: "14:00",
      endTime: "15:00",
      studentId: "student-1",
      taughtTopic: "New Topic",
    });
    expect(editingSessionId).toBeUndefined();
  });

  it("submits edited session with editingSessionId", async () => {
    render(
      <SessionForm
        students={mockStudents}
        groups={mockGroups}
        skills={mockSkills}
        metrics={mockMetrics}
        editingSession={mockEditingSession}
        editingMetrics={mockEditingMetrics}
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    // Change a field
    fireEvent.change(screen.getByDisplayValue("C Major Scale"), { target: { value: "Updated Topic" } });

    // Submit
    fireEvent.click(screen.getByText("Save Session Log"));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledTimes(1);
    });

    const [sessionData, metricsData, selectedSkillIds, studentNotesArray, editingSessionId] = onSave.mock.calls[0];
    
    expect(sessionData.taughtTopic).toBe("Updated Topic");
    expect(editingSessionId).toBe("session-1");
  });

  it("toggles skill selection when clicking skill buttons", async () => {
    render(
      <SessionForm
        students={mockStudents}
        groups={mockGroups}
        skills={mockSkills}
        metrics={mockMetrics}
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    // Click first skill
    fireEvent.click(screen.getByText("Scales"));
    
    // Click second skill
    fireEvent.click(screen.getByText("Sight Reading"));

    // Fill required fields and submit
    fireEvent.change(screen.getAllByRole("combobox")[0], { target: { value: "student-1" } });
    fireEvent.change(screen.getByDisplayValue(screen.getByDisplayValue(/\d{4}-\d{2}-\d{2}/).getAttribute("value") || ""), { target: { value: "2026-02-01" } });
    fireEvent.change(screen.getByDisplayValue("15:00"), { target: { value: "14:00" } });
    fireEvent.change(screen.getByDisplayValue("15:45"), { target: { value: "15:00" } });
    fireEvent.change(screen.getByPlaceholderText(/Treble clef reading/i), { target: { value: "New Topic" } });

    fireEvent.click(screen.getByText("Save Session Log"));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledTimes(1);
    });

    const [, , selectedSkillIds] = onSave.mock.calls[0];
    expect(selectedSkillIds).toContain("skill-1");
    expect(selectedSkillIds).toContain("skill-2");
  });

  it("calls onCancel when clicking Cancel button", () => {
    render(
      <SessionForm
        students={mockStudents}
        groups={mockGroups}
        skills={mockSkills}
        metrics={mockMetrics}
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    fireEvent.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when clicking X button", () => {
    render(
      <SessionForm
        students={mockStudents}
        groups={mockGroups}
        skills={mockSkills}
        metrics={mockMetrics}
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("shows validation alert when taught topic is empty", () => {
    window.alert = vi.fn();
    
    render(
      <SessionForm
        students={mockStudents}
        groups={mockGroups}
        skills={mockSkills}
        metrics={mockMetrics}
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    // Fill student but leave taught topic empty
    fireEvent.change(screen.getAllByRole("combobox")[0], { target: { value: "student-1" } });

    // Submit via form submit event to bypass HTML5 required validation
    const form = document.querySelector("form")!;
    fireEvent.submit(form);

    expect(window.alert).toHaveBeenCalledWith("Please enter the taught topic");
    expect(onSave).not.toHaveBeenCalled();
  });

  it("shows validation alert when student is not selected for private lesson", () => {
    window.alert = vi.fn();
    
    render(
      <SessionForm
        students={mockStudents}
        groups={mockGroups}
        skills={mockSkills}
        metrics={mockMetrics}
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    // Fill taught topic but leave student empty
    fireEvent.change(screen.getByPlaceholderText(/Treble clef reading/i), { target: { value: "New Topic" } });

    // Submit via form submit event to bypass HTML5 required validation
    const form = document.querySelector("form")!;
    fireEvent.submit(form);

    expect(window.alert).toHaveBeenCalledWith("Please select a student");
    expect(onSave).not.toHaveBeenCalled();
  });

  it("switches to group mode and shows group selector", () => {
    render(
      <SessionForm
        students={mockStudents}
        groups={mockGroups}
        skills={mockSkills}
        metrics={mockMetrics}
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    // Click Group Class tab
    fireEvent.click(screen.getByText("Group Class"));

    expect(screen.getByText("Class Group")).toBeInTheDocument();
    expect(screen.queryByText("Student")).toBeNull();
  });

  it("pre-fills student notes when editing", () => {
    const editingStudentNotes = [
      { studentId: "student-1", note: "Great progress on scales" },
      { studentId: "student-2", note: "Needs work on rhythm" },
    ];

    render(
      <SessionForm
        students={mockStudents}
        groups={mockGroups}
        skills={mockSkills}
        metrics={mockMetrics}
        editingSession={mockEditingSession}
        editingMetrics={mockEditingMetrics}
        editingStudentNotes={editingStudentNotes}
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    expect(screen.getByDisplayValue("Great progress on scales")).toBeInTheDocument();
  });

  it("pre-selects skills when editing", () => {
    render(
      <SessionForm
        students={mockStudents}
        groups={mockGroups}
        skills={mockSkills}
        metrics={mockMetrics}
        editingSession={mockEditingSession}
        editingMetrics={mockEditingMetrics}
        editingSkillIds={["skill-1"]}
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    // The Scales skill should be visually selected (has Check icon)
    const scalesButton = screen.getByText("Scales").closest("button");
    expect(scalesButton).toHaveClass("bg-indigo-50");
  });
});