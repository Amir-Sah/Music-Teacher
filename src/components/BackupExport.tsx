/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from "react";
import { AppState } from "../types";
import { Download, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Database } from "lucide-react";
import { AppStateSchema } from "../utils/schema";

interface BackupExportProps {
  appState: AppState;
  onRestoreState: (state: AppState) => void;
}

export default function BackupExport({ appState, onRestoreState }: BackupExportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Helper to convert array of objects into CSV string
  const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return "";
    
    // Get headers
    const headers = Object.keys(data[0]);
    
    const rows = data.map((obj) => {
      return headers
        .map((header) => {
          let val = obj[header];
          if (val === undefined || val === null) {
            val = "";
          }
          // Convert objects or arrays to simple string representations
          if (typeof val === "object") {
            val = JSON.stringify(val);
          }
          // Escape quotes
          const stringVal = String(val).replace(/"/g, '""');
          // Wrap in quotes if contains comma, quote, or newline
          if (stringVal.includes(",") || stringVal.includes('"') || stringVal.includes("\n") || stringVal.includes("\r")) {
            return `"${stringVal}"`;
          }
          return stringVal;
        })
        .join(",");
    });

    return [headers.join(","), ...rows].join("\r\n");
  };

  // Helper to trigger file download
  const triggerDownload = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export specific collection to CSV
  const handleExportCSV = (collectionName: keyof AppState, filename: string) => {
    const rawData = appState[collectionName];
    if (!Array.isArray(rawData) || rawData.length === 0) {
      alert(`There is no data in ${String(collectionName)} to export yet.`);
      return;
    }
    const csvContent = convertToCSV(rawData);
    triggerDownload(csvContent, filename, "text/csv;charset=utf-8;");
  };

  // Full database JSON backup
  const handleExportJSONBackup = () => {
    const dataStr = JSON.stringify(appState, null, 2);
    const dateStr = new Date().toISOString().split("T")[0];
    triggerDownload(
      dataStr,
      `music_teacher_assistant_backup_${dateStr}.json`,
      "application/json"
    );
  };

  // Restore database from JSON
  const handleImportJSONBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSuccessMsg("");
    setErrorMsg("");
    
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        
        // Zod schema verification
        const validationResult = AppStateSchema.safeParse(parsed);
        
        if (validationResult.success) {
          onRestoreState(validationResult.data as AppState);
          setSuccessMsg("🎉 Database restored successfully! All tables, evaluations, skills, and student session notes are updated.");
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } else {
          // Log specific schema errors for debugging
          console.error("Backup validation failed:", validationResult.error);
          
          // Provide a user-friendly error message, extracting the first error if possible
          const firstError = validationResult.error.issues[0];
          const errorPath = firstError.path.join(".");
          setErrorMsg(`⚠️ Invalid backup file structure. Problem near: ${errorPath || 'unknown'} - ${firstError.message}`);
        }
      } catch (err) {
        setErrorMsg("⚠️ Failed to parse JSON file. Ensure it is a valid backup file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Database className="w-6 h-6 text-slate-800" />
          Data Export & Database Backup
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Export your gradebook and session logs as CSV spreadsheets for Google Sheets or Excel, or perform an offline system backup.
        </p>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm flex items-start gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CSV Spreadsheets Export */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              Spreadsheet Export (Google Sheets / Excel)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Download clean comma-separated values (CSV) sheets. Fully compatible with Google Sheets, Excel, and Numbers.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => handleExportCSV("students", "music_students_export.csv")}
              className="w-full flex items-center justify-between p-3 border border-slate-200 hover:bg-slate-50 rounded-lg text-left transition-colors group cursor-pointer"
            >
              <div>
                <span className="font-bold text-xs sm:text-sm text-slate-850 block">Export Students List</span>
                <span className="text-[10px] text-slate-400 font-semibold">Contains {appState.students.length} students with parent info</span>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
            </button>

            <button
              onClick={() => handleExportCSV("groups", "music_groups_export.csv")}
              className="w-full flex items-center justify-between p-3 border border-slate-200 hover:bg-slate-50 rounded-lg text-left transition-colors group cursor-pointer"
            >
              <div>
                <span className="font-bold text-xs sm:text-sm text-slate-850 block">Export Group Classes</span>
                <span className="text-[10px] text-slate-400 font-semibold">Contains {appState.groups.length} active classes & circles</span>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
            </button>

            <button
              onClick={() => handleExportCSV("sessions", "music_sessions_export.csv")}
              className="w-full flex items-center justify-between p-3 border border-slate-200 hover:bg-slate-50 rounded-lg text-left transition-colors group cursor-pointer"
            >
              <div>
                <span className="font-bold text-xs sm:text-sm text-slate-850 block">Export All Session Logs</span>
                <span className="text-[10px] text-slate-400 font-semibold">Contains {appState.sessions.length} recorded classes, ratings, and topics</span>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
            </button>

            <button
              onClick={() => handleExportCSV("sessionMetrics", "music_session_metrics_export.csv")}
              className="w-full flex items-center justify-between p-3 border border-slate-200 hover:bg-slate-50 rounded-lg text-left transition-colors group cursor-pointer"
            >
              <div>
                <span className="font-bold text-xs sm:text-sm text-slate-850 block">Export Session Metrics Evaluation</span>
                <span className="text-[10px] text-slate-400 font-semibold">Contains {appState.sessionMetrics.length} dynamic metrics linked to sessions</span>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
            </button>

            <button
              onClick={() => handleExportCSV("sessionSkills", "music_session_skills_export.csv")}
              className="w-full flex items-center justify-between p-3 border border-slate-200 hover:bg-slate-50 rounded-lg text-left transition-colors group cursor-pointer"
            >
              <div>
                <span className="font-bold text-xs sm:text-sm text-slate-850 block">Export Session Skills Covered</span>
                <span className="text-[10px] text-slate-400 font-semibold">Contains {appState.sessionSkills.length} links between logged sessions and musical skills practiced</span>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
            </button>

            <button
              onClick={() => handleExportCSV("studentSessionNotes", "music_student_session_notes_export.csv")}
              className="w-full flex items-center justify-between p-3 border border-slate-200 hover:bg-slate-50 rounded-lg text-left transition-colors group cursor-pointer"
            >
              <div>
                <span className="font-bold text-xs sm:text-sm text-slate-850 block">Export Student Session Notes</span>
                <span className="text-[10px] text-slate-400 font-semibold">Contains {appState.studentSessionNotes.length} specific student comments from group and private lessons</span>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
            </button>

            <button
              onClick={() => handleExportCSV("monthlyReports", "music_monthly_reports_export.csv")}
              className="w-full flex items-center justify-between p-3 border border-slate-200 hover:bg-slate-50 rounded-lg text-left transition-colors group cursor-pointer"
            >
              <div>
                <span className="font-bold text-xs sm:text-sm text-slate-850 block">Export Parent Monthly Reports</span>
                <span className="text-[10px] text-slate-400 font-semibold">Contains {appState.monthlyReports.length} parent updates with focus trends</span>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
            </button>
          </div>
        </div>

        {/* System JSON Backup & Restore */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <Database className="w-5 h-5 text-indigo-600" />
              Complete Backup & Restore
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Save or load your entire database including students, sessions, evaluation scores, games and analytics in a single file.
            </p>
          </div>

          <div className="space-y-4 pt-4">
            {/* Export JSON Button */}
            <button
              onClick={handleExportJSONBackup}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-md transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download System Backup (.json)
            </button>

            {/* Separator */}
            <div className="flex items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest gap-2">
              <div className="flex-1 h-[1px] bg-slate-200"></div>
              <span>OR RESTORE SYSTEM</span>
              <div className="flex-1 h-[1px] bg-slate-200"></div>
            </div>

            {/* Upload/Restore Button */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportJSONBackup}
                className="hidden"
                id="restore-db-file"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm rounded-md transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4 text-slate-500" />
                Upload Backup File to Restore
              </button>
              <span className="block text-[10px] text-center text-slate-400 mt-2">
                ⚠️ Restoring from a backup will replace your current browser session database.
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
