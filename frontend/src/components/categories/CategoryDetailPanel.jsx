import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Tag,
  Edit3,
  Trash2,
  Copy,
  DollarSign,
  TrendingUp,
  Sparkles,
  PieChart,
  Palette,
  Check,
} from 'lucide-react';
import * as Icons from 'lucide-react';
import CategoryColorPicker from './CategoryColorPicker.jsx';
import CategoryIconPicker from './CategoryIconPicker.jsx';
import CategoryRuleBuilder from './CategoryRuleBuilder.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import { toast } from 'react-toastify';

export const CategoryDetailPanel = ({
  category,
  categories = [],
  onEdit,
  onDuplicate,
  onDelete,
}) => {
  const [accentColor, setAccentColor] = useState(category?.color || '#6366F1');
  const [selectedIcon, setSelectedIcon] = useState(category?.icon_name || 'Tag');

  useEffect(() => {
    if (category) {
      setAccentColor(category.color || '#6366F1');
      setSelectedIcon(category.icon_name || 'Tag');
    }
  }, [category]);

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center h-full rounded-3xl border border-border-subtle bg-bg-surface p-12 text-center text-slate-400 space-y-3">
        <Tag className="w-12 h-12 text-slate-500" />
        <h4 className="text-base font-bold text-slate-900 dark:text-white font-outfit">
          No Category Selected
        </h4>
        <p className="text-xs text-slate-400 max-w-sm">
          Select a parent category or subcategory from the left taxonomy tree to inspect configurations and customize rule automations.
        </p>
      </div>
    );
  }

  const IconComp = Icons[selectedIcon] || Icons.Tag;
  const isIncome = category.category_type === 'INCOME';

  const handleSaveCustomization = () => {
    toast.success(`Updated styling for ${category.category_name}!`, { icon: '🎨' });
  };

  return (
    <div className="space-y-6">
      {/* Category Overview Card */}
      <div className="rounded-3xl border border-border-subtle bg-bg-surface p-6 shadow-glass space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            {/* Dynamic Icon Avatar Badge */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg transition-transform hover:scale-105"
              style={{ backgroundColor: accentColor }}
            >
              <IconComp className="w-7 h-7" />
            </div>

            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-outfit">
                  {category.category_name}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    isIncome ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary-500/10 text-primary-500'
                  }`}
                >
                  {category.category_type}
                </span>
                {category.parent_name && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                    ↳ Subcategory of {category.parent_name}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
                {category.description || 'Custom category for organizing personal financial ledger items.'}
              </p>
            </div>
          </div>

          {/* Quick Category Action Buttons */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => onEdit(category)}
              className="p-2.5 rounded-2xl border border-border-strong bg-bg-elevated hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
              title="Edit Category"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDuplicate(category.id)}
              className="p-2.5 rounded-2xl border border-border-strong bg-bg-elevated hover:bg-slate-200 dark:hover:bg-slate-800 text-indigo-400 text-xs font-bold transition-all"
              title="Duplicate Category"
            >
              <Copy className="w-4 h-4" />
            </button>
            {!category.is_default && (
              <button
                onClick={() => onDelete(category)}
                className="p-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold transition-all"
                title="Delete Category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Customization Controls: Color & Icon Picker */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border-subtle">
          <CategoryColorPicker selectedColor={accentColor} onSelectColor={setAccentColor} />
          <CategoryIconPicker selectedIcon={selectedIcon} onSelectIcon={setSelectedIcon} />
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveCustomization}
            className="px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold shadow-md transition-all flex items-center space-x-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Style Customizations</span>
          </button>
        </div>
      </div>

      {/* Dynamic Rule Builder Section */}
      <CategoryRuleBuilder selectedCategory={category} categories={categories} />
    </div>
  );
};

export default CategoryDetailPanel;
