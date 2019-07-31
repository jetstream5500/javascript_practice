// c = camera position
// h = flattened plane of view
// we then extend to actual plane of view on the associated sphere
// theta, phi, alpha = angles for camera
// window_size = extent of flattend window plane


function setup() {
    var canvas = document.getElementById('drawing_area');
    var ctx = canvas.getContext("2d");

    var retina = 2;
    var width = 700;
    var height = 700;
    var window_size = {xmin:-1, xmax:1, ymin:-1, ymax:1};

    canvas.width = width*retina;
    canvas.height = height*retina;
    canvas.style.width = width+"px";
    canvas.style.height = height+"px";
    ctx.scale(retina,retina);

    draw(canvas, ctx, window_size);
}

function draw(canvas, ctx, window_size) {
    var color1 = new Color(255, 0, 0);
    var a1 = new Vector3D(-1, -1, 2);
    var color2 = new Color(255, 255, 0);
    var a2 = new Vector3D(-1, 1, 2);
    var color3 = new Color(0, 255, 20);
    var a3 = new Vector3D(1, -1, 2);
    var color4 = new Color(0, 0, 255);
    var a4 = new Vector3D(-1, -1, 4);

    var t1 = new Triangle(a2, a3, a4, color1);
    var t2 = new Triangle(a1, a3, a4, color2);
    var t3 = new Triangle(a1, a2, a4, color3);
    var t4 = new Triangle(a1, a2, a3, color4);

    var triangles = [t4, t1, t2, t4];

    // c = camera
    // h = distance of plane from camera
    var c = new Vector3D(0, 0, 0);
    var h = 1;
    var phi = 0;
    var theta = 0;
    var alpha = 0;
    var correct_theta = Matrix3x3.rotateZ(theta);
    var correct_phi = Matrix3x3.rotateY(phi);
    var correct_alpha = Matrix3x3.rotateZ(alpha);

    // Dimensions in window space
    var pixel_width = (window_size.xmax-window_size.xmin)/canvas.width;
    var pixel_height = (window_size.ymax-window_size.ymin)/canvas.height;
    var image = ctx.createImageData(canvas.width,canvas.height);

    var depth_table = new Array(canvas.height);
    for (var i = 0; i<canvas.height; i++) {
        depth_table[i] = (new Array(canvas.width)).fill(100000);
    }

    var counter = 0;
    for (var y = 0; y<canvas.height; y++) {
        for (var x = 0; x<canvas.width; x++) {
            // Center of pixel coordinate in window space
            var center_x = pixel_width/2 + x*pixel_width + window_size.xmin;
            var center_y = pixel_height/2 + y*pixel_height + window_size.ymin;


            var window_point = new Vector3D(center_x, center_y, h);
            //console.log(window_point.magnitude())
            //console.log(window_point)
            // line of sight
            //console.log("window point", window_point);
            //console.log(window_point);
            var s = window_point.normalize();
            //if (y < 0.02) {
            //    console.log(s)
            //}
            //console.log(s);
            //console.log(s.magnitude());
            //console.log("line of sight", s.scale(h));
            //console.log(s);
            // rotate line of sight
            s = correct_theta.multiply(correct_phi.multiply(correct_alpha.multiply(s)));
            // translate camera
            //s = s.add(c);
            //console.log(s);


            //console.log(s);

            //console.log(s);
            var hadSomething = false;

            for (var i = 0; i<triangles.length; i++) {
                var t = triangles[i];
                //console.log(t);

                var depth = t.depth(c, s);
                var p = new Vector3D(c.x+s.x*depth, c.y+s.y*depth, c.z+s.z*depth);

                if (depth < depth_table[y][x] && depth > 0) {
                    if (t.contains(p)) {
                        depth_table[y][x] = depth;
                        image.data[counter] = t.color.r;
                        image.data[counter+1] = t.color.g;
                        image.data[counter+2] = t.color.b;
                        image.data[counter+3] = 255;
                        hadSomething = true;
                    }
                }
            }

            if (!hadSomething) {
                image.data[counter] = 0;
                image.data[counter+1] = 0;
                image.data[counter+2] = 50;
                image.data[counter+3] = 255;
            }

            counter+=4;
        }
    }
    //console.log(image.data[4]);

    ctx.putImageData(image, 0, 0);
}
