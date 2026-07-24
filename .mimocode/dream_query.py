import sqlite3, json, datetime

conn = sqlite3.connect(r'C:\Users\eliob\.local\share\mimocode\mimocode.db')
cur = conn.cursor()

# Find current project id by worktree
cur.execute("SELECT id, worktree, name FROM project WHERE worktree LIKE '%hospital%' ORDER BY time_created DESC")
projects = cur.fetchall()
print("=== Hospital-related projects ===")
for p in projects:
    print(p)

# For the main project, list all sessions (parent only) in last 7 days
project_id = 'ef20226d-0e36-402b-abe3-dcf193f973c1'
seven_days_ago = int((datetime.datetime.now() - datetime.timedelta(days=7)).timestamp() * 1000)

print(f"\n=== Parent sessions for {project_id} (last 7 days) ===")
cur.execute("""
    SELECT id, title, datetime(time_created/1000, 'unixepoch', 'localtime') as created,
           summary_additions, summary_deletions, summary_files
    FROM session 
    WHERE project_id=? AND parent_id IS NULL AND time_created > ?
    ORDER BY time_created DESC
""", (project_id, seven_days_ago))
for r in cur.fetchall():
    print(f"  {r[0]} | {r[1][:80]} | {r[2]} | +{r[3]}/-{r[4]} ({r[5]} files)")

# List messages with user statements containing keywords
print("\n=== User messages with decision/rule keywords ===")
cur.execute("""
    SELECT m.id, m.session_id, substr(json_extract(m.data, '$.content'), 1, 500)
    FROM message m
    JOIN session s ON s.id = m.session_id
    WHERE s.project_id = ?
      AND json_extract(m.data, '$.role') = 'user'
      AND m.time_created > ?
      AND (
        json_extract(m.data, '$.content') LIKE '%always%'
        OR json_extract(m.data, '$.content') LIKE '%never%'
        OR json_extract(m.data, '$.content') LIKE '%remember%'
        OR json_extract(m.data, '$.content') LIKE '%rule%'
        OR json_extract(m.data, '$.content') LIKE '%decision%'
        OR json_extract(m.data, '$.content') LIKE '%decid%'
        OR json_extract(m.data, '$.content') LIKE '%workflow%'
        OR json_extract(m.data, '$.content') LIKE '%prefer%'
      )
    ORDER BY m.time_created DESC
    LIMIT 30
""", (project_id, seven_days_ago))
for r in cur.fetchall():
    print(f"  [{r[1]}] {r[2][:300]}")
    print()

conn.close()
