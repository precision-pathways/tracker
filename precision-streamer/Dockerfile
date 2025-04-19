FROM ubuntu:22.04

# Avoid interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install FFmpeg and Python3
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
 && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy the video file into the container
COPY ./video.mp4 /app/video.mp4

# Expose port 8000 for the HTTP server
EXPOSE 8000

# Use FFmpeg to loop the video indefinitely and generate an HLS stream,
# then start the simple Python HTTP server. The ampersand (&) puts FFmpeg in the background.
CMD ["/bin/sh", "-c", "ffmpeg -loglevel quiet -stream_loop -1 -i video.mp4 -codec copy -start_number 0 -hls_time 10 -hls_list_size 0 -f hls stream.m3u8 & exec python3 -m http.server 8000"]

