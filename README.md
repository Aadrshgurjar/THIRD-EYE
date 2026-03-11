# THIRD_EYE
Deepfake Image Detection System

## Overview
THIRD_EYE is a machine learning-based system designed to detect AI-generated (deepfake) face images.  
The project uses deep learning techniques to classify images as **Real** or **Fake** and aims to help identify manipulated media.

## Project Status
This project is currently **under development**.  
The full implementation and working demo will be available soon.

## Tech Stack
- Python
- TensorFlow / Keras
- Flask
- OpenCV
- NumPyTHIRD_EYE/

## project structure
│
├── data/
│ └── real_vs_fake/
│ ├── train/
│ │ ├── real/
│ │ └── fake/
│ ├── valid/
│ └── test/
│
├── flask_app/
│ ├── app.py
│ ├── model/
│ ├── static/
│ │ └── uploads/
│ └── templates/
│ ├── index.html
│ └── result.html
│
├── notebooks/
│ └── third_eye_development.ipynb
│
├── requirements.txt
└── README.md

## Installation

### Clone Repository

### Create Virtual Environment
python -m venv thirdeye_env
Activate environment

Windows
### Install Dependencies
pip install -r requirements.txt

## Running the Project

## Running the Project

Run the Flask application:

cd flask_app
python app.py


Then open in browser:

http://127.0.0.1:5000

## Future Work
- Model training and evaluation
- Web interface integration
- Performance optimization
- Deepfake video detection
- Cloud deployment

## Author
Adarsh Gurjar

