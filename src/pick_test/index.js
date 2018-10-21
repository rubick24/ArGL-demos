import { ArGL, OrbitCamera, Shader } from 'argl'
import { vec3, mat4, glMatrix } from 'gl-matrix'

import Ray from './ray'

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

let gl = argl.gl
gl.enable(gl.DEPTH_TEST)
gl.enable(gl.CULL_FACE)

let camera = new OrbitCamera([4, 4, 4], [0, 0, 0])
let shader = new Shader(gl, vs, fs)

let suzanneMesh = argl.loadMesh(suzanneObj)
let suzan_s_vao = argl.setMeshVAO(suzanneMesh, shader)


let model, view, projection

//
argl.canvas.addEventListener('mousemove', e => {

  let angleY = -((e.offsetY * camera.zoom / canvas.height) - (camera.zoom / 2))
  let zoomX = (camera.zoom / canvas.height) * canvas.width
  let angleX = (e.offsetX * zoomX / canvas.width) - (zoomX / 2)
  //console.log('angle X,Y:', angleX, angleY)

  let normalFR = vec3.cross([], camera.front, camera.right)
  vec3.normalize(normalFR, normalFR)

  let direction = rotateVec(camera.front, normalFR, glMatrix.toRadian(angleX))

  let normalFU = vec3.cross([], direction, camera.up)
  vec3.normalize(normalFU, normalFU)

  direction = rotateVec(direction, normalFU, glMatrix.toRadian(angleY))

  // console.log('⭐ direction:', direction)
  let ray = new Ray(camera.position, direction)
  let flag = false
  let len = suzanneMesh.indices.length

  for (let i = 0; i < len; i += 3) {
    let index = [suzanneMesh.indices[i], suzanneMesh.indices[i + 1], suzanneMesh.indices[i + 2]]
    let triangle = new Array(3)
    triangle[0] = vec3.transformMat4([], [suzanneMesh.vertices[index[0] * 3], suzanneMesh.vertices[index[0] * 3 + 1], suzanneMesh.vertices[index[0] * 3 + 2]], model)
    triangle[1] = vec3.transformMat4([], [suzanneMesh.vertices[index[1] * 3], suzanneMesh.vertices[index[1] * 3 + 1], suzanneMesh.vertices[index[1] * 3 + 2]], model)
    triangle[2] = vec3.transformMat4([], [suzanneMesh.vertices[index[2] * 3], suzanneMesh.vertices[index[2] * 3 + 1], suzanneMesh.vertices[index[2] * 3 + 2]], model)

    if (ray.intersectsTriangle(triangle)) {
      flag = true
    }
  }
  hover = flag
  //console.log('flag:', flag)
})

let hover = false

argl.start()

gl.clearColor(0, 0, 0, 1)


argl.draw = (time) => {

  camera.desktopOrbitControl(argl)
  camera.mobileOrbitControl(argl)

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  model = mat4.create()
  view = camera.getViewMatrix()
  projection = mat4.perspective([], glMatrix.toRadian(camera.zoom), gl.canvas.clientWidth / gl.canvas.clientHeight, 0.1, 100)

  shader.use()
  shader.setMat4('u_projection', projection)
  shader.setMat4('u_view', view)
  shader.setMat4('u_model', model)
  shader.setBool('u_hover', hover)
  argl.drawMesh(suzanneMesh, suzan_s_vao)
}


function rotateVec(vec, normal, angle) {
  vec3.normalize(normal, normal)
  let t1 = vec3.scale([], vec, Math.cos(angle))
  let t2 = vec3.cross([], normal, vec)
  vec3.scale(t2, t2, Math.sin(angle))
  return vec3.add([], t1, t2)
}
