import dotenv
import os
from pymongo import MongoClient
import pandas as pd
from datetime import datetime, timedelta



dotenv.load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../.env"))
client = MongoClient(os.getenv("ATLAS_URI"))
database = client["IFT3225"]


locations = [
    {
        "location": "iga marché tellier sainte dorothee",
        "lat": 45.525277982924315,
        "lon": -73.78364623818311
    },
    {
        "location": "tim hortons smartcentres laval",
        "lat": 45.52817899540404,
        "lon": -73.78266045091988
    },
    {
        "location": "parc de la petite-italie",
        "lat": 45.5354,
        "lon": -73.6144
    }
             ]


# --- Clés
coll = database["locations"]
coll.drop()
print("Debut generation des locations")
coll.insert_many(locations)
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

temp = []

for idx, row in measurements.iterrows():
    date = row["timestamp"].split("T")[0]
    time = row["timestamp"].split("T")[1]
    year, month, date = map(int, date.split("-"))
    hour, minute, second = map(int, time[:-1].split(":"))
    
    temp.append({"type": row["type"], "value": row["value"], "location": row["location"].lower(), "timestamp": datetime(year, month, date, hour, minute, second)})

coll.insert_many(temp)

coll = database["observations"]
coll.drop()
print("Génération des observations")
temp = []
if ("userId" in observations.columns):
    for idx, row in observations.iterrows():
        temp.append({"location": row["location"].lower(), "vibe": row["vibe"], "proximity": row["proximity"], "notes": row["notes"], "userId": row["userId"]})
else:
    for idx, row in observations.iterrows():
        temp.append({"location": row["location"].lower(), "vibe": row["vibe"], "proximity": row["proximity"], "notes": row["notes"], "userId": "0"})    
        
coll.insert_many(temp)

temp = []

mes4 = pd.read_csv(os.path.join(os.path.dirname(__file__), "../src/data/measurements-4.csv"))
mes5 = pd.read_csv(os.path.join(os.path.dirname(__file__), "../src/data/measurements-5.csv"))
mes6 = pd.read_csv(os.path.join(os.path.dirname(__file__), "../src/data/measurements-6.csv"))
mes7 = pd.read_csv(os.path.join(os.path.dirname(__file__), "../src/data/measurements-7.csv"))
mes8 = pd.read_csv(os.path.join(os.path.dirname(__file__), "../src/data/measurements-8.csv"))
mes9 = pd.read_csv(os.path.join(os.path.dirname(__file__), "../src/data/measurements-9.csv"))
mes10 = pd.read_csv(os.path.join(os.path.dirname(__file__), "../src/data/measurements-10.csv"))
mes11 = pd.read_csv(os.path.join(os.path.dirname(__file__), "../src/data/measurements-11.csv"))
mes12 = pd.read_csv(os.path.join(os.path.dirname(__file__), "../src/data/measurements-12.csv"))
mes13 = pd.read_csv(os.path.join(os.path.dirname(__file__), "../src/data/measurements-13.csv"))
mes14 = pd.read_csv(os.path.join(os.path.dirname(__file__), "../src/data/measurements-14.csv"))
# Les dates ici sont en UTC
mes4_start = datetime(2026, 7, 17, 13, 23)
mes5_start = datetime(2026, 7, 17, 15, 9)
mes6_start = datetime(2026, 7, 17, 18, 9)
mes7_start = datetime(2026, 7, 17, 19, 10)
mes8_start = datetime(2026, 7, 18, 2, 19)
mes9_start = datetime(2026, 7, 18, 10, 42)
# Enregistrements du parc de la petite-italie (heures locales EDT converties en UTC, +4h)
mes10_start = datetime(2026, 7, 19, 3, 23)
mes11_start = datetime(2026, 7, 17, 0, 42)
mes12_start = datetime(2026, 7, 16, 19, 8)


mes13_start = datetime(2026, 7, 18, 17, 4)
mes14_start = datetime(2026, 7, 20, 17, 9)

print("Génération des 4eme, 5eme, 6eme, 7eme, 8eme, 9eme, 10eme, 11eme, 12eme, 13eme et 14eme mesures")
coll = database["measurements"]
for idx, row in mes4.iterrows():
    if not pd.isna(row["Sound pressure level (dB)"]):
        temp.append({"type": "audio", "value": row["Sound pressure level (dB)"], "location": "iga marché tellier sainte dorothee", "timestamp": mes4_start +timedelta(seconds=row["Time (s)"])})
    
for idx, row in mes5.iterrows():
    if not pd.isna(row["Sound pressure level (dB)"]):
        temp.append({"type": "audio", "value": row["Sound pressure level (dB)"], "location": "iga marché tellier sainte dorothee", "timestamp": mes5_start +timedelta(seconds=row["Time (s)"])})    
    
for idx, row in mes6.iterrows():
    if not pd.isna(row["Sound pressure level (dB)"]):
        temp.append({"type": "audio", "value": row["Sound pressure level (dB)"], "location": "iga marché tellier sainte dorothee", "timestamp": mes6_start +timedelta(seconds=row["Time (s)"])})       
    
for idx, row in mes7.iterrows():
    if not pd.isna(row["Sound pressure level (dB)"]):
        temp.append({"type": "audio", "value": row["Sound pressure level (dB)"], "location": "iga marché tellier sainte dorothee", "timestamp": mes7_start +timedelta(seconds=row["Time (s)"])})       
        
for idx, row in mes8.iterrows():
    if not pd.isna(row["Sound pressure level (dB)"]):
        temp.append({"type": "audio", "value": row["Sound pressure level (dB)"], "location": "tim hortons smartcentres laval", "timestamp": mes8_start +timedelta(seconds=row["Time (s)"])})   
            
for idx, row in mes9.iterrows():
    if not pd.isna(row["Sound pressure level (dB)"]):
        temp.append({"type": "audio", "value": row["Sound pressure level (dB)"], "location": "tim hortons smartcentres laval", "timestamp": mes9_start +timedelta(seconds=row["Time (s)"])})

for idx, row in mes10.iterrows():
    if not pd.isna(row["Sound pressure level (dB)"]):
        temp.append({"type": "audio", "value": row["Sound pressure level (dB)"], "location": "parc de la petite-italie", "timestamp": mes10_start +timedelta(seconds=row["Time (s)"])})

for idx, row in mes11.iterrows():
    if not pd.isna(row["Sound pressure level (dB)"]):
        temp.append({"type": "audio", "value": row["Sound pressure level (dB)"], "location": "parc de la petite-italie", "timestamp": mes11_start +timedelta(seconds=row["Time (s)"])})

for idx, row in mes12.iterrows():
    if not pd.isna(row["Sound pressure level (dB)"]):
        temp.append({"type": "audio", "value": row["Sound pressure level (dB)"], "location": "parc de la petite-italie", "timestamp": mes12_start +timedelta(seconds=row["Time (s)"])})       
    
for idx, row in mes13.iterrows():
    if not pd.isna(row["Sound pressure level (dB)"]):
        temp.append({"type": "audio", "value": row["Sound pressure level (dB)"], "location": "tim hortons smartcentres laval", "timestamp": mes13_start +timedelta(seconds=row["Time (s)"])})    
    
    
for idx, row in mes14.iterrows():
    if not pd.isna(row["Sound pressure level (dB)"]):
        temp.append({"type": "audio", "value": row["Sound pressure level (dB)"], "location": "tim hortons smartcentres laval", "timestamp": mes14_start +timedelta(seconds=row["Time (s)"])})      
    
coll.insert_many(temp)