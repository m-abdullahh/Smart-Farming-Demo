FROM python:3.12

RUN apt-get update && \
    apt-get install -y ffmpeg && \
    apt-get clean
    
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /app


COPY --chown=user ./requirements.txt requirements.txt
RUN pip install --no-cache-dir --upgrade -r requirements.txt
RUN git clone https://github.com/nvidia-riva/python-clients.git


COPY --chown=user . /app
CMD ["gunicorn", "-b", "0.0.0.0:7860", "app:app"]