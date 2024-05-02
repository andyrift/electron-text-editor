CREATE TABLE IF NOT EXISTS [folders] (
  [id] INTEGER PRIMARY KEY AUTOINCREMENT, 
  [name] TEXT,
  [folder] INTEGER,
  FOREIGN KEY (folder) REFERENCES folders (id) ON DELETE SET NULL,
  CHECK (folder != id)
);

CREATE TABLE IF NOT EXISTS [pages] (
  [id] INTEGER PRIMARY KEY AUTOINCREMENT, 
  [title] TEXT,
  [last_saved] INTEGER NOT NULL,
  [deleted] INTEGER,
  [folder] INTEGER,
  FOREIGN KEY (folder) REFERENCES folders (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS [page_data] (
  [id] INTEGER PRIMARY KEY,
  [document] NOT NULL,
  [editor_state] NOT NULL,
  FOREIGN KEY (id) REFERENCES pages (id) ON DELETE CASCADE
);