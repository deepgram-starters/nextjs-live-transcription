
from FlagEmbedding import FlagModel
import torch
from pyannote.audio import Model as PyannoteModel, Inference
import requests
import os
from urllib.parse import urlparse
import time

# Assuming you have a similar setup for audio processing
audio_model = PyannoteModel.from_pretrained("pyannote/embedding", use_auth_token="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")
audio_inference = Inference(audio_model, window="whole")
audio_inference.to(torch.device("cuda"))

model = FlagModel('BAAI/bge-large-en-v1.5', 
                  query_instruction_for_retrieval="Generate a representation for this sentence to retrieve related articles:",
                  use_fp16=True)

def download_audio_from_url(url):
    """
    Download an audio file from a URL and save it locally.
    Returns the path to the saved file.
    """
    parsed_url = urlparse(url)
    filename = os.path.basename(parsed_url.path)
    local_path = os.path.join("/tmp", filename)
    response = requests.get(url)
    if response.status_code == 200:
        with open(local_path, 'wb') as audio_file:
            audio_file.write(response.content)
        return local_path  # Return the local file path
    else:
        raise Exception(f"Failed to download audio from {url}")

def handler(job):
    print("Received job:", job)
    job_input = job['input']

    if 'audio_file' in job_input:
        audio_path = job_input['audio_file']
        # If the audio file is a URL, download it first
        if audio_path.startswith('http://') or audio_path.startswith('https://'):
            audio_path = download_audio_from_url(audio_path)
        
        # Ensure audio_path is not None before proceeding
        if audio_path:
            start_time = time.time()  # Start timing before processing the audio file
            # Process the downloaded/local audio file to extract embeddings
            embedding = audio_inference(audio_path)  # Ensure audio_inference processes data on the correct device
            end_time = time.time()  # End timing after processing is complete
            process_time = end_time - start_time  # Calculate the processing time
            print(f"Audio file processing and embedding creation took {process_time} seconds.")  # Log the processing time
            
            embedding_list = embedding.tolist()
            return {"embedding": embedding_list}
        else:
            return {"error": "Failed to download or locate the audio file."}

    sentences = job_input.get('sentence', [])
    if 'queries' in job_input:
        embeddings = model.encode_queries(sentences)
    else:
        embeddings = model.encode(sentences)
    
    embeddings_list = embeddings.tolist()
    return {"embeddings": embeddings_list}

import runpod

runpod.serverless.start({"handler": handler})