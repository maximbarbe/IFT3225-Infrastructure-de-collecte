import dotenv
import os
from pymongo import MongoClient
import random
import datetime






dotenv.load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../.env"))


client = MongoClient(os.getenv("ATLAS_URI"))

# S'il y a un nom de database différent, le changer ICI.
database = client["IFT3225"]
coll = database["locations"]
locations = ["parc jean-drapeau", "pavillon roger-gaudry", "stade olympique", "pavillon jean-brillant", "bibliotheque andre-aisenstadt"]



print("Début génération des locations")
# On crée des locations
for loc in locations:
    
    try:
        if coll.find_one({"location": loc}) == None:
            coll.insert_one({"location": loc})
    except:
        print("Probleme avec la base de données.")
        exit(1)

print("Fin génération des locations")
SEUIL_BAS = 40
SEUIL_HAUT = 60

coll = database["observations"]

print("Début génération des observations")
# On crée les observations
for loc in locations:
    for i in range(100):
        db = random.uniform(30, 70)
        if db < SEUIL_BAS:
            proximite = "LOIN"
            vibe = "CALME"
        elif db > SEUIL_HAUT:
            proximite = "PROCHE"
            vibe = "BRUYANT"
        else:
            proximite = "MOYENNE"
            vibe = "NORMAL"
        
        td = random.randint(0, 75000)
        time = (datetime.datetime.now() - datetime.timedelta(minutes=td)).strftime("%Y-%m-%dT%H:%M:%SZ")
        try:
            coll.insert_one({"location": loc, "proximity": proximite, "vibe": vibe, "notes": f"Timestamp: {time}, dB: {db}"})
        except:
            print("Probleme lors de la génération des observations.")
            exit(1)
print("Fin génération des observations")

print("Début génération des mesures")
coll = database["measurements"]
for loc in locations:
    for i in range(100):
        db = random.uniform(30, 70)

        
        td = random.randint(0, 75000)
        time = (datetime.datetime.now() - datetime.timedelta(minutes=td)).strftime("%Y-%m-%dT%H:%M:%SZ")
        try:
            coll.insert_one({"type": "audio", "value": db, "location": loc, "timestamp": time})
        except:
            print("Probleme lors de la génération des mesures.")
            exit(1)
print("Fin génération des mesures")


print("Début génération des device")

devices = [f"device{i}" for i in range(1, len(locations) + 1)]
coll = database["devices"]
for i in range(len(locations)):
    try:
        if coll.find_one({"api_key": i + 1}) == None:
            coll.insert_one({"api_key": i +1, "name": devices[i], "location": locations[i]})
    except:
        print("Probleme lors de la génération des devices")
        exit(1)
    
print("Fin génération des devices")

