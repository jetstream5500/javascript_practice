var fps=60;
var now;
var then = Date.now();
var interval = 1000/fps;
var delta;
var animationFrameID;
var iterating = true;
var retina = 2;

//https://stackoverflow.com/questions/13938686/can-i-load-a-local-file-into-an-html-canvas-element
var image_canvas = document.getElementById('image_painting')
var best_canvas = document.getElementById('best_painting')
var inspect_canvas = document.getElementById('inspect_painting')
var img;
var population;
var counter;

function loadImage() {
	var input, file, fr;

	if (typeof window.FileReader !== 'function') {
		console.log("The file API isn't supported on this browser yet.");
		return;
	}

	input = document.getElementById('fileSelect');
	if (!input) {
		console.log("Um, couldn't find the imgfile element.");
	}
	else if (!input.files) {
		console.log("This browser doesn't seem to support the `files` property of file inputs.");
	}
	else if (!input.files[0]) {
		console.log("Please select a file before clicking 'Load'");
	}
	else {
		file = input.files[0];
		fr = new FileReader();
		fr.onload = createImage;
		fr.readAsDataURL(file);
	}
	function createImage() {
		img = new Image();
		img.onload = imageLoaded;
		img.src = fr.result;
	}

	function imageLoaded() {
		var image_canvas = document.getElementById("image");
    var best_canvas = document.getElementById("best_painting");
    var inspect_canvas = document.getElementById("inspect_painting");
		image_canvas.width = img.width;
		image_canvas.height = img.height;
		best_canvas.width = img.width;
    best_canvas.height = img.height;
    inspect_canvas.width = img.width;
    inspect_canvas.height = img.height;
		var ctx = image_canvas.getContext("2d");
		//ctx.scale(0.5,0.5);
		ctx.drawImage(img,0,0,img.width,img.height);
    console.log(img)
	}
}

class Triangle {
  constructor(xmin, xmax, ymin, ymax) {
    this.color = {
      r:Math.floor(Math.random()*256),
      g:Math.floor(Math.random()*256),
      b:Math.floor(Math.random()*256),
      a:1.0
    }
    this.vertices = [
      {x:Math.random()*(xmax-xmin)+xmin, y:Math.random()*(ymax-ymin)+ymin},
      {x:Math.random()*(xmax-xmin)+xmin, y:Math.random()*(ymax-ymin)+ymin},
      {x:Math.random()*(xmax-xmin)+xmin, y:Math.random()*(ymax-ymin)+ymin}
    ]
  }
}

class Painting {
  constructor(num_elements, canvas_size) {
    this.triangles = []
    for (var i = 0; i<num_elements; i++) {
      this.triangles.push(
        new Triangle(0,canvas_size.width,0,canvas_size.height)
      )
    }
    this.fitness = -1
    this.mutation_rate = 0.5
  }
}

function clear_canvas(canvas) {
  var ctx = canvas.getContext('2d')
  ctx.rect(0,0,canvas.width, canvas.height)
  ctx.fillStyle = "white";
  ctx.fill()
}

function draw_painting(p, canvas) {
  var ctx = canvas.getContext('2d')
  clear_canvas(canvas)
  for (var i = 0; i<p.triangles.length; i++) {
    var triangle = p.triangles[i];

    ctx.beginPath();
    ctx.moveTo(triangle.vertices[0].x, triangle.vertices[0].y)
    ctx.lineTo(triangle.vertices[1].x, triangle.vertices[1].y)
    ctx.lineTo(triangle.vertices[2].x, triangle.vertices[2].y)
    ctx.closePath();
    ctx.fillStyle = "rgba("+triangle.color.r+", "+triangle.color.g+", "+triangle.color.b+", "+triangle.color.a+")";
    ctx.fill()
  }
}

function generate_population() {
  var population = []
  for (var i = 0; i < 100; i++) {
    population.push(new Painting(30,{width:img.width,height:img.height}))
  }
  return population
}

function mutate_triangle(triangle) {
  var color = triangle.color
  color.r=Math.max(0,Math.min(255, Math.floor(color.r+Math.random()*20-10)))
  color.g=Math.max(0,Math.min(255, Math.floor(color.g+Math.random()*20-10)))
  color.b=Math.max(0,Math.min(255, Math.floor(color.b+Math.random()*20-10)))

  for (var i = 0; i<triangle.vertices.length; i++) {
    var vertex = triangle.vertices[i]
    vertex.x+=Math.random()*10-5
    vertex.y+=Math.random()*10-5
  }
}

function generate_new_population() {
  for (var i = 1; i<population.length; i++) {
    var triangles = population[i].triangles;
    for (var j = 0; j<triangles.length; j++) {
      if (Math.random() < population[i].mutation_rate) {
        mutate_triangle(triangles[j])
      }
    }
  }
}

function compute_fitness(p) {
  var inspect_canvas = document.getElementById("inspect_painting");
  var ctx = inspect_canvas.getContext('2d');
  data = ctx.getImageData(0,0,img.width,img.height).data

  var image_canvas = document.getElementById("image");
  var ctx2 = image_canvas.getContext('2d');
  data2 = ctx2.getImageData(0,0,img.width,img.height).data

  p.fitness = 0
  for (var i = 0; i<data.length; i+=4) {
    p.fitness += Math.pow(Math.abs(data[i]-data2[i]),2)
              + Math.pow(Math.abs(data[i+1]-data2[i+1]),2)
              + Math.pow(Math.abs(data[i+2]-data2[i+2]),2)
  }
}

function setup() {
  population = generate_population()
  counter = 0;
}

function iterate() {
	iterating = true;
	animationFrameID=requestAnimationFrame(iterate);
	now = Date.now();
	delta = now-then;
	if (delta > interval) {
		then = now - (delta % interval);
    draw_painting(population[counter], inspect_canvas);
    compute_fitness(population[counter]);
    counter = (counter+1)%population.length
    if (counter == 0) {
      population.sort(function (a,b) {
        return a.fitness-b.fitness;
      });
      console.log(population)
      draw_painting(population[0], best_canvas)
      generate_new_population()
    }
	}
}

function stopIterate() {
	iterating = false;
	window.cancelAnimationFrame(animationFrameID)
}
