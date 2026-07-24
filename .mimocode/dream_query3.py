import sqlite3, json, datetime

conn = sqlite3.connect(r'C:\Users\eliob\.local\share\mimocode\mimocode.db')
cur = conn.cursor()

project_id = 'ef20226d-0e36-402b-abe3-dcf193f973c1'
seven_days_ago = int((datetime.datetime.now() - datetime.timedelta(days=7)).timestamp() * 1000)

# Get parts for user messages to find actual content
print("=== User message parts (last 7 days) ===")
cur.execute("""
    SELECT m.session_id, m.id, 
           json_extract(p.data, '$.type') as part_type,
           substr(p.data, 1, 600) as preview,
           datetime(m.time_created/1000, 'unixepoch', 'localtime') as created
    FROM message m
    JOIN part p ON p.message_id = m.id
    JOIN session s ON s.id = m.session_id
    WHERE s.project_id = ?
      AND json_extract(m.data, '$.role') = 'user'
      AND m.time_created > ?
      AND json_extract(m.data, '$.agent') IS NULL
    ORDER BY m.time_created DESC
    LIMIT 30
""", (project_id, seven_days_ago))
for r in cur.fetchall():
    print(f"  [{r[0]}] {r[4]} type={r[2]}")
    print(f"    {r[3]}")
    print()

# Get error-containing tool results
print("\n=== Tool results with errors (last 7 days) ===")
cur.execute("""
    SELECT m.session_id, m.id,
           json_extract(p.data, '$.tool') as tool,
           substr(p.data, 1, 800) as preview,
           datetime(m.time_created/1000, 'unixepoch', 'localtime') as created
    FROM message m
    JOIN part p ON p.message_id = m.id
    JOIN session s ON s.id = m.session_id
    WHERE s.project_id = ?
      AND json_extract(m.data, '$.role') = 'assistant'
      AND json_extract(p.data, '$.type') = 'tool'
      AND m.time_created > ?
      AND (
        p.data LIKE '%error%'
        OR p.data LIKE '%Error%'
        OR p.data LIKE '%failed%'
        OR p.data LIKE '%FAILED%'
      )
    ORDER BY m.time_created DESC
    LIMIT 15
""", (project_id, seven_days_ago))
for r in cur.fetchall():
    print(f"  [{r[0]}] tool={r[2]} {r[4]}")
    print(f"    {r[3][:500]}")
    print()

# Get assistant text output (agent reasoning/decisions)
print("\n=== Assistant text parts (last 7 days) ===")
cur.execute("""
    SELECT m.session_id,
           substr(json_extract(p.data, '$.text'), 1, 600) as text,
           datetime(m.time_created/1000, 'unixepoch', 'localtime') as created
    FROM message m
    JOIN part p ON p.message_id = m.id
    JOIN session s ON s.id = m.session_id
    WHERE s.project_id = ?
      AND json_extract(m.data, '$.role') = 'assistant'
      AND json_extract(p.data, '$.type') = 'text'
      AND m.time_created > ?
      AND m.agent_id = ''
    ORDER BY m.time_created DESC
    LIMIT 20
""", (project_id, seven_days_ago))
for r in cur.fetchall():
    print(f"  [{r[0]}] {r[3]}")
    print(f"    {r[2]}")
    print()

conn.close()
