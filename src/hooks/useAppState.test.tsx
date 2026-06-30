import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { useAppState } from "./useAppState";

describe("useAppState", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("adds a new student", () => {
    const { result } = renderHook(() => useAppState());

    const initialCount = result.current.appState.students.length;

    act(() => {
      result.current.handleSaveStudent({
        name: "John Doe",
        age: 10,
        level: "Beginner",
        parentName: "Jane Doe",
        parentPhone: "123456789",
        notes: "",
        groupId: undefined,
      });
    });

    expect(result.current.appState.students).toHaveLength(initialCount + 1);

    const addedStudent = result.current.appState.students.find(
      (s) => s.name === "John Doe"
    );

    expect(addedStudent).toBeDefined();
    expect(addedStudent?.age).toBe(10);
  });

  it("updates an existing student", () => {
    const { result } = renderHook(() => useAppState());

    const existingStudent = result.current.appState.students[0];

    act(() => {
      result.current.handleSaveStudent({
        ...existingStudent,
        name: "UpdatedName",
      });
    });

    const updatedStudent = result.current.appState.students.find(
      (s) => s.id === existingStudent.id
    );

    expect(updatedStudent?.name).toBe("UpdatedName");
  });

  it("deletes a student", () => {
    const { result } = renderHook(() => useAppState());

    const existingStudent = result.current.appState.students[0];
    const initialCount = result.current.appState.students.length;

    act(() => {
      result.current.handleDeleteStudent(existingStudent.id);
    });

    expect(result.current.appState.students).toHaveLength(initialCount - 1);

    const deletedStudent = result.current.appState.students.find(
      (s) => s.id === existingStudent.id
    );

    expect(deletedStudent).toBeUndefined();
  });

  it("adds a new group", () => {
    const { result } = renderHook(() => useAppState());

    const initialCount = result.current.appState.groups.length;

    act(() => {
      result.current.handleSaveGroup({
        name: "Beginner Piano",
        location: "Studio A",
        description: "Kids piano class",
      });
    });

    expect(result.current.appState.groups).toHaveLength(initialCount + 1);
  });
});