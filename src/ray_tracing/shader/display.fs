#version 300 es
precision highp float;

uniform sampler2D source;
uniform float count;

in vec2 uv;
out vec4 FragColor;

void main() {
  vec3 src = texture(source, uv).rgb/count;
  src = pow(src, vec3(1.0/2.2));
  FragColor = vec4(src, 1.0);
}
