# Precision Pathways

[![Precision Pathways Demo](./precision-pathways.gif)](./precision-pathways.gif)

Precision Pathways is a simulation platform that bridges technology and healthcare. By integrating real-time video feeds, DICOM digitization, and interactive 3D visualization, the project supports surgical procedure monitoring and remote case review for enhanced patient care and professional education.

## Overview

**Precision Pathways** simulates 3D navigation in surgical environments through three core services:

- **precision-streamer:**  
  Simulates a live video feed representing the ongoing patient procedure.

- **precision-digitizer:**  
  Processes raw DICOM images into a detailed 3D model of the operative area.

- **precision-viewer:**  
  Renders the 3D model along with real-time instrument positions, enabling remote practitioners to monitor and review cases.

This combination of services facilitates remote consultation, intraoperative monitoring, and educational insights for practitioners not physically present with the patient.

## Background Context

In the modern healthcare setting, the ability to remotely observe and interact with live procedures is critical. Precision Pathways achieves this by:

- **Simulating Live Procedures:**  
  The precision-streamer provides a dependable simulation of a surgical video feed, essential for real-time observation.
  
- **3D Anatomical Modeling:**  
  Using processed DICOM images, the precision-digitizer creates accurate 3D representations of the surgical field, aiding both in navigation and post-procedure analysis.
  
- **Real-Time Monitoring & Training:**  
  The precision-viewer displays live instrument positioning and the 3D model, offering a platform for intraoperative decision-making and remote expert consultation.

This approach not only enhances patient monitoring but also serves as an invaluable training tool for healthcare professionals.

---

### **Precision API**

The Precision API service is developed with NestJS and serves as the central hub for collecting and distributing real-time instrument tracking data. Built from the `./precision-api` project and exposed on port 3000, it receives a simulated HLS video feed from the precision-streamer via the environment variable `HLS_STREAM_URL=http://precision-streamer:8000/stream.m3u8`. This setup ensures robust communication and seamless integration between the streaming solution and the 3D visualization components.

---

### **Data Processing & Notebooks**

Within this system, the precision-digitizer service plays a crucial role in data preparation. It leverages the contents of the `./notebooks/dicoms` directory to process raw DICOM images. The service converts these images into structural assets suitable for 3D rendering and outputs them to the `./precision-viewer/src/assets` directory. Controlled by the environment variables `DATAIN` and `DATAOUT`, this workflow ensures that healthcare imaging data is effectively refined for visualization and further analysis.

---

### **Precision Viewer**

The precision-viewer service brings the simulation platform to life by delivering an interactive 3D visualization of the surgical scene. Built from the `./precision-viewer` project, it communicates with the Precision API using the URL `http://precision-api:3000` (set through the `API_HOST` environment variable) to retrieve live instrument positioning data. Exposed on port 5000, the viewer offers a comprehensive interface that allows practitioners to actively monitor, review, and interact with detailed 3D models during simulated procedures.


---

### **Our Exciting TODOs** 🚀

1. [X] **Convert DICOM Files to SIL Objects**: Transform raw medical imaging files into objects that can load seamlessly in our Angular app.
2. [x] **Improve 3D Controls**: Add functionality to zoom in, pan, and interact with the 3D space for an enhanced user experience.
3. [ ] **Refine Coordinate Generation**: Make the random coordinate generator more natural and smooth—perfect for showcasing at hackathons!
4. [X] **Process Video Streams**: Enable the same level of processing for video streams as we do for DICOM files, unlocking more possibilities.
5. [ ] **Implement Computer Vision**: Use cutting-edge computer vision techniques to track objects in video streams and render them dynamically in the Three.js canvas. This would be a groundbreaking achievement!

---

### **Tools Required for Local Development**

To set up and develop this workspace locally, here’s what you’ll need:

#### **Essential Tools**
1. **Node.js**  
   - Required for running the backend (`Precision API`) and frontend (`Precision Viewer`) projects.  
   - Install the latest LTS version from [Node.js official website](https://nodejs.org).

2. **npm (Node Package Manager)**  
   - Comes bundled with Node.js and manages dependencies for both projects.

3. **Angular CLI**  
   - Needed for developing and running the `Precision Viewer` frontend.  
   - Install globally using:  
     ```bash
     npm install -g @angular/cli
     ```

4. **NestJS CLI**  
   - Required for developing and running the `Precision API` backend.  
   - Install globally using:  
     ```bash
     npm install -g @nestjs/cli
     ```

5. **Docker**  
   - Used to containerize and run both projects together.  
   - Install it from [Docker's official website](https://www.docker.com).

6. **Git**  
   - Essential for version control and cloning repositories.  
   - Get it from [Git's official website](https://git-scm.com).

#### **Optional Tools**
1. **Visual Studio Code**  
   - A powerful IDE for editing and debugging.  
   - Recommended extensions include:
     - **Angular Language Service** for Angular development.
     - **ESLint** for code linting.
     - **Docker** for managing containers.

2. **Postman**  
   - Great for testing API endpoints of the `Precision API`.  
   - Download from [Postman](https://www.postman.com).

3. **Three.js Documentation**  
   - A resource for working with 3D rendering in the `Precision Viewer`.  
   - Access it at [Three.js official site](https://threejs.org/docs).

---

### **Steps to Run the Docker Compose File**

1. **Navigate to the Project Directory**  
   Open your terminal and navigate to the folder containing the `docker-compose.yml` file:
   ```bash
   cd /path/to/project-directory
   ```

2. **Build the Docker Containers**  
   Run the following command to build the containers without using the cache:
   ```bash
   docker compose build
   ```

3. **Start the Docker Containers**  
   Use the following command to start the containers and recreate them if necessary:
   ```bash
   docker compose up
   ```

4. **Access the viewer**  
   The precision tracker view will be available on [http://localhost:5000](http://localhost:5000)

#### **Reference:**
Surgery videos: https://www.laparoscopyhospital.com/free-robotic-surgery-video.html