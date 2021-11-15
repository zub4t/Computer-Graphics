var my_vertex = new Array()
var my_vertex_normal = []
var my_face = []
var my_vertex_texture = []

let d3Obj = (exec) => {
  fetch('http://localhost:3000/obj/spiderman.obj')
    .then(function (response) {
      return response.text()
    })
    .then((data) => {
      new Promise(function (myResolve, myReject) {
        // "Producing Code" (May take some time)
        dump_vector('v', my_vertex, data)
        dump_vector('n', my_vertex_normal, data)
        dump_vector('t', my_vertex_texture, data)
        dump_quad(my_face, data)
        myResolve()
      })
    })
    .then((result) => {
      console.log("OK iniciando ")
      exec()
    })
}
function dump_quad(list, data) {
  let i = 0
  while (i < data.length) {
    if (data[i] == 'f' && data[i + 1] == ' ') {
      let start = i
      let containTexture = false
      while (data[i] != '\n') {
        if (data[i] == '/' && data[i + 1] != '/') {
          containTexture = true
        }
        i++
      }
      let end = i
      let v = data.slice(start, end)
      v = v.split(' ')
      let position = []
      let texture = []
      let normal = []
      if (!containTexture) {
        for (x of v) {
          x = x.split('//')
          if (x.length > 1) {
            position.push(x[0])
            normal.push(x[1])
          }
        }
      } else {
        for (x of v) {
          x = x.split('/')
          if (x.length > 1) {
            position.push(x[0])
            texture.push(x[1])
            normal.push(x[2])
          }
        }
      }
      let quad = new Quad(
        position[0],
        position[1],
        position[2],
        position[3],
        normal[0],
        normal[1],
        normal[2],
        normal[3],
      )
      if (containTexture)
        quad.setTexture(texture[0], texture[1], texture[2], texture[3])
      list.push(quad)
    }

    i++
  }
}
function dump_vector(initial_ch, list, data) {
  let i = 0
  while (i < data.length) {
    let start = 0
    if (data[i] == initial_ch && data[i + 1] == ' ') {
      start = i
      while (data[i] != '\n') i++
      let end = i
      let v = data.slice(start, end)
      v = v.split(' ')
      if (v.length > 3) list.push(new Vector(v[1], v[2], v[3]))
      else list.push(new Vector(v[1], v[2]))
    }
    i++
  }
}

class Quad {
  constructor(p1, p2, p3, p4, n1, n2, n3, n4) {
    this.p1 = p1
    this.p2 = p2
    this.p3 = p3
    this.p4 = p4

    this.n1 = n1
    this.n2 = n2
    this.n3 = n3
    this.n4 = n4
  }
  setTexture(t1, t2, t3, t4) {
    this.t1 = t1
    this.t2 = t2
    this.t3 = t3
    this.t4 = t4
  }
}
class Vector {
  constructor(x, y, z) {
    this.x = parseFloat(x)
    this.y = parseFloat(y)
    this.z = parseFloat(z)
  }
}
