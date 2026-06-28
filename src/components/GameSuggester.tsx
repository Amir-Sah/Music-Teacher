/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Game, Skill, GameSkill, Student } from "../types";
import { Search, Filter, Trophy, Sparkles, Box, Compass, RefreshCw, Layers, Plus, Edit, Trash2 } from "lucide-react";
import GameFormModal from "./GameFormModal";

interface GameSuggesterProps {
  games: Game[];
  skills: Skill[];
  gameSkills: GameSkill[];
  students: Student[];
  preselectedStudentId?: string;
  onSaveGame?: (game: Omit<Game, "id"> & { id?: string }, selectedSkillIds: string[]) => void;
  onDeleteGame?: (id: string) => void;
}

export default function GameSuggester({
  games,
  skills,
  gameSkills,
  students,
  preselectedStudentId = "",
  onSaveGame,
  onDeleteGame
}: GameSuggesterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("");
  const [activeStudentId, setActiveStudentId] = useState(preselectedStudentId);

  // CRUD overlay states
  const [isAddingGame, setIsAddingGame] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);

  // Student active selection for smart matcher
  const activeStudent = useMemo(() => {
    return students.find((s) => s.id === activeStudentId);
  }, [students, activeStudentId]);

  // Smart recommended games for selected student
  const smartRecommendations = useMemo(() => {
    if (!activeStudent) return [];
    
    const age = activeStudent.age;
    // Map student level to game difficulty
    let levelMatch: "Beginner" | "Intermediate" | "Advanced" = "Beginner";
    const lvlLower = activeStudent.level.toLowerCase();
    if (lvlLower.includes("inter") || lvlLower.includes("grade 2") || lvlLower.includes("grade 3")) {
      levelMatch = "Intermediate";
    } else if (lvlLower.includes("adv") || lvlLower.includes("grade 4") || lvlLower.includes("grade 5")) {
      levelMatch = "Advanced";
    }

    return games.map(game => {
      let score = 0;
      
      // Check difficulty match
      if (game.difficulty === levelMatch) {
        score += 3;
      } else if (
        (levelMatch === "Intermediate" && (game.difficulty === "Beginner" || game.difficulty === "Advanced")) ||
        (levelMatch === "Beginner" && game.difficulty === "Intermediate") ||
        (levelMatch === "Advanced" && game.difficulty === "Intermediate")
      ) {
        score += 1;
      }

      // Check age compatibility
      if (age >= game.ageMin && age <= game.ageMax) {
        score += 4;
      } else if (age >= game.ageMin - 1 && age <= game.ageMax + 1) {
        score += 2;
      }

      return { game, score };
    })
    .filter(item => item.score >= 3)
    .sort((a, b) => b.score - a.score)
    .map(item => item.game);
  }, [activeStudent, games]);

  // General Filtered Games
  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      // 1. Text Search
      if (
        searchTerm &&
        !game.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !game.description.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // 2. Skill Filter
      if (selectedSkillId) {
        const isLinkedToSkill = gameSkills.some(
          (gs) => gs.gameId === game.id && gs.skillId === selectedSkillId
        );
        if (!isLinkedToSkill) return false;
      }

      // 3. Difficulty Filter
      if (selectedDifficulty && game.difficulty !== selectedDifficulty) {
        return false;
      }

      // 4. Age Group Filter
      if (selectedAgeGroup) {
        if (selectedAgeGroup === "young" && game.ageMax > 8) return false; // up to 8
        if (selectedAgeGroup === "mid" && (game.ageMin > 12 || game.ageMax < 8)) return false; // 8-12
        if (selectedAgeGroup === "older" && game.ageMin < 10) return false; // 10+
      }

      return true;
    });
  }, [games, gameSkills, searchTerm, selectedSkillId, selectedDifficulty, selectedAgeGroup]);

  // Find skill list for a given game
  const getGameSkills = (gameId: string) => {
    const linkedSkillIds = gameSkills
      .filter((gs) => gs.gameId === gameId)
      .map((gs) => gs.skillId);
    return skills.filter((sk) => linkedSkillIds.includes(sk.id));
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Compass className="w-6 h-6 text-indigo-600 animate-spin-slow" />
          Music Activity & Game Suggester
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Select or filter games to play during lessons to train core rhythm, pitch, and listening skills.
        </p>
      </div>

      {/* 1. Smart Recommend Section */}
      <div className="bg-slate-100/50 p-6 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 relative z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Smart Student Matcher</h3>
              <p className="text-xs text-slate-450 uppercase tracking-wider mt-0.5 font-bold">Auto-match educational games to student age and level</p>
            </div>
          </div>
          
          <div className="max-w-xs">
            <select
              id="smart-recommend-student-select"
              value={activeStudentId}
              onChange={(e) => setActiveStudentId(e.target.value)}
              className="w-full text-xs font-bold px-3 py-2 border border-slate-200 rounded bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">-- Choose Student to Recommend --</option>
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} (Age {st.age}, {st.level})
                </option>
              ))}
            </select>
          </div>
        </div>

        {activeStudent ? (
          <div className="relative z-10">
            {smartRecommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {smartRecommendations.slice(0, 3).map((game) => (
                  <div key={`smart-${game.id}`} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h4 className="font-bold text-slate-850 text-xs sm:text-sm">{game.name}</h4>
                        <span className="px-1.5 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[8px] font-bold rounded uppercase flex-shrink-0">
                          {game.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                        {game.description}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-between text-[10px] font-semibold text-slate-400 border-t border-slate-100 pt-2.5">
                      <span>Age: {game.ageMin}–{game.ageMax}</span>
                      <div className="flex gap-1 mt-1">
                        {getGameSkills(game.id).map(s => (
                          <span key={s.id} className="bg-slate-100 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase">
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No games match this student's profile exactly. Try searching manually below.</p>
            )}
          </div>
        ) : (
          <div className="flex justify-center py-3 relative z-10">
            <p className="text-xs text-slate-500 italic">Select a student from the dropdown above to view personal game recommendations.</p>
          </div>
        )}

        {/* Decorative elements */}
        <div className="absolute -right-12 -top-12 w-32 h-32 bg-indigo-50 rounded-full opacity-30"></div>
      </div>

      {/* 2. Manual Catalog Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-8 mb-4">
          <h3 className="text-xs uppercase tracking-widest font-bold text-slate-400">
            Activity & Game Library ({filteredGames.length} games)
          </h3>
          {onSaveGame && (
            <button
              onClick={() => setIsAddingGame(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add New Activity
            </button>
          )}
        </div>

        {/* Filters Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-100/50 p-4 rounded-xl border border-slate-200">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search games..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-900"
            />
          </div>

          {/* Skill Filter */}
          <div>
            <select
              value={selectedSkillId}
              onChange={(e) => setSelectedSkillId(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-200 rounded bg-white text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="">All Music Skills</option>
              {skills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-200 rounded bg-white text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          {/* Age Group Filter */}
          <div>
            <select
              value={selectedAgeGroup}
              onChange={(e) => setSelectedAgeGroup(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-200 rounded bg-white text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="">All Ages</option>
              <option value="young">Young Learners (Up to Age 8)</option>
              <option value="mid">Middle Grade (Ages 8-12)</option>
              <option value="older">Older Students (Age 10+)</option>
            </select>
          </div>
        </div>

        {/* Reset Button */}
        {(searchTerm || selectedSkillId || selectedDifficulty || selectedAgeGroup) && (
          <div className="flex justify-end">
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedSkillId("");
                setSelectedDifficulty("");
                setSelectedAgeGroup("");
              }}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset filters
            </button>
          </div>
        )}

        {/* Games Catalog Grid */}
        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredGames.map((game) => (
              <div
                key={game.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
              >
                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-150 flex items-start justify-between gap-3 bg-slate-50/50">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-slate-900 tracking-tight text-sm sm:text-base truncate">
                      {game.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Age: {game.ageMin}–{game.ageMax} years
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span
                      className={`px-2 py-0.5 text-[8px] font-bold rounded uppercase tracking-wider border ${
                        game.difficulty === "Beginner"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : game.difficulty === "Intermediate"
                          ? "bg-amber-50 text-amber-700 border-amber-100"
                          : "bg-red-50 text-red-700 border-red-100"
                      }`}
                    >
                      {game.difficulty}
                    </span>
                    {(onSaveGame || onDeleteGame) && (
                      <div className="flex items-center gap-1 ml-1 border-l border-slate-200 pl-1.5">
                        {onSaveGame && (
                          <button
                            onClick={() => setEditingGame(game)}
                            title="Edit Activity"
                            className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onDeleteGame && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete "${game.name}"?`)) {
                                onDeleteGame(game.id);
                              }
                            }}
                            title="Delete Activity"
                            className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <p className="text-xs text-slate-650 leading-relaxed">
                      {game.description}
                    </p>

                    {game.materialsNeeded && (
                      <div className="flex gap-2 items-start text-xs bg-slate-50 p-2.5 rounded border border-slate-200/60">
                        <Box className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-bold text-slate-700">Materials: </span>
                          <span className="text-slate-600">{game.materialsNeeded}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer Skills Tagged */}
                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-150">
                    {getGameSkills(game.id).map((skill) => (
                      <span
                        key={skill.id}
                        className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-[10px] px-2.5 py-0.5 rounded"
                      >
                        <Trophy className="w-2.5 h-2.5 text-indigo-500" />
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Compass className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">No games found</p>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your keyword filters or choose another music skill.
            </p>
          </div>
        )}
      </div>

      {/* Game Form Modal */}
      {(isAddingGame || editingGame) && onSaveGame && (
        <GameFormModal
          game={editingGame || undefined}
          skills={skills}
          gameSkills={gameSkills}
          onSave={(gamePayload, selectedSkillIds) => {
            onSaveGame(gamePayload, selectedSkillIds);
            setIsAddingGame(false);
            setEditingGame(null);
          }}
          onClose={() => {
            setIsAddingGame(false);
            setEditingGame(null);
          }}
        />
      )}
    </div>
  );
}
