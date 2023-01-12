import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import * as THREE from 'three';
import * as font from 'three/examples/fonts/helvetiker_bold.typeface.json';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { gsap } from 'gsap';

import { Howl } from 'howler';

import { points, colors } from '../../constants';

declare const OnirixSDK: any;
const OX = new OnirixSDK("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyMDIsInByb2plY3RJZCI6MTgyMzYsInJvbGUiOjMsImlhdCI6MTYyOTYyODk1Mn0.pMHhjuCZwAoELfriSbEdixugVy_tdy6qKPmwgiDuem8");

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class GameComponent implements OnInit {

  coinId!: string;
  score!: number;
  showHome: boolean = true;
  loading: boolean = false;
  
  // THREE.js
  scene: THREE.Scene = new THREE.Scene();
  renderer!: THREE.WebGLRenderer;
  camera!: THREE.PerspectiveCamera;
  coinModel!: THREE.Object3D;
  pointsModel!: THREE.Object3D;
  clock: THREE.Clock = new THREE.Clock();
  catchingAnimation = false;
  
  // Sounds
  coinFlipSound = new Howl({ src: ['assets/coin-flip.mp3'] });
  successSound = new Howl({ src: ['assets/success.mp3'] });

  constructor(private route: ActivatedRoute) {
    // Get current score
    this.score = (localStorage.getItem('score')) ? parseInt(localStorage.getItem('score')!) : 0;
  }

  ngOnInit(): void {
    // Get coin id from route
    this.coinId = this.route.snapshot.params.id;
    // If user does not exist, redirect to register component
    if (localStorage.getItem('email') === null) {
      window.location.href = `/register?from=${this.coinId}`;
    }
    
  }

  async initGame() {
    
    this.showHome = false;
    this.loading = true;

    // Initialize Onirix and setup renderer
    const renderCanvas = await OX.init({ mode: OnirixSDK.TrackingMode.Image });
    this.setupRenderer(renderCanvas);

    // Initialize render loop
    this.renderLoop();

    // Load the scene
    this.loadScene();

    // Subscribe to Onirix callbacks
    OX.subscribe(OnirixSDK.Events.OnDetected, (id: string) => {
      this.onDetected();
    });

    OX.subscribe(OnirixSDK.Events.OnPose, (pose: any) => {
      this.updatePose(pose);
    });

    OX.subscribe(OnirixSDK.Events.OnLost, (id: string) => {
      this.onLost();
    });

    OX.subscribe(OnirixSDK.Events.OnResize, () => {
      this.onResize();
    });

    OX.subscribe(OnirixSDK.Events.OnTouch, (touchPos: any) => {
      this.onTouch(touchPos);
    });

    this.loading = false;

  }

  setupRenderer(renderCanvas: any) {
    
    const width = renderCanvas.width;
    const height = renderCanvas.height;
    
    // Initialize renderer with renderCanvas provided by Onirix SDK
    this.renderer = new THREE.WebGLRenderer({ canvas: renderCanvas, alpha: true, antialias: true });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // Ask Onirix SDK for camera parameters to create a 3D camera that fits with the AR projection.
    const cameraParams = OX.getCameraParameters();
    this.camera = new THREE.PerspectiveCamera(cameraParams.fov, cameraParams.aspect, 0.1, 1000);
    this.camera.matrixAutoUpdate = false;
    
    // Add some lights
    const ambientLight = new THREE.AmbientLight('#ffffff', 1.5);
    this.scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight('#ffffff', 1.5);
    directionalLight.position.set(0, 1, -1);
    this.scene.add(directionalLight);
    
  }

  onDetected() {
    // Show scene
    this.scene.add(this.coinModel);
    // It is useful to synchronize scene background with the camera feed
    this.scene.background = new THREE.VideoTexture(OX.getCameraFeed());
  }

  onLost() {
    // Clear scene
    this.scene.remove(this.coinModel);
    this.scene.remove(this.pointsModel);
    this.scene.background = null;
  }

  onTouch(touchPos: any) {
    // Raycast
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(touchPos, this.camera);
    const intersects = raycaster.intersectObject(this.coinModel, true);
    if (intersects.length > 0) {
      // Coin catch animation
      this.catchingAnimation = true;
      this.coinFlipSound.play();
      gsap.to(this.coinModel.rotation, { x: 0, y: 0, z: 0, duration: 0.3, 
        onComplete: () => {
          gsap.to(this.coinModel.rotation, { x: 7.5 * Math.PI, duration: 2 });
          gsap.to(this.coinModel.position, { z: -1, duration: 1, 
            onComplete: () => {
              gsap.to(this.coinModel.position, { z: 0, duration: 1,
                onComplete: () => {
                  this.scene.add(this.pointsModel);
                  this.successSound.play();
                  gsap.to(this.pointsModel.scale, { x: 0.0025, y: 0.0025, z: 0.0025, duration: 2, 
                    onComplete: () => {
                        this.scene.remove(this.pointsModel);
                        location.href = "/score/" + this.coinId;
                    }
                  });
                }
              });
            } 
          });
        }
      });
    }
  }

  updatePose(pose: any) {
    // When a new pose is detected, update the 3D camera
    let modelViewMatrix = new THREE.Matrix4();
    modelViewMatrix = modelViewMatrix.fromArray(pose);
    this.camera.matrix = modelViewMatrix;
    this.camera.matrixWorldNeedsUpdate = true;
  }

  onResize() {
    // When device orientation changes, it is required to update camera params.
    const width = this.renderer.domElement.width;
    const height = this.renderer.domElement.height;
    const cameraParams = OX.getCameraParameters();
    this.camera.fov = cameraParams.fov;
    this.camera.aspect = cameraParams.aspect;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  render() {
    // Just render the scene
    this.renderer.render(this.scene, this.camera);
  }

  renderLoop() {
    const delta = this.clock.getDelta();
    if (this.coinModel && !this.catchingAnimation) {
      this.coinModel.rotation.y += delta;
    }
    this.render();
    requestAnimationFrame(() => this.renderLoop());
  }

  loadScene() {
    // Load coin model
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      'assets/coin.glb',
      (model) => {
        this.coinModel = model.scene;
        this.coinModel.rotation.x = -0.5 * Math.PI;
        this.coinModel.scale.set(0.5, 0.5, 0.5);
        this.coinModel.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            // Tint coin
            child.material.color.set(colors.get(this.coinId));
          }
        });
      }
    );
    // Load points model
    const textGeometry = new THREE.TextGeometry(
      `+${points.get(this.coinId)}`,
      {
        font: new THREE.Font(font),
        height: 5,
        curveSegments: 50,
        bevelEnabled: true,
        bevelSize: 5,
        bevelThickness: 5,
        bevelSegments: 5
      }
    );
    textGeometry.center();
    const textMaterial = new THREE.MeshStandardMaterial({
      color: '#580088',
      metalness: 0.6,
      roughness: 0.2
    });
    this.pointsModel = new THREE.Mesh(textGeometry, textMaterial);
    this.pointsModel.position.y = 0.5;
    this.pointsModel.rotation.x = -Math.PI/2;
    this.pointsModel.scale.set(0.0001, 0.0001, 0.0001);
  }

  goBack() {
    window.location.reload();
  }

}