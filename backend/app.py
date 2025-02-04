from flask import Flask, request, jsonify
from openai import OpenAI
import os
from flask_cors import CORS
import base64
import requests
import json
from PIL import Image
from io import BytesIO

app = Flask(__name__)

# Initialize OpenAI client
client = OpenAI(
  base_url = "https://integrate.api.nvidia.com/v1",
  api_key = os.environ.get("API_KEY")
)

print(f"API Key: {os.environ.get('API_KEY')}")

CORS(app, resources={r"/*": {"origins": "*"}})
@app.route('/query', methods=['GET'])
def query_openai():
    try:
        
        user_query = request.args.get("query")
        if not user_query:
            return jsonify({"error": "Query parameter is required."}), 400

        # Call the OpenAI API with streaming
        completion = client.chat.completions.create(
        model="meta/llama-3.1-405b-instruct",
        messages=[
        {"role": "system", "content": "You are an assistant trained to answer questions related to crops and Pakistani weather. If asked about other topics, politely inform the user you can only discuss crops or Pakistani weather."},
        {"role": "system", "content": "You can help the user with information such as the best crops to grow in Pakistan's regions, weather patterns affecting farming, and general advice on agricultural practices."},
        {"role": "system", "content": "Response should be max 2 sentences"},
        {"role": "user", "content": f"${user_query}"}
    ],
    temperature=0.2,
    top_p=0.7,
    max_tokens=256,
    stream=True,
)

        # Prepare the response content by iterating through the response stream
        response_content = ""
        for chunk in completion:
            if chunk.choices[0].delta.content is not None:
                response_content += chunk.choices[0].delta.content

        # Return the response as JSON
        print(response_content)
        return jsonify({"response": response_content.strip()}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# --------------------------------------------------------------------------------------------------------
# --------------------------------------------------------------------------------------------------------
# --------------------------------------------------------------------------------------------------------

@app.route('/farm-management-chatbot', methods=['GET'])
def farm_management_chatbot():
    try:
        
        user_query = request.args.get("query")
        if not user_query:
            return jsonify({"error": "Query parameter is required."}), 400

        # Call the OpenAI API with streaming
        completion = client.chat.completions.create(
        model="meta/llama-3.1-405b-instruct",
        messages=[
        {"role": "system", "content": "You are an assistant trained to answer questions related to Farm Management. If asked about other topics, politely inform the user you can only discuss Farm Management."},
        {"role": "system", "content": "You can help the user with Queries related to Farm Management, Crop Management, Soil Management, and General Farming Practices,Crop and Livestock Management,Equipment and Infrastructure Management."},
        {"role": "user", "content": f"${user_query}"}
    ],
    temperature=0.2,
    top_p=0.7,
    max_tokens=512,
    stream=True,
)

        # Prepare the response content by iterating through the response stream
        response_content = ""
        for chunk in completion:
            if chunk.choices[0].delta.content is not None:
                response_content += chunk.choices[0].delta.content

        # Return the response as JSON
        print(response_content)
        return jsonify({"response": response_content.strip()}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# --------------------------------------------------------------------------------------------------------
# --------------------------------------------------------------------------------------------------------
# --------------------------------------------------------------------------------------------------------

@app.route('/weather-analyst', methods=['GET'])
def weather_analyst():
    print("Weather Analyst")
    try:
        user_query = request.args.get("query")
        weather = request.args.get("weather")  # Weather object as JSON string

        if not user_query:
            return jsonify({"error": "Query parameter is required."}), 400
        if not weather:
            return jsonify({"error": "Weather Information is required."}), 400

        # Convert weather JSON string to a dictionary
        weather_data = json.loads(weather)

        # Extract relevant weather attributes
        relevant_weather_info = {
            "Temperature (°C)": weather_data.get("temp_c"),
            "Humidity (%)": weather_data.get("humidity"),
            "Precipitation (mm)": weather_data.get("precip_mm"),
            "Wind Speed (kph)": weather_data.get("wind_kph"),
            "Wind Direction": weather_data.get("wind_dir"),
            "UV Index": weather_data.get("uv"),
            "Dew Point (°C)": weather_data.get("dewpoint_c"),
            "Air Pressure (mb)": weather_data.get("pressure_mb"),
            "Cloud Cover (%)": weather_data.get("cloud"),
            "Weather Condition": weather_data.get("condition", {}).get("text")
        }

        # Generate structured weather description for the model
        formatted_weather = "\n".join([f"{key}: {value}" for key, value in relevant_weather_info.items() if value is not None])

        # Call the OpenAI API with structured prompt
        completion = client.chat.completions.create(
            model="meta/llama-3.1-405b-instruct",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert assistant that provides guidance on crop maintenance based on real-time weather conditions. "
                        "Your responses should be practical, data-driven, and specific to the given weather data. "
                        "If a query is unrelated to farming or weather-based crop management, politely decline to answer."
                        "Give Answer to the point and provide the best advice based on the weather data."
                    )
                },
                {
                    "role": "user",
                    "content": (
                        f"User Query: {user_query}\n"
                        f"Current Weather Details:\n{formatted_weather}\n\n"
                        "Based on this weather data, provide the best farming advice relevant to the user's query."
                    )
                }
            ],
            temperature=0.2,
            top_p=0.7,
            max_tokens=512,
            stream=True
        )

        # Prepare the response content by iterating through the response stream
        response_content = ""
        for chunk in completion:
            if chunk.choices[0].delta.content is not None:
                response_content += chunk.choices[0].delta.content
                
        print(response_content)
        return jsonify({"response": response_content.strip()}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def resize_image(image_file, max_size=(800, 800)):
   
    img = Image.open(image_file)
    
    # Convert to RGB if image is in RGBA mode
    if img.mode == 'RGBA':
        img = img.convert('RGB')
        
    # Calculate aspect ratio
    ratio = min(max_size[0] / img.size[0], max_size[1] / img.size[1])
    
    # Only resize if image is larger than max_size
    if ratio < 1:
        new_size = (int(img.size[0] * ratio), int(img.size[1] * ratio))
        img = img.resize(new_size, Image.Resampling.LANCZOS)
    
    # Save to BytesIO object
    buffer = BytesIO()
    img.save(buffer, format='JPEG', quality=85)
    buffer.seek(0)
    return buffer

@app.route('/analyze-crop', methods=['POST'])
def analyze_crop():
    description = request.form.get('description')
    image = request.files.get('image')  # Corrected to 'image'
    if not image:
        return jsonify({'error': 'No image file part'}), 400  # Error if no image is found

    print(f"Description: {description}, Image: {image.filename}")

    try:
        resized_image = resize_image(image)
        image_b64 = base64.b64encode(resized_image.read()).decode()

        # Check if the length of base64 string is within the allowed limit
        if len(image_b64) >= 180_000:
            return jsonify({
                'error': 'Image is too large. To upload larger images, use the assets API.'
            }), 400

        # Call external service for crop analysis
        invoke_url = "https://integrate.api.nvidia.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {os.environ.get('API_KEY2')}",
            "Accept": "application/json"
        }

        payload = {
            "model": 'microsoft/phi-3.5-vision-instruct',
            "messages": [
                {
                    "role": "system",
                    "content": "You are a crop detector and disease analyzer. Your Response should be to tell what the crop is which is given in content and if there are any diseases present in the crop, and how to treat them."
                },
                {
                    "role": "system",
                    "content": "You are a crop detector and disease analyzer. Your Response should be to tell what the crop is which is given in content and if there are any diseases present in the crop, and how to treat them."
                },
                {
                    "role": "user",
                    "content": f'User\'s Query: {description}\n Image: <img src="data:image/jpeg;base64,{image_b64}" />'
                }
            ],
            "max_tokens": 1024,
            "temperature": 0.70,
            "top_p": 0.70,
            "stream": False
        }

        # Send the request to the external API
        response = requests.post(invoke_url, json=payload, headers=headers)

        # Check response
        if response.status_code == 200:
            # Extract response content
            json_response = response.json()
            return jsonify({
                'response': json_response['choices'][0]['message']['content']
            }), 200
        else:
            # Log the error response
            print(f"External API error: {response.status_code} - {response.text}")
            
            return jsonify({'error': f'External API error: {response.status_code} - {response.text}'}), 500

    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return jsonify({'error': f"An error occurred: {str(e)}"}), 500
    
if __name__ == '__main__':
    app.run(debug=True,host='0.0.0.0')