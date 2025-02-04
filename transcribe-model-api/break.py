from flask import Flask, jsonify
import subprocess
import os

app = Flask(__name__)

# NVIDIA API details
NVIDIA_API_URL = "grpc.nvcf.nvidia.com:443"
FUNCTION_ID = "d8dd4e9b-fbf5-4fb0-9dba-8cf436c8d965"
API_KEY = ""

def transcribe_audio(audio_file_path):
    """Transcribe audio using NVIDIA API"""
    print("Starting transcription")
    try:
        # Call NVIDIA API using the provided Python script
        result = subprocess.run(
            [
                "python",
                os.path.join("python-clients", "scripts", "asr", "transcribe_file.py"),
                "--server", NVIDIA_API_URL,
                "--use-ssl",
                "--metadata", "function-id", FUNCTION_ID,
                "--metadata", "authorization", f"Bearer {API_KEY}",
                "--language-code", "en-US",
                "--input-file", audio_file_path
            ],
            capture_output=True,
            text=True
        )

        print("Subprocess stdout:", result.stdout)
        print("Subprocess stderr:", result.stderr)

        if result.returncode != 0:
            return {"error": "Transcription failed", "details": result.stderr}

        return {"transcription": result.stdout.strip()}

    except Exception as e:
        return {"error": str(e)}

@app.route('/transcribe', methods=['GET'])
def transcribe():
    """Handle transcription for a fixed file"""
    try:
        # Use fixed file "audio.wav" from the current directory
        audio_file_path = "audio.wav"
        
        # Check if the file exists
        if not os.path.exists(audio_file_path):
            return jsonify({"error": "audio.wav file not found in the current directory"}), 400
        
        # Transcribe the audio
        transcription_result = transcribe_audio(audio_file_path)

        # Return the result
        if "transcription" in transcription_result:
            return jsonify({"transcription": transcription_result["transcription"]})
        else:
            return jsonify({"error": transcription_result["error"]})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
