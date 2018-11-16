var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var xMin = -10;
var xMax = 10;
var xCount = 50;
var yMin = -10;
var yMax = 10;
var yCount = 50;
var zMin = -5;
var zMax = 5;
var grid = [];

var phi = 3*Math.PI/36;
var theta = 5*Math.PI/36;
var projectedGrid = [];
var projectedAxes = [];
var retina = 2;
//var equation = "1/(Math.pow(x,2)+Math.pow(y,2)+1)";
//var equation = "Math.pow(x,2)+Math.pow(y,2)";//"Math.pow(x,2)+Math.pow(y,2)";//"Math.sin(x)+Math.cos(y)";//"x+y";
var equation = "Math.sin(x)+Math.cos(y)";

var backgroundColor = "#000000";
var plotColor = "#33FF33";
var axesColor = "#777777";
var dragX;
var dragY;
var mousedown=false;

canvas.addEventListener("mousemove", function(event) {
	if (mousedown) {
		theta +=(event.x-dragX)/100;
		phi +=(event.y-dragY)/100;
		dragX = event.x;
		dragY = event.y;
		draw();
	}
}, true);

canvas.addEventListener("mousedown", function(event) {
	stopIterate();
	mousedown=true;
	dragX = event.x;
	dragY = event.y;
}, true);
canvas.addEventListener("mouseup", function(event) {
	mousedown=false;
	if (iterating) {
		iterate();
	}
}, true);
canvas.addEventListener("mouseleave", function(event) {
	mousedown=false;
	if (iterating) {
		iterate();
	}
}, true);

document.addEventListener('keydown', function(event) {
    if (event.keyCode == 38) {
		phi-=Math.PI/36;
		draw();
    }
}, true);
document.addEventListener('keydown', function(event) {
    if (event.keyCode == 40) {
		phi+=Math.PI/36;
		draw();
    }
}, true);
document.addEventListener('keydown', function(event) {
    if (event.keyCode == 37) {
		theta-=Math.PI/36;
		draw();
    }
}, true);
document.addEventListener('keydown', function(event) {
    if (event.keyCode == 39) {
		theta+=Math.PI/36;
		draw();
    }
}, true);


function graphStep() {
	theta+=Math.PI/300;
}

function setup() {
	for (var i = 0; i<xCount; i++) {
		var x = xMin+i*((xMax-xMin)/(xCount-1));
		var yChanges = [];
		for (var j = 0; j<yCount; j++) {
			var y = yMin+j*((yMax-yMin)/(yCount-1));
			yChanges.push([x,y,eval(equation)]);
		}
		grid.push(yChanges);
	}
	console.log(grid);
}

function clearCanvas() {
	ctx.fillStyle = backgroundColor;
	ctx.fillRect(0,0,canvas.width,canvas.height);
}

function draw() {
	var origin = [canvas.width/(2*retina),canvas.height/(2*retina)];

	clearCanvas();
	projectedGrid = [];
	var projectionMatrix = getProjectionMatrix();
	projectAxes(projectionMatrix);
	projectPlot(projectionMatrix);

	drawAxes(origin);
	drawPlot(origin);
}

function drawAxes(origin) {
	ctx.strokeStyle = axesColor;
	ctx.lineWidth = 1;

	ctx.beginPath();
	ctx.moveTo(projectedAxes[0][0]*15+origin[0], projectedAxes[0][1]*15+origin[1]);
	for (var j = 1; j<8; j++) {
		ctx.lineTo(projectedAxes[j][0]*15+origin[0], projectedAxes[j][1]*15+origin[1]);
	}
	ctx.closePath();
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(projectedAxes[0][0]*15+origin[0], projectedAxes[0][1]*15+origin[1]);
	ctx.lineTo(projectedAxes[3][0]*15+origin[0], projectedAxes[3][1]*15+origin[1]);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(projectedAxes[4][0]*15+origin[0], projectedAxes[4][1]*15+origin[1]);
	ctx.lineTo(projectedAxes[7][0]*15+origin[0], projectedAxes[7][1]*15+origin[1]);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(projectedAxes[1][0]*15+origin[0], projectedAxes[1][1]*15+origin[1]);
	ctx.lineTo(projectedAxes[6][0]*15+origin[0], projectedAxes[6][1]*15+origin[1]);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(projectedAxes[2][0]*15+origin[0], projectedAxes[2][1]*15+origin[1]);
	ctx.lineTo(projectedAxes[5][0]*15+origin[0], projectedAxes[5][1]*15+origin[1]);
	ctx.stroke();
}

function drawPlot(origin) {
	ctx.strokeStyle = plotColor;
	ctx.lineWidth = 1;
	for (var x = 0; x<projectedGrid.length; x++) {
		ctx.beginPath();
		ctx.moveTo(projectedGrid[x][0][0]*15+origin[0], projectedGrid[x][0][1]*15+origin[1]);
		for (var y = 1; y<projectedGrid[0].length; y++) {
			ctx.lineTo(projectedGrid[x][y][0]*15+origin[0], projectedGrid[x][y][1]*15+origin[1]);
		}
		ctx.stroke();
	}
	for (var y = 0; y<projectedGrid[0].length; y++) {
		ctx.beginPath();
		ctx.moveTo(projectedGrid[0][y][0]*15+origin[0], projectedGrid[0][y][1]*15+origin[1]);
		for (var x = 1; x<projectedGrid.length; x++) {
			ctx.lineTo(projectedGrid[x][y][0]*15+origin[0], projectedGrid[x][y][1]*15+origin[1]);
		}
		ctx.stroke();
	}
}

function getProjectionMatrix() {
	return [[Math.cos(theta), -Math.sin(theta), 0],
		[-Math.sin(phi)*Math.sin(theta), -Math.sin(phi)*Math.cos(theta), -Math.cos(phi)]];
}

function projectAxes(projectionMatrix) {
	projectedAxes = [projectPoint(projectionMatrix,[xMin,yMin,zMin]),
		projectPoint(projectionMatrix,[xMin,yMax,zMin]),
		projectPoint(projectionMatrix,[xMax,yMax,zMin]),
		projectPoint(projectionMatrix,[xMax,yMin,zMin]),

		projectPoint(projectionMatrix,[xMax,yMin,zMax]),
		projectPoint(projectionMatrix,[xMax,yMax,zMax]),
		projectPoint(projectionMatrix,[xMin,yMax,zMax]),
		projectPoint(projectionMatrix,[xMin,yMin,zMax])];
}

function projectPoint(projectionMatrix, vector) {
	return [projectionMatrix[0][0]*vector[0]+projectionMatrix[0][1]*vector[1]+projectionMatrix[0][2]*vector[2],
		projectionMatrix[1][0]*vector[0]+projectionMatrix[1][1]*vector[1]+projectionMatrix[1][2]*vector[2]];
}

function projectPlot(projectionMatrix) {
	for (var x = 0; x<grid.length; x++) {
		var yProjectedGrid = [];
		for (var y = 0; y<grid[0].length; y++) {
			yProjectedGrid.push(projectPoint(projectionMatrix,grid[x][y]));
		}
		projectedGrid.push(yProjectedGrid);
	}
}
