import { ArGL, OrbitCamera, Shader } from 'argl'
import { mat4, glMatrix } from 'gl-matrix'
import { Mesh, initMeshBuffers } from 'webgl-obj-loader'


import vs from './shader/ct.vs'
import fs from './shader/ct.fs'

import suzanneObj from '../assets/suzanne.obj'

let canvas = document.createElement('canvas')
document.body.appendChild(canvas)
canvas.width = window.innerWidth
canvas.height = window.innerHeight
document.body.style.margin = '0'
document.body.style.overflow = 'hidden'
let argl = new ArGL(canvas, {
  desktopInput: {
    lockPointer: false
  }
})

let tips = document.createElement('p')
tips.style.color = '#fff'
tips.style.position = 'absolute'
tips.style.bottom = '0px'
tips.style.width = '100%'
tips.style.textAlign = 'center'
tips.innerText = 'drag to rotate, scroll to zoom'
document.body.appendChild(tips)


let gl = argl.gl
gl.enable(gl.DEPTH_TEST)
// gl.enable(gl.CULL_FACE)

let camera = new OrbitCamera()
let shader = new Shader(gl, vs, fs)

// let suzanneMesh = argl.loadMesh(suzanneObj)
// let suzan_s_vao = argl.setMeshVAO(suzanneMesh, shader)

let suzanneMesh = new Mesh(suzanneObj)
initMeshBuffers(gl, suzanneMesh)

let vertexCount = suzanneMesh.vertices.length / 3;

let quadVertices = [
  0.5, 0.5, 0.0,
  -0.5, 0.5, 0.0,
  0.5, -0.5, 0.0,
  -0.5, -0.5, 0.0
]
let quadIndices = [
  0, 1, 2,
  2, 1, 3
]

let quadBuffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer)
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quadVertices), gl.STATIC_DRAW)

let EBO = gl.createBuffer()
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, EBO)
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(quadIndices), gl.STATIC_DRAW)

let VAO = gl.createVertexArray()
gl.bindVertexArray(VAO)

let a_quad_pos = gl.getAttribLocation(shader.program, 'a_quad_pos')
let a_position = gl.getAttribLocation(shader.program, 'a_position')

gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer)
gl.vertexAttribPointer(a_quad_pos, 3, gl.FLOAT, false, 12, 0)
gl.enableVertexAttribArray(a_quad_pos)


gl.bindBuffer(gl.ARRAY_BUFFER, suzanneMesh.vertexBuffer)
gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 12, 0)
gl.enableVertexAttribArray(a_position)

gl.vertexAttribDivisor(a_position, 1)
gl.bindVertexArray(null)



let model, view, projection

argl.start()

gl.clearColor(0, 0, 0, 1)


argl.draw = (time) => {

  camera.desktopOrbitControl(argl)
  camera.mobileOrbitControl(argl)

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  model = mat4.create()
  view = camera.getViewMatrix()
  projection = mat4.perspective([], glMatrix.toRadian(camera.zoom), gl.canvas.clientWidth / gl.canvas.clientHeight, 0.1, 100)
  // mat4.ortho(projection, -4.8, 4.8, -2.7, 2.7, 0.1, 100)
  shader.use()
  shader.setMat4('u_projection', projection)
  shader.setMat4('u_view', view)
  shader.setMat4('u_model', model)

  gl.bindVertexArray(VAO)
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, EBO)
  //gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0)
  gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0, vertexCount)
}

