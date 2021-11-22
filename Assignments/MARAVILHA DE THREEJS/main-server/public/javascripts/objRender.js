import * as THREE from '/three.js/build/three.module.js'
import { OrbitControls } from '/three.js/examples/jsm/controls/OrbitControls.js'

let camera, scene, renderer

let mouseX = 0,
  mouseY = 0
let controls
let windowHalfX = window.innerWidth / 2
let windowHalfY = window.innerHeight / 2

init()
animate()

function init() {
  const container = document.createElement('div')
  document.body.appendChild(container)

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    2000,
  )
  camera.position.z = 10
  camera.position.y = -50
  // scene

  scene = new THREE.Scene()

  const ambientLight = new THREE.AmbientLight(0xcccccc, 0.4)
  scene.add(ambientLight)

  const pointLight = new THREE.PointLight(0xffffff, 0.8)
  camera.add(pointLight)
  scene.add(camera)

  renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableZoom = true
  controls.enableDamping = true

  container.appendChild(renderer.domElement)

  document.addEventListener('mousemove', onDocumentMouseMove)

  let i = 0
  for(let j = 1; j <= 6; j++){
    d3Obj(() => {
    const texture = new THREE.Texture(generateTexture())
    texture.needsUpdate = true
    let material = new THREE.MeshPhongMaterial({
      color: 0xdddddd,
      specular: 0x009900,
      shininess: 30,
      flatShading: true,
    })

    i += 1
    let points = []
    for (let face of my_face) {
      points.push(
        my_vertex[face.p1 - 1].x,
        my_vertex[face.p1 - 1].y,
        my_vertex[face.p1 - 1].z,
      )
      points.push(
        my_vertex[face.p2 - 1].x,
        my_vertex[face.p2 - 1].y,
        my_vertex[face.p2 - 1].z,
      )
      points.push(
        my_vertex[face.p3 - 1].x,
        my_vertex[face.p3 - 1].y,
        my_vertex[face.p3 - 1].z,
      )
      if ( face.p4) {
        points.push(
          my_vertex[face.p3 - 1].x,
          my_vertex[face.p3 - 1].y,
          my_vertex[face.p3 - 1].z,
        )
        points.push(
          my_vertex[face.p4 - 1].x,
          my_vertex[face.p4 - 1].y,
          my_vertex[face.p4 - 1].z,
        )
        points.push(
          my_vertex[face.p1 - 1].x,
          my_vertex[face.p1 - 1].y,
          my_vertex[face.p1 - 1].z,
        )
      }

   
    }
    
    var vertices = new Float32Array(points)
    var geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
    var mesh = new THREE.Mesh(geometry, material)
    mesh.position.add(new THREE.Vector3(30*j,0,0));
    scene.add(mesh)
    my_vertex = []
    my_face = []
  }, 'http://localhost:3000/obj/' + j + '.obj')
}
  }
  

function onWindowResize() {
  windowHalfX = window.innerWidth / 2
  windowHalfY = window.innerHeight / 2

  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

function onDocumentMouseMove(event) {
  /* mouseX = (event.clientX - windowHalfX) / 2
  mouseY = (event.clientY - windowHalfY) / 2*/
}

//

function animate() {
  requestAnimationFrame(animate)
  controls.update()
  render()
}

function render() {
  /*
  camera.position.x += (mouseX - camera.position.x) * 0.05
  camera.position.y += (-mouseY - camera.position.y) * 0.05

  camera.lookAt(scene.position)
*/
  renderer.render(scene, camera)
}
function generateTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256

  const context = canvas.getContext('2d')
  const image = context.getImageData(0, 0, 256, 256)

  let x = 0,
    y = 0

  for (let i = 0, j = 0, l = image.data.length; i < l; i += 4, j++) {
    x = j % 256
    y = x === 0 ? y + 1 : y

    image.data[i] = 255
    image.data[i + 1] = 255
    image.data[i + 2] = 255
    image.data[i + 3] = Math.floor(x ^ y)
  }

  context.putImageData(image, 0, 0)

  return canvas
}
