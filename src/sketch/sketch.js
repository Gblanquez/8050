import * as THREE from 'three'
import globalSceneManager from './scene-manager'
import gsap from 'gsap'
import { Draggable } from "gsap/Draggable"
gsap.registerPlugin(Draggable)

let sm = null

class SketchManager {
  constructor() {
    if (sm) return sm
    sm = this

    this.scene = null
    this.camera = null
    this.renderer = null
    this.canvas = null
    this.meshData = []
    this.isInitialized = false

    this.worldGroup = null
    this.circleGroup = null

    this.cylinderGroup = null
    this.dragCylinder = null

    this.isDragging = false
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
    this.dragPoint = new THREE.Vector3()
    this.previousDragPoint = new THREE.Vector3()

    this.rotationAxis = new THREE.Vector3(0, 1, 0)
    this.rotationQuaternion = new THREE.Quaternion()

    this.currentRotationVelocity = 0
    this.dragVelocity = 0
    this.lastDragTime = 0
    this.velocityMultiplier = 0.8
    this.dampingFactor = 0.95
    this.minVelocity = 0.001

    this.dragEnabled = true
    this.startTime = performance.now() / 1000

    this.cornerAmount = 0
    this.cornerDamping = 0.9
  }

  init(container) {
    if (this.isInitialized) return

    this.container = container

    this.canvas = document.createElement('canvas')
    this.canvas.style.position = 'absolute'
    this.canvas.style.top = '0'
    this.canvas.style.left = '0'
    this.canvas.style.width = '100%'
    this.canvas.style.height = '100%'
    this.canvas.style.pointerEvents = 'none'
    this.canvas.style.zIndex = '1'
    container.appendChild(this.canvas)

    this.scene = new THREE.Scene()

    const width = container.clientWidth
    const height = container.clientHeight

    this.camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      1000
    )
    this.camera.position.set(0, 0, 6)

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true
    })
    this.renderer.setSize(width, height)

    this.worldGroup = new THREE.Group()
    this.scene.add(this.worldGroup)

    this.circleGroup = new THREE.Group()
    this.worldGroup.add(this.circleGroup)

    this.initializeRotationAxis()

    globalSceneManager.init(this.canvas, this.camera)

    this.setupMeshes()
    this.createDragCylinder()
    this.setupDragListeners()

    window.addEventListener('resize', () => this.handleResize())

    this.isInitialized = true
    this.animate()
  }

  initializeRotationAxis() {
    const tiltQuaternion = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(
        Math.PI * 0.1,
        Math.PI * 0.1,
        Math.PI * -0.1
      )
    )

    this.rotationAxis.applyQuaternion(tiltQuaternion)
    this.rotationAxis.normalize()
  }

  setupMeshes() {
    if (!globalSceneManager.isInitialized) {
      setTimeout(() => this.setupMeshes(), 50)
      return
    }

    globalSceneManager.updateMeshes()
    this.meshData = [...globalSceneManager.meshes]

    this.createThreeMeshes()
  }

  createThreeMeshes() {
    this.circleGroup.children = this.circleGroup.children.filter(
      child => !child.userData?.isImageMesh
    )

    this.meshData.forEach((data) => {
      const geometry = new THREE.PlaneGeometry(2, 2, 12, 1)
      const mesh = new THREE.Mesh(geometry, data.material)

      mesh.matrixAutoUpdate = false
      mesh.matrix.copy(data.matrix)

      mesh.userData.isImageMesh = true

      this.circleGroup.add(mesh)
    })
  }

  createDragCylinder() {
    const radius = 3.5
    const height = 3
    const geometry = new THREE.CylinderGeometry(radius, radius, height, 90)
    const material = new THREE.MeshBasicMaterial({
      visible: false,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.1,
      color: 0x00ff00
    })

    this.cylinderGroup = new THREE.Group()
    this.dragCylinder = new THREE.Mesh(geometry, material)

    this.cylinderGroup.add(this.dragCylinder)

    this.cylinderGroup.rotation.x = Math.PI * 0.1
    this.cylinderGroup.rotation.y = Math.PI * 0.1
    this.cylinderGroup.rotation.z = Math.PI * -0.1

    this.worldGroup.add(this.cylinderGroup)
  }

  setupDragListeners() {
    this.onPointerDownHandler = this.onPointerDown.bind(this)
    this.onPointerMoveHandler = this.onPointerMove.bind(this)
    this.onPointerUpHandler = this.onPointerUp.bind(this)

    window.addEventListener('pointerdown', this.onPointerDownHandler)
    window.addEventListener('pointermove', this.onPointerMoveHandler)
    window.addEventListener('pointerup', this.onPointerUpHandler)
    window.addEventListener('pointercancel', this.onPointerUpHandler)
  }

  getNormalizedMouse(event) {
    const rect = this.canvas.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
      y: -((event.clientY - rect.top) / rect.height) * 2 + 1
    }
  }

  onPointerDown(event) {
    if (!this.dragEnabled || !this.dragCylinder) return

    const pos = this.getNormalizedMouse(event)
    this.mouse.x = pos.x
    this.mouse.y = pos.y

    this.raycaster.setFromCamera(this.mouse, this.camera)

    const intersects = this.raycaster.intersectObject(this.dragCylinder, true)

    if (intersects.length > 0) {
      this.isDragging = true

      if (event.target.setPointerCapture) {
        try {
          event.target.setPointerCapture(event.pointerId)
        } catch (_) {}
      }

      const intersectPoint = intersects[0].point.clone()
      this.cylinderGroup.worldToLocal(intersectPoint)
      this.previousDragPoint.copy(intersectPoint)

      this.lastDragTime = performance.now()
      this.currentRotationVelocity = 0
      this.dragVelocity = 0
    }
  }

  onPointerMove(event) {
    if (!this.isDragging || !this.dragCylinder) return

    const pos = this.getNormalizedMouse(event)
    this.mouse.x = pos.x
    this.mouse.y = pos.y

    this.raycaster.setFromCamera(this.mouse, this.camera)

    const intersects = this.raycaster.intersectObject(this.dragCylinder, true)

    if (intersects.length > 0) {
      const currentTime = performance.now()
      const deltaTime = Math.max((currentTime - this.lastDragTime) / 1000, 0.001)

      const intersectPoint = intersects[0].point.clone()
      this.cylinderGroup.worldToLocal(intersectPoint)
      this.dragPoint.copy(intersectPoint)

      const projectedPrevious = this.previousDragPoint.clone()
        .projectOnPlane(this.rotationAxis)
        .normalize()

      const projectedCurrent = this.dragPoint.clone()
        .projectOnPlane(this.rotationAxis)
        .normalize()

      const dot = Math.min(1, Math.max(-1, projectedPrevious.dot(projectedCurrent)))
      const angle = Math.acos(dot)

      const cross = new THREE.Vector3().crossVectors(projectedPrevious, projectedCurrent)
      const direction = Math.sign(cross.dot(this.rotationAxis)) || 1
      const signedAngle = angle * direction

      this.dragVelocity = signedAngle / deltaTime
      this.currentRotationVelocity = this.currentRotationVelocity * 0.8 + this.dragVelocity * 0.2

      const targetCorner = THREE.MathUtils.clamp(this.dragVelocity * 0.3, -0.6, 0.6)
      this.cornerAmount = targetCorner

      this.rotationQuaternion.setFromAxisAngle(
        this.rotationAxis,
        this.currentRotationVelocity * 0.1
      )
      this.worldGroup.quaternion.multiply(this.rotationQuaternion)

      this.previousDragPoint.copy(this.dragPoint)
      this.lastDragTime = currentTime
    }
  }

  onPointerUp(event) {
    if (!this.isDragging) return

    if (event.target.releasePointerCapture) {
      try {
        event.target.releasePointerCapture(event.pointerId)
      } catch (_) {}
    }

    this.isDragging = false
    this.currentRotationVelocity *= this.velocityMultiplier
  }

  updateMeshPositions() {}

  handleResize() {
    const width = this.container.clientWidth
    const height = this.container.clientHeight

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(width, height)

    globalSceneManager.materials.forEach((material) => {
      if (material.uniforms.uResolution) {
        material.uniforms.uResolution.value.set(width, height)
      }
    })

    setTimeout(() => this.setupMeshes(), 100)
  }

  animate() {
    requestAnimationFrame(() => this.animate())

    const t = performance.now() / 1000 - this.startTime

    globalSceneManager.materials.forEach((material) => {
      if (material.uniforms.time) {
        material.uniforms.time.value = t
      }

      if (material.uniforms.uCorners) {
        const v = this.cornerAmount
        material.uniforms.uCorners.value.set(v, -v, -v, v)
      }
    })

    if (!this.isDragging) {
      this.cornerAmount *= this.cornerDamping
      if (Math.abs(this.cornerAmount) < 0.0001) this.cornerAmount = 0
    }

    if (this.dragEnabled && !this.isDragging && Math.abs(this.currentRotationVelocity) > this.minVelocity) {
      this.rotationQuaternion.setFromAxisAngle(
        this.rotationAxis,
        this.currentRotationVelocity * 0.1
      )
      this.worldGroup.quaternion.multiply(this.rotationQuaternion)
      this.currentRotationVelocity *= this.dampingFactor
    }

    this.renderer.render(this.scene, this.camera)
  }

  cleanup() {
    this.circleGroup.children.forEach(child => {
      if (child.userData?.isImageMesh) {
        child.geometry.dispose()
        child.material.dispose()
      }
    })

    if (this.dragCylinder) {
      if (this.dragCylinder.geometry) this.dragCylinder.geometry.dispose()
      if (this.dragCylinder.material) this.dragCylinder.material.dispose()
      if (this.cylinderGroup) this.worldGroup.remove(this.cylinderGroup)
      this.dragCylinder = null
      this.cylinderGroup = null
    }

    window.removeEventListener('pointerdown', this.onPointerDownHandler)
    window.removeEventListener('pointermove', this.onPointerMoveHandler)
    window.removeEventListener('pointerup', this.onPointerUpHandler)
    window.removeEventListener('pointercancel', this.onPointerUpHandler)

    this.meshData = []
    globalSceneManager.meshes = []
  }


  animateMenuMeshes(isOpen = true) {
    if (!globalSceneManager.isInitialized) return
    globalSceneManager.animateMenuMeshes(isOpen)
  }

  animateMenuIntro() {
    if (!this.worldGroup) return;
  
    this.dragEnabled = false;
  
    // start angle
    const state = { angle: 0 };
  
    gsap.killTweensOf(state);
  
    gsap.to(state, {
      angle: Math.PI * 2, // full rotation
      duration: 1.6,
      ease: "power2.out",
      onUpdate: () => {
        // apply rotation exactly like drag
        this.rotationQuaternion.setFromAxisAngle(
          this.rotationAxis,
          state.angle - (this._lastIntroAngle || 0)
        );
  
        this.worldGroup.quaternion.multiply(this.rotationQuaternion);
  
        this._lastIntroAngle = state.angle;
      },
      onComplete: () => {
        this._lastIntroAngle = 0;
        this.dragEnabled = true;
      }
    });
  }
}

const sketchManager = new SketchManager()
export default sketchManager