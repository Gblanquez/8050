import * as THREE from 'three'
import { fragmentShader } from './shaders/fragment.js'
import { vertexShader } from './shaders/vertex.js'
import gsap from 'gsap'

let sceneInstance = null

class SceneManager {
  constructor() {
    if (sceneInstance) return sceneInstance

    this.scene = null
    this.camera = null
    this.renderer = null
    this.canvasElement = null
    this.materials = new Map()
    this.meshes = []
    this.isInitialized = false
    this.textureLoader = new THREE.TextureLoader()

    sceneInstance = this
  }

  init(canvasElement, camera) {
    this.canvasElement = canvasElement
    this.camera = camera
    this.isInitialized = true
  }

  reset() {
    this.materials.forEach((material) => {
      material.dispose()
      if (material.uniforms.uTexture.value) {
        material.uniforms.uTexture.value.dispose()
      }
    })
    this.materials.clear()
    this.meshes = []
  }

  makeUniforms(texture, w, h) {
    return {
      uTexture: { value: texture },
      uTextureSize: { value: new THREE.Vector2(w, h) },
      uOpacity: { value: 0 },
      uPlaneSize: { value: new THREE.Vector2(1, 1) },
      uImageSize: { value: new THREE.Vector2(w, h) },
      uRadius: { value: 1 },
      uReveal: { value: 0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uQuadSize: { value: new THREE.Vector2(2, 2) },
      uProgress: { value: 0 },
      uBend: { value: new THREE.Vector3(1.0, 0.0, 0.0) },
      uCorners: { value: new THREE.Vector4(0, 0, 0, 0) },
      uTransitionCorners: { value: new THREE.Vector4(0, 0, 0, 0) },
      hover: { value: new THREE.Vector2(0.5, 0.5) },
      hoverState: { value: 1.0 },
      time: { value: 0 }
    }
  }

  makeMaterial(uniforms) {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      depthWrite: false,
      transparent: true,
      side: THREE.DoubleSide,
      uniforms
    })
  }

  createMaterial(imageUrl) {
    if (this.materials.has(imageUrl)) {
      return this.materials.get(imageUrl)
    }

    const material = this.makeMaterial(this.makeUniforms(null, 1, 1))

    this.textureLoader.load(imageUrl, (texture) => {
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter
      material.uniforms.uTexture.value = texture

      if (texture.image && texture.image.width && texture.image.height) {
        material.uniforms.uTextureSize.value.set(texture.image.width, texture.image.height)
        material.uniforms.uImageSize.value.set(texture.image.width, texture.image.height)
      }
    })

    this.materials.set(imageUrl, material)
    return material
  }

  createVideoMaterial(src) {
    if (this.materials.has(src)) return this.materials.get(src)

    // create our own video element with crossOrigin set before loading
    const video = document.createElement('video')
    video.crossOrigin = 'anonymous'
    video.src = src
    video.autoplay = true
    video.loop = true
    video.muted = true
    video.playsInline = true
    video.setAttribute('playsinline', '')
    video.style.display = 'none'
    document.body.appendChild(video)
    video.play().catch(() => {})

    const material = this.makeMaterial(this.makeUniforms(null, 1920, 1080))

    video.addEventListener('loadeddata', () => {
      const texture = new THREE.VideoTexture(video)
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter
      material.uniforms.uTexture.value = texture
      material.uniforms.uTextureSize.value.set(video.videoWidth, video.videoHeight)
      material.uniforms.uImageSize.value.set(video.videoWidth, video.videoHeight)
    }, { once: true })

    this.materials.set(src, material)
    return material
  }

  createCircleMatrices() {
    const count = this.meshes.length
    if (count === 0) return

    const meshScaleX = 1.4
    const meshScaleY = 0.6
    const meshScaleZ = 0.6

    const meshWidth = 3 * meshScaleX
    const spacing = 0.01

    const totalWidth = count * (meshWidth + spacing)
    const radius = totalWidth / (2 * Math.PI)

    this.meshes.forEach((m) => {
      m.material.uniforms.uRadius.value = radius
      m.material.uniforms.uQuadSize.value.set(2.0 * meshScaleX, 2.0 * meshScaleY)
    })

    const groupRotation = new THREE.Euler(
      Math.PI * 0.1,
      Math.PI * 0.1,
      Math.PI * -0.1
    )
    const rotationMatrix = new THREE.Matrix4().makeRotationFromEuler(groupRotation)

    this.meshes.forEach((m, i) => {
      const angle = (i / count) * Math.PI * 2

      const position = new THREE.Vector3(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      )

      const quaternion = new THREE.Quaternion()
      const lookMatrix = new THREE.Matrix4()
      lookMatrix.lookAt(
        position,
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 1, 0)
      )
      quaternion.setFromRotationMatrix(lookMatrix)

      const matrix = new THREE.Matrix4()
      matrix.compose(
        position,
        quaternion,
        new THREE.Vector3(meshScaleX, meshScaleY, meshScaleZ)
      )

      matrix.premultiply(rotationMatrix)

      m.matrix = matrix
    })
  }

  updateMeshes() {
    const wraps = document.querySelectorAll(".img-wrap")
    this.meshes = []

    wraps.forEach((wrap, index) => {
      const videoSrc = wrap.getAttribute('data-video-src')
      const imgEl = wrap.querySelector(".img")

      if (videoSrc) {
        this.meshes.push({
          id: `mesh-${index}`,
          element: wrap,
          material: this.createVideoMaterial(videoSrc),
          matrix: null
        })
      } else if (imgEl) {
        this.meshes.push({
          id: `mesh-${index}`,
          element: imgEl,
          material: this.createMaterial(imgEl.src),
          matrix: null
        })
      }
    })

    this.createCircleMatrices()
  }

  updateMeshPositions() {}

  animateMenuMeshes(isOpen = true) {
    if (!this.meshes.length) return
  
    const opacityUniforms = this.meshes
      .map(m => m.material?.uniforms?.uOpacity)
      .filter(Boolean)
  
    const revealUniforms = this.meshes
      .map(m => m.material?.uniforms?.uReveal)
      .filter(Boolean)
  
    if (!opacityUniforms.length && !revealUniforms.length) return
  
    gsap.killTweensOf([...opacityUniforms, ...revealUniforms])
  
    gsap.to(opacityUniforms, {
      value: isOpen ? 1 : 0,
      duration: 1.4,
      ease: "power3.out",
      stagger: { each: 0.04, from: "start" }
    })
  
    gsap.to(revealUniforms, {
      value: isOpen ? 1 : 0,
      duration: 1.4,
      ease: "power3.out",
      stagger: { each: 0.14, from: "start" }
    })
  }
}

const globalSceneManager = new SceneManager()
export default globalSceneManager
