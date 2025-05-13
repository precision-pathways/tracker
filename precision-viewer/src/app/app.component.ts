import { Component, OnInit, Inject, PLATFORM_ID, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { TrackerService } from './tracker.service';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, AfterViewInit {
  private dots: THREE.Mesh[] = [];
  private camera!: THREE.PerspectiveCamera;
  private scene!: THREE.Scene;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  @ViewChild('canvas') private canvasRef!: ElementRef;

  spinInterval: number | null = null;
  spinVerticalInterval: number | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private trackerService: TrackerService) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initThreeJs();
    }
  }

  ngAfterViewInit(): void {
    this.canvasRef.nativeElement.appendChild(this.renderer.domElement);
    this.animate();
  }

  private initThreeJs(): void {
    this.scene = this.createScene();
    this.camera = this.createCamera();
    this.renderer = this.createRenderer();

    this.addGrids(this.scene);
    this.loadSTLModel(this.scene);
    this.addLighting(this.scene);

    this.initControls();
    this.animate();

    this.subscribeToLocationUpdates();
  }

  private createScene(): THREE.Scene {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000022); // Dark hospital monitor style
    return scene;
  }

  private createCamera(): THREE.PerspectiveCamera {
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
    return camera;
  }

  private createRenderer(): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    return renderer;
  }

  private addGrids(scene: THREE.Scene): void {
    const gridXZ = new THREE.GridHelper(10, 10, 0x00ffcc, 0x00ffcc); // Cyan XZ grid
    const gridXY = new THREE.GridHelper(10, 10, 0xff4444, 0xff4444); // Red XY grid
    gridXY.rotation.x = Math.PI / 2;
    const gridYZ = new THREE.GridHelper(10, 10, 0x44ff44, 0x44ff44); // Green YZ grid
    gridYZ.rotation.z = Math.PI / 2;

    gridXZ.renderOrder = 1;
    gridXY.renderOrder = 1;
    gridYZ.renderOrder = 1;

    scene.add(gridXZ, gridXY, gridYZ);
  }

  private loadSTLModel(scene: THREE.Scene): void {
    const loader = new STLLoader();
    loader.load('/assets/dicom_model.stl', (geometry) => {
      const material = new THREE.MeshStandardMaterial({
        color: 0x00ff88,
        transparent: true,
        opacity: 0.7,
        emissive: 0x00ff88,
        emissiveIntensity: 1.5,
      });
      geometry.center();
      const mesh = new THREE.Mesh(geometry, material);
      mesh.scale.set(0.05, 0.05, 0.05);
      scene.add(mesh);
    });
  }

  // Helper to add or update dots based on incoming coordinates
  private addOrUpdateDots(coordinates: { x: number; y: number; z: number }[], scene: THREE.Scene): void {
    // Scaling factor to fit large coordinates into the view
    const SCALE = 0.003; // Adjust as needed for your scene size

    // Remove extra dots if needed
    while (this.dots.length > coordinates.length) {
      const dot = this.dots.pop();
      if (dot) scene.remove(dot);
    }
    // Add new dots if needed
    while (this.dots.length < coordinates.length) {
      const dotGeometry = new THREE.SphereGeometry(0.1, 32, 32);
      const dotMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 2,
      });
      const dot = new THREE.Mesh(dotGeometry, dotMaterial);
      scene.add(dot);
      this.dots.push(dot);
    }
    // Update positions with scaling
    coordinates.forEach((coord, i) => {
      this.dots[i].position.set(coord.x * SCALE, coord.y * SCALE, coord.z * SCALE);
    });
  }

  private addLighting(scene: THREE.Scene): void {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
  }

  private initControls(): void {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 10;
  }

  private animate(): void {
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);

      // Pulsate all dots
      const elapsedTime = clock.getElapsedTime();
      const scale = 1 + 0.2 * Math.sin(elapsedTime * 2);
      this.dots.forEach(dot => dot.scale.set(scale, scale, scale));

      // Update controls
      const delta = clock.getDelta();
      this.controls.update(delta);

      this.renderer.render(this.scene, this.camera);
    };

    animate();
  }

  private subscribeToLocationUpdates(): void {
    this.trackerService.onLocation().subscribe((data: { x: number; y: number; z: number }[]) => {
      this.addOrUpdateDots(data, this.scene);

      // Animate all dots scaling like a heartbeat
      const initialScale = 1;
      const targetScale = 1.5;
      const duration = 0.5;
      let elapsedTime = 0;

      const animateScale = () => {
        elapsedTime += 0.01;
        const scale = THREE.MathUtils.lerp(initialScale, targetScale, elapsedTime / duration);
        this.dots.forEach(dot => dot.scale.set(scale, scale, scale));
        if (elapsedTime < duration) {
          requestAnimationFrame(animateScale);
        } else {
          this.dots.forEach(dot => dot.scale.set(initialScale, initialScale, initialScale));
        }
      };

      animateScale();
    });
  }

  spinCamera(): void {
    if (this.spinInterval) {
      this.stopSpinning();
      return;
    }
    this.stopSpinning();
    this.spinInterval = window.setInterval(() => {
      this.camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.02);
      this.camera.lookAt(new THREE.Vector3(0, 0, 0));
      this.renderer.render(this.scene, this.camera);
    }, 16);
  }

  spinCameraVertical() {
    if (this.spinVerticalInterval) {
      this.stopSpinning();
      return;
    }
    this.stopSpinning();
    this.spinVerticalInterval = window.setInterval(() => {
      this.camera.position.applyAxisAngle(new THREE.Vector3(1, 0, 0), 0.02);
      this.camera.lookAt(new THREE.Vector3(0, 0, 0));
      this.renderer.render(this.scene, this.camera);
    }, 16);
  }

  stopSpinning(): void {
    if (this.spinInterval) {
      clearInterval(this.spinInterval);
      this.spinInterval = null;
    }
    if (this.spinVerticalInterval) {
      clearInterval(this.spinVerticalInterval);
      this.spinVerticalInterval = null;
    }
  }
}
