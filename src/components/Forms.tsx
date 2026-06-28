/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Student, Group } from "../types";
import { X, Save, User, Users, Phone, MapPin, NotebookPen } from "lucide-react";

interface StudentFormModalProps {
  student?: Student; // If editing
  groups: Group[];
  onSave: (student: Omit<Student, "id"> & { id?: string }) => void;
  onClose: () => void;
}

export function StudentFormModal({
  student,
  groups,
  onSave,
  onClose
}: StudentFormModalProps) {
  const [name, setName] = useState(student?.name || "");
  const [age, setAge] = useState(student?.age || 8);
  const [level, setLevel] = useState(student?.level || "Beginner");
  const [parentName, setParentName] = useState(student?.parentName || "");
  const [parentPhone, setParentPhone] = useState(student?.parentPhone || "");
  const [notes, setNotes] = useState(student?.notes || "");
  const [groupId, setGroupId] = useState(student?.groupId || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Name is required");
      return;
    }

    onSave({
      id: student?.id,
      name: name.trim(),
      age: Number(age),
      level: level.trim(),
      parentName: parentName.trim(),
      parentPhone: parentPhone.trim(),
      notes: notes.trim(),
      groupId: groupId || undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-xl border border-slate-200 w-full max-w-lg shadow-xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-150 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <User className="w-5 h-5 text-slate-700" />
            {student ? `Edit Profile: ${student.name}` : "Register New Student"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Student Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Lucas Fletcher"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Student Age
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                min={3}
                max={99}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Music Skill Level
              </label>
              <input
                type="text"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                placeholder="e.g. Beginner, Prep A, Grade 1"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Group Class / Ensemble
              </label>
              <select
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-850 cursor-pointer"
              >
                <option value="">-- No Group / Private Lessons --</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Contacts */}
          <div className="border-t border-slate-150 pt-4 space-y-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-indigo-500" />
              Parent Contact Details
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Parent Name
                </label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="e.g. Sarah Fletcher"
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Parent Phone Number
                </label>
                <input
                  type="text"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="e.g. +1 555-019-2834"
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900"
                  required
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Permanent Bio / Teacher Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Energetic, enjoys percussion tools, visual learner..."
              rows={3}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 resize-y"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-150">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:border-slate-300 rounded text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Save Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface GroupFormModalProps {
  group?: Group;
  onSave: (group: Omit<Group, "id"> & { id?: string }) => void;
  onClose: () => void;
}

export function GroupFormModal({
  group,
  onSave,
  onClose
}: GroupFormModalProps) {
  const [name, setName] = useState(group?.name || "");
  const [location, setLocation] = useState(group?.location || "");
  const [description, setDescription] = useState(group?.description || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Group name is required");
      return;
    }
    if (!location.trim()) {
      alert("Location is required");
      return;
    }

    onSave({
      id: group?.id,
      name: name.trim(),
      location: location.trim(),
      description: description.trim()
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-xl border border-slate-200 w-full max-w-md shadow-xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-150 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-700" />
            {group ? `Edit Class: ${group.name}` : "Create Group Class"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Class Group Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Keyboard Minis, Wednesday Vocal Circle"
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Class Location / Room
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Studio Room A, East Hall"
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Curriculum / Group Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. High energy group keyboard lessons for kids age 5-7. Focused on rhythm claps, standard hand postures, and interactive listening games."
              rows={4}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 resize-y"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-150">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:border-slate-300 rounded text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Save Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
