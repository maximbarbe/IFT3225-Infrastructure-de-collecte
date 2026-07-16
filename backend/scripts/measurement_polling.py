import requests
import datetime
import time
import pandas as pd
import os

PHYPHOX_URL = "http://172.20.10.1/"
API_URL = "http://localhost:8383"
API_KEY = "seed-key-1"

NO_MINUTES = 20

# À modifier
CALIBRATION=100
MEASUREMENT_TYPE = "audio"
LOCATION = "IGA Marché Tellier Sainte Dorothee"
SEUIL_ELEVE = 60
SEUIL_BAS = 48
LAT = 45.525277982924315
LON = -73.78364623818311

start_time = datetime.datetime.now()

mes = []
obs = []


try:
    res = requests.post(url=API_URL+f"/locations", headers={"x-api-key": f"{API_KEY}"}, json={"location": LOCATION, "lat": LAT, "lon": LON})
    if res.status_code == 500:
        print("Erreur du serveur lors de la création de la location")
        exit(1)
except:
    print("Could not create location")
    exit(1)

while (start_time + datetime.timedelta(minutes=NO_MINUTES) > datetime.datetime.now()):
    # (Phyphox, 2024)
    # (jbshute, 2018)

    try:
        res = requests.get(url=PHYPHOX_URL + f"control?cmd=set&buffer=calibration&value={CALIBRATION}")
        time.sleep(1)
        if res.status_code != 200:
            print("Could not calibrate trial")
            exit(1)
    except:
        print("Could not calibrate trial")
        exit(1)


    try:
        res = requests.get(url=PHYPHOX_URL + "control?cmd=start")
        if res.status_code != 200:
            continue
        print("TRIAL STARTED")
    except:
        print("Could not start trial")
        exit(1)
        
    temps_collecte = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    time.sleep(2)
    try:
        res = requests.get(url=PHYPHOX_URL+"get?dB=full")
        
    except:
        print("could not get data")
        continue
    if res.status_code != 200:
        continue
    data = res.json()["buffer"]["dB"]["buffer"]
    print(f"SENDING {len(data)} measurements and observations")
    for measurement in data:
        payload = {
            "type": MEASUREMENT_TYPE,
            "value": float(measurement),
            "location": LOCATION,
            "timestamp": temps_collecte
        }
        mes.append(payload)
        try:
            res = requests.post(API_URL + "/measurements", json=payload, headers={"x-api-key": f"{API_KEY}"})
        except:
            print("Could not send measurement")
            print(res.text)
            continue
        if res.status_code != 201:
            print(res.text)
            print("Could not send data")
            continue

        if float(measurement) > SEUIL_ELEVE:
            vibe = "BRUYANT"
            proximite = "PROCHE"
        elif float(measurement) < SEUIL_BAS:
            vibe = "CALME"
            proximite = "LOIN"
        else:
            vibe = "NORMAL"
            proximite = "MOYENNE"

        observation = {
            "location": LOCATION,
            "vibe": vibe,
            "proximity": proximite,
            "notes": f"Timestamp: {temps_collecte}, Db: {measurement}",
            "userId": "0"
        }
        obs.append(observation)
        try:
            res = requests.post(API_URL + "/observations", json=observation, headers={"x-api-key": f"{API_KEY}"})
        except:
            print("Could not send observation.")
            print(res.text)
            continue
        if res.status_code != 201:
            print(res.text)
            print("Could not send data")
            continue



    print("BATCH SENT!")
    try:
        res = requests.get(url=PHYPHOX_URL + "control?cmd=clear")
        if res.status_code != 200:
            continue
    except:
        print("Could not stop trial")
        exit(1)
    time.sleep(2)

df = pd.DataFrame(mes)
df.to_csv(os.path.join(os.path.dirname(__file__), f"../src/data/measurements-4.csv"), index=False)


df = pd.DataFrame(obs)
df.to_csv(os.path.join(os.path.dirname(__file__), f"../src/data/observations-4.csv"), index=False)