import sqlite3, json, datetime

conn = sqlite3.connect(r'C:\Users\eliob\.local\share\mimocode\mimocode.db')
cur = conn.cursor()

project_id = 'ef20226d-0e36-402b-abe3-dcf193f973c1'
seven_days_ago = int((datetime.datetime.now() - datetime.timedelta(days=7)).timestamp() * 1000)

# Check write/edit calls without agent_id filter
print("=== Write/Edit calls (no agent filter) ===")
cur.execute("""
    SELECT m.session_id,
           json_extract(m.data, '$.agent_id') as agent_id,
           json_extract(p.data, '$.tool') as tool,
           substr(json_extract(json_extract(p.data, '$.state'), '$.input'), 1, 400) as input_preview,
           datetime(m.time_created/1000, 'unixepoch', 'localtime') as created
    FROM message m
    JOIN part p ON p.message_id = m.id
    JOIN session s ON s.id = m.session_id
    WHERE s.project_id = ?
      AND json_extract(m.data, '$.role') = 'assistant'
      AND json_extract(p.data, '$.type') = 'tool'
      AND json_extract(p.data, '$.tool') IN ('write', 'edit')
      AND m.time_created > ?
    ORDER BY m.time_created DESC
    LIMIT 40
""", (project_id, seven_days_ago))
for r in cur.fetchall():
    print(f"  [{r[0]}] agent={r[1]} {r[2]} {r[4]}")
    print(f"    {r[3]}")
    print()

# Check what sessions had user text (non-synthetic)
print("\n=== Non-synthetic user messages ===")
cur.execute("""
    SELECT m.session_id,
           json_extract(m.data, '$.agent') as agent,
           json_extract(p.data, '$.text') as text,
           datetime(m.time_created/1000, 'unixepoch', 'localtime') as created
    FROM message m
    JOIN part p ON p.message_id = m.id
    JOIN session s ON s.id = m.session_id
    WHERE s.project_id = ?
      AND json_extract(m.data, '$.role') = 'user'
      AND json_extract(p.data, '$.synthetic') IS NULL
      AND m.time_created > ?
    ORDER BY m.time_created DESC
    LIMIT 20
""", (project_id, seven_days_ago))
for r in cur.fetchall():
    if r[1] == 'build':
        print(f"  [{r[0]}] {r[3]}")
        print(f"    {r[2][:300]}")
        print()

conn.close()
