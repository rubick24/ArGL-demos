import styles from './styles.js'

const l = [
  { displayName: 'Vertices ', url: 'vertices' },
  { displayName: 'Physical Material', url: 'pbr' },
  { displayName: 'Shadow Map', url: 'shadow_map' },
  { displayName: 'Pick Test', url: 'pick_test' },
  { displayName: 'glTF Model', url: 'gltf' },
  { displayName: 'Ray Tracing', url: 'ray_tracing' }
]


const header = document.createElement('header')
const title = document.createElement('h2')
title.innerText = 'Argl demos'
title.className = 'title'
const p = document.createElement('p')
p.innerHTML = 'View source on <a href="https://github.com/Deadalusmask/ArGL-demos">Github</a>'
header.appendChild(title)
header.appendChild(p)

const main = document.createElement('main')
const cards = l.map(element => {
  let card = document.createElement('div')
  card.className = 'card'
  let a = document.createElement('a')
  a.href = PRODUCTION ? '/argl-demos/' + element.url : element.url
  a.target = '_blank'
  a.innerText = element.displayName
  a.className = 'item-link'

  let imgSrc = require('./assets/screenshots/'+element.url+'.png')
  let img = document.createElement('img')
  img.src = imgSrc
  img.className = 'screenshot'
  card.appendChild(a)
  card.appendChild(img)
  return card
})
cards.forEach(c => {
  main.appendChild(c)
})
const footer = document.createElement('footer')


document.head.appendChild(styles)
document.body.appendChild(header)
document.body.appendChild(main)
document.body.appendChild(footer)

