# Stage 1: Build the Angular application
FROM node:20 AS build

ADD ZscalerRootCertificate-2048-SHA256.crt /usr/local/share/ca-certificates/ZscalerRootCertificate.crt
RUN chmod 644 /usr/local/share/ca-certificates/ZscalerRootCertificate.crt && update-ca-certificates
ENV REQUESTS_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Configure npm to use the custom certificate
RUN npm config set cafile /usr/local/share/ca-certificates/ZscalerRootCertificate.crt


# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Angular application
RUN npm run build --prod

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

# Copy the built application from the previous stage
COPY --from=build /app/dist/precision-viewer/browser /usr/share/nginx/html

# Copy the STLLoader file explicitly (if needed)
# COPY node_modules/three/examples/jsm/loaders/STLLoader.js /usr/share/nginx/html/assets/js/

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 5000
EXPOSE 5000

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
