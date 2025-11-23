import * as THREE from 'three'
import { fragmentShader } from './shaders/fragment.js'
import { vertexShader } from './shaders/vertex.js'

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

  createMaterial(imageUrl) {
    if (this.materials.has(imageUrl)) {
      return this.materials.get(imageUrl)
    }

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
      uniforms: {
        uTexture: { value: null },
        uTextureSize: { value: new THREE.Vector2(1, 1) },
        uOpacity: { value: 1 },
        uPlaneSize: { value: new THREE.Vector2(1, 1) },
        uImageSize: { value: new THREE.Vector2(1, 1) },
        uRadius: { value: 1 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uQuadSize: { value: new THREE.Vector2(2, 2) },
        uProgress: { value: 0 },
        uBend: { value: new THREE.Vector3(1.0, 0.0, 0.0) }, // stronger default bend
        uCorners: { value: new THREE.Vector4(0, 0, 0, 0) },
        uTransitionCorners: { value: new THREE.Vector4(0, 0, 0, 0) },
        hover: { value: new THREE.Vector2(0.5, 0.5) },
        hoverState: { value: 1.0 },
        time: { value: 0 }
      }
    })

    this.textureLoader.load(imageUrl, (texture) => {
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter
      material.uniforms.uTexture.value = texture

      if (texture.image && texture.image.width && texture.image.height) {
        material.uniforms.uTextureSize.value.set(
          texture.image.width,
          texture.image.height
        )
        material.uniforms.uImageSize.value.set(
          texture.image.width,
          texture.image.height
        )
      }
    })

    this.materials.set(imageUrl, material)
    return material
  }

  createCircleMatrices() {
    const count = this.meshes.length
    if (count === 0) return

    const meshScaleX = 1.2
    const meshScaleY = 0.62
    const meshScaleZ = 0.62

    const meshWidth = 2 * meshScaleX
    const spacing = 0.2

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
    const els = document.querySelectorAll(".img")
    this.meshes = []

    els.forEach((el, index) => {
      const imageUrl = el.src
      this.meshes.push({
        id: `mesh-${index}`,
        element: el,
        imageUrl,
        material: this.createMaterial(imageUrl),
        matrix: null
      })
    })

    this.createCircleMatrices()
  }

  updateMeshPositions() {}
}

const globalSceneManager = new SceneManager()
export default globalSceneManager