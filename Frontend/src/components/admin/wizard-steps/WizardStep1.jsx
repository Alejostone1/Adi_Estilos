import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronRight, ChevronLeft, Check, Layers, Tag as TagIcon, ArrowLeft } from 'lucide-react';
import { categoriasApi } from '../../../api/categoriasApi';
import { motion, AnimatePresence } from 'framer-motion';

const WizardStep1 = ({ formData, onUpdateFormData }) => {
  const [allCategorias, setAllCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryStep, setCategoryStep] = useState('parents'); // 'parents' or 'subcategories'
  const [selectedParent, setSelectedParent] = useState(null);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        setLoading(true);
        const response = await categoriasApi.obtenerTodasLasCategorias();
        const data = response.datos || response.data || response || [];
        setAllCategorias(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategorias();
  }, []);

  // 1. Filtrar estrictamente categorías PADRE (no tienen padre asignado)
  const parents = useMemo(() => 
    allCategorias.filter(cat => cat.categoriaPadre === null || !cat.categoriaPadre),
  [allCategorias]);

  // 2. Filtrar estrictamente categorías HIJAS del padre seleccionado
  const subcategories = useMemo(() => {
    if (!selectedParent) return [];
    return allCategorias.filter(cat => String(cat.categoriaPadre) === String(selectedParent.idCategoria));
  }, [allCategorias, selectedParent]);

  // Manejo de edición: Si ya hay un idCategoria, intentar posicionar el wizard
  useEffect(() => {
    if (formData.idCategoria && allCategorias.length > 0 && categoryStep === 'parents') {
      const current = allCategorias.find(c => String(c.idCategoria) === String(formData.idCategoria));
      if (current) {
        if (current.categoriaPadre) {
          const parent = allCategorias.find(p => String(p.idCategoria) === String(current.categoriaPadre));
          if (parent) {
            setSelectedParent(parent);
            setCategoryStep('subcategories');
          }
        }
      }
    }
  }, [allCategorias, formData.idCategoria]);

  const handleSelectParent = (parent) => {
    const hijos = allCategorias.filter(c => String(c.categoriaPadre) === String(parent.idCategoria));
    
    if (hijos.length > 0) {
      // Si tiene hijos, avanzamos a la vista de subcategorías
      setSelectedParent(parent);
      setCategoryStep('subcategories');
      setSearchQuery('');
    } else {
      // Si es una categoría final (aunque sea padre), la seleccionamos
      setSelectedParent(null);
      onUpdateFormData({ idCategoria: parent.idCategoria });
    }
  };

  const handleSelectSubcategory = (sub) => {
    onUpdateFormData({ idCategoria: sub.idCategoria });
  };

  const itemsToDisplay = useMemo(() => {
    const source = categoryStep === 'parents' ? parents : subcategories;
    return source.filter(cat => 
      cat.nombreCategoria.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categoryStep, parents, subcategories, searchQuery]);

  const currentCategoryName = useMemo(() => 
    allCategorias.find(c => String(c.idCategoria) === String(formData.idCategoria))?.nombreCategoria,
  [allCategorias, formData.idCategoria]);

  return (
    <div className="space-y-8 max-w-xl mx-auto">
      {/* Header Informativo */}
      <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 flex-shrink-0">
           <Layers size={20} />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Configuración de Catálogo</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Navega por los grupos principales para encontrar la subcategoría específica de este producto.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Identidad */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Nombre *</label>
            <input
              type="text"
              value={formData.nombreProducto || ''}
              onChange={(e) => onUpdateFormData({ nombreProducto: e.target.value })}
              placeholder="Ej: Pijama Mujer"
              className="w-full px-6 py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-indigo-500 outline-none text-sm font-semibold transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Referencia *</label>
            <input
              type="text"
              value={formData.codigoReferencia || ''}
              onChange={(e) => onUpdateFormData({ codigoReferencia: e.target.value.toUpperCase() })}
              placeholder="REF-001"
              className="w-full px-6 py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-indigo-500 outline-none text-sm font-semibold transition-all uppercase"
            />
          </div>
        </div>

        {/* Selector Maestro */}
        <div className="space-y-4 pt-6 mt-6 border-t border-slate-50 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
               {categoryStep === 'subcategories' && (
                 <button 
                  onClick={() => { setCategoryStep('parents'); setSelectedParent(null); setSearchQuery(''); }}
                  className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-indigo-500 hover:text-white rounded-xl transition-all"
                  title="Volver a Grupos"
                 >
                   <ArrowLeft size={14} />
                 </button>
               )}
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                 {categoryStep === 'parents' ? 'Selecciona un Grupo' : `Subcategorías de ${selectedParent?.nombreCategoria}`}
               </label>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={categoryStep === 'parents' ? "Buscar grupo (Mujer, Hombre...)" : "Buscar subcategoría..."}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm font-semibold transition-all"
            />
          </div>

          {/* Selección Actual Destacada */}
          {formData.idCategoria && (
            <div className="flex items-center gap-2 px-4 py-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
              <Check size={14} className="text-indigo-500" />
              <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest"> Seleccionado: {currentCategoryName}</p>
            </div>
          )}

          {/* Listado Puro */}
          <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar p-1">
            {loading ? (
              <div className="py-12 text-center text-slate-400 font-bold text-[10px] uppercase tracking-widest animate-pulse">Sincronizando Catálogo...</div>
            ) : itemsToDisplay.length > 0 ? (
              itemsToDisplay.map((cat) => {
                const isSelected = String(formData.idCategoria) === String(cat.idCategoria);
                const isCurrentParent = String(selectedParent?.idCategoria) === String(cat.idCategoria);
                
                return (
                  <button
                    key={cat.idCategoria}
                    onClick={() => categoryStep === 'parents' ? handleSelectParent(cat) : handleSelectSubcategory(cat)}
                    className={`
                      flex items-center justify-between p-4 rounded-2xl transition-all border-2
                      ${isSelected || isCurrentParent
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                        : 'bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-100 dark:hover:border-slate-700'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isSelected || isCurrentParent ? 'bg-white/20' : 'bg-slate-50 dark:bg-slate-800'}`}>
                        {categoryStep === 'parents' ? <Layers size={14} /> : <TagIcon size={14} />}
                      </div>
                      <span className="text-sm font-bold">{cat.nombreCategoria}</span>
                    </div>
                    {categoryStep === 'parents' && allCategorias.some(c => String(c.categoriaPadre) === String(cat.idCategoria)) && (
                      <ChevronRight size={14} className={isCurrentParent ? 'text-white' : 'text-slate-300'} />
                    )}
                    {isSelected && <Check size={16} className="text-white" />}
                  </button>
                );
              })
            ) : (
              <div className="py-16 text-center text-slate-400 text-xs font-bold uppercase tracking-widest italic">No hay resultados en esta búsqueda</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WizardStep1;
