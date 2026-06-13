import dotenv
import os
import random
import math
import datetime
from zoneinfo import ZoneInfo
from pymongo import MongoClient
import pandas as pd

dotenv.load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../.env"))
client = MongoClient(os.getenv("ATLAS_URI"))
database = client["IFT3225"]

MTL = ZoneInfo("America/Montreal")

locations = ["IGA Marché Tellier Sainte Dorothee"]


# # Profil sonore type sur 24h (heure locale): calme la nuit, fort l'apres-midi.
# # Creux vers 2h (~40 dB), pic vers 14h (~66 dB). On est oblige de faire ca, car sans cette variation par heure,
# # toutes les heures auraient la meme moyenne et quiet-hours ne montrerait rien.
# def db_pour_heure(h):
#     return 53 + 13 * math.sin(2 * math.pi * (h - 8) / 24)


# --- Clés
coll = database["locations"]
print("Debut generation des locations")
for loc in locations:
    if coll.find_one({"location": loc}) is None:
        coll.insert_one({"location": loc})
print("Fin generation des locations")

# --- Devices
coll = database["devices"]
print("Debut generation des devices")
for i in range(len(locations)):
    api_key = f"seed-key-{i + 1}"
    if coll.find_one({"apiKey": api_key}) is None:
        coll.insert_one({"apiKey": api_key, "name": f"device{i + 1}", "location": locations[i]})



mes1 = pd.read_csv(os.path.join(os.path.dirname(__file__), "../src/data/measurements-1.csv"))
mes2 = pd.read_csv(os.path.join(os.path.dirname(__file__), "../src/data/measurements-2.csv"))
mes3 = pd.read_csv(os.path.join(os.path.dirname(__file__), "../src/data/measurements-3.csv"))

obs1 = pd.read_csv(os.path.join(os.path.dirname(__file__), "../src/data/measurements-1.csv"))
obs2 = pd.read_csv(os.path.join(os.path.dirname(__file__), "../src/data/observations-2.csv"))
obs3 = pd.read_csv(os.path.join(os.path.dirname(__file__), "../src/data/observations-3.csv"))

print("Fin generation des devices")
