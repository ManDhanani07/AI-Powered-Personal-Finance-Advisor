import React, { useState } from 'react';
import { Check, Palette } from 'lucide-react';

const PRESET_COLORS = [
  { name: 'Indigo', hex: '#6366F1' },
  { name: 'Violet', hex: '#8B5CF6' },
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Amber', hex: '#F59E0B' },
  { name: 'Rose', hex: '#F43F5E' },
  { name: 'Sky', hex: '#06B6D4' },
  { name: 'Teal', hex: '#14B8A6' },
  { name: 'Purple', hex: '#A855F7' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Slate', hex: '#64748B' },
];

export const CategoryColorPicker = ({ selectedColor = '#6366F1', onSelectColor }) => {
  const [customHex, setCustomHex] = useState(selectedColor);

  const handleHexChange = (e) => {
    const val = e.target.value;
    setCustomHex(val);
    if (/^#[0-9A-F]{6}$/i.test(val)) {
      onSelectColor(val);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
        Category Accent Color
      </label>

      {/* Palette Swatches */}
      <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-2xl border border-border-strong bg-bg-elevated/60">
        {PRESET_COLORS.map((c) => {
          const isSelected = selectedColor?.toLowerCase() === c.hex.toLowerCase();
          return (
            <button
              key={c.hex}
              type="button"
              onClick={() => {
                setCustomHex(c.hex);
                onSelectColor(c.hex);
              }}
              style={{ backgroundColor: c.hex }}
              className={`flex h-7 w-7 items-center justify-center rounded-full transition-transform ${
                isSelected ? 'scale-115 ring-2 ring-primary-500 ring-offset-2 ring-offset-bg-surface' : 'hover:scale-105'
              }`}
              title={c.name}
            >
              {isSelected && <Check className="h-4 w-4 text-white drop-shadow" />}
            </button>
          );
        })}
      </div>

      {/* Custom Hex Picker Input */}
      <div className="flex items-center space-x-2 pt-1">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Palette className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <input
            type="text"
            value={customHex}
            onChange={handleHexChange}
            placeholder="#6366F1"
            className="w-full rounded-xl border border-border-strong bg-bg-surface py-1.5 pl-8 pr-3 font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => {
            setCustomHex(e.target.value);
            onSelectColor(e.target.value);
          }}
          className="h-8 w-8 cursor-pointer rounded-xl border-0 bg-transparent p-0"
        />
      </div>
    </div>
  );
};

export default CategoryColorPicker;
