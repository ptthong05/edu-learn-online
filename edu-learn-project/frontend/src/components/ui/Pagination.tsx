'use client';
import React from 'react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number | ((prev: number) => number)) => void;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div
      className={`flex justify-between items-center px-6 py-4 bg-gray-950/40 border-t border-gray-800 text-xs ${className}`}
    >
      <p className="text-gray-400">
        Hiển thị trang <span className="font-semibold text-white">{currentPage}</span> trên{' '}
        <span className="font-semibold text-white">{totalPages}</span>
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange((p: number) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1.5 rounded-lg border border-gray-800 bg-gray-900 text-gray-300 hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-gray-900 transition font-bold"
        >
          Trước
        </button>
        <button
          type="button"
          onClick={() => onPageChange((p: number) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 rounded-lg border border-gray-800 bg-gray-900 text-gray-300 hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-gray-900 transition font-bold"
        >
          Sau
        </button>
      </div>
    </div>
  );
}
