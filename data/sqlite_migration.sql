-- SQLite migration script generated from JSON store
PRAGMA foreign_keys=OFF;

-- Schema (idempotent)
CREATE TABLE IF NOT EXISTS lists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  emoji TEXT,
  created_at TEXT
);
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  list_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  date TEXT,
  deadline TEXT,
  reminders TEXT,
  estimate TEXT,
  actual_time TEXT,
  labels TEXT,
  priority TEXT,
  subtasks TEXT,
  recurring TEXT,
  attachment TEXT,
  completed INTEGER,
  created_at TEXT,
  updated_at TEXT
);
CREATE TABLE IF NOT EXISTS subtasks (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  name TEXT NOT NULL,
  done INTEGER,
  created_at TEXT,
  updated_at TEXT
);
CREATE TABLE IF NOT EXISTS labels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT
);
CREATE TABLE IF NOT EXISTS task_labels (
  task_id TEXT NOT NULL,
  label_id TEXT NOT NULL,
  PRIMARY KEY (task_id, label_id)
);
CREATE TABLE IF NOT EXISTS reminders (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  when TEXT NOT NULL,
  type TEXT
);
CREATE TABLE IF NOT EXISTS logs (
  id TEXT PRIMARY KEY,
  task_id TEXT,
  action TEXT,
  timestamp TEXT,
  details TEXT
);
INSERT INTO lists (id, name, color, emoji, created_at) VALUES ('list_47ht126','Inbox','#3b82f6','📥','2025-12-17T09:26:21.784Z');
INSERT INTO lists (id, name, color, emoji, created_at) VALUES ('list_hn1zjo2','Inbox','#3b82f6','','2025-12-17T09:26:27.912Z');
INSERT INTO lists (id, name, color, emoji, created_at) VALUES ('list_x7ci2n2','Inbox','#3b82f6','📥','2025-12-17T09:26:27.918Z');
INSERT INTO lists (id, name, color, emoji, created_at) VALUES ('list_0typic8','Work','#10b981','','2025-12-17T09:26:27.919Z');
INSERT INTO lists (id, name, color, emoji, created_at) VALUES ('list_catp84f','Inbox','#3b82f6','','2025-12-17T09:26:56.942Z');
INSERT INTO lists (id, name, color, emoji, created_at) VALUES ('list_grlss6l','Inbox','#3b82f6','📥','2025-12-17T09:26:56.946Z');
INSERT INTO lists (id, name, color, emoji, created_at) VALUES ('list_o9h91rr','Work','#10b981','','2025-12-17T09:26:56.949Z');
INSERT INTO tasks (id, list_id, name, description, date, deadline, reminders, estimate, actual_time, labels, priority, subtasks, recurring, attachment, completed, created_at, updated_at) VALUES ('task_axwz50x','list_47ht126','Plan day','Outline today priorities','2025-12-17','','"[]"','','','"[]"','Medium','"[]"','','','0','2025-12-17T09:26:21.785Z','2025-12-17T09:26:21.785Z');
INSERT INTO tasks (id, list_id, name, description, date, deadline, reminders, estimate, actual_time, labels, priority, subtasks, recurring, attachment, completed, created_at, updated_at) VALUES ('task_r78fnrx','list_47ht126','Check emails','Inbox zero','2025-12-17','','"[]"','','','"[]"','Low','"[]"','','','0','2025-12-17T09:26:21.785Z','2025-12-17T09:26:21.785Z');
INSERT INTO tasks (id, list_id, name, description, date, deadline, reminders, estimate, actual_time, labels, priority, subtasks, recurring, attachment, completed, created_at, updated_at) VALUES ('task_ll2igqs','list_hn1zjo2','Test For Today','','2025-12-17','','"[]"','','','"[]"','None','"[]"','','','0','2025-12-17T09:26:27.913Z','2025-12-17T09:26:27.913Z');
INSERT INTO tasks (id, list_id, name, description, date, deadline, reminders, estimate, actual_time, labels, priority, subtasks, recurring, attachment, completed, created_at, updated_at) VALUES ('task_ipycmxh','','Lunch with Sarah','','','','"[]"','','','"[]"','None','"[]"','','','0','2025-12-17T09:26:27.914Z','2025-12-17T09:26:27.914Z');
INSERT INTO tasks (id, list_id, name, description, date, deadline, reminders, estimate, actual_time, labels, priority, subtasks, recurring, attachment, completed, created_at, updated_at) VALUES ('task_3su9hhw','','Sample Task','','','','"[]"','','','"[]"','None','"[]"','','','0','2025-12-17T09:26:27.918Z','2025-12-17T09:26:27.918Z');
INSERT INTO tasks (id, list_id, name, description, date, deadline, reminders, estimate, actual_time, labels, priority, subtasks, recurring, attachment, completed, created_at, updated_at) VALUES ('task_8bmlu25','list_0typic8','Review Q4 plan','','2025-12-17','','"[\"2025-12-17T09:26:27.919Z\"]"','','','"[{\"name\":\"Review\",\"icon\":\"📝\"},{\"name\":\"Calendar\",\"icon\":\"🗓️\"}]"','None','"[{\"name\":\"Prepare slides\",\"done\":false},{\"name\":\"Send invites\",\"done\":true}]"','','','0','2025-12-17T09:26:27.919Z','2025-12-17T09:26:27.919Z');
INSERT INTO tasks (id, list_id, name, description, date, deadline, reminders, estimate, actual_time, labels, priority, subtasks, recurring, attachment, completed, created_at, updated_at) VALUES ('task_z2tnaf5','list_catp84f','Test For Today','','2025-12-17','','"[]"','','','"[]"','None','"[]"','','','0','2025-12-17T09:26:56.943Z','2025-12-17T09:26:56.943Z');
INSERT INTO tasks (id, list_id, name, description, date, deadline, reminders, estimate, actual_time, labels, priority, subtasks, recurring, attachment, completed, created_at, updated_at) VALUES ('task_m9lqe74','','Lunch with Sarah','','','','"[]"','','','"[]"','None','"[]"','','','0','2025-12-17T09:26:56.943Z','2025-12-17T09:26:56.943Z');
INSERT INTO tasks (id, list_id, name, description, date, deadline, reminders, estimate, actual_time, labels, priority, subtasks, recurring, attachment, completed, created_at, updated_at) VALUES ('task_ilubh93','','Sample Task','','','','"[]"','','','"[]"','None','"[]"','','','0','2025-12-17T09:26:56.948Z','2025-12-17T09:26:56.948Z');
INSERT INTO tasks (id, list_id, name, description, date, deadline, reminders, estimate, actual_time, labels, priority, subtasks, recurring, attachment, completed, created_at, updated_at) VALUES ('task_l7pa4vc','list_o9h91rr','Review Q4 plan','','2025-12-17','','"[\"2025-12-17T09:26:56.949Z\"]"','','','"[{\"name\":\"Review\",\"icon\":\"📝\"},{\"name\":\"Calendar\",\"icon\":\"🗓️\"}]"','None','"[{\"name\":\"Prepare slides\",\"done\":false},{\"name\":\"Send invites\",\"done\":true}]"','','','0','2025-12-17T09:26:56.949Z','2025-12-17T09:26:56.949Z');
INSERT INTO subtasks (id, task_id, name, done, created_at, updated_at) VALUES ('sub_7x07zp2','task_8bmlu25','Prepare slides','0','2025-12-17T09:26:27.919Z','2025-12-17T09:26:27.919Z');
INSERT INTO subtasks (id, task_id, name, done, created_at, updated_at) VALUES ('sub_97kaqoq','task_8bmlu25','Send invites','1','2025-12-17T09:26:27.919Z','2025-12-17T09:26:27.919Z');
INSERT INTO subtasks (id, task_id, name, done, created_at, updated_at) VALUES ('sub_c53p69r','task_l7pa4vc','Prepare slides','0','2025-12-17T09:26:56.949Z','2025-12-17T09:26:56.949Z');
INSERT INTO subtasks (id, task_id, name, done, created_at, updated_at) VALUES ('sub_x6p9ubi','task_l7pa4vc','Send invites','1','2025-12-17T09:26:56.949Z','2025-12-17T09:26:56.949Z');
INSERT INTO labels (id, name, icon, color) VALUES ('label_bstjdq3','Review','📝','');
INSERT INTO labels (id, name, icon, color) VALUES ('label_axkws4a','Calendar','🗓️','');
INSERT INTO reminders (id, task_id, when, type) VALUES ('rem_bdydwp5','task_l7pa4vc','2025-12-17T09:26:56.949Z','');

COMMIT;