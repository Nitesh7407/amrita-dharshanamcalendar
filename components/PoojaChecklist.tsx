'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, RotateCcw, Sparkles } from 'lucide-react';

interface ChecklistItem {
  step: number;
  task: string;
  completed?: boolean;
}

interface PoojaChecklistProps {
  id: string;
  title: string;
  checklistJson?: string | null;
  defaultItems?: ChecklistItem[];
}

export function PoojaChecklist({ id, title, checklistJson, defaultItems }: PoojaChecklistProps) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let initialItems: ChecklistItem[] = [];
    if (checklistJson) {
      try {
        initialItems = JSON.parse(checklistJson);
      } catch (e) {
        initialItems = defaultItems || [];
      }
    } else {
      initialItems = defaultItems || [
        { step: 1, task: "Purification of puja altar and lighting lamps" },
        { step: 2, task: "Guru Dhyanam & Sankalpam (setting intention)" },
        { step: 3, task: "Vigneshwara Puja (Lord Ganesha invocation)" },
        { step: 4, task: "Parayanam of designated Stotrams and Suktams" },
        { step: 5, task: "Naivedyam (sacred food offering) and Deeparadhana" },
        { step: 6, task: "Kshama Prarthana (prayer for forgiveness) & Prasad distribution" }
      ];
    }

    // Check localStorage for saved user state
    try {
      const saved = localStorage.getItem(`pooja-checklist-${id}`);
      if (saved) {
        const savedState = JSON.parse(saved);
        initialItems = initialItems.map((item) => ({
          ...item,
          completed: savedState[item.step] ?? false,
        }));
      }
    } catch (e) {
      // localStorage may fail in some environments
    }

    setItems(initialItems);
    setIsLoaded(true);
  }, [id, checklistJson, defaultItems]);

  const toggleStep = (stepNumber: number) => {
    const updated = items.map((item) => {
      if (item.step === stepNumber) {
        return { ...item, completed: !item.completed };
      }
      return item;
    });
    setItems(updated);

    try {
      const stateToSave = updated.reduce((acc, curr) => {
        acc[curr.step] = curr.completed || false;
        return acc;
      }, {} as Record<number, boolean>);
      localStorage.setItem(`pooja-checklist-${id}`, JSON.stringify(stateToSave));
    } catch (e) {
      // ignore
    }
  };

  const resetChecklist = () => {
    const reset = items.map((item) => ({ ...item, completed: false }));
    setItems(reset);
    try {
      localStorage.removeItem(`pooja-checklist-${id}`);
    } catch (e) {}
  };

  const completedCount = items.filter((i) => i.completed).length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  if (!isLoaded || items.length === 0) return null;

  return (
    <div className="bg-[#FFFDF9] rounded-xl border border-[#E8DEC8] p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-700" />
          <h3 className="font-serif font-bold text-base text-[#6E1B24]">
            Pooja Preparation & Checklist
          </h3>
        </div>
        <button
          onClick={resetChecklist}
          className="text-xs text-stone-500 hover:text-stone-700 flex items-center space-x-1 transition"
          title="Reset checklist"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-stone-600 mb-1">
          <span>{completedCount} of {items.length} steps completed</span>
          <span className="font-semibold text-amber-800">{progressPercent}%</span>
        </div>
        <div className="w-full bg-[#F4ECE1] rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-600 to-[#6E1B24] h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={item.step}
            onClick={() => toggleStep(item.step)}
            className={`w-full flex items-start text-left p-2.5 rounded-lg border transition ${
              item.completed
                ? 'bg-amber-50/70 border-amber-200 text-stone-500'
                : 'bg-white border-[#E8DEC8] hover:border-amber-400 text-stone-800'
            }`}
          >
            <div className="mt-0.5 mr-3 shrink-0">
              {item.completed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <Circle className="w-4 h-4 text-stone-400" />
              )}
            </div>
            <div className="flex-1 text-xs">
              <span className={`font-medium ${item.completed ? 'line-through text-stone-400' : 'text-[#6E1B24]'}`}>
                Step {item.step}:
              </span>{' '}
              <span className={item.completed ? 'line-through text-stone-400' : ''}>
                {item.task}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
