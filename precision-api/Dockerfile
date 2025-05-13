# Use the official Node.js image as the base image
FROM node:20


ADD ZscalerRootCertificate-2048-SHA256.crt /usr/local/share/ca-certificates/ZscalerRootCertificate.crt
RUN chmod 644 /usr/local/share/ca-certificates/ZscalerRootCertificate.crt && update-ca-certificates
ENV REQUESTS_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt

# Set the working directory inside the container
WORKDIR /app

# Update package lists and install FFmpeg
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Configure npm to use the custom certificate
RUN npm config set cafile /usr/local/share/ca-certificates/ZscalerRootCertificate.crt

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
