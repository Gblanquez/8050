export const fragmentShader = `
varying vec2 vUv;
varying vec2 vSize;

uniform sampler2D uTexture;
uniform vec2 uTextureSize;
uniform float uProgress;

vec2 getUV(vec2 uv, vec2 textureSize, vec2 quadSize){
    vec2 tempUV = uv - vec2(0.5);

    float quadAspect = quadSize.x / quadSize.y;
    float textureAspect = textureSize.x / textureSize.y;

    if(quadAspect < textureAspect){
        tempUV = tempUV * vec2(quadAspect / textureAspect , 1.0);
    }else{
        tempUV = tempUV * vec2(1.0, textureAspect / quadAspect);
    }

    tempUV += vec2(0.5);
    return tempUV;
}

void main()
{
    vec2 correctUV = getUV(vUv, uTextureSize, vSize);
    
    // Debug if texture size invalid
    if(uTextureSize.x < 1.0 || uTextureSize.y < 1.0) {
        gl_FragColor = vec4(vUv.x, vUv.y, 0.0, 1.0);
        return;
    }
    
    vec4 textureColor = texture2D(uTexture, correctUV);

    // If UV is outside bounds, make it transparent
    if(correctUV.x < 0.0 || correctUV.x > 1.0 || correctUV.y < 0.0 || correctUV.y > 1.0) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    } else {
        gl_FragColor = textureColor;
    }
}
`;