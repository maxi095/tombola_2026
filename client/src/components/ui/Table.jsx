import React from "react";

/**
 * Table Components - Premium 2026 v3 (Navy Alignment)
 * Unidades atómicas para la construcción de grillas de datos profesionales.
 */

export const Table = ({ children, className = "" }) => (
  <div className={`overflow-x-auto ${className}`}>
    <table className="w-full text-left border-collapse min-w-[800px]">
      {children}
    </table>
  </div>
);

export const THead = ({ children }) => (
  <thead>
    <tr className="bg-slate-50/50 border-b border-slate-100">
      {children}
    </tr>
  </thead>
);

export const TBody = ({ children }) => (
  <tbody className="divide-y divide-slate-50">
    {children}
  </tbody>
);

export const TH = ({ children, className = "" }) => (
  <th className={`px-8 py-6 text-[11px] font-black text-muted uppercase tracking-[0.2em] ${className}`}>
    {children}
  </th>
);

export const TD = ({ children, className = "" }) => (
  <td className={`px-8 py-6 ${className}`}>
    {children}
  </td>
);
