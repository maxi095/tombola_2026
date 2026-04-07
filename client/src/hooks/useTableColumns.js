import { useState, useEffect, useCallback } from "react";

/**
 * useTableColumns - Elite 2026 Layout Controller (v17.1) 🏹⚖️✨💎🚀
 * Gestiona el estado de las columnas de una tabla con persistencia y 
 * blindaje de posición para elementos críticos.
 * 
 * @param {string} pageKey - Identificador único de la página (p/ LocalStorage)
 * @param {Array} initialColumns - Definición inicial [{ id, label, isMandatory, isFixed }]
 */
export const useTableColumns = (pageKey, initialColumns) => {
  const storageKey = `tombola_cols_${pageKey}`;

  // Función auxiliar para ordenar (Forzar isFixed al final) ⚓
  const enforceFixedOrder = (cols) => {
    const normal = cols.filter(c => !c.isFixed);
    const fixed = cols.filter(c => c.isFixed);
    return [...normal, ...fixed];
  };

  // Cargar estado inicial desde LocalStorage o usar el default
  const [columns, setColumns] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    
    if (!saved) {
      return enforceFixedOrder(initialColumns.map(col => ({ ...col, isVisible: true })));
    }

    try {
      const parsed = JSON.parse(saved);
      // Sincronizar con posibles cambios en el código (nuevas columnas)
      const merged = initialColumns.map(baseCol => {
        const savedCol = parsed.find(c => c.id === baseCol.id);
        return {
          ...baseCol,
          isVisible: savedCol ? savedCol.isVisible : true,
        };
      });

      // Ordenar según el guardado
      const sorted = merged.sort((a, b) => {
        const indexA = parsed.findIndex(c => c.id === a.id);
        const indexB = parsed.findIndex(c => c.id === b.id);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });

      // BLINDAJE FINAL v17.1: Forzar isFixed al final 🛡️
      return enforceFixedOrder(sorted);
    } catch (e) {
      return enforceFixedOrder(initialColumns.map(col => ({ ...col, isVisible: true })));
    }
  });

  // Guardar en LocalStorage cada vez que cambie 🧠
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(columns));
  }, [columns, storageKey]);

  // TOGGLE VISIBILIDAD 👁️
  const toggleVisibility = useCallback((id) => {
    setColumns(prev => prev.map(col => {
      if (col.id === id && !col.isMandatory) {
        return { ...col, isVisible: !col.isVisible };
      }
      return col;
    }));
  }, []);

  // REORDENAR (UP / DOWN) ↕️
  const moveColumn = useCallback((id, direction) => {
    setColumns(prev => {
      const index = prev.findIndex(c => c.id === id);
      if (index === -1) return prev;

      const newCols = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;

      // Límites y reglas de columnas fijas 🔒
      if (targetIndex < 0 || targetIndex >= newCols.length) return prev;
      
      // Prohibir mover una columna fija o saltar sobre una fija
      if (newCols[index].isFixed || newCols[targetIndex].isFixed) {
        console.warn("🚫 Intento de mover columna fija bloqueado por v17.1");
        return prev;
      }

      // Swap
      [newCols[index], newCols[targetIndex]] = [newCols[targetIndex], newCols[index]];
      return newCols;
    });
  }, []);

  // RESET 🧹
  const resetColumns = useCallback(() => {
    setColumns(enforceFixedOrder(initialColumns.map(col => ({ ...col, isVisible: true }))));
  }, [initialColumns]);

  return {
    columns,
    visibleColumns: columns.filter(c => c.isVisible),
    toggleVisibility,
    moveColumn,
    resetColumns
  };
};
