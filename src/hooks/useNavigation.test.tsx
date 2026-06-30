import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useNavigation } from "./useNavigation";

describe("useNavigation", () => {
  it("changes tabs and resets modal state", () => {
    const { result } = renderHook(() => useNavigation());

    act(() => {
      result.current.setIsAddingStudent(true);
      result.current.setActiveStudentId("student-1");
      result.current.setIsMobileMenuOpen(true);
    });

    act(() => {
      result.current.handleNavigation("students");
    });

    expect(result.current.currentTab).toBe("students");
    expect(result.current.isAddingStudent).toBe(false);
    expect(result.current.activeStudentId).toBeNull();
    expect(result.current.isMobileMenuOpen).toBe(false);
  });

  it("opens session editing mode", () => {
    const { result } = renderHook(() => useNavigation());

    const session = {
      id: "session-1",
      date: "2026-01-01",
      startTime: "10:00",
      endTime: "11:00",
      taughtTopic: "Scales",
      practiceAssigned: "Practice C major",
      nextLessonSuggestion: "Chord progressions",
      teacherMistakes: "",
      teacherStrengths: "",
      privateNotes: "",
    };

    act(() => {
      result.current.handleEditSession(session);
    });

    expect(result.current.isLoggingSession).toBe(true);
    expect(result.current.editingSession?.id).toBe("session-1");
  });

  it("closes session form and clears editing state", () => {
    const { result } = renderHook(() => useNavigation());

    act(() => {
      result.current.setIsLoggingSession(true);
      result.current.setPreselectedLogStudentId("student-1");
    });

    act(() => {
      result.current.closeSessionForm();
    });

    expect(result.current.isLoggingSession).toBe(false);
    expect(result.current.preselectedLogStudentId).toBe("");
    expect(result.current.editingSession).toBeNull();
  });

  it("closes report form and clears selected student", () => {
    const { result } = renderHook(() => useNavigation());

    act(() => {
      result.current.setIsGeneratingReport(true);
      result.current.setPreselectedReportStudentId("student-1");
    });

    act(() => {
      result.current.closeReportForm();
    });

    expect(result.current.isGeneratingReport).toBe(false);
    expect(result.current.preselectedReportStudentId).toBe("");
  });
});