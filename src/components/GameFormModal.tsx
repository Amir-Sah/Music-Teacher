/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Game, Skill, GameSkill } from "../types";
import { X, Save, Trophy, Box, Layers, HelpCircle } from "lucide-react";

interface GameFormModalProps {
  game?: Game; // If editing
  skills: Skill[];
  gameSkills: GameSkill[];
  onSave: (game: Omit<Game, "id"> & { id?: string }, selectedSkillIds: string[]) => void;
  onClose: () => void;
}

export default function GameFormModal({
  game,
  skills,
  gameSkills,
  onSave,
  onClose
}: GameFormModalProps) {
  const [name, setName] = useState(game?.name || "");
  const [description, setDescription] = useState(game?.description || "");
  const [ageMin, setAgeMin] = useState(game?.ageMin || 5);
  const [ageMax, setAgeMax] = useState(game?.ageMax || 12);
  const [difficulty, setDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">(
    game?.difficulty || "Beginner"
  );
  const [materialsNeeded, setMaterialsNeeded] = useState(game?.materialsNeeded || "");
  
  // Track selected skills
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);

  // Initialize selected skill IDs
  useEffect(() => {
    if (game) {
      const linkedSkillIds = gameSkills
        .filter((gs) => gs.gameId === game.id)
        .map((gs) => gs.skillId);
      setSelectedSkillIds(linkedSkillIds);
    } else {
      setSelectedSkillIds([]);
    }
  }, [game, gameSkills]);

  const handleToggleSkill = (skillId: string) => {
    setSelectedSkillIds((prev) =>
      prev.includes(skillId)
        ? prev.filter((id) => id !== skillId)
        : [...prev, skillId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Game/Activity name is required");
      return;
    }
    if (!description.trim()) {
      alert("Description is required");
      return;
    }
    if (ageMin > ageMax) {
      alert("Minimum age cannot be greater than maximum age");
      return;
    }

    onSave(
      {
        id: game?.id,
        name: name.trim(),
        description: description.trim(),
        ageMin: Number(ageMin),
        ageMax: Number(ageMax),
        difficulty,
        materialsNeeded: materialsNeeded.trim()
      },
      selectedSkillIds
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-xl border border-slate-200 w-full max-w-lg shadow-xl overflow-hidden animate-scale-up flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-150 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Trophy className="w-5 h-5 text-indigo-600 animate-pulse" />
            {game ? `Edit Activity: ${game.name}` : "Create New Music Game / Activity"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Game Title */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Activity / Game Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rhythm Telephone, Interval Matcher"
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Gameplay Instructions / Objective
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Students sit in a circle. The teacher taps a short rhythm on the shoulder of the first student, who passes it down the line. Compare the final pattern..."
              rows={4}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 resize-y"
              required
            />
          </div>

          {/* Age range & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Min Recommended Age
              </label>
              <input
                type="number"
                value={ageMin}
                onChange={(e) => setAgeMin(Math.max(3, Number(e.target.value)))}
                min={3}
                max={99}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Max Recommended Age
              </label>
              <input
                type="number"
                value={ageMax}
                onChange={(e) => setAgeMax(Math.max(ageMin, Number(e.target.value)))}
                min={ageMin}
                max={99}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as "Beginner" | "Intermediate" | "Advanced")}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer font-medium"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Materials needed */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <Box className="w-3.5 h-3.5 text-slate-400" />
              Materials / Props Needed (Optional)
            </label>
            <input
              type="text"
              value={materialsNeeded}
              onChange={(e) => setMaterialsNeeded(e.target.value)}
              placeholder="e.g. Hand drum, flashcards, none..."
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900"
            />
          </div>

          {/* Associated Music Skills */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              Taught Music Skills (Select all that apply)
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded">
              {skills.map((skill) => {
                const isSelected = selectedSkillIds.includes(skill.id);
                return (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => handleToggleSkill(skill.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded text-left border text-xs font-semibold cursor-pointer transition-all ${
                      isSelected
                        ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="rounded text-indigo-650 focus:ring-indigo-500/25 h-3.5 w-3.5 cursor-pointer pointer-events-none"
                    />
                    <span>{skill.name}</span>
                  </button>
                );
              })}
            </div>
            {selectedSkillIds.length === 0 && (
              <p className="text-[10px] text-amber-600 font-bold mt-1">
                * Select at least one skill so the matcher can suggest this game appropriately!
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-150 flex-shrink-0">
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
              Save Game
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
