import { vec2, vec3, mat4 } from 'gl-matrix'
import { ArGL, Shader } from 'argl'
import sampleVs from './shader/sample.vs'
import sampleFs from './shader/sample.fs'
import displayVs from './shader/display.vs'
import displayFs from './shader/display.fs'

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
gl.getExtension('EXT_color_buffer_float')
gl.clearColor(0, 0, 0, 1.0)
gl.clearDepth(1.0)
const randsize = 1024

const dRand2Uniform = new Float32Array(randsize * randsize * 2)
for (let i = 0; i < randsize * randsize; i++) {
  const r = [Math.random(), Math.random()]
  dRand2Uniform[i * 2 + 0] = r[0]
  dRand2Uniform[i * 2 + 1] = r[1]
}
const tRand2Uniform = gl.createTexture()
gl.activeTexture(gl.TEXTURE0)
gl.bindTexture(gl.TEXTURE_2D, tRand2Uniform)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG32F, randsize, randsize, 0, gl.RG, gl.FLOAT, dRand2Uniform)



const dRand2Normal = new Float32Array(randsize * randsize * 2)
for (let i = 0; i < randsize * randsize; i++) {
  const r = vec2.random([])
  dRand2Normal[i * 2 + 0] = r[0]
  dRand2Normal[i * 2 + 1] = r[1]
}
const tRand2Normal = gl.createTexture()
gl.activeTexture(gl.TEXTURE0)
gl.bindTexture(gl.TEXTURE_2D, tRand2Normal)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG32F, randsize, randsize, 0, gl.RG, gl.FLOAT, dRand2Normal)


const dRand3Normal = new Float32Array(randsize * randsize * 3)
for (let i = 0; i < randsize * randsize; i++) {
  const r = vec3.random([])
  dRand3Normal[i * 3 + 0] = r[0]
  dRand3Normal[i * 3 + 1] = r[1]
  dRand3Normal[i * 3 + 2] = r[2]
}
const tRand3Normal = gl.createTexture()
gl.activeTexture(gl.TEXTURE0)
gl.bindTexture(gl.TEXTURE_2D, tRand3Normal)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB32F, randsize, randsize, 0, gl.RGB, gl.FLOAT, dRand3Normal)


const pingpong = new Array(2)
const pingpongTex = new Array(2)
for (let i = 0; i < 2; i++) {
  pingpong[i] = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, pingpong[i])
  pingpong[i].width = canvas.width
  pingpong[i].height = canvas.height

  pingpongTex[i] = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, pingpongTex[i])
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, pingpong[i].width, pingpong[i].height, 0, gl.RGBA, gl.FLOAT, null)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pingpongTex[i], 0)
}


let ping = 0
let count = 0

const sampleShader = new Shader(gl, sampleVs, sampleFs)
const quad = [-1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, -1.0]

let quadVAO = gl.createVertexArray()
let quadVBO = gl.createBuffer()
gl.bindVertexArray(quadVAO)
gl.bindBuffer(gl.ARRAY_BUFFER, quadVBO)
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quad), gl.STATIC_DRAW)
gl.enableVertexAttribArray(0)
gl.vertexAttribPointer(0, 2, gl.FLOAT, true, 8, 0)
gl.bindBuffer(gl.ARRAY_BUFFER, null)
gl.bindVertexArray(null)

const elements = [
  { radius: 0.310, color: [1.000, 1.000, 1.000] },
  { radius: 0.710, color: [0.188, 0.314, 0.973] },
  { radius: 0.730, color: [0.565, 0.565, 0.565] },
  { radius: 0.660, color: [1.000, 0.051, 0.051] }
]

const atoms = [
  { position: [-3.3804130, -1.1272367, 0.5733036], element: 0 },
  { position: [0.9668296, -1.0737425, -0.8198227], element: 1 },
  { position: [0.0567293, 0.8527195, 0.3923156], element: 2 },
  { position: [-1.3751742, -1.0212243, -0.0570552], element: 1 },
  { position: [-1.2615018, 0.2590713, 0.5234135], element: 2 },
  { position: [-0.3068337, -1.6836331, -0.7169344], element: 2 },
  { position: [1.1394235, 0.1874122, -0.2700900], element: 2 },
  { position: [0.5602627, 2.0839095, 0.8251589], element: 1 },
  { position: [-0.4926797, -2.8180554, -1.2094732], element: 3 },
  { position: [-2.6328073, -1.7303959, -0.0060953], element: 2 },
  { position: [-2.2301338, 0.7988624, 1.0899730], element: 3 },
  { position: [2.5496990, 2.9734977, 0.6229590], element: 0 },
  { position: [2.0527432, -1.7360887, -1.4931279], element: 2 },
  { position: [-2.4807715, -2.7269528, 0.4882631], element: 0 },
  { position: [-3.0089039, -1.9025254, -1.0498023], element: 0 },
  { position: [2.9176101, -1.8481516, -0.7857866], element: 0 },
  { position: [2.3787863, -1.1211917, -2.3743655], element: 0 },
  { position: [1.7189877, -2.7489920, -1.8439205], element: 0 },
  { position: [-0.1518450, 3.0970046, 1.5348347], element: 2 },
  { position: [1.8934096, 2.1181245, 0.4193193], element: 2 },
  { position: [2.2861252, 0.9968439, -0.2440298], element: 1 },
  { position: [-0.1687028, 4.0436553, 0.9301094], element: 0 },
  { position: [0.3535322, 3.2979060, 2.5177747], element: 0 },
  { position: [-1.2074498, 2.7537592, 1.7203047], element: 0 },
]

