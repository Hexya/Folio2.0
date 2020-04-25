uniform float time;
uniform float uAlpha;
uniform float uFrequency;
uniform float uAmplitude;
uniform vec2 resolution;
uniform sampler2D texture1;

varying vec2 vUv;

void main() {  
    vec2 uv1 = vUv;
    // variable que contiene el eje de coordenadas
    vec2 uv = gl_FragCoord.xy/resolution.xy;

    float frequency = uFrequency;
    float amplitude = uAmplitude;

    float x = uv1.y * frequency + time * .7; 
    float y = uv1.x * frequency + time * .3;

    uv1.x += cos(x+y) * amplitude * cos(y);
    uv1.y += sin(x-y) * amplitude * cos(y);

    vec4 rgba = texture2D(texture1, uv1);
    gl_FragColor = rgba;
    gl_FragColor *= uAlpha;
}