#version 300 es

precision mediump float;

out vec4 FragColor;

in vec3 WorldPos;

void main()
{
    vec4 red = vec4(1, 0.1, 0.2, 1);
    vec4 blue = vec4(0, 0.5, 1.0, 1);
    FragColor = blue;
}
