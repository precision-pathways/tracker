# Use the official Node.js image as the base image
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Update package lists and install FFmpeg
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Build the NestJS application
RUN npm run build

# Expose the application port
EXPOSE 3000

ARG HLS_STREAM_URL
ENV HLS_STREAM_URL=${HLS_STREAM_URL}

# Start the application
CMD ["node", "dist/main.js", "--host", "0.0.0.0"]
