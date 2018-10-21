
const l = ['points', 'pbr', 'shadow_map', 'pick_test', 'gltf', 'ray_tracing']
l.forEach(element => {
  let a = document.createElement('a')
  a.href = '/' + element
  a.innerText = element
  document.body.append(a)
  let br = document.createElement('br')
  document.body.append(br)
})


