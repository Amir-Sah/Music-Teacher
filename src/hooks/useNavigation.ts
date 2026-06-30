import { useState } from "react";
import { Student, Group, Session } from "../types";

export type TabId =
  | "dashboard"
  | "students"
  | "groups"
  | "games"
  | "skills"
  | "metrics"
  | "sessions"
  | "backup";

export interface UseNavigationReturn {
  currentTab: TabId;
  activeStudentId: string | null;
  activeGroupId: string | null;
  isMobileMenuOpen: boolean;

  isAddingStudent: boolean;
  editingStudent: Student | null;
  isAddingGroup: boolean;
  editingGroup: Group | null;
  isLoggingSession: boolean;
  editingSession: Session | null;
  preselectedLogStudentId: string;
  preselectedLogGroupId: string;
  isGeneratingReport: boolean;
  preselectedReportStudentId: string;

  handleNavigation: (tabId: TabId) => void;
  setActiveStudentId: (id: string | null) => void;
  setActiveGroupId: (id: string | null) => void;
  setIsMobileMenuOpen: (open: boolean) => void;

  setIsAddingStudent: (open: boolean) => void;
  setEditingStudent: (student: Student | null) => void;
  setIsAddingGroup: (open: boolean) => void;
  setEditingGroup: (group: Group | null) => void;
  setIsLoggingSession: (open: boolean) => void;
  setEditingSession: (session: Session | null) => void;
  setPreselectedLogStudentId: (id: string) => void;
  setPreselectedLogGroupId: (id: string) => void;
  setIsGeneratingReport: (open: boolean) => void;
  setPreselectedReportStudentId: (id: string) => void;

  handleEditSession: (session: Session) => void;
  closeSessionForm: () => void;
  closeReportForm: () => void;
}

export function useNavigation(): UseNavigationReturn {
  const [currentTab, setCurrentTab] = useState<TabId>("dashboard");
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [isLoggingSession, setIsLoggingSession] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [preselectedLogStudentId, setPreselectedLogStudentId] = useState("");
  const [preselectedLogGroupId, setPreselectedLogGroupId] = useState("");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [preselectedReportStudentId, setPreselectedReportStudentId] = useState("");

  const handleNavigation = (tabId: TabId) => {
    setCurrentTab(tabId);
    setActiveStudentId(null);
    setActiveGroupId(null);
    setIsMobileMenuOpen(false);

    setIsAddingStudent(false);
    setEditingStudent(null);
    setIsAddingGroup(false);
    setEditingGroup(null);
    setIsLoggingSession(false);
    setEditingSession(null);
    setPreselectedLogStudentId("");
    setPreselectedLogGroupId("");
    setIsGeneratingReport(false);
    setPreselectedReportStudentId("");
  };

  const handleEditSession = (session: Session) => {
    setEditingSession(session);
    setIsLoggingSession(true);
  };

  const closeSessionForm = () => {
    setIsLoggingSession(false);
    setPreselectedLogStudentId("");
    setPreselectedLogGroupId("");
    setEditingSession(null);
  };

  const closeReportForm = () => {
    setIsGeneratingReport(false);
    setPreselectedReportStudentId("");
  };

  return {
    currentTab,
    activeStudentId,
    activeGroupId,
    isMobileMenuOpen,

    isAddingStudent,
    editingStudent,
    isAddingGroup,
    editingGroup,
    isLoggingSession,
    editingSession,
    preselectedLogStudentId,
    preselectedLogGroupId,
    isGeneratingReport,
    preselectedReportStudentId,

    handleNavigation,
    setActiveStudentId,
    setActiveGroupId,
    setIsMobileMenuOpen,

    setIsAddingStudent,
    setEditingStudent,
    setIsAddingGroup,
    setEditingGroup,
    setIsLoggingSession,
    setEditingSession,
    setPreselectedLogStudentId,
    setPreselectedLogGroupId,
    setIsGeneratingReport,
    setPreselectedReportStudentId,

    handleEditSession,
    closeSessionForm,
    closeReportForm,
  };
}