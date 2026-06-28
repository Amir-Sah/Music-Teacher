/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Skill, GameSkill, StudentSkill, SessionSkill } from "../types";
import { 
  Award, Search, Plus, Edit, Trash2, X, Save, HelpCircle, 
  Layers, Users, Trophy, BookOpen, AlertTriangle
} from "lucide-react";

interface SkillsManagerProps {
  skills: Skill[];
  gameSkills: GameSkill[];
  studentSkills: StudentSkill[];
  sessionSkills: SessionSkill[];
  onSaveSkill: (skill: Omit<Skill, "id"> & { id?: string }) => void;
  onDeleteSkill: (id: string) => void;
}

export default function SkillsManager({
  skills,
  gameSkills,
  studentSkills,
  sessionSkills,
  onSaveSkill,
  onDeleteSkill
}: SkillsManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  
  // Modal form state
  const [skillName, setSkillName] = useState("");

  // Search filter
  const filteredSkills = useMemo(() => {
    return skills.filter((s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [skills, searchTerm]);

  // Compute skill usage statistics
  const skillStats = useMemo(() => {
    const stats: Record<string, { games: number; students: number; sessions: number }> = {};
    
    skills.forEach((skill) => {
      stats[skill.id] = { games: 0, students: 0, sessions: 0 };
    });

    gameSkills.forEach((gs) => {
      if (stats[gs.skillId]) {
        stats[gs.skillId].games += 1;
      }
    });

    studentSkills.forEach((ss) => {
      if (stats[ss.skillId]) {
        stats[ss.skillId].students += 1;
      }
    });

    sessionSkills.forEach((sc) => {
      if (stats[sc.skillId]) {
        stats[sc.skillId].sessions += 1;
      }
    });

    return stats;
  }, [skills, gameSkills, studentSkills, sessionSkills]);

  const handleOpenAdd = () => {
    setSkillName("");
    setIsAddingSkill(true);
  };

  const handleOpenEdit = (skill: Skill) => {
    setSkillName(skill.name);
    setEditingSkill(skill);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) {
      alert("Skill name is required");
      return;
    }

    if (skills.some(s => s.name.toLowerCase() === skillName.trim().toLowerCase() && s.id !== editingSkill?.id)) {
      alert("A skill with this name already exists");
      return;
    }

    onSaveSkill({
      id: editingSkill?.id,
      name: skillName.trim()
    });

    setIsAddingSkill(false);
    setEditingSkill(null);
    setSkillName("");
  };

  const handleDelete = (skill: Skill) => {
    const stats = skillStats[skill.id] || { games: 0, students: 0, sessions: 0 };
    const hasAssociations = stats.games > 0 || stats.students > 0 || stats.sessions > 0;
    
    let confirmationMessage = `Are you sure you want to delete the skill "${skill.name}"?`;
    if (hasAssociations) {
      confirmationMessage = `Warning: The skill "${skill.name}" is currently associated with:\n` +
        `- ${stats.games} Game/Activity suggestions\n` +
        `- ${stats.students} Students' progress grids\n` +
        `- ${stats.sessions} Logged training sessions\n\n` +
        `Deleting this skill will permanently remove these relationships from the database. This action is irreversible.\n\n` +
        `Do you wish to proceed?`;
    }

    if (window.confirm(confirmationMessage)) {
      onDeleteSkill(skill.id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-500" />
            Music Skills Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, update, and manage the core educational skills tracked across student logs, progress matrices, and learning activities.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-750 text-white rounded font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Music Skill
        </button>
      </div>

      {/* Main Grid Section */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Search controls */}
        <div className="p-4 bg-slate-50 border-b border-slate-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search music skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 bg-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Showing {filteredSkills.length} of {skills.length} skills
          </span>
        </div>

        {/* Skills Cards Grid */}
        {filteredSkills.length > 0 ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSkills.map((skill) => {
              const stats = skillStats[skill.id] || { games: 0, students: 0, sessions: 0 };
              const isUsed = stats.games > 0 || stats.students > 0 || stats.sessions > 0;

              return (
                <div 
                  key={skill.id}
                  className="border border-slate-200 hover:border-indigo-150 rounded-xl p-5 hover:shadow-xs transition-all flex flex-col justify-between bg-white relative group"
                >
                  <div>
                    {/* Top title area */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0 font-bold text-xs">
                          {skill.name.slice(0, 2).toUpperCase()}
                        </div>
                        <h3 className="font-bold text-slate-800 tracking-tight text-sm truncate" title={skill.name}>
                          {skill.name}
                        </h3>
                      </div>

                      {/* Hover action bar */}
                      <div className="flex items-center gap-1 opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEdit(skill)}
                          title="Rename Skill"
                          className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-650 transition-colors cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(skill)}
                          title="Delete Skill"
                          className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-red-650 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Stats relational matrix indicators */}
                    <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-slate-100 text-[10px] font-bold text-slate-500 uppercase">
                      <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-150/45 rounded-lg py-1.5 px-1">
                        <Trophy className="w-3.5 h-3.5 text-indigo-500 mb-1" />
                        <span className="text-slate-800 font-extrabold text-xs">{stats.games}</span>
                        <span className="text-[8px] text-slate-400">Games</span>
                      </div>
                      <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-150/45 rounded-lg py-1.5 px-1">
                        <Users className="w-3.5 h-3.5 text-indigo-500 mb-1" />
                        <span className="text-slate-800 font-extrabold text-xs">{stats.students}</span>
                        <span className="text-[8px] text-slate-400">Students</span>
                      </div>
                      <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-150/45 rounded-lg py-1.5 px-1">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-500 mb-1" />
                        <span className="text-slate-800 font-extrabold text-xs">{stats.sessions}</span>
                        <span className="text-[8px] text-slate-400">Sessions</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Footer metadata */}
                  <div className="mt-3 flex items-center justify-between text-[8px] font-bold uppercase tracking-wider text-slate-400">
                    <span>ID: {skill.id}</span>
                    {isUsed ? (
                      <span className="text-indigo-600 bg-indigo-50/70 border border-indigo-100/50 px-1.5 py-0.5 rounded">Active</span>
                    ) : (
                      <span className="text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Unused</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 text-sm">No Skills Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchTerm 
                ? "No music skills matched your search query. Try another term or add a new skill."
                : "Create your first Music Skill to start tracking student progression and mapping learning activities."
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 px-3.5 py-1.5 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 font-bold text-xs rounded transition-colors cursor-pointer"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        )}
      </div>

      {/* Guide/Info Section */}
      <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5 flex gap-3.5">
        <HelpCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-indigo-900 text-xs sm:text-sm">Skills Architecture Information</h4>
          <p className="text-xs text-indigo-800/80 leading-relaxed mt-1">
            MuseAdmin relies on relational mapping. Each <strong>Music Skill</strong> you define is mapped directly onto the student diagnostic matrix, loaded as session objectives, and utilized by the automatic <strong>Activity & Game Suggester</strong> to suggest educational games specific to students' weak areas. Deleting or modifying skills safely updates records across your whole environment.
          </p>
        </div>
      </div>

      {/* Add / Edit Skill Modal */}
      {(isAddingSkill || editingSkill) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl border border-slate-200 w-full max-w-md shadow-xl overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-150 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-500" />
                {editingSkill ? `Rename Music Skill` : "Create New Music Skill"}
              </h3>
              <button
                onClick={() => {
                  setIsAddingSkill(false);
                  setEditingSkill(null);
                }}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Skill Name / Area
                </label>
                <input
                  type="text"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  placeholder="e.g. Ear Training, Rhythm Accuracy, Sight Reading"
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900"
                  required
                  autoFocus
                />
              </div>

              {editingSkill && (
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-[11px] text-amber-800 flex gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Renaming this skill will update it instantly across all student progress charts, lesson logs, and game lists.
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-150">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingSkill(false);
                    setEditingSkill(null);
                  }}
                  className="px-4 py-2 border border-slate-200 hover:border-slate-300 rounded text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-750 text-white rounded text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  {editingSkill ? "Save Changes" : "Create Skill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
