import { vec3, mat4, glMatrix } from 'gl-matrix'

import vs from './shader/pbr.vs'
import fs from './shader/pbr.fs'
import { Shader } from 'argl'

const componentTypedArray = {
  '5120': Int8Array,    // BYTE
  '5121': Uint8Array,   // UNSIGNED_BYTE
  '5122': Int16Array,   // SHORT
  '5123': Uint16Array,  // UNSIGNED_SHORT
  '5125': Uint32Array,  // UNSIGNED_INT
  '5126': Float32Array  // FLOAT
}

const typeSize = {
  'SCALAR': 1,
  'VEC2': 2,
  'VEC3': 3,
  'VEC4': 4,
  'MAT2': 4,
  'MAT3': 9,
  'MAT4': 16
}

class GLTFLoader {
  constructor(gltf, binFiles, images = []) {
    if (!(gltf && gltf.asset)) {
      throw Error('Invalid gltf object')
    }
    Object.assign(this, gltf)
    this.binFiles = binFiles
    this.images = images
  }

  accessData(accessorIndex) {
    let accessor = this.accessors[accessorIndex]
    if (accessor.id === accessorIndex) {
      return accessor
    }
    accessor.id = accessorIndex
    let bufferView = this.bufferViews[accessor.bufferView]
    let bin = this.binFiles[bufferView.buffer]
    let stepSize = componentTypedArray[accessor.componentType].BYTES_PER_ELEMENT * typeSize[accessor.type]
    let arrayType = componentTypedArray[accessor.componentType]
    let start, end

    start = 0
    end = accessor.count * stepSize
    if (bufferView.byteOffset !== undefined) {
      start += bufferView.byteOffset
      end += bufferView.byteOffset
    }

    accessor.itemSize = typeSize[accessor.type]
    accessor.bufferData = new arrayType(bin.slice(start, end))
    return accessor
  }

  loadMaterial(materialIndex) {
    let material = this.materials[materialIndex]
    if (material.id === materialIndex) {
      return material
    }
    material.id = materialIndex
    material.defines = {}
    let self = this
    let replaceSource = function (texture) {
      if (!isNaN(texture.source)) {
        texture.source = self.images[texture.source]
      }
    }

    if (material.pbrMetallicRoughness !== undefined) {
      let mr = material.pbrMetallicRoughness
      if (mr.baseColorTexture !== undefined) {
        material.defines.HAS_BASECOLORMAP = 1
        mr.baseColorTexture = this.textures[mr.baseColorTexture.index]
        replaceSource(mr.baseColorTexture)
      }
      if (mr.metallicRoughnessTexture !== undefined) {
        material.defines.HAS_METALROUGHNESSMAP = 1
        mr.metallicRoughnessTexture = this.textures[mr.metallicRoughnessTexture.index]
        replaceSource(mr.metallicRoughnessTexture)
      }
      if (mr.metallicFactor === undefined) {
        mr.metallicFactor = 1
      }
      if (mr.roughnessFactor === undefined) {
        mr.roughnessFactor = 1
      }
      if (mr.baseColorFactor === undefined) {
        mr.baseColorFactor = [1, 1, 1, 1]
      }
    }
    if (material.normalTexture !== undefined) {
      material.defines.HAS_NORMALMAP = 1
      material.normalTexture = this.textures[material.normalTexture.index]
      replaceSource(material.normalTexture)
      if (material.normalTexture.scale === undefined) {
        material.normalTexture.scale = 1
      }
    }
    if (material.emissiveTexture !== undefined) {
      material.defines.HAS_EMISSIVEMAP = 1
      material.emissiveTexture = this.textures[material.emissiveTexture.index]
      replaceSource(material.emissiveTexture)
    }
    if (material.emissiveFactor === undefined) {
      material.emissiveFactor = [0, 0, 0]
    }
    if (material.alphaMode === undefined) {
      material.alphaMode = 'OPAQUE'
    }
    if (material.alphaCutoff === undefined) {
      material.alphaCutoff = 0.5
    }
    if (material.doubleSided === undefined) {
      material.doubleSided = false
    }

    return material
  }

