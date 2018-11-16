//https://stackoverflow.com/questions/13938686/can-i-load-a-local-file-into-an-html-canvas-element
var img;

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
		var canvas = document.getElementById("canvas");
		canvas.width = img.width;
		canvas.height = img.height;
		bestcanvas.width = img.width;
		bestcanvas.height = img.height;
		test.width = img.width;
		test.height = img.height;
		var ctx = canvas.getContext("2d");
		//ctx.scale(0.5,0.5);
		ctx.drawImage(img,0,0,img.width,img.height);
	}
}

class Painting {
	constructor(polys,colors) {
		if (polys===undefined) {
			this.polys = [makeRandomPoly()];
			this.colors = [getRandomColor()];
		} else {
			this.polys = polys;
			this.colors = colors;
		}
	}
}

function getRandomColor() {
	var r = Math.floor(Math.random()*256);
	var g = Math.floor(Math.random()*256);
	var b = Math.floor(Math.random()*256);
	var a = 0.3;
	return 'rgba('+r+','+g+','+b+','+a+')';
}

function makeRandomPoly() {
	var polyList = [];

	var vertices = Math.floor(Math.random()*6)+3;
	for (var i = 0; i<vertices; i++) {
		polyList.push(Math.random()*img.width*1.2-img.width*0.1);
		polyList.push(Math.random()*img.height*1.2-img.height*0.1);
	}

	return polyList;
}

console.log(getRandomColor());

function generate() {
	var painting = new Painting();
	//document.body.innerHTML+='<canvas id="a"></canvas>'
	draw(painting);
}

function draw(painting) {
	var canvas = document.getElementById("test");
	var ctx = canvas.getContext("2d");
	//ctx.scale(0.5,0.5);
	for (var i = 0; i<painting.polys.length; i++) {
		ctx.beginPath();
		ctx.moveTo(painting.polys[i][0],painting.polys[i][1]);
		for (var j = 2; j<painting.polys[i].length; j+=2) {
			ctx.lineTo(painting.polys[i][j],painting.polys[i][j+1]);
		}
		ctx.closePath();
		ctx.fillStyle = painting.colors[i];
		ctx.fill();
	}
}