sampleShader.use()

for (let i = 0; i < elements.length; i++) {
  sampleShader.setFloat('elements[' + i + '].radius', elements[i].radius)
  sampleShader.setVec3('elements[' + i + '].color', elements[i].color)
}
for (let i = 0; i < atoms.length; i++) {
  sampleShader.setVec3('atoms[' + i + '].position', atoms[i].position)
  sampleShader.setInt('atoms[' + i + '].element', atoms[i].element)
}

sampleShader.setFloat('atom_roughness', 0.1)
sampleShader.setFloat('coffee_roughness', 0)
sampleShader.setFloat('light_radius', 2.5)
sampleShader.setFloat('light_intensity', 4.1)
sampleShader.setFloat('light_angle', 4.7)
sampleShader.setVec2('resolution', [canvas.width, canvas.height])
sampleShader.setFloat('focal_plane', 0)
sampleShader.setFloat('focal_length', 0.1)
sampleShader.setInt('bounces', 3)
sampleShader.setBool('antialias', true)
sampleShader.setFloat('randsize', randsize)



gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
gl.disable(gl.DEPTH_TEST)

const displayShader = new Shader(gl, displayVs, displayFs)
displayShader.use()


function sample(opts) {
  const view = mat4.lookAt([], opts.eye, opts.target, [0, 1, 0])
  const projection = mat4.perspective([], Math.PI / 3, canvas.width / canvas.height, 0.1, 1000)
  const pv = mat4.multiply([], projection, view)
  const invpv = mat4.invert([], pv)

  sampleShader.use()
  sampleShader.setMat4('model', opts.model)
  sampleShader.setMat4('invpv', invpv)
  sampleShader.setVec3('eye', opts.eye)
  sampleShader.setVec2('rand', [Math.random(), Math.random()])
  sampleShader.setFloat('time', opts.time)
  sampleShader.setInt('source', 0)
  sampleShader.setInt('tRand2Uniform', 1)
  sampleShader.setInt('tRand2Normal', 2)
  sampleShader.setInt('tRand3Normal', 3)

  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, pingpongTex[ping])
  gl.activeTexture(gl.TEXTURE1)
  gl.bindTexture(gl.TEXTURE_2D, tRand2Uniform)
  gl.activeTexture(gl.TEXTURE2)
  gl.bindTexture(gl.TEXTURE_2D, tRand2Normal)
  gl.activeTexture(gl.TEXTURE3)
  gl.bindTexture(gl.TEXTURE_2D, tRand3Normal)


  gl.bindVertexArray(quadVAO)
  gl.bindFramebuffer(gl.FRAMEBUFFER, pingpong[1 - ping])
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

  count++
  ping = 1 - ping
}

function display() {
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  displayShader.use()
  displayShader.setFloat('count', count)
  displayShader.setInt('source', 0)
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, pingpongTex[ping])

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.bindVertexArray(quadVAO)
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
}

function reset() {
  gl.viewport(0, 0, canvas.width, canvas.height)
  gl.bindFramebuffer(gl.FRAMEBUFFER, pingpong[0])
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.bindFramebuffer(gl.FRAMEBUFFER, pingpong[1])
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  count = 0
}


const model = mat4.create()
argl.draw = (time) => {

  const eye = [0, 0, 10]
  const target = [0, 0, 0]
  if (argl.mouseInput.drag && (argl.mouseInput.dragX !== 0 || argl.mouseInput.dragY !== 0)) {
    let radianX = argl.mouseInput.dragX / argl.canvas.clientWidth * Math.PI * 2
    let radianY = argl.mouseInput.dragY / argl.canvas.clientHeight * Math.PI * 2
    let rotate = mat4.create()
    mat4.rotateY(rotate, rotate, radianX)
    mat4.rotateX(rotate, rotate, radianY)
    mat4.mul(model, rotate, model)

    reset()
  }
  sample({
    eye: eye,
    target: target,
    model: model,
    time: time
  })
  display()
  // reset()
}

argl.start()
