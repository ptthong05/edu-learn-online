import { useState, useEffect, useCallback, useRef } from 'react';

interface UseInfiniteScrollOptions<T> {
  fetchPage: (page: number, limit: number) => Promise<{ data: T[]; pagination: { totalPages: number } }>;
  limit?: number;
}

export function useInfiniteScroll<T>({ fetchPage, limit = 16 }: UseInfiniteScrollOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const loadPage = useCallback(async (pageNum: number, reset: boolean = false) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchPage(pageNum, limit);
      
      if (reset) {
        setItems(response.data);
      } else {
        setItems(prev => [...prev, ...response.data]);
      }
      
      setTotalPages(response.pagination.totalPages);
      setHasMore(pageNum < response.pagination.totalPages);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  }, [fetchPage, limit, loading]);

  // Load initial data
  useEffect(() => {
    loadPage(1, true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Infinite scroll observer
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadPage(page + 1, false);
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, page, loadPage]);

  const reset = useCallback(() => {
    setItems([]);
    setPage(1);
    setTotalPages(1);
    setHasMore(true);
    setError(null);
    loadPage(1, true);
  }, [loadPage]);

  const refresh = useCallback(() => {
    loadPage(1, true);
  }, [loadPage]);

  return {
    items,
    loading,
    error,
    hasMore,
    loadMoreRef,
    reset,
    refresh,
  };
}