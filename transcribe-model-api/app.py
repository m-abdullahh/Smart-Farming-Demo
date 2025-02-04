from flask import Flask, request, jsonify
import subprocess
import os
import asyncio
from flask_cors import CORS
import os

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})
# NVIDIA API details
NVIDIA_API_URL = "grpc.nvcf.nvidia.com:443"
FUNCTION_ID = "d8dd4e9b-fbf5-4fb0-9dba-8cf436c8d965"
API_KEY = os.environ.get("API_KEY")

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

async def convert_audio(input_file, output_file):
    """Convert audio file to WAV format with PCM encoding using ffmpeg."""
    command = [
        "ffmpeg",
        "-i", input_file,
        "-acodec", "pcm_s16le",
        "-ar", "16000",
        "-ac", "1",
        output_file
    ]
    process = await asyncio.create_subprocess_exec(*command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    stdout, stderr = await process.communicate()

    if process.returncode != 0:
        raise Exception(f"Audio conversion failed: {stderr.decode()}")

async def transcribe_audio(audio_file_path):
    print("Starting transcription")
    try:
        result = await asyncio.to_thread(subprocess.run, [
            "python",
            os.path.join("python-clients", "scripts", "asr", "transcribe_file.py"),
            "--server", NVIDIA_API_URL,
            "--use-ssl",
            "--metadata", "function-id", FUNCTION_ID,
            "--metadata", "authorization", f"Bearer {API_KEY}",
            "--language-code", "en-US",
            "--input-file", audio_file_path
        ], capture_output=True, text=True)

        print("Subprocess stdout:", result.stdout)
        print("Subprocess stderr:", result.stderr)

        if result.returncode != 0:
            return {"error": "Transcription failed", "details": result.stderr}

        return {"transcription": result.stdout.strip()}

    except Exception as e:
        return {"error": str(e)}

@app.route('/', methods=['GET'])
def index():
    return {"message":"RUNNING SERVER"}

@app.route('/api/transcribe', methods=['POST'])
async def transcribe():
    try:
        # Check if an audio file is provided
        if 'audio' not in request.files:
            return jsonify({"error": "No file part"}), 400
        
        audio_file = request.files['audio']

        # If no file is selected
        if audio_file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        # Save the uploaded file to a temporary location
        file_extension = audio_file.filename.split('.')[-1].lower()
        if file_extension not in ['wav', 'mp3', 'ogg']:  # Only allow certain audio formats
            return jsonify({"error": "Invalid file format. Please upload a .wav, .mp3, or .ogg file."}), 400

        # Save the original file
        original_file_path = os.path.join(UPLOAD_FOLDER, audio_file.filename)
        audio_file.save(original_file_path)
        print(f"Original audio file saved at: {original_file_path}")

        # Convert the audio file to WAV format with PCM encoding
        converted_file_path = os.path.join(UPLOAD_FOLDER, "converted_output.wav")
        await convert_audio(original_file_path, converted_file_path)
        print(f"Converted audio file saved at: {converted_file_path}")

        # Transcribe the converted audio file
        transcription_result = await transcribe_audio(converted_file_path)

        # Clean up the saved files after processing
        os.remove(original_file_path)
        os.remove(converted_file_path)

        if "transcription" in transcription_result:
            return jsonify({"transcription": transcription_result["transcription"]})
        else:
            return jsonify({"error": transcription_result["error"]})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')