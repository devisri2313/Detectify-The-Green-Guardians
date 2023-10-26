from flask import Flask, request, jsonify
import tensorflow as tf
from flask_cors import CORS
import pandas as pd
import numpy as np
from PIL import Image

app = Flask(__name__)
CORS(app)


@app.route('/test', methods=['GET'])
def test():
    return jsonify({'test': 'Hello'})

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files or 'plant_name' not in request.form:
        return jsonify({'error': 'Image or plant name missing'}), 400

    # Get the image and plant name
    image = request.files['image']

    plant_name = request.form['plant_name'].lower()

    # Load the model and data based on plant name
    model_path = f"{plant_name}_model.h5"
    data_path = f"{plant_name}_data.csv"
    model = tf.keras.models.load_model(model_path)
    info_df = pd.read_csv(data_path)

    # Preprocess the image and make predictions
    image = Image.open(image).resize((224, 224))
    img_array = np.array(image)[np.newaxis, :]
    predictions = model.predict(img_array)
    predicted_class = np.argmax(predictions)

    # Fetch the row corresponding to the predicted class
    predicted_row = info_df.loc[predicted_class].squeeze()

    # Fetch details
    disease_name = predicted_row['Disease']
    description = predicted_row['Description']
    why_it_occurred = predicted_row['Why it occurred']
    preventive_measures = predicted_row['Prevention measures']
    recommended_steps = predicted_row['Recommended steps to cure the disease']

    # Return the results
    return jsonify({
        'disease_name': disease_name,
        'description': description,
        'why_it_occurred': why_it_occurred,
        'preventive_measures': preventive_measures,
        'recommended_steps': recommended_steps,
        'original_image': request.form.get('original_image')
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
