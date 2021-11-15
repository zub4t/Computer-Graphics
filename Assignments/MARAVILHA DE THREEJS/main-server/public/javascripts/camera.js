import * as THREE from '/three.js/build/three.module.js'
import Stats from '/three.js/examples/jsm/libs/stats.module.js'

import { GLTFLoader } from '/three.js/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from '/three.js/examples/jsm/loaders/DRACOLoader.js'

let mixer,
  basicCharacterController,
  viewHalfX,
  viewHalfY,
  mouseX,
  mouseY,
  activeCamera
viewHalfX = window.innerWidth / 2
viewHalfY = window.innerHeight / 2
function bind(scope, fn) {
  return function () {
    fn.apply(scope, arguments)
  }
}

const clock = new THREE.Clock()
const container = document.getElementById('container')

const stats = new Stats()
container.appendChild(stats.dom)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.outputEncoding = THREE.sRGBEncoding
container.appendChild(renderer.domElement)

const scene = new THREE.Scene()
scene.background = new THREE.Color(0xbfe3dd)

const cameras = [
  new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    1500,
  ),

  new THREE.OrthographicCamera(
    window.innerWidth / -2,
    window.innerWidth / 2,
    window.innerHeight / 2,
    window.innerHeight / -2,
    1,
    1000,
  ),
]

activeCamera = cameras[0]
activeCamera.position.set(9, -164, 210)

document.addEventListener('wheel', (event) => {
  event.preventDefault()

  let scale = event.deltaY

  if (activeCamera.fov)
    switch (Math.sign(scale)) {
      case 1:
        activeCamera.fov += 1
        break
      case -1:
        activeCamera.fov -= 1
        break
    }
  activeCamera.updateProjectionMatrix()
})

/*
const controls = new OrbitControls(camera, renderer.domElement)
controls.target.set(0, 0.5, 0)
controls.update()
controls.enablePan = false
controls.enableDamping = true
*/
scene.add(new THREE.HemisphereLight(0xffffff, 0x000000, 0.4))

const dirLight = new THREE.DirectionalLight(0xffffff, 1)
dirLight.position.set(5, 2, 8)
scene.add(dirLight)

// envmap
const path = '/three.js/examples/textures/cube/Park2/'
const format = '.jpg'
const envMap = new THREE.CubeTextureLoader().load([
  path + 'posx' + format,
  path + 'negx' + format,
  path + 'posy' + format,
  path + 'negy' + format,
  path + 'posz' + format,
  path + 'negz' + format,
])

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/three.js/examples/js/libs/draco/gltf/')

const loader = new GLTFLoader()
loader.setDRACOLoader(dracoLoader)
loader.load(
  '/three.js/examples/models/gltf/LittlestTokyo.glb',
  function (gltf) {
    const model = gltf.scene
    model.position.set(1, 1, 0)
    model.scale.set(1, 1, 1)
    model.traverse(function (child) {
      if (child.isMesh) child.material.envMap = envMap
    })

    scene.add(model)

    mixer = new THREE.AnimationMixer(model)
    mixer.clipAction(gltf.animations[0]).play()
    basicCharacterController = new BasicCharacterController(activeCamera)

    animate()
  },
  undefined,
  function (e) {
    console.error(e)
  },
)

window.onresize = function () {
  activeCamera.aspect = window.innerWidth / window.innerHeight
  activeCamera.updateProjectionMatrix()
  viewHalfX = window.innerWidth / 2
  viewHalfY = window.innerHeight / 2
  renderer.setSize(window.innerWidth, window.innerHeight)
}

class My3DCamera {
  constructor(params) {
    this.camera = params.camera
  }
}
class BasicCharacterControllerInput {
  constructor() {
    this.Init()
  }
  Init() {
    this._keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      space: false,
      shift: false,
    }
    document.addEventListener('keydown', (e) => this.onKeyDown(e), false)
    document.addEventListener('keyup', (e) => this.onKeyUp(e), false)
  }

  onKeyDown(event) {
    switch (event.keyCode) {
      case 87: // w
        this._keys.forward = true
        break
      case 65: // a
        this._keys.left = true
        break
      case 83: // s
        this._keys.backward = true
        break
      case 68: // d
        this._keys.right = true
        break
      case 32: // SPACE
        this._keys.space = true
        break
      case 16: // SHIFT
        this._keys.shift = true
        break
    }
  }

  onKeyUp(event) {
    switch (event.keyCode) {
      case 87: // w
        this._keys.forward = false
        break
      case 65: // a
        this._keys.left = false
        break
      case 83: // s
        this._keys.backward = false
        break
      case 68: // d
        this._keys.right = false
        break
      case 32: // SPACE
        this._keys.space = false
        break
      case 16: // SHIFT
        this._keys.shift = false
        break
    }
  }
}

