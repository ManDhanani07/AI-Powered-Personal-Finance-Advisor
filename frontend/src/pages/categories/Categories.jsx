import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Tag, Loader2, Layers, Cpu, Check } from 'lucide-react';
import { toast } from 'react-toastify';

import { PageContainer } from '../../components/layout/PageContainer.jsx';
import categoryService from '../../services/categoryService.js';

import CategoryTreeAccordion from '../../components/categories/CategoryTreeAccordion.jsx';
import CategoryDetailPanel from '../../components/categories/CategoryDetailPanel.jsx';
import CategoryForm from '../../components/categories/CategoryForm.jsx';
import DeleteCategoryModal from '../../components/categories/DeleteCategoryModal.jsx';

export const Categories = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await categoryService.getCategories();
      if (res?.data) {
        setCategories(res.data);
        if (res.data.length > 0 && !selectedCategory) {
          setSelectedCategory(res.data[0]);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load categories.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleDuplicate = async (id) => {
    try {
      await categoryService.duplicateCategory(id);
      toast.success('Category duplicated successfully!', { icon: '📋' });
      loadCategories();
    } catch (err) {
      toast.error(err.message || 'Failed to duplicate category.');
    }
  };

  return (
    <PageContainer
      title="Category Taxonomy & Rule Engine"
      description="Organize category hierarchies and configure automated regex and keyword categorization rules."
      action={
        <button
          onClick={() => {
            setEditingCategory(null);
            setIsFormOpen(true);
          }}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      }
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          <p className="text-xs font-semibold text-slate-400">Loading taxonomy hierarchy...</p>
        </div>
      ) : (
        /* Master-Detail Split Canvas: Left 35% / Right 65% */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel (35% / 4 Cols on 12-grid) */}
          <div className="lg:col-span-4 h-full">
            <CategoryTreeAccordion
              categories={categories}
              selectedCategoryId={selectedCategory?.id}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
              onAddCategory={() => {
                setEditingCategory(null);
                setIsFormOpen(true);
              }}
            />
          </div>

          {/* Right Panel (65% / 8 Cols on 12-grid) */}
          <div className="lg:col-span-8">
            <CategoryDetailPanel
              category={selectedCategory}
              categories={categories}
              onEdit={(cat) => {
                setEditingCategory(cat);
                setIsFormOpen(true);
              }}
              onDuplicate={handleDuplicate}
              onDelete={(cat) => {
                setDeletingCategory(cat);
                setIsDeleteOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Category Creation / Editing Modal */}
      <CategoryForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={editingCategory}
        categories={categories}
        onSuccess={loadCategories}
      />

      {/* Delete Category Confirmation Modal */}
      <DeleteCategoryModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        category={deletingCategory}
        onSuccess={() => {
          setSelectedCategory(null);
          loadCategories();
        }}
      />
    </PageContainer>
  );
};

export default Categories;
