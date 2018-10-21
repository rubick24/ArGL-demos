import { ArGL, OrbitCamera, util } from 'argl'

import { mat4 } from 'gl-matrix'

import GLTFLoader from './GLTFLoader'


import suzanne from '../assets/BoomBox/BoomBoxWithAxes.gltf'
import suzanne_bin from '../assets/BoomBox/BoomBoxWithAxes.bin'

import baseColor from '../assets/BoomBox/BoomBoxWithAxes_baseColor.png'
import baseColor1 from '../assets/BoomBox/BoomBoxWithAxes_baseColor1.png'
import emissive from '../assets/BoomBox/BoomBoxWithAxes_emissive.png'
import normal from '../assets/BoomBox/BoomBoxWithAxes_normal.png'
import roughnessMetallic from '../assets/BoomBox/BoomBoxWithAxes_roughnessMetallic.png'

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

// let camera = new FreeMoveCamera([0.0, 0.0, 5.0], [0, 1, 0, 0])
let camera = new OrbitCamera([4, 4, 4], [0, 0, 0])


async function start() {
  let bin = await util.loadBinary(suzanne_bin, () => { })
  let images = [baseColor, roughnessMetallic, normal, emissive, baseColor1]
  let promises = images.map(element => {
    return ArGL.loadImage(element, () => { })
  })
  let loadedImgs = await Promise.all(promises)
  let loader = new GLTFLoader(suzanne, [bin], loadedImgs)

  let scene = loader.loadScene(0)
  loader.initScene(scene, gl)

  console.log('scene:', scene)

  if (loader.animations !== undefined) {
    loader.animations.forEach((v, i) => {
      loader.loadAnimation(i, scene)
    })
  }

  argl.start()
  gl.clearColor(0, 0, 0, 1)

  argl.draw = (time) => {

    camera.desktopOrbitControl(argl)
    camera.mobileOrbitControl(argl)
    // let step = argl.deltaTime * 0.005
    // camera.desktopFreeMoveControl(argl, step, 0.05)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    let transform = mat4.fromScaling([], [100, 100, 100])
    loader.renderScene(gl, scene, camera, transform)
  }

}
start()
