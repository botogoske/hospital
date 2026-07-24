import sqlite3, json, datetime

conn = sqlite3.connect(r'C:\Users\eliob\.local\share\mimocode\mimocode.db')
cur = conn.cursor()

project_id = 'ef20226d-0e36-402b-abe3-dcf193f973c1'
seven_days_ago = int((datetime.datetime.now() - datetime.timedelta(days=7)).timestamp() * 1000)

# Get all user messages for this project in last 7 days
print("=== All user messages (last 7 days) ===")
cur.execute("""
    SELECT m.id, m.session_id, json_extract(m.data, '$.role') as role,
           substr(json_extract(m.data, '$.content'), 1, 600) as content,
           datetime(m.time_created/1000, 'unixepoch', 'localtime') as created
    FROM message m
    JOIN session s ON s.id = m.session_id
    WHERE s.project_id = ?
      AND json_extract(m.data, '$.role') = 'user'
      AND m.time_created > ?
    ORDER BY m.time_created DESC
    LIMIT 30
""", (project_id, seven_days_ago))
for r in cur.fetchall():
    print(f"  [{r[1]}] {r[4]}")
    print(f"    {r[3]}")
    print()

# Check content field - maybe it's in a different JSON key
print("\n=== Check message data structure ===")
cur.execute("""
    SELECT data FROM message m
    JOIN session s ON s.id = m.session_id
    WHERE s.project_id = ?
      AND json_extract(m.data, '$.role') = 'user'
    ORDER BY m.time_created DESC
    LIMIT 3
""", (project_id,))
for r in cur.fetchall():
    d = json.loads(r[0])
    print(json.dumps(d, indent=2, ensure_ascii=False)[:500])
    print("---")

# Also check assistant messages for errors and decisions
print("\n=== Assistant tool calls in recent sessions ===")
cur.execute("""
    SELECT m.session_id, m.id, json_extract(p.data, '$.type') as part_type,
           json_extract(p.data, '$.tool') as tool,
           substr(p.data, 1, 500) as preview
    FROM message m
    JOIN part p ON p.message_id = m.id
    JOIN session s ON s.id = m.session_id
    WHERE s.project_id = ?
      AND json_extract(m.data, '$.role') = 'assistant'
      AND m.time_created > ?
      AND m.agent_id = ''
    ORDER BY m.time_created DESC
    LIMIT 20
""", (project_id, seven_days_ago))
for r in cur.fetchall():
    print(f"  [{r[0]}] type={r[2]} tool={r[3]}")
    print(f"    {r[4][:400]}")
    print()

conn.close()
