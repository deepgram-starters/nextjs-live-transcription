from flask import Flask, request, jsonify, send_from_directory
from pyannote.audio import Model, Inference
import torch
import os
import time
import threading
import subprocess

import logging
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

# Define inactivity period in seconds
INACTIVITY_PERIOD = 600

app = Flask(__name__, static_folder='.')

# Check GPU availability
device = torch.device(
    "cuda") if torch.cuda.is_available() else torch.device("cpu")

# Instantiate pretrained model
model = Model.from_pretrained(
    "pyannote/embedding", use_auth_token="").to(device)
inference = Inference(model, window="whole")

# Initialize last call time
last_call_time = time.time()

@app.route('/', methods=['GET'])
def index():
    return send_from_directory('.', 'index.html')

@app.route('/generate_embedding', methods=['POST'])
def generate_embedding():
    global last_call_time
    last_call_time = time.time()  # Update last call time
    print("generate_embedding function started")
    # Ensure audio file was sent
    if 'audio_file' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files['audio_file']
    audio_path = os.path.join("/tmp", audio_file.filename)
    audio_file.save(audio_path)

    # Extract embedding from the audio file
    embedding = inference(audio_path)

    # Convert the embedding to a list so it can be serialized to JSON
    embedding_list = embedding.tolist()

    # Respond with the embeddings
    return jsonify({"embedding": embedding_list})

@app.route('/countdown', methods=['GET'])
def countdown():
    global last_call_time
    remaining_time = max(0, INACTIVITY_PERIOD - (time.time() - last_call_time))
    hours, rem = divmod(remaining_time, 3600)
    minutes, seconds = divmod(rem, 60)
    return f"Time remaining before shutdown: {int(hours)}:{int(minutes)}:{seconds:.2f}"

def shutdown_check():
    global last_call_time
    while True:
        time.sleep(1)  # Check every second
        if time.time() - last_call_time > INACTIVITY_PERIOD:  
            print("Shutting down due to inactivity...")
            instance_name = "instance-1"  # Replace with the name of your VM
            zone = "us-central1-a"  # Replace with the zone your VM is located in
            subprocess.run(["gcloud", "compute", "instances", "stop", instance_name, "--zone", zone])

if __name__ == '__main__':
    print("app.run started")
    # Start the shutdown check thread
    threading.Thread(target=shutdown_check).start()
    app.run(host='0.0.0.0', port=5000)
