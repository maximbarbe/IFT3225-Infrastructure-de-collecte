import requests
import datetime
import time

PHYPHOX_URL = "http://172.20.10.1/"
API_URL = "http://localhost:8383"

NO_MINUTES = 20

# À modifier
CALIBRATION=100
MEASUREMENT_TYPE = "audio"
LOCATION = "hello"


start_time = datetime.datetime.now()


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
    print(f"SENDING {len(data)} measurements")
    for measurement in data:
        payload = {
            "type": MEASUREMENT_TYPE,
            "value": float(measurement),
            "location": LOCATION,
            "timestamp": temps_collecte
        }
        try:
            res = requests.post(API_URL + "/measurements", json=payload, headers={"x-api-key": "test"})
        except:
            print("Could not send measurement")
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
