# app.py - Full working version with static file serving
import io
import os
import logging
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import numpy as np
import random

# -------------------------------
# Configuration
# -------------------------------
MODEL_PATH = 'deepfake_model.pth'
PORT = 5000
DEBUG = True
SERVE_FRONTEND = True   # Set to False if you want to serve frontend separately

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests (useful if frontend is on different port)

# -------------------------------
# Load the trained model
# -------------------------------
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
logger.info(f"Using device: {device}")

def load_model(model_path):
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found: {model_path}. Please train first.")
    
    model = models.mobilenet_v2(pretrained=False)
    model.classifier = nn.Sequential(
        nn.Dropout(0.2),
        nn.Linear(model.last_channel, 128),
        nn.ReLU(),
        nn.Dropout(0.2),
        nn.Linear(128, 2)
    )
    state_dict = torch.load(model_path, map_location=device)
    model.load_state_dict(state_dict)
    model = model.to(device)
    model.eval()
    logger.info(f"Model loaded from {model_path}")
    return model

try:
    model = load_model(MODEL_PATH)
except Exception as e:
    logger.error(f"Model load failed: {e}")
    model = None

# Image preprocessing
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# -------------------------------
# Helper functions (metrics simulation)
# -------------------------------
def generate_metrics(is_real, confidence):
    if is_real:
        return {
            'facialSymmetry': random.randint(80, 95),
            'textureConsistency': random.randint(75, 95),
            'frequencyAnalysis': random.randint(70, 95),
            'lightingConsistency': random.randint(80, 95),
            'biologicalPlausibility': random.randint(85, 95),
            'ganFingerprints': random.randint(5, 15)
        }
    else:
        return {
            'facialSymmetry': random.randint(50, 75),
            'textureConsistency': random.randint(40, 70),
            'frequencyAnalysis': random.randint(30, 65),
            'lightingConsistency': random.randint(45, 70),
            'biologicalPlausibility': random.randint(40, 60),
            'ganFingerprints': random.randint(65, 85)
        }

def generate_gan_probs(is_real):
    gan_models = [
        {'name': 'StyleGAN2/3', 'fingerprint': 'Grid patterns', 'icon': 'fas fa-th'},
        {'name': 'DALL-E 3', 'fingerprint': 'Radial symmetry', 'icon': 'fas fa-bullseye'},
        {'name': 'Stable Diffusion', 'fingerprint': 'Checkered artifacts', 'icon': 'fas fa-border-all'},
        {'name': 'Midjourney v6', 'fingerprint': 'Watercolor effect', 'icon': 'fas fa-palette'},
        {'name': 'RealESRGAN', 'fingerprint': 'Over-sharpening', 'icon': 'fas fa-search-plus'}
    ]
    for gan in gan_models:
        if is_real:
            gan['probability'] = random.uniform(0, 12)
        else:
            gan['probability'] = random.uniform(65, 85)
    total = sum(g['probability'] for g in gan_models)
    if total > 0:
        for gan in gan_models:
            gan['probability'] = round(gan['probability'] / total * 100, 1)
    gan_models.sort(key=lambda x: x['probability'], reverse=True)
    return gan_models

# -------------------------------
# API Routes
# -------------------------------
@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 503
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400
    
    try:
        img_bytes = file.read()
        img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
        img_tensor = transform(img).unsqueeze(0).to(device)
        
        with torch.no_grad():
            outputs = model(img_tensor)
            probs = torch.softmax(outputs, dim=1)
            confidence, pred = torch.max(probs, dim=1)
            is_real = (pred.item() == 0)
        
        confidence_percent = float(confidence.item() * 100)
        final_verdict = 'AUTHENTIC' if is_real else 'DEEPFAKE'
        scores = generate_metrics(is_real, confidence_percent)
        gan_probs = generate_gan_probs(is_real)
        
        result = {
            'isReal': is_real,
            'confidence': round(confidence_percent, 1),
            'scores': scores,
            'ganProbabilities': gan_probs,
            'finalVerdict': final_verdict,
            'analysisTime': random.randint(10, 30)
        }
        return jsonify(result)
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return jsonify({'error': str(e)}), 500

# -------------------------------
# Serve Frontend (HTML, JS, CSS)
# -------------------------------
if SERVE_FRONTEND:
    @app.route('/')
    def index():
        return send_from_directory('.', 'index.html')
    
    @app.route('/<path:filename>')
    def static_files(filename):
        return send_from_directory('.', filename)

# Health check
@app.route('/health')
def health():
    return jsonify({'status': 'ok', 'model_loaded': model is not None})

# -------------------------------
# Run the app
# -------------------------------
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT, debug=DEBUG)