from telethon import TelegramClient
import json
import os

# === YOUR TELEGRAM API CREDENTIALS ===
api_id = '20471322'  # <-- YOUR API ID HERE
api_hash = '9dbcf3ccae7f474d24a88a84797d8fc3'  # <-- YOUR API HASH HERE
session_name = 'stackedinfo'

# === CHANNELS TO SCRAPE ===
CHANNELS = [
    'remarks',
    'WatcherGuru',
    'coinmarket',
    'SolidIntelX',
    'startups',
    'investigations',
    'bricsnews'
]

N_MESSAGES = 5  # How many recent messages per channel

EXPORT_DIR = 'exports'
EXPORT_FILE = os.path.join(EXPORT_DIR, 'news.json')

client = TelegramClient(session_name, api_id, api_hash)

def load_existing():
    """Load already-saved messages (by unique channel+id)"""
    if not os.path.exists(EXPORT_FILE):
        return []
    with open(EXPORT_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def message_key(msg):
    """A unique key for each message (channel, id)"""
    return f"{msg['channel']}:{msg['id']}"

async def main():
    os.makedirs(EXPORT_DIR, exist_ok=True)
    existing = load_existing()
    existing_keys = set(message_key(m) for m in existing)
    all_messages = existing.copy()

    new_count = 0
    for channel in CHANNELS:
        print(f"Fetching from {channel}...")
        async for message in client.iter_messages(channel, limit=N_MESSAGES):
            if message.text:
                msg = {
                    'channel': channel,
                    'id': message.id,
                    'date': str(message.date),
                    'text': message.text.strip(),
                    'sender_id': message.sender_id
                }
                key = message_key(msg)
                if key not in existing_keys:
                    all_messages.append(msg)
                    existing_keys.add(key)
                    new_count += 1
                    print(f"  [NEW] {channel} | {msg['date']} | {msg['text'][:60]}{'...' if len(msg['text'])>60 else ''}")
                else:
                    print(f"  [SKIP] {channel} | {message.id} already saved.")

    with open(EXPORT_FILE, 'w', encoding='utf-8') as f:
        json.dump(all_messages, f, indent=2, ensure_ascii=False)

    print(f"Added {new_count} new messages. Total: {len(all_messages)}")
    print(f"Exported to {EXPORT_FILE}")

with client:
    client.loop.run_until_complete(main())
