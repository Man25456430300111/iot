# python 3.6import random
import time
import random
from paho.mqtt import client as mqtt_client
import json
import RPi.GPIO as GPIO

import multiprocessing
print("Number of cpu : ", multiprocessing.cpu_count())
GPIO.setmode(GPIO.BCM)
# Define pin for Water pump
water_pin = 6 
GPIO.setup(6, GPIO.OUT)

light_pin = 5 
GPIO.setup(5, GPIO.OUT)


broker = 'm15.cloudmqtt.com'
port = 12987
client_id = f'python-mqtt-{random.randint(0, 1000)}'
username = 'cyejnmdr'
password = 'Is7roaqnQX09'

  
def connect_mqtt() -> mqtt_client:
    def on_connect(client, userdata, flags, rc):
        if rc == 0:
            print("Connected to MQTT Broker!")
        else:
            print("Failed to connect, return code %d\n", rc)

    client = mqtt_client.Client(client_id)
    client.username_pw_set(username, password)
    client.on_connect = on_connect
    client.connect(broker, port)
    return client
def publish(client):
    msg_count = 0
    while True:
        time.sleep(3)
        topic="DT"
        msg = f"{msg_count+1},{msg_count+2},{msg_count+3},{msg_count+4},{msg_count+5},{msg_count+6},{msg_count+7}"
        result = client.publish(topic, msg)
        # result: [0, 1]
        print(msg)
        if msg_count==100:
           msg_count =0
        else:
           msg_count+=1
def subscribe(client: mqtt_client):
    client.subscribe("DT")
    client.subscribe("updatedevice")
    # client.subscribe("updateconfig")
    client.on_message = on_message #"waterpump,on" "waterpump,off","medpump,on"
    
def on_message(client, userdata, msg):
    # print(f"Received `{msg.payload.decode()}` from `{msg.topic}` topic")
    if msg.topic == "updatedevice":
        message = json.loads(msg.payload.decode())
        device = message.get('device')
        status = message.get('status')
        if device == "Water":
            print(device,status)
            if status == "on":
                GPIO.output(water_pin, GPIO.LOW) # Turn on
                print("Water pump turned on")
            elif status == "off":
                GPIO.output(water_pin, GPIO.HIGH) # Turn off
                print("Water pump turned off")
        elif device == "Spray":
            print(device,status)
            if status == "on":
                # GPIO.output(Spray_pin, GPIO.HIGH) # Turn on
                print("Spray turned on")
            elif status == "off":
                # GPIO.output(Spray_pin, GPIO.LOW) # Turn off
                print("Spray turned off")
        elif device == "fertilizer":
            print(device,status)
            if status == "on":
                # GPIO.output(fertilizer_pin, GPIO.HIGH) # Turn on
                print("fertilizer turned on")
            elif status == "off":
                # GPIO.output(fertilizer_pin, GPIO.LOW) # Turn off
                print("fertilizer turned off")
        elif device == "Light":
            print(device,status)
            if status == "on":
                GPIO.output(light_pin, GPIO.LOW) # Turn on
                print("Light turned on")
            elif status == "off":
                GPIO.output(light_pin, GPIO.HIGH) # Turn off
                print("Light turned off")
                
 
def publish_pro1(client):
    publish(client)

    
def subscribe_pro2(client):
    subscribe(client)  
    client.loop_forever()
def run():
    GPIO.setmode(GPIO.BCM)
    # GPIO.setup([ขาพินรับค่า], GPIO.IN)
    GPIO.setup([water_pin,light_pin], GPIO.OUT)

    client = connect_mqtt()
    subscribe(client)    
    p1 = multiprocessing.Process(target=publish_pro1,args=(client,)) 
    p2 = multiprocessing.Process(target=subscribe_pro2,args=(client,)) 
  
    # starting process 1 
    p1.start() 
    # starting process 2 
    p2.start() 
  
    # wait until process 1 is finished 
    p1.join() 
    # wait until process 2 is finished 
    p2.join() 
  
    # both processes finished 
    print("Done!") 
    
    
if __name__ == '__main__':
    run()
    # try:
    #     run()
    # except KeyboardInterrupt:
    #     print("KeyboardInterrupt: Exiting program...")
    #     GPIO.cleanup()
