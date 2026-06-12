import requests
import datetime
import time
import pandas as pd
import os
PHYPHOX_URL = "http://172.20.10.1/"
API_URL = "http://localhost:8383"

NO_MINUTES = 20

# À modifier
CALIBRATION = 100
LOCATION = "hello"
SEUIL_ELEVE = 75
SEUIL_BAS = 40

start_time = datetime.datetime.now()

obs = []

while (start_time + datetime.timedelta(minutes=NO_MINUTES) > datetime.datetime.now()):
    # https://phyphox.org/wiki/index.php/Remote-interface_communication
    # https://phyphox.org/forums/showthread.php?tid=60

    
    try:
        res = requests.get(url=PHYPHOX_URL + f"control?cmd=set&buffer=calibration&value={CALIBRATION}")
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
    day = datetime.datetime.now()
    temps_collecte = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    time.sleep(5)
    try:
        res = requests.get(url=PHYPHOX_URL+"get?dB=full")
        
    except:
        print("could not get data")
        continue
    if res.status_code != 200:
        continue
    data = res.json()["buffer"]["dB"]["buffer"]
    print(f"SENDING {len(data)} observations")
    for measurement in data:
        if float(measurement) > SEUIL_ELEVE:
            vibe = "BRUYANT"
            proximite = "PROCHE"
        elif float(measurement) < SEUIL_BAS:
            vibe = "CALME"
            proximite = "LOIN"
        else:
            vibe = "NORMAL"
            proximite = "MOYENNE"

        payload = {
            "location": LOCATION,
            "vibe": vibe,
            "proximity": proximite,
            "notes": f"Timestamp: {temps_collecte}, Db: {data}"
        }
        obs.append(payload)
        try:
            res = requests.post(API_URL + "/observations", json=payload, headers={"x-api-key": "test"})
        except:
            print("Could not send observation.")
            print(res.text)
            exit(1)
        if res.status_code != 201:
            print(res.text)
            print("Could not send data")
            exit(1)
    print("BATCH SENT!")
    try:
        res = requests.get(url=PHYPHOX_URL + "control?cmd=clear")
        if res.status_code != 200:
            continue
    except:
        print("Could not stop trial")
        exit(1)

df = pd.DataFrame(obs)
df.to_csv(os.path.join(os.path.dirname(__file__), f"../src/data/observations.csv"), index=False)