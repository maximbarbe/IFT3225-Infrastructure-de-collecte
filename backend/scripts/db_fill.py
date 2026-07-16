import dotenv
import os
from pymongo import MongoClient
import pandas as pd
from datetime import datetime



dotenv.load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../.env"))
client = MongoClient(os.getenv("ATLAS_URI"))
database = client["IFT3225"]


locations = [{
    "location": "iga marché tellier sainte dorothee",
    "lat": 45.525277982924315,
    "lon": -73.78364623818311
}]


# --- Clés
coll = database["locations"]
coll.drop()
print("Debut generation des locations")
for loc in locations:
    if coll.find_one({"location": loc["location"]}) is None:
        coll.insert_one({"location": loc["location"], "lat": loc["lat"], "lon": loc["lon"]})
print("Fin generation des locations")

# --- Devices
coll = database["devices"]
coll.drop()
print("Debut generation des devices")
for i in range(len(locations)):
    api_key = f"seed-key-{i + 1}"
    if coll.find_one({"apiKey": api_key}) is None:
        coll.insert_one({"apiKey": api_key, "name": f"device{i + 1}", "location": locations[i]})



mes1 = pd.read_csv(os.path.join(os.path.dirname(__file__), "../src/data/measurements-1.csv"))
mes2 = pd.read_csv(os.path.join(os.path.dirname(__file__), "../src/data/measurements-2.csv"))
mes3 = pd.read_csv(os.path.join(os.path.dirname(__file__), "../src/data/measurements-3.csv"))

obs1 = pd.read_csv(os.path.join(os.path.dirname(__file__), "../src/data/observations-1.csv"))
obs2 = pd.read_csv(os.path.join(os.path.dirname(__file__), "../src/data/observations-2.csv"))
obs3 = pd.read_csv(os.path.join(os.path.dirname(__file__), "../src/data/observations-3.csv"))

measurements = pd.concat([mes1, mes2, mes3], ignore_index=True)
observations = pd.concat([obs1, obs2, obs3], ignore_index=True)

coll = database["measurements"]
coll.drop()
print("Génération des mesures")
for idx, row in measurements.iterrows():
    date = row["timestamp"].split("T")[0]
    time = row["timestamp"].split("T")[1]
    year, month, date = map(int, date.split("-"))
    hour, minute, second = map(int, time[:-1].split(":"))
    coll.insert_one({"type": row["type"], "value": row["value"], "location": row["location"].lower(), "timestamp": datetime(year, month, date, hour, minute, second)})


coll = database["observations"]
coll.drop()
print("Génération des observations")
if ("userId" in observations.columns):
    for idx, row in observations.iterrows():
        coll.insert_one({"location": row["location"].lower(), "vibe": row["vibe"], "proximity": row["proximity"], "notes": row["notes"], "userId": row["userId"]})
else:
    for idx, row in observations.iterrows():
        coll.insert_one({"location": row["location"].lower(), "vibe": row["vibe"], "proximity": row["proximity"], "notes": row["notes"], "userId": "0"})    

