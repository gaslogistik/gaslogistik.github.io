import json
import os
from pathlib import Path
from datetime import date

import pandas as pd
import requests

TOKEN = os.environ["TELEGRAM_BOT_TOKEN"]
CHAT_ID = os.environ["TELEGRAM_CHAT_ID"]

STATE_FILE = ".adr_notifications.json"
EXCEL_FILE = "databank.xlsx"

def load_state():
    if Path(STATE_FILE).exists():
        with open(STATE_FILE,"r",encoding="utf-8") as f:
            return json.load(f)
    return {}

def save_state(state):
    with open(STATE_FILE,"w",encoding="utf-8") as f:
        json.dump(state,f,indent=2)

def send(msg):
    requests.post(
        f"https://api.telegram.org/bot{TOKEN}/sendMessage",
        json={"chat_id": CHAT_ID, "text": msg},
        timeout=30
    )

today = date.today()
state = load_state()

for sheet in ["TRUCKS","TANKTRAILERS"]:
    try:
        df = pd.read_excel(EXCEL_FILE, sheet_name=sheet)
    except Exception:
        continue

    for _, row in df.iterrows():
        if pd.isna(row.get("ADR VALID")):
            continue

        adr = pd.to_datetime(row["ADR VALID"]).date()
        days = (adr - today).days

        if days == 21:
            event = "21 DAYS"
        elif days == 7:
            event = "7 DAYS"
        elif days == 0:
            event = "TODAY"
        elif days == -1:
            event = "EXPIRED"
        else:
            continue

        plate = str(row.get("PLATES","")).strip()
        model = str(row.get("MODEL","")).strip()

        key = f"{plate}_{adr}_{event}"

        if key in state:
            continue

        msg = f"""🔔 ADR REMINDER

Status: {event}
Plate: {plate}
Model: {model}
Type: {sheet}
ADR valid until: {adr}
Remaining days: {days}
"""
        send(msg)
        state[key] = True

save_state(state)