  loadMesh(meshIndex) {
    let mesh = this.meshes[meshIndex]
    if (mesh.id === meshIndex) {
      return mesh
    }
    mesh.id = meshIndex
    let length = mesh.primitives.length
    for (let i = 0; i < length; i++) {
      let primitive = mesh.primitives[i]
      primitive.defines = {}
      primitive.indices = this.accessData(primitive.indices)
      let attributes = Object.keys(primitive.attributes)

      attributes.forEach(attribute => {
        let bufferData = this.accessData(primitive.attributes[attribute])
        primitive.attributes[attribute] = bufferData
        switch (attribute) {
          case "NORMAL":
            primitive.defines.HAS_NORMALS = 1
            break
          case "TANGENT":
            primitive.defines.HAS_TANGENTS = 1
            break
          case "TEXCOORD_0":
            primitive.defines.HAS_UV = 1
            break
        }
      })

      if (primitive.material !== undefined) {
        primitive.material = this.loadMaterial(primitive.material)
        primitive.defines = Object.assign(primitive.defines, primitive.material.defines)
      }

      primitive.getDefines = function () {
        let definesToString = function (defines) {
          let outStr = ''
          for (let def in defines) {
            outStr += '#define ' + def + ' ' + defines[def] + '\n'
          }
          return outStr
        }
        return definesToString(this.defines)
      }
    }

    return mesh
  }

  loadScene(sceneIndex) {
    let scene = this.scenes[sceneIndex]
    if (scene.id === sceneIndex) {
      return node
    }
    scene.id = sceneIndex
    if (scene.nodes !== undefined) {
      let nodeIndexes = scene.nodes.slice()
      scene.nodes = []
      nodeIndexes.forEach(nodeIndex => {
        scene.nodes.push(this.loadNode(nodeIndex))
      })
    }

    return scene
  }

  loadNode(nodeIndex) {
    let node = this.nodes[nodeIndex]
    if (node.id === nodeIndex) {
      return node
    }
    node.id = nodeIndex
    if (node.matrix === undefined) {
      node.matrix = mat4.create()
      if (node.translation) {
        mat4.translate(node.matrix, node.matrix, node.translation)
      }
      if (node.rotation) {
        let rotation = mat4.create()
        mat4.fromQuat(rotation, node.rotation)
        mat4.mul(node.matrix, node.matrix, rotation)
      }
      if (node.scale) {
        mat4.scale(node.matrix, node.matrix, node.scale)
      }
    }
    if (node.mesh !== undefined) {
      node.mesh = this.loadMesh(node.mesh)
    }
    if (node.children !== undefined) {
      node.children.forEach((childIndex, i) => {
        node.children[i] = this.loadNode(childIndex)
      })
    }
    return node
  }


