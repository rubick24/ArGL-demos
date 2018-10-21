
layout (location = 0) in vec3 a_position;
#ifdef HAS_NORMALS
layout (location = 1) in vec3 a_normal;
#endif
#ifdef HAS_TANGENTS
layout (location = 2) in vec4 a_tangent;
#endif
#ifdef HAS_UV
layout (location = 3) in vec2 a_texcoord_0;
#endif

uniform mat4 u_MVPMatrix;
uniform mat4 u_ModelMatrix;
uniform mat4 u_NormalMatrix;

out vec3 v_Position;
out vec2 v_UV;

#ifdef HAS_NORMALS
#ifdef HAS_TANGENTS
out mat3 v_TBN;
#else
out vec3 v_Normal;
#endif
#endif


void main()
{
  vec4 pos = u_ModelMatrix * vec4(a_position, 1.0);
  v_Position = vec3(pos.xyz) / pos.w;

  #ifdef HAS_NORMALS
  #ifdef HAS_TANGENTS
  vec3 normalW = normalize(vec3(u_NormalMatrix * vec4(a_normal.xyz, 0.0)));
  vec3 tangentW = normalize(vec3(u_ModelMatrix * vec4(a_tangent.xyz, 0.0)));
  vec3 bitangentW = cross(normalW, tangentW) * a_tangent.w;
  v_TBN = mat3(tangentW, bitangentW, normalW);
  #else // HAS_TANGENTS != 1
  v_Normal = normalize(vec3(u_ModelMatrix * vec4(a_normal.xyz, 0.0)));
  #endif
  #endif

  #ifdef HAS_UV
  v_UV = a_texcoord_0;
  #else
  v_UV = vec2(0.,0.);
  #endif

  gl_Position = u_MVPMatrix * vec4(a_position, 1.0); // needs w for proper perspective correction
}
