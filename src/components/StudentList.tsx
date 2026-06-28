/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Student, Group } from "../types";
import { Search, Plus, User, Eye, Phone, Edit2, Users, SlidersHorizontal, Trash2 } from "lucide-react";

interface StudentListProps {
  students: Student[];
  groups: Group[];
  onSelectStudent: (id: string) => void;
  onAddStudent: () => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
}

export default function StudentList({
  students,
  groups,
  onSelectStudent,
  onAddStudent,
  onEditStudent,
  onDeleteStudent
}: StudentListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.level.toLowerCase().includes(searchTerm.toLowerCase());

      const matchGroup = selectedGroupId ? student.groupId === selectedGroupId : true;

      return matchSearch && matchGroup;
    });
  }, [students, searchTerm, selectedGroupId]);

  // Lookup group name for display
  const getGroupName = (groupId?: string) => {
    if (!groupId) return "";
    const group = groups.find((g) => g.id === groupId);
    return group ? group.name : "";
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-slate-800" />
            Students Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your roster, view student performance timelines, or record parent updates.
          </p>
        </div>

        <button
          onClick={onAddStudent}
          className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-md shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Student
        </button>
      </div>

      {/* Roster Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-slate-100/50 p-4 rounded-xl border border-slate-200">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search student or parent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {/* Group Selector Filter */}
        <div className="relative">
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="w-full py-2 px-3 text-xs border border-slate-200 rounded bg-white text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="">All Group Classes</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid List */}
      {filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              {/* Card Header */}
              <div className="p-5 flex items-start gap-4">
                <div className="w-11 h-11 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center text-slate-700 flex-shrink-0 font-bold">
                  {student.name[0]}
                </div>
                
                <div className="space-y-1 overflow-hidden">
                  <h3 className="font-bold text-slate-900 tracking-tight text-sm sm:text-base truncate">
                    {student.name}
                  </h3>
                  <p className="text-xs text-indigo-600 font-semibold truncate">
                    Level: {student.level || "Beginner"}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Age {student.age} years
                  </p>
                </div>
              </div>

              {/* Card Mid Block */}
              <div className="px-5 pb-5 space-y-3">
                {student.groupId && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-400 font-bold uppercase text-[9px]">Class:</span>
                    <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold">
                      {getGroupName(student.groupId)}
                    </span>
                  </div>
                )}

                <div className="text-[11px] text-slate-650 bg-slate-50 p-2.5 rounded border border-slate-200/60 line-clamp-2 min-h-[46px]">
                  {student.notes || "No extra bio notes. Select view to add detailed goals."}
                </div>
              </div>

              {/* Card Actions */}
              <div className="px-5 py-3 border-t border-slate-150 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{student.parentName}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onEditStudent(student)}
                    className="p-1.5 rounded border border-slate-200 bg-white text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-colors"
                    title="Edit profile"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onSelectStudent(student.id)}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">No students found</p>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search criteria, clearing your group filter, or click "Add Student" above.
          </p>
        </div>
      )}
    </div>
  );
}
