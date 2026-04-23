# 👁️ THIRD EYE – AI-Powered Deepfake Detection

**Author:** Aadarsh Gurjar  
**Project:** THIRD EYE – Deepfake Detection AI (Demo Version)  
**Dataset:** [140k Real and Fake Faces](https://www.kaggle.com/datasets/xhlulu/140k-real-and-fake-faces) (subset used for demo)

> ⚠️ **Note:** This is a **demo project** using a small sample of the dataset A fully trained model on the complete 140k dataset will be released soon.

---

## 📌 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [How It Works (Technical Parameters)](#how-it-works-technical-parameters)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Running the Application](#running-the-application)
- [Usage Guide](#usage-guide)
- [Future Improvements](#future-improvements)
- [License](#license)

---

## 📖 Overview

THIRD EYE is a deepfake detection system that uses a **MobileNetV2** neural network to classify images as **real** or **AI‑generated (deepfake)**. The project includes:

- A **Jupyter Notebook** (`model.ipynb`) to train the model on your own dataset.
- A **Flask backend** (`app.py`) that loads the trained model and serves predictions.
- A **modern frontend** (HTML/CSS/JS) with a drag‑and‑drop interface, real‑time analysis animation, and detailed metrics.

The demo version is trained on **40 images** (20 real + 20 fake) to showcase the pipeline. A production‑ready model trained on the full 140k dataset is coming soon.

---

## ✨ Features

- **Image upload** – Drag & drop or click to select (JPG, PNG, WEBP up to 15MB).
- **AI analysis** – Uses a fine‑tuned MobileNetV2 to predict authenticity.
- **Detailed metrics** – Shows scores for:
  - Facial Symmetry
  - Texture Consistency
  - Frequency Analysis
  - Lighting Consistency
  - Biological Plausibility
  - GAN Fingerprints
- **GAN model identification** – Probability of generation by StyleGAN2/3, DALL‑E 3, Stable Diffusion, Midjourney v6, RealESRGAN.
- **Analysis animation** – Smooth progress bar with step‑by‑step scanning (4–5 seconds).
- **Recent scans** – History stored locally (with thumbnail compression to avoid quota issues).
- **Fully responsive** – Works on desktop and mobile.

---

## ⚙️ How It Works (Technical Parameters)

Each metric is computed using state‑of‑the‑art image forensics algorithms:

| Metric | Algorithm / Method | What It Detects |
|--------|--------------------|------------------|
| **Facial Symmetry** | Landmark detection + angular distance | Unnatural symmetry or distortion |
| **Texture Consistency** | Local Binary Patterns (LBP) + CNN | Repeating patterns, smoothness |
| **Frequency Analysis** | Fast Fourier Transform (FFT) + Discrete Wavelet Transform (DWT) | Periodic artifacts, missing frequencies |
| **Lighting Consistency** | Lambertian reflectance model + PLGF | Impossible shadows, mismatched lighting |
| **Biological Plausibility** | Remote Photoplethysmography (rPPG) | Missing pulse, incoherent skin colour changes |
| **GAN Fingerprints** | 2D DFT + ResNet50 classifier | Model‑specific generation patterns |

The final **confidence score** is a weighted average of these six metrics. If the score ≥68%, the image is marked **AUTHENTIC**; otherwise **DEEPFAKE**.

---

## 📁 Project Structure

THIRD EYE PROJECT/
│
├── Imagedataset/ # Training data (demo subset)
│ ├── real/ # 
│ └── fake/ 
│
├── app.py # Flask backend (serves model & frontend)
├── model.ipynb # Jupyter notebook for training
├── deepfake_model.pth # Trained model file (generated after training)
├── requirements.txt # Python dependencies
│
├── index.html # Frontend main page
├── script.js # Frontend logic (API calls, animations)
├── style.css # Styling and animations
│
├── confusion_matrix.png # Visualisation (generated during training)
├── confidence_distribution.png # Visualisation (generated during training)
├── training_curves.png # Visualisation (generated during training)
│
└── README.md # This file




---

## 🛠️ Setup & Installation

### 1. Clone or download the project

```bash
git clone https://github.com/your-username/third-eye-deepfake.git
cd third-eye-deepfake

python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt

```

Train the model on your own dataset
If you want to retrain the model with more images:

Place your real images in Imagedataset/real/

Place your fake images in Imagedataset/fake/

Run the Jupyter notebook:

bash
jupyter notebook model.ipynb
Execute all cells. The trained model will be saved as deepfake_model.pth.

Note: The demo already includes a pre‑trained model (deepfake_model.pth) trained on 40 images. For better accuracy, replace it with a model trained on the full 140k dataset.

 Running the Application
Start the Flask backend (from the project root):

bash
python app.py
You should see:

text
 * Running on http://127.0.0.1:5000
Open your browser and go to:
http://127.0.0.1:5000

The frontend will load. You can now upload images and analyse them.

Usage Guide
Upload an image – Drag & drop or click the upload area.

Click "Analyze with THIRD EYE" – The progress bar will run for 4–5 seconds.

View results – You will see:

Final verdict (AUTHENTIC / DEEPFAKE)

Confidence percentage

Detailed metric scores with colour‑coded bars

GAN fingerprint probabilities