  initMeshBuffers(mesh, gl) {
    mesh.primitives.forEach((primitive) => {
      primitive.indices.buffer = gl.createBuffer()
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, primitive.indices.buffer)
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, primitive.indices.bufferData, gl.STATIC_DRAW)

      primitive.vao = gl.createVertexArray()
      gl.bindVertexArray(primitive.vao)

      let attributes = Object.keys(primitive.attributes)
      attributes.forEach(attribute => {
        let attrObj = primitive.attributes[attribute]
        attrObj.buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, attrObj.buffer)
        gl.bufferData(gl.ARRAY_BUFFER, attrObj.bufferData, gl.STATIC_DRAW)

        let attrLocation = gl.getAttribLocation(primitive.shader.program, 'a_' + attribute.toLowerCase())
        gl.bindBuffer(gl.ARRAY_BUFFER, attrObj.buffer)
        gl.vertexAttribPointer(attrLocation, attrObj.itemSize, attrObj.componentType, false, 0, 0)
        gl.enableVertexAttribArray(attrLocation)
      })
    })
  }

  initMesh(mesh, gl) {
    let length = mesh.primitives.length
    for (let i = 0; i < length; i++) {
      let primitive = mesh.primitives[i]

      let defines = '#version 300 es\n' + primitive.getDefines()
      primitive.shader = new Shader(gl, defines + vs, defines + fs)
    }

    this.initMeshBuffers(mesh, gl)

    for (let i = 0; i < length; i++) {
      let primitive = mesh.primitives[i]
      if (primitive.material !== undefined) {
        this.initMaterial(primitive.material, gl)
      }
    }
  }

  initMaterial(material, gl) {
    if (material.loaded) return
    material.loaded = true
    let setTexture = function (texture, gl, index) {
      if (texture.texture !== undefined) return
      texture.texture = gl.createTexture()
      gl.activeTexture(gl.TEXTURE0 + index)
      gl.bindTexture(gl.TEXTURE_2D, texture.texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.source)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    }
    if (material.pbrMetallicRoughness !== undefined) {
      let mr = material.pbrMetallicRoughness
      if (mr.baseColorTexture !== undefined) {
        setTexture(mr.baseColorTexture, gl, 0)
      }
      if (mr.metallicRoughnessTexture !== undefined) {
        setTexture(mr.metallicRoughnessTexture, gl, 1)
      }
    }
    if (material.normalTexture !== undefined) {
      setTexture(material.normalTexture, gl, 2)
    }
    if (material.emissiveTexture !== undefined) {
      setTexture(material.emissiveTexture, gl, 3)
    }
  }

  useMaterial(material, gl, shader) {
    // shader.use()
    shader.setInt('u_BaseColorSampler', 0)
    shader.setInt('u_MetallicRoughnessSampler', 1)
    shader.setInt('u_NormalSampler', 2)
    shader.setInt('u_EmissiveSampler', 3)
    shader.setVec3('u_EmissiveFactor', material.emissiveFactor)
    let useTex = function (texture, gl, index) {
      gl.activeTexture(gl.TEXTURE0 + index)
      gl.bindTexture(gl.TEXTURE_2D, texture.texture)
    }
    if (material.pbrMetallicRoughness !== undefined) {
      let mr = material.pbrMetallicRoughness
      shader.setVec4('u_BaseColorFactor', mr.baseColorFactor)
      shader.setVec2('u_MetallicRoughnessValues', [
        mr.metallicFactor,
        mr.roughnessFactor
      ])
      if (mr.baseColorTexture !== undefined) {
        useTex(mr.baseColorTexture, gl, 0)
      }
      if (mr.metallicRoughnessTexture !== undefined) {
        useTex(mr.metallicRoughnessTexture, gl, 1)
      }

    }
    if (material.normalTexture !== undefined) {
      shader.setFloat('u_NormalScale', material.normalTexture.scale)
      useTex(material.normalTexture, gl, 2)
    }
    if (material.emissiveTexture !== undefined) {
      useTex(material.emissiveTexture, gl, 3)
    }
  }

  initScene(scene, gl) {
    scene.nodes.forEach(node => {
      this.initNode(node, gl)
    })
  }

  initNode(node, gl) {
    if (node.mesh !== undefined) {
      this.initMesh(node.mesh, gl)
    }
    if (node.children !== undefined) {
      node.children.forEach(node => {
        this.initNode(node, gl)
      })
    }
  }

  loadAnimation(animationIndex, scene) {
    let animation = this.animations[animationIndex]
    if (animation.id === animationIndex) {
      return animation
    }
    animation.id = animationIndex
    animation.samplers.forEach(sampler => {
      sampler.input = this.accessData(sampler.input)
      sampler.output = this.accessData(sampler.output)
    })
    animation.channels.forEach(channel => {
      channel.sampler = animation.samplers[channel.sampler]
      channel.target.node = this.findNode(channel.target.node, scene)
    })

    return animation
  }

  findNode(nodeIndex, scene) {
    let length = scene.nodes.length
    let res
    for (let i = 0; i < length; i++) {
      res = this._findNode(scene.nodes[i], nodeIndex)
      if (res !== undefined) break
    }
    return res
  }
  _findNode(node, nodeIndex) {
    if (node.id === nodeIndex) {
      return node
    }
    if (node.children !== undefined) {
      let length = node.children.length
      let res
      for (let i = 0; i < length; i++) {
        res = this._findNode(node.children[i], nodeIndex)
        if (res !== undefined) break
      }
      return res
    }
  }

  getCurrentValue(currentTime, sampler) {
    let previousTime = sampler.input.bufferData.reduce((p, c, i) => {
      return c > p && c < currentTime ? c : p
    })
    let nextTime = sampler.input.bufferData.reduce((p, c) => {
      if (c > currentTime && p > currentTime) {
        return c < p ? c : p
      } else {
        return c > currentTime ? c : p
      }
    })
    let itemSize = sampler.output.itemSize
    let prevIndex = sampler.input.bufferData.indexOf(previousTime)
    let nextIndex = sampler.input.bufferData.indexOf(nextTime)
    let previousValue, nextValue
    if (itemSize == 1) {
      previousValue = sampler.output.bufferData[prevIndex]
      nextValue = sampler.output.bufferData[nextIndex]
    } else {
      previousValue = []
      nextValue = []
      if (sampler.interpolation === 'CUBICSPLINE') {
        for (let i = 0; i < itemSize * 3; i++) {
          previousValue[i] = sampler.output.bufferData[prevIndex * itemSize * 3 + i]
          nextValue[i] = sampler.output.bufferData[nextIndex * itemSize * 3 + i]
        }
      } else {
        for (let i = 0; i < itemSize; i++) {
          previousValue[i] = sampler.output.bufferData[prevIndex * itemSize + i]
          nextValue[i] = sampler.output.bufferData[nextIndex * itemSize + i]
        }
      }
    }
    let interpolationValue = (currentTime - previousTime) / (nextTime - previousTime)
    let currentValue
    // currentValue = previousValue + interpolationValue * (nextValue - previousValue)
    if (itemSize === 4) {
      currentValue = quat.create()
      quat.slerp(currentValue, previousValue, nextValue, interpolationValue)
    } else {
      currentValue = []
      if (sampler.interpolation === 'LINEAR') {
        for (let i = 0; i < itemSize; i++) {
          currentValue[i] = previousValue[i] + interpolationValue * (nextValue[i] - previousValue[i])
        }
      } else if (sampler.interpolation === 'STEP') {
        for (let i = 0; i < itemSize; i++) {
          currentValue[i] = previousValue[i]
        }
      } else if (sampler.interpolation === 'CUBICSPLINE') {
        let p0 = []
        let p1 = []
        let m0 = []
        let m1 = []
        for (let i = 0; i < itemSize; i++) {
          p0[i] = previousValue[itemSize + i]
          p1[i] = nextValue[itemSize + i]
          m0[i] = (nextTime - previousTime) * previousValue[2 * itemSize + i]
          m1[i] = (nextTime - previousTime) * nextValue[i]
        }
        currentValue = vec3.create()
        let t = interpolationValue
        vec3.scaleAndAdd(currentValue, currentValue, p0, (2 * t ** 3 - 3 * t ** 2 + 1))
        vec3.scaleAndAdd(currentValue, currentValue, m0, (t ** 3 - 2 * t ** 2 + t))
        vec3.scaleAndAdd(currentValue, currentValue, p1, (-2 * t ** 3 + 3 * t ** 2))
        vec3.scaleAndAdd(currentValue, currentValue, m1, (t ** 3 - t ** 2))
      }
    }
    return currentValue
  }


  renderScene(gl, scene, camera, tansfromMatrix) {
    this.view = camera.getViewMatrix()
    this.view_postion = camera.position
    this.projection = mat4.perspective([], glMatrix.toRadian(camera.zoom), gl.canvas.clientWidth / gl.canvas.clientHeight, 0.1, 100)

    scene.nodes.forEach(node => {
      let modelMatrix = tansfromMatrix || mat4.create()
      this.renderNode(gl, node, modelMatrix)
    })
  }

  renderNode(gl, node, modelMatrix) {
    mat4.mul(modelMatrix, modelMatrix, node.matrix)
    if (this.animations !== undefined) {
      this.animations.forEach(animation => {
        animation.channels.forEach(channel => {
          if (node.id === channel.target.node.id) {
            let duration = channel.sampler.input.max[0] - channel.sampler.input.min[0]
            let currentValue = this.getCurrentValue(time / 1000 % duration, channel.sampler)

            if (channel.target.path === 'scale') {
              mat4.scale(modelMatrix, modelMatrix, currentValue)
            } else if (channel.target.path === 'translation') {
              mat4.translate(modelMatrix, modelMatrix, currentValue)
            } else if (channel.target.path === 'rotation') {
              let rotateAni = mat4.create()
              mat4.fromQuat(rotateAni, currentValue)
              mat4.mul(modelMatrix, modelMatrix, rotateAni)
            }
          }
        })
      })
    }
    if (node.mesh !== undefined) {
      let mvMatrix = mat4.create()
      let mvpMatrix = mat4.create()
      mat4.multiply(mvMatrix, this.view, modelMatrix)
      mat4.multiply(mvpMatrix, this.projection, mvMatrix)
      let modelInverse = mat4.create()
      let normalMatrix = mat4.create()
      mat4.invert(modelInverse, modelMatrix)
      mat4.transpose(normalMatrix, modelInverse)

      node.mesh.primitives.forEach(primitive => {
        primitive.shader.use()
        primitive.shader.setVec3('u_LightDirection[0]', [3, 5, 4])
        primitive.shader.setVec3('u_LightDirection[1]', [-3, -3, -5])
        primitive.shader.setVec3('u_LightColor[0]', [1, 1, 1])
        primitive.shader.setVec3('u_LightColor[1]', [0.2, 0.2, 0.2])
        primitive.shader.setVec3('u_Camera', this.view_postion)
        primitive.shader.setMat4('u_MVPMatrix', mvpMatrix)
        primitive.shader.setMat4('u_ModelMatrix', modelMatrix)
        primitive.shader.setMat4('u_NormalMatrix', normalMatrix)

        if (primitive.material !== undefined) {
          this.useMaterial(primitive.material, gl, primitive.shader)
        }
        gl.bindVertexArray(primitive.vao)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, primitive.indices.buffer)
        gl.drawElements(gl.TRIANGLES, primitive.indices.count, primitive.indices.componentType, 0)
      })
    }
    if (node.children !== undefined) {
      node.children.forEach(child => {
        let childmodelMatrix = mat4.create()
        mat4.copy(childmodelMatrix, modelMatrix)
        this.renderNode(gl, child, childmodelMatrix)
      })
    }
  }
}


export default GLTFLoader
