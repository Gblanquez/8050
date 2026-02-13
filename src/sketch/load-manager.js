import * as THREE from 'three'
import gsap from 'gsap'
import { coverVertexShader, coverFragmentShader } from './shaders/cover.js'

class LoadManager {
  constructor(scene, camera) {
    this.scene = scene
    this.camera = camera
    this.coverMesh = null
    this.uniforms = null
  }

  init() {
    this.uniforms = {
      // phase 1: slide + grow to 0.2
      uSlideTopLeft:     { value: 0 },
      uSlideTopRight:    { value: 0 },
      uSlideBottomLeft:  { value: 0 },
      uSlideBottomRight: { value: 0 },
      // phase 2: grow to full screen
      uTopLeft:     { value: 0 },
      uTopRight:    { value: 0 },
      uBottomLeft:  { value: 0 },
      uBottomRight: { value: 0 },
      uResolution:  { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uColor:       { value: new THREE.Color('#D9D9D9') }
    }

    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: coverVertexShader,
      fragmentShader: coverFragmentShader,
      transparent: false,
      depthTest: false,
      depthWrite: false,
      side: THREE.DoubleSide
    })

    const geo = new THREE.PlaneGeometry(2, 2, 128, 128)
    this.coverMesh = new THREE.Mesh(geo, mat)
    this.coverMesh.frustumCulled = false
    this.coverMesh.renderOrder = -1
    this.scene.add(this.coverMesh)
  }

  play(onComplete) {
    const u = this.uniforms
    gsap.timeline({ onComplete })
      // phase 1: slide from y:110% to center + grow 0→0.2, staggered corners
      .to(u.uSlideTopRight,    { value: 1, duration: 0.8,  ease: 'power3.out' })
      .to(u.uSlideTopLeft,     { value: 1, duration: 0.8,  ease: 'power3.out' }, '<0.12')
      .to(u.uSlideBottomLeft,  { value: 1, duration: 0.85, ease: 'power3.out' }, '<0.15')
      .to(u.uSlideBottomRight, { value: 1, duration: 0.85, ease: 'power3.out' }, '<0.15')
      // phase 2: grow from center to full screen, staggered corners
      .to(u.uTopRight,    { value: 1, duration: 1.0,  ease: 'power3.inOut' }, '+=0.02')
      .to(u.uBottomLeft,  { value: 1, duration: 1.05, ease: 'power3.inOut' }, '<0.15')
      .to(u.uTopLeft,     { value: 1, duration: 1.0,  ease: 'power3.inOut' }, '<0.18')
      .to(u.uBottomRight, { value: 1, duration: 1.05, ease: 'power3.inOut' }, '<0.18')
  }

  handleResize() {
    if (this.uniforms) {
      this.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight)
    }
  }
}

export default LoadManager
