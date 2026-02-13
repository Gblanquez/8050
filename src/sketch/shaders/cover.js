export const coverVertexShader = /* glsl */ `
varying vec2 vUv;

uniform float uSlideTopLeft;
uniform float uSlideTopRight;
uniform float uSlideBottomLeft;
uniform float uSlideBottomRight;

uniform float uTopLeft;
uniform float uTopRight;
uniform float uBottomLeft;
uniform float uBottomRight;

uniform vec2 uResolution;

void main() {
  vUv = uv;

  float PI = 3.1415926;

  // phase 1 corners: slide from y:110% to center + grow 0 to 0.2
  float slideProgress = mix(
    mix(uSlideBottomLeft, uSlideBottomRight, uv.x),
    mix(uSlideTopLeft, uSlideTopRight, uv.x),
    uv.y
  );

  // phase 2 corners: grow from 0.2 to full screen
  float growProgress = mix(
    mix(uBottomLeft, uBottomRight, uv.x),
    mix(uTopLeft, uTopRight, uv.x),
    uv.y
  );

  // sine waves during grow phase
  float sine = sin(PI * growProgress);
  float waves = sine * 0.5 * sin(3.0 * length(uv) + 10.0 * growProgress);

  // viewport math
  float fov = 75.0 * PI / 180.0;
  float planeZ = 8.0;
  float viewportHeight = 2.0 * tan(fov / 2.0) * planeZ;
  float viewportWidth = viewportHeight * (uResolution.x / uResolution.y);

  // scale: phase 1 grows 0→0.2, phase 2 grows 0.2→1.0
  float startScale = 0.03;
  float phase1Scale = slideProgress * startScale;
  float currentScale = mix(phase1Scale, 1.0, growProgress);

  vec4 state = vec4(position, 1.0);
  state.x *= (viewportWidth / 2.0) * currentScale;
  state.y *= (viewportHeight / 2.0) * currentScale;
  state.z = -planeZ + waves;

  // y offset from phase 1: 110% → center
  float yOffset = (1.0 - slideProgress) * viewportHeight * 1.1;
  state.y -= yOffset;

  gl_Position = projectionMatrix * state;
}
`

export const coverFragmentShader = /* glsl */ `
uniform vec3 uColor;

void main() {
  gl_FragColor = vec4(uColor, 1.0);
}
`
