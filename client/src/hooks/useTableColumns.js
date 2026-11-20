import { useState, useEffect, useCallback, useMemo } from "react";

const enforceFixedOrder = (cols) => {
  const normal = cols.filter((c) => !c.isFixed);
  const fixed = cols.filter((c) => c.isFixed);
  return [...normal, ...fixed];
};

/**
 * useTableColumns - Layout Controller
 * Gestiona visibilidad, orden y persistencia segura en localStorage de columnas de tabla.
 */
export const useTableColumns = (pageKey, initialColumns) => {
  const storageKey = `tombola_cols_${pageKey}`;

  const [columns, setColumns] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) {
        return enforceFixedOrder(initialColumns.map((col) => ({ ...col, isVisible: true })));
      }

      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) {
        return enforceFixedOrder(initialColumns.map((col) => ({ ...col, isVisible: true })));
      }

      const merged = initialColumns.map((baseCol) => {
        const savedCol = parsed.find((c) => c.id === baseCol.id);
        return {
          ...baseCol,
          isVisible: savedCol ? Boolean(savedCol.isVisible) : true,
        };
      });

      const sorted = merged.sort((a, b) => {
        const indexA = parsed.findIndex((c) => c.id === a.id);
        const indexB = parsed.findIndex((c) => c.id === b.id);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });

      return enforceFixedOrder(sorted);
    } catch {
      return enforceFixedOrder(initialColumns.map((col) => ({ ...col, isVisible: true })));
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(columns));
    } catch {
      // Ignorar errores de cuota o modo privado
    }
  }, [columns, storageKey]);

  const toggleVisibility = useCallback((id) => {
    setColumns((prev) =>
      prev.map((col) => {
        if (col.id === id && !col.isMandatory) {
          return { ...col, isVisible: !col.isVisible };
        }
        return col;
      })
    );
  }, []);

  const moveColumn = useCallback((id, direction) => {
    setColumns((prev) => {
      const index = prev.findIndex((c) => c.id === id);
      if (index === -1) return prev;

      const newCols = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= newCols.length) return prev;
      if (newCols[index].isFixed || newCols[targetIndex].isFixed) return prev;

      [newCols[index], newCols[targetIndex]] = [newCols[targetIndex], newCols[index]];
      return newCols;
    });
  }, []);

  const resetColumns = useCallback(() => {
    setColumns(enforceFixedOrder(initialColumns.map((col) => ({ ...col, isVisible: true }))));
  }, [initialColumns]);

  const visibleColumns = useMemo(() => columns.filter((c) => c.isVisible), [columns]);

  return {
    columns,
    visibleColumns,
    toggleVisibility,
    moveColumn,
    resetColumns,
  };
};
