// c = camera position
// h = flattened plane of view
// we then extend to actual plane of view on the associated sphere
// theta, phi, alpha = angles for camera
// window_size = extent of flattend window plane


function setup() {
    var canvas = document.getElementById('drawing_area');
    var ctx = canvas.getContext("2d");

    var retina = 2;
    var width = 600;
    var height = 600;
    var window_size = {xmin:-1, xmax:1, ymin:-1, ymax:1};

    canvas.width = width*retina;
    canvas.height = height*retina;
    canvas.style.width = width+"px";
    canvas.style.height = height+"px";
    ctx.scale(retina,retina);

    draw(canvas, ctx, window_size);
}

function draw(canvas, ctx, window_size) {
    var a1 = new Vector3D(-1, -1, 15);
    var a2 = new Vector3D(-1, 1, 15);
    var a3 = new Vector3D(1, -1, 15);
    var color1 = new Color(255, 0, 0);

    var t1 = new Triangle(a1, a2, a3, color1);
    var triangles = [t1];



    // determines "angle of view"
    var angle_of_view = Math.PI/10
    var radius = 1/Math.tan(angle_of_view/2);
    console.log(radius)
    // Dimensions in window space
    var pixel_width = (window_size.xmax-window_size.xmin)/canvas.width;
    var pixel_height = (window_size.ymax-window_size.ymin)/canvas.height;
    var image = ctx.createImageData(canvas.width,canvas.height);

    // Rasterization
    var counter = 0;
    for (var y = 0; y<canvas.height; y++) {
        for (var x = 0; x<canvas.width; x++) {
            // Center of pixel coordinate in window space
            var center_x = pixel_width/2 + x*pixel_width + window_size.xmin;
            var center_y = pixel_height/2 + y*pixel_height + window_size.ymin;
            var center_z = Math.sqrt(Math.pow(radius, 2)-Math.pow(center_x, 2)-Math.pow(center_y, 2));
            var center = (new Vector3D(center_x, center_y, center_z)).normalize();

            //var depth =
            //console.log(center)

            for (var i = 0; i<triangles.length; i++) {
                var tri = triangles[i];
                var depth = tri.depth(center);
                //console.log(center.scale(depth))
                if (tri.contains(center.scale(depth))) {
                    image.data[counter] = tri.color.r;
                    image.data[counter+1] = tri.color.g;
                    image.data[counter+2] = tri.color.b;
                    image.data[counter+3] = 255;
                }
            }
            counter+=4;
        }
    }
    //console.log(image.data[4]);

    ctx.putImageData(image, 0, 0);
}
