import sqlite3
conn = sqlite3.connect(r'C:\Users\eliob\.local\share\mimocode\mimocode.db')
cur = conn.cursor()

print("=== TABLES ===")
cur.execute("SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name")
for name, sql in cur.fetchall():
    print(f"\n--- {name} ---")
    if sql:
        print(sql)

print("\n\n=== RECENT SESSIONS (last 20) ===")
try:
    cur.execute("PRAGMA table_info(session)")
    cols = [r[1] for r in cur.fetchall()]
    print("Session columns:", cols)
    cur.execute("SELECT * FROM session ORDER BY rowid DESC LIMIT 20")
    for row in cur.fetchall():
        print(row)
except Exception as e:
    print(f"Error reading session: {e}")

conn.close()
