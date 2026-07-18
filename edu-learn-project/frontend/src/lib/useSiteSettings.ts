'use client';

import { useState, useEffect } from 'react';

interface SiteSettings {
  id: string;
  site_name: string;
  site_tagline: string;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string;
  secondary_color: string;
  updated_at: string;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/site-settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      } else {
        setError('Failed to fetch site settings');
      }
    } catch (err) {
      setError('Error fetching site settings');
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading, error, refetch: fetchSettings };
}