import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { TrackerService } from './tracker.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private dot!: THREE.Mesh;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private trackerService: TrackerService) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initThreeJs();
    }
  }

  initThreeJs(): void {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();

    scene.background = new THREE.Color(0x000022); // Dark hospital monitor style

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Hospital-style grid colors
    const gridXZ = new THREE.GridHelper(10, 10, 0x00ffcc, 0x00ffcc); // Cyan XZ grid
    const gridXY = new THREE.GridHelper(10, 10, 0xff4444, 0xff4444); // Red XY grid
    gridXY.rotation.x = Math.PI / 2;
    const gridYZ = new THREE.GridHelper(10, 10, 0x44ff44, 0x44ff44); // Green YZ grid
    gridYZ.rotation.z = Math.PI / 2;

    gridXZ.renderOrder = 1;
    gridXY.renderOrder = 1;
    gridYZ.renderOrder = 1;

    scene.add(gridXZ, gridXY, gridYZ);

    // Load STL model with glowing effect
    const loader = new STLLoader();
    loader.load('/assets/dicom_model.stl', (geometry) => {
      const material = new THREE.MeshStandardMaterial({ 
        color: 0x00ff88, 
        transparent: true, 
        opacity: 0.7, 
        emissive: 0x00ff88, 
        emissiveIntensity: 1.5 
      });
      geometry.center();
      const mesh = new THREE.Mesh(geometry, material);
      mesh.scale.set(0.05, 0.05, 0.05);
      scene.add(mesh);
    });

    // Glowing red dot for tracking
    const dotGeometry = new THREE.SphereGeometry(0.1, 32, 32);
    const dotMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xff0000, 
      emissive: 0xff0000, 
      emissiveIntensity: 2 
    });
    this.dot = new THREE.Mesh(dotGeometry, dotMaterial);
    this.dot.position.set(0, 0, 0);
    scene.add(this.dot);

    // Add ambient & directional lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // Position the camera
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);

    let clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);

      // Pulsate the dot
      const elapsedTime = clock.getElapsedTime();
      const scale = 1 + 0.2 * Math.sin(elapsedTime * 2);
      this.dot.scale.set(scale, scale, scale);

      renderer.render(scene, camera);
    };

    animate();

    // Subscribe to location updates
    this.trackerService.onLocation().subscribe(
      (data: { x: number; y: number; z: number }) => {
        console.log('Received coordinates:', data);
        if (this.dot) {
          this.dot.position.set(data.x, data.y, data.z);

          // Animate the dot scaling like a heartbeat
          const initialScale = 1;
          const targetScale = 1.5;
          const duration = 0.5;
          let elapsedTime = 0;

          const animateScale = () => {
            elapsedTime += 0.01;
            const scale = THREE.MathUtils.lerp(initialScale, targetScale, elapsedTime / duration);
            this.dot.scale.set(scale, scale, scale);

            if (elapsedTime < duration) {
              requestAnimationFrame(animateScale);
            } else {
              this.dot.scale.set(initialScale, initialScale, initialScale);
            }
          };

          animateScale();
        }
      }
    );
  }
}
