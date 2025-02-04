FROM python:3.12

# Set the working directory in the container
WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    apt-get clean

# Copy the requirements.txt and install Python dependencies
COPY ./requirements.txt /app/requirements.txt
RUN pip install -r /app/requirements.txt

# Install additional Python dependencies
RUN pip install pydub requests grpcio grpcio-tools

# Download the NVIDIA Python client
RUN git clone https://github.com/nvidia-riva/python-clients.git

# Force reinstall the NVIDIA Python client from GitHub
# RUN pip install --force-reinstall git+https://github.com/nvidia-riva/python-clients.git

# Copy the rest of the application files
COPY . .

# Expose the correct port (Hugging Face typically uses 7860 for web apps)
EXPOSE 7860

# Start the app with gunicorn, binding to all interfaces and using port 7860
CMD ["gunicorn", "-b", "0.0.0.0:7860", "app:app"]
