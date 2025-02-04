FROM python:3.11.9

# Set the working directory in the container
WORKDIR /app

# Copy the requirements.txt and install dependencies
COPY ./requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

# Copy the rest of the application files
COPY . .

# Expose the correct port (Hugging Face typically uses 7860 for web apps)
EXPOSE 7860

# Start the app with gunicorn, binding to all interfaces and using port 7860
CMD ["gunicorn", "-b", "0.0.0.0:7860", "app:app"]

