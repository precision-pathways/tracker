import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { TrackerService } from './tracker.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private dot!: THREE.Mesh; // Declare the dot as a class property

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private trackerService: TrackerService) { }

  ngOnInit(): void {
    // Initialize Three.js only if the platform is browser
    if (isPlatformBrowser(this.platformId)) {
      this.initThreeJs();
    }
  }

  initThreeJs(): void {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
  
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
  
    // Add color-coded grids for XZ, XY, and YZ planes
    const gridXZ = new THREE.GridHelper(10, 10, 0x00ff00, 0x00ff00); // Green for XZ grid
    const gridXY = new THREE.GridHelper(10, 10, 0xff0000, 0xff0000); // Red for XY grid
    gridXY.rotation.x = Math.PI / 2; // Rotate to align with XY plane
    const gridYZ = new THREE.GridHelper(10, 10, 0x0000ff, 0x0000ff); // Blue for YZ grid
    gridYZ.rotation.z = Math.PI / 2; // Rotate to align with YZ plane
    scene.add(gridXZ, gridXY, gridYZ);
  
    // Add Axes Helper
    const axesHelper = new THREE.AxesHelper(5); // Length of axes
    scene.add(axesHelper);
  
    // Load the STL model
    const loader = new STLLoader();
    loader.load('/assets/dicom_model.stl', (geometry) => {
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
    });
  
    // Create the dot (small sphere)
    const geometry = new THREE.SphereGeometry(0.1, 32, 32); // Small sphere
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red color
    this.dot = new THREE.Mesh(geometry, material);
    this.dot.position.set(0, 0, 0); // Set initial position to (0, 0, 0)
    scene.add(this.dot);
  
    // Add lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);
  
    const ambientLight = new THREE.AmbientLight(0x404040); // Soft ambient light
    scene.add(ambientLight);
  
    // Position the camera
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
  
    // Render the scene
    let clock = new THREE.Clock(); // Clock to track time
    const animate = () => {
      requestAnimationFrame(animate);
  
      // Pulsate the dot
      const elapsedTime = clock.getElapsedTime();
      const scale = 1 + 0.2 * Math.sin(elapsedTime * 2); // Scale oscillates between 0.8 and 1.2
      this.dot.scale.set(scale, scale, scale);
  
      renderer.render(scene, camera);
    };
  
    animate();
  
    // Subscribe to the 'location' event
    this.trackerService.onLocation().subscribe(
      (data: { x: number; y: number; z: number }) => {
        console.log('Received coordinates:', data);
        if (this.dot) {
          // Update the position of the dot in the 3D scene
          this.dot.position.set(data.x, data.y, data.z);
    
          // Animate the dot after moving
          const initialScale = 1;
          const targetScale = 1.5; // Scale up to 1.5x
          const duration = 0.5; // Animation duration in seconds
          let elapsedTime = 0;
    
          const animateScale = () => {
            elapsedTime += 0.01; // Increment time
            const scale = THREE.MathUtils.lerp(initialScale, targetScale, elapsedTime / duration);
    
            // Apply the scale
            this.dot.scale.set(scale, scale, scale);
    
            if (elapsedTime < duration) {
              requestAnimationFrame(animateScale);
            } else {
              // Reset to the original scale
              this.dot.scale.set(initialScale, initialScale, initialScale);
            }
          };
    
          animateScale();
        }
      }
    );
  }
}