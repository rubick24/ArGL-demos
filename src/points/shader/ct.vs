#version 300 es

layout (location = 0) in vec3 a_quad_pos;
layout (location = 1) in vec3 a_position;


out vec3 WorldPos;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

void main() {

    float scale = 0.003;
    vec3 cameraRight = vec3(
      u_view[0].x, u_view[1].x, u_view[2].x
    );
    vec3 cameraUp = vec3(
      u_view[0].y, u_view[1].y, u_view[2].y
    );
    vec3 position = ((cameraRight * a_quad_pos.x * 2.0) + (cameraUp * a_quad_pos.y * 2.0)) * scale;

    WorldPos = vec3(u_model * vec4(position , 1.0)) + a_position;
    gl_Position =  u_projection * u_view * vec4(WorldPos, 1.0);
}
