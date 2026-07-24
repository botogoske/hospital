import sqlite3, json, datetime

conn = sqlite3.connect(r'C:\Users\eliob\.local\share\mimocode\mimocode.db')
cur = conn.cursor()

project_id = 'ef20226d-0e36-402b-abe3-dcf193f973c1'
seven_days_ago = int((datetime.datetime.now() - datetime.timedelta(days=7)).timestamp() * 1000)

# Check actual user messages - look at the 'agent' field in user messages
print("=== User messages - check agent field ===")
cur.execute("""
    SELECT m.session_id, 
           json_extract(m.data, '$.agent') as agent,
           substr(p.data, 1, 800) as part_data,
           datetime(m.time_created/1000, 'unixepoch', 'localtime') as created
    FROM message m
    JOIN part p ON p.message_id = m.id
    JOIN session s ON s.id = m.session_id
    WHERE s.project_id = ?
      AND json_extract(m.data, '$.role') = 'user'
      AND m.time_created > ?
      AND json_extract(p.data, '$.type') = 'text'
    ORDER BY m.time_created DESC
    LIMIT 20
""", (project_id, seven_days_ago))
for r in cur.fetchall():
    print(f"  [{r[0]}] agent={r[1]} {r[3]}")
    print(f"    {r[2]}")
    print()

# Check all write/edit tool calls to understand what code was changed
print("\n=== Write/Edit tool calls (last 7 days, main agent only) ===")
cur.execute("""
    SELECT m.session_id,
           json_extract(p.data, '$.tool') as tool,
           substr(json_extract(json_extract(p.data, '$.state'), '$.input.file_path'), 1, 200) as filepath,
           datetime(m.time_created/1000, 'unixepoch', 'localtime') as created
    FROM message m
    JOIN part p ON p.message_id = m.id
    JOIN session s ON s.id = m.session_id
    WHERE s.project_id = ?
      AND json_extract(m.data, '$.role') = 'assistant'
      AND json_extract(p.data, '$.type') = 'tool'
      AND json_extract(p.data, '$.tool') IN ('write', 'edit')
      AND json_extract(m.data, '$.agent_id') = ''
      AND m.time_created > ?
    ORDER BY m.time_created DESC
    LIMIT 30
""", (project_id, seven_days_ago))
for r in cur.fetchall():
    print(f"  [{r[0]}] {r[1]} {r[2]} {r[3]}")

conn.close()
