class Vector3D {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    magnitude() {
        return this.dist(new Vector3D(0, 0, 0));
    }

    normalize() {
        return this.scale(1/this.magnitude());
    }

    scale(c) {
        return new Vector3D(c*this.x, c*this.y, c*this.z);
    }

    add(v) {
        return new Vector3D(this.x+v.x, this.y+v.y, this.z+v.z);
    }

    sub(v) {
        return new Vector3D(this.x-v.x, this.y-v.y, this.z-v.z);
    }

    dist(v) {
        return Math.sqrt(Math.pow((this.x-v.x), 2) + Math.pow((this.y-v.y), 2) + Math.pow((this.z-v.z), 2));
    }

    cross(v) {
        return new Vector3D(this.y*v.z-this.z*v.y, this.z*v.x-this.x*v.z, this.x*v.y-this.y*v.x);
    }
}

class Matrix3x3 {
    constructor(vals) {
        this.vals = vals;
    }

    multiply(v) {
        return new Vector3D(this.vals[0][0]*v.x+this.vals[0][1]*v.y+this.vals[0][2]*v.z,
                            this.vals[1][0]*v.x+this.vals[1][1]*v.y+this.vals[1][2]*v.z,
                            this.vals[2][0]*v.x+this.vals[2][1]*v.y+this.vals[2][2]*v.z);
    }

    static rotateX(theta) {
        return new Matrix3x3([[1, 0, 0], [0, Math.cos(theta), -Math.sin(theta)], [0, Math.sin(theta), Math.cos(theta)]]);
    }

    static rotateY(theta) {
        return new Matrix3x3([[Math.cos(theta), 0, Math.sin(theta)], [0, 1, 0], [-Math.sin(theta), 0, Math.cos(theta)]]);
    }

    static rotateZ(theta) {
        return new Matrix3x3([[Math.cos(theta), -Math.sin(theta), 0], [Math.sin(theta), Math.cos(theta), 0], [0, 0, 1]]);
    }
}

class Color {
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
}


class Triangle {
    constructor(a, b, c, color) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.color = color;
    }

    contains(p) {
        // jank but works
        var edge1 = this.b.sub(this.a);
        var edge2 = this.c.sub(this.b);
        var edge3 = this.a.sub(this.c);
        var v1 = p.sub(this.a);
        var v2 = p.sub(this.b);
        var v3 = p.sub(this.c);
        var cross1 = edge1.cross(v1);
        var cross2 = edge2.cross(v2);
        var cross3 = edge3.cross(v3);

        if (cross1.x != 0) {
            return ((cross1.x < 0 && cross2.x < 0 && cross3.x < 0) || (cross1.x > 0 && cross2.x > 0 && cross3.x > 0));
        } else if (cross1.y != 0) {
            return ((cross1.y < 0 && cross2.y < 0 && cross3.y < 0) || (cross1.y > 0 && cross2.y > 0 && cross3.y > 0));
        } else {
            return ((cross1.z < 0 && cross2.z < 0 && cross3.z < 0) || (cross1.z > 0 && cross2.z > 0 && cross3.z > 0));
        }

    }

    depth(c, s) {
        // We are solving A(s.x*d + c.x - p) + B(...) + C(...) = 0
        // p is just the point a for this
        var edge1 = this.b.sub(this.a);
        var edge2 = this.c.sub(this.a);
        var normal = edge1.cross(edge2);
        var rhs = normal.x*(this.a.x-c.x) + normal.y*(this.a.y-c.y) + normal.z*(this.a.z-c.z);
        var lhs = normal.x*s.x + normal.y*s.y + normal.z*s.z;
        return rhs / lhs;
    }
}
