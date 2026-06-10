import dotenv
import os
import random
import math
import datetime
from zoneinfo import ZoneInfo
from pymongo import MongoClient

dotenv.load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../.env"))
client = MongoClient(os.getenv("ATLAS_URI"))
database = client["IFT3225"]

MTL = ZoneInfo("America/Montreal")

locations = ["parc jean-drapeau", "pavillon roger-gaudry", "stade olympique",
             "pavillon jean-brillant", "bibliotheque andre-aisenstadt"]


# Profil sonore type sur 24h (heure locale): calme la nuit, fort l'apres-midi.
# Creux vers 2h (~40 dB), pic vers 14h (~66 dB). On est oblige de faire ca, car sans cette variation par heure,
# toutes les heures auraient la meme moyenne et quiet-hours ne montrerait rien.
def db_pour_heure(h):
    return 53 + 13 * math.sin(2 * math.pi * (h - 8) / 24)


# --- Location
coll = database["locations"]
print("Debut generation des locations")
for loc in locations:
    if coll.find_one({"location": loc}) is None:
        coll.insert_one({"location": loc})
print("Fin generation des locations")

# --- Observation
SEUIL_BAS = 50
SEUIL_HAUT = 62
coll = database["observations"]
coll.delete_many({})  # on repart propre a chaque execution
print("Debut generation des observations")
for loc in locations:
    for _ in range(100):
        td = random.randint(0, 75000)
        local_time = datetime.datetime.now(MTL) - datetime.timedelta(minutes=td)
        db = db_pour_heure(local_time.hour) + random.uniform(-5, 5)
        if db < SEUIL_BAS:
            proximite, vibe = "LOIN", "CALME"
        elif db > SEUIL_HAUT:
            proximite, vibe = "PROCHE", "BRUYANT"
        else:
            proximite, vibe = "MOYENNE", "NORMAL"
        coll.insert_one({
            "location": loc,
            "proximity": proximite,
            "vibe": vibe,
            "timestamp": local_time.astimezone(datetime.timezone.utc),
            "notes": f"dB simule: {round(db, 1)}"
        })
print("Fin generation des observations")

# --- Mesure
coll = database["measurements"]
coll.delete_many({})  # on repart propre a chaque execution
print("Debut generation des mesures")
for loc in locations:
    for _ in range(100):
        td = random.randint(0, 75000)
        # Heure generee en local (Montreal) pour appliquer le profil, puis
        # stockee en UTC comme vraie date BSON (pas une chaine), pour que
        # $hour et $dateTrunc fonctionnent dans l'agregation.
        local_time = datetime.datetime.now(MTL) - datetime.timedelta(minutes=td)
        db = db_pour_heure(local_time.hour) + random.uniform(-5, 5)
        coll.insert_one({
            "type": "audio",
            "value": round(db, 1),
            "location": loc,
            "timestamp": local_time.astimezone(datetime.timezone.utc)
        })
print("Fin generation des mesures")

# --- Devices
coll = database["devices"]
print("Debut generation des devices")
for i in range(len(locations)):
    api_key = f"seed-key-{i + 1}"
    if coll.find_one({"apiKey": api_key}) is None:
        coll.insert_one({"apiKey": api_key, "name": f"device{i + 1}", "location": locations[i]})
print("Fin generation des devices")
