export const vertexShader = `
varying vec2 vUv;
varying vec2 vSize;

uniform float uProgress;       
uniform vec3 uBend;            
uniform float uRadius;         
uniform vec4 uCorners;         
uniform vec4 uTransitionCorners;  
uniform vec2 uResolution;
uniform vec2 uQuadSize;

vec3 applyCornerDistortion(vec3 pos, vec2 uv, vec4 corners) {
    float topLeft = (1.0 - uv.x) * uv.y;
    float topRight = uv.x * uv.y;
    float bottomLeft = (1.0 - uv.x) * (1.0 - uv.y);
    float bottomRight = uv.x * (1.0 - uv.y);
    
    pos.z += corners.x * topLeft +      
             corners.y * topRight +     
             corners.z * bottomLeft +   
             corners.w * bottomRight;   
    
    return pos;
}

// RW-style bend: simple quadratic along local X
vec3 bendVertex(vec3 pos, vec3 bend) {
    vec3 original = pos;
    float normalizedX = original.x / 2.0;      // -1 .. 1 across the plane
    float bendAmount = normalizedX * normalizedX * bend.x;
    pos.z -= bendAmount;
    return pos;
}

void main()
{
    vUv = uv;
    vSize = uQuadSize;

    float PI = 3.1415926;
    float cornersProgress = mix(
        mix(uTransitionCorners.w, uTransitionCorners.z, uv.x),
        mix(uTransitionCorners.y, uTransitionCorners.x, uv.x),
        uv.y
    );

    float sine = sin(PI * cornersProgress);
    float waves = sine * 0.1 * sin(2.0 * length(uv) + 9.0 * cornersProgress);

    vec3 transformedPosition = position;
    
    // drag corner twist
    transformedPosition = applyCornerDistortion(transformedPosition, uv, uCorners);

    // constant bend along the card, like RW
    transformedPosition = bendVertex(transformedPosition, uBend);

    vec4 defaultState = modelViewMatrix * vec4(transformedPosition, 1.0);
    vec4 fullScreenState = vec4(position, 1.0);

    float fov = 75.0 * PI / 180.0;
    float cameraDistance = 12.0;
    float viewportHeight = 2.0 * tan(fov / 2.0) * cameraDistance;
    float viewportWidth = viewportHeight * (uResolution.x / uResolution.y);
    
    fullScreenState.x *= viewportWidth / uQuadSize.x;
    fullScreenState.y *= viewportHeight / uQuadSize.y;
    fullScreenState.z = -cameraDistance + waves;

    gl_Position = projectionMatrix * mix(defaultState, fullScreenState, cornersProgress);
}
`;