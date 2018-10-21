import { vec3 } from 'gl-matrix'

function Ray(position, direction) {
  this.position = position
  this.direction = direction
}

Ray.prototype.intersectsTriangle = function (triangle) {
  const EPSILON = 0.0000001
  let a, f, u, v, t
  let edge1 = vec3.sub([], triangle[1], triangle[0])
  let edge2 = vec3.sub([], triangle[2], triangle[0])
  let h = vec3.cross([], this.direction, edge2)
  a = vec3.dot(edge1, h)
  if (a > -EPSILON && a < EPSILON)
    return false
  f = 1 / a
  let s = vec3.sub([], this.position, triangle[0])
  u = f * vec3.dot(s, h)
  if (u < 0.0 || u > 1.0)
    return false
  let q = vec3.cross([], s, edge1)
  v = f * vec3.dot(this.direction, q)
  if (v < 0.0 || u + v > 1.0)
    return false
  // At this stage we can compute t to find out where the intersection point is on the line.
  t = f * vec3.dot(edge2, q)
  if (t > EPSILON) // ray intersection
  {
    let temp = vec3.scale([], this.direction, t)
    let IntersectionPoint = vec3.add([], this.position, temp)
    // Intersection point to use

    return true
  }
  else // This means that there is a line intersection but not a ray intersection.
    return false
}

export default Ray
