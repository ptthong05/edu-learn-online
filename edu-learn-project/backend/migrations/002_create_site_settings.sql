-- Create site_settings table for customizable site name and branding
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY,
  site_name TEXT NOT NULL DEFAULT 'DRIVE MH',
  site_tagline TEXT DEFAULT 'Nền tảng học trực tuyến hàng đầu',
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT DEFAULT '#2563eb',
  secondary_color TEXT DEFAULT '#1e40af',
  updated_at TEXT NOT NULL
);

-- Insert default settings
INSERT OR IGNORE INTO site_settings (id, site_name, site_tagline, updated_at)
VALUES ('settings-main', 'DRIVE MH', 'Nền tảng học trực tuyến hàng đầu', datetime('now'));