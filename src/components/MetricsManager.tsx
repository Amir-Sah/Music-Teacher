/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MetricDefinition, SessionMetricValue } from "../types";
import { SlidersHorizontal, Plus, Edit, Trash2, X, Save, AlertTriangle } from "lucide-react";

interface MetricsManagerProps {
  metrics: MetricDefinition[];
  sessionMetrics: SessionMetricValue[];
  onSaveMetric: (metric: Omit<MetricDefinition, "id"> & { id?: string }) => void;
  onDeleteMetric: (id: string) => void;
}

export default function MetricsManager({
  metrics,
  sessionMetrics,
  onSaveMetric,
  onDeleteMetric
}: MetricsManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingMetric, setEditingMetric] = useState<MetricDefinition | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState<"student" | "group" | "teacher" | "all">("all");

  const handleOpenAdd = () => {
    setName("");
    setDescription("");
    setTarget("all");
    setIsAdding(true);
  };

  const handleOpenEdit = (metric: MetricDefinition) => {
    setName(metric.name);
    setDescription(metric.description);
    setTarget(metric.target);
    setEditingMetric(metric);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Metric name is required");
      return;
    }

    onSaveMetric({
      id: editingMetric?.id,
      name: name.trim(),
      description: description.trim(),
      target
    });

    setIsAdding(false);
    setEditingMetric(null);
  };

  const handleDelete = (metric: MetricDefinition) => {
    const usages = sessionMetrics.filter(sm => sm.metricId === metric.id).length;
    let confirmMsg = `Are you sure you want to delete the metric "${metric.name}"?`;
    if (usages > 0) {
      confirmMsg = `Warning: This metric is used in ${usages} session logs.\nDeleting it will remove the associated rating data from those logs permanently. Proceed?`;
    }
    if (window.confirm(confirmMsg)) {
      onDeleteMetric(metric.id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <SlidersHorizontal className="w-6 h-6 text-indigo-500" />
            Class Quality Metrics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Define the criteria you evaluate in your class logs.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-750 text-white rounded font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Metric
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {metrics.length > 0 ? (
          <div className="divide-y divide-slate-150">
            {metrics.map((metric) => (
              <div key={metric.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800 text-sm">{metric.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      metric.target === "teacher" ? "bg-amber-100 text-amber-700" :
                      metric.target === "group" ? "bg-emerald-100 text-emerald-700" :
                      metric.target === "student" ? "bg-blue-100 text-blue-700" :
                      "bg-indigo-100 text-indigo-700"
                    }`}>
                      {metric.target}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{metric.description}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(metric)}
                    className="p-2 text-slate-400 hover:bg-white hover:text-indigo-600 border border-transparent hover:border-slate-200 rounded transition-all cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(metric)}
                    className="p-2 text-slate-400 hover:bg-white hover:text-red-600 border border-transparent hover:border-slate-200 rounded transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500">
            No metrics defined.
          </div>
        )}
      </div>

      {(isAdding || editingMetric) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 w-full max-w-md shadow-xl overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-slate-150 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                {editingMetric ? "Edit Metric" : "Add Metric"}
              </h3>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setEditingMetric(null);
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Target Applies To</label>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value as any)}
                  className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
                >
                  <option value="all">All Classes</option>
                  <option value="student">Private Lessons Only</option>
                  <option value="group">Group Classes Only</option>
                  <option value="teacher">Teacher Evaluation Only</option>
                </select>
              </div>

              {editingMetric && (
                <div className="bg-amber-50 border border-amber-100 text-amber-800 text-[11px] p-3 rounded-lg flex gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                  <span>Modifying this metric will update it globally across all session logs.</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-150">
                <button
                  type="button"
                  onClick={() => { setIsAdding(false); setEditingMetric(null); }}
                  className="px-4 py-2 border border-slate-200 rounded text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-700 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