class BasicCharacterController {
  constructor(entity) {
    this.entity = entity
    this.input = new BasicCharacterControllerInput()
    this.acceleration = new THREE.Vector3(1000, 1, 1000)
    this.decceleration = new THREE.Vector3(-5.0, -0.0001, -5.0)
    this.position = new THREE.Vector3(0, 0, 0)
    this.velocity = new THREE.Vector3(0, 0, 0)
    document.removeEventListener('mousemove', _onMouseMove)
    var _onMouseMove = bind(this, this.onMouseMove)
    document.addEventListener('mousemove', _onMouseMove)
    setInterval(() => {
      console.log(this.entity.position)
    }, 3000)
  }
  onMouseMove = function (event) {
    mouseX = event.clientX - viewHalfX
    mouseY = event.clientY - viewHalfY
  }
  Update(timeInSeconds) {
    if (this.input._keys.space) {
      activeCamera = cameras[1]
    } else {
      activeCamera = cameras[0]
    }

    var targetPosition = new THREE.Vector3(0, 0, 0)

    const frameDecceleration = new THREE.Vector3(
      this.velocity.x * this.decceleration.x,
      this.velocity.y * this.decceleration.y,
      this.velocity.z * this.decceleration.z,
    )
    frameDecceleration.multiplyScalar(timeInSeconds)
    frameDecceleration.z =
      Math.sign(frameDecceleration.z) *
      Math.min(Math.abs(frameDecceleration.z), Math.abs(this.velocity.z))

    frameDecceleration.x =
      Math.sign(frameDecceleration.x) *
      Math.min(Math.abs(frameDecceleration.x), Math.abs(this.velocity.x))
    this.velocity.add(frameDecceleration)

    const Q = new THREE.Quaternion()
    const A = new THREE.Vector3()
    const R = this.entity.quaternion.clone()

    const acc = this.acceleration.clone()
    if (this.input._keys.shift) {
      acc.multiplyScalar(2.0)
    }

    if (this.input._keys.forward) {
      this.velocity.z -= acc.z * timeInSeconds
    }
    if (this.input._keys.backward) {
      this.velocity.z += acc.z * timeInSeconds
    }
    if (this.input._keys.left) {
      this.velocity.x -= acc.x * timeInSeconds
    }
    if (this.input._keys.right) {
      this.velocity.x += acc.x * timeInSeconds
    }
    /*   if (this.input._keys.left) {
      A.set(0, 1, 0)
      Q.setFromAxisAngle(A, 4.0 * Math.PI * timeInSeconds * this.acceleration.y)
      R.multiply(Q)
    }
    if (this.input._keys.right) {
      A.set(0, 1, 0)
      Q.setFromAxisAngle(
        A,
        4.0 * -Math.PI * timeInSeconds * this.acceleration.y,
      )
      R.multiply(Q)
    }*/
    //this.entity.quaternion.copy(R)

    const forward = new THREE.Vector3(0, 0, 1)
    forward.applyQuaternion(this.entity.quaternion)
    forward.normalize()

    const sideways = new THREE.Vector3(1, 0, 0)
    sideways.applyQuaternion(this.entity.quaternion)
    sideways.normalize()

    sideways.multiplyScalar(this.velocity.x * timeInSeconds)
    forward.multiplyScalar(this.velocity.z * timeInSeconds)

    this.position.copy(this.entity.position)

    var lat = 0
    var lon = 0
    //console.log( this.mouseX)
    lon -= mouseX * 1
    lat -= mouseY * 1
    lat = Math.max(-85, Math.min(85, lat))
    //console.log(`lat :${lat} long${lon}`)
    var phi = THREE.MathUtils.degToRad(90 - lat)
    var theta = THREE.MathUtils.degToRad(lon)


    this.position.add(sideways).add(forward)


    targetPosition.setFromSphericalCoords(1, phi, theta)

    targetPosition.add(this.position)
    this.entity.position.copy(this.position)

    const t = 1.0 - Math.pow(0.1, timeInSeconds)
    targetPosition.lerp(targetPosition, t)
    if (!isNaN(targetPosition.x)) this.entity.lookAt(targetPosition)
  }
}
/*
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
)
scene.add(cube)
*/

function animate() {
  requestAnimationFrame(animate)

  const delta = clock.getDelta()

  mixer.update(delta)

  //controls.update()
  basicCharacterController.Update(delta)
  stats.update()

  renderer.render(scene, activeCamera)
}
