import json
import os
from datetime import datetime
from pathlib import Path

import pandas as pd
import requests

TOKEN = os.environ["TELEGRAM_BOT_TOKEN"]
CHAT_ID = os.environ["TELEGRAM_CHAT_ID"]

EXCEL_FILE = "databank.xlsx"
STATE_FILE = ".adr_notifications.json"

SHEETS = ["TRUCKS", "TANKTRAILERS"]

def load_state():
if not Path(STATE_FILE).exists():
return {}

with open(STATE_FILE, "r", encoding="utf-8") as f:
    return json.load(f)

def save_state(state):
with open(STATE_FILE, "w", encoding="utf-8") as f:
json.dump(state, f, indent=2)

def send_telegram(message):
url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"

requests.post(
    url,
    json={
        "chat_id": CHAT_ID,
        "text": message
    },
    timeout=30
)

today = datetime.utcnow().date()

state = load_state()

for sheet in SHEETS:

df = pd.read_excel(EXCEL_FILE, sheet_name=sheet)

for _, row in df.iterrows():

    if pd.isna(row.get("ADR VALID")):
        continue

    adr_date = pd.to_datetime(row["ADR VALID"]).date()

    plate = str(row.get("PLATES", "")).strip()
    model = str(row.get("MODEL", "")).strip()

    days = (adr_date - today).days

    if days == 21:
        event = "21"

    elif days == 7:
        event = "7"

    elif days == 0:
        event = "TODAY"

    elif days == -1:
        event = "EXPIRED"

    else:
        continue

    key = f"{plate}_{adr_date}_{event}"

    if key in state:
        continue

    message = f"""

🔔 ADR REMINDER

Status: {event}

Vehicle:
{plate}

Type:
{sheet}

Model:
{model}

ADR valid until:
{adr_date}

Remaining:
{days} days
""".strip()

    send_telegram(message)

    state[key] = True

save_state(state)
