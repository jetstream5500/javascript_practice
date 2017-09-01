// A*
var rows = 100;
var cols = 100;
var start = {x:0,y:0};
var end = {x:cols-1,y:rows-1}
var grid = [];
var openSet = [];
var closedSet = [];
var percentWalls = 0.3;
var oldCurrent = null;
var current = null;
var finished = false;
var impossible = false;
var epsilon = 5;

var backgroundColor = "#ffffff"
var blankColor = "#ffffff";
var wallColor = "#000000";
var openColor = "#00ff00";
var closedColor = "#ff0000";
var pathColor = "#0000ff";

class Cell {
	constructor(x,y) {
		this.x = x;
		this.y = y;
	}
	show(color) {
		var width = canvas.width/cols;
		var height = canvas.height/rows;
		// rect
		ctx.fillStyle = color;
		ctx.fillRect(this.x*width,this.y*height,width,height);
		//ctx.strokeStyle = "#000000";
		//ctx.lineWidth = "0.5";
		//ctx.strokeRect(this.x*width,this.y*height,width,height);
		// rect border
		//ctx.fillStyle = color;
		//ctx.fillRect(this.x*width,this.y*height,width,height);
		//ctx.strokeStyle = "#000000";
		//ctx.lineWidth = "1";
		//ctx.strokeRect(this.x*width,this.y*height,width,height);
		// circle
		//ctx.fillStyle = color;
		//ctx.beginPath();
		//ctx.arc(this.x*width+width/2,this.y*height+width/2, width/3, 0, 2 * Math.PI);
		//ctx.fill();
	}
}

class Node extends Cell {
	constructor(x,y) {
		super(x,y);
		this.f = 10000;
		this.g = 10000;
		this.h = 10000;
		this.cameFrom = null;
		this.condition = 0;
	}
	getNeighbors() {
		var neighbors = [];
		if (this.x > 0 && !(grid[this.y][this.x-1] instanceof Wall)) {
			neighbors.push(grid[this.y][this.x-1]);
		}
		if (this.x < cols-1 && !(grid[this.y][this.x+1] instanceof Wall)) {
			neighbors.push(grid[this.y][this.x+1]);
		}
		if (this.y > 0 && !(grid[this.y-1][this.x] instanceof Wall)) {
			neighbors.push(grid[this.y-1][this.x]);
		}
		if (this.y < rows-1 && !(grid[this.y+1][this.x] instanceof Wall)) {
			neighbors.push(grid[this.y+1][this.x]);
		}
		return neighbors;
	}
}

class Wall extends Cell {
	constructor(x,y) {
		super(x,y);
	}
}

function setup() {
	for (var y = 0; y<rows; y++) {
		var gridRow = []
		for (var x = 0; x<cols; x++) {
			if (Math.random() < percentWalls && (x!=start.x || y!=start.y) && (x!=end.x || y!=end.y)) {
				gridRow.push(new Wall(x,y));
			} else {
				gridRow.push(new Node(x,y));
			}

		}
		grid.push(gridRow);
	}

	start = grid[start.y][start.x];
	end = grid[end.y][end.x];
	start.condition++;
	openSet.push(start);

	start.g=0;
	start.f=heuristic(start,end);
}

function heuristic(c1, c2) {
	return Math.abs(c1.x-c2.x)+Math.abs(c1.y-c2.y);
}

function aStarStep() {
	if (openSet.length > 0) {
		currentIndex = 0;
		current = openSet[0];
		for (var i = 1; i<openSet.length; i++) {
			var node = openSet[i];
			if (node.f < current.f) {
				currentIndex = i;
				current = node;
			}
		}
		if (current == end) {
			finished=true;
		} else {
			current.condition = 2;
			openSet.splice(currentIndex,1);
			closedSet.push(current);

			var neighbors = current.getNeighbors();
			for (var i = 0; i<neighbors.length; i++) {
				var n = neighbors[i]
				if (n.condition == 0) {
					n.condition++;
					//openSet.push(n);
					openSet.splice(0,0,n);
				}
				if (n.condition == 1) {
					var possG = current.g+heuristic(n,current);
					if (possG < n.g) {
						n.cameFrom = current;
						n.g = possG;
						n.f = possG+epsilon*heuristic(n,end);
					}
				}
			}
		}
	} else {
		impossible=true;
	}
	//console.log(grid);
}

function initialDraw() {
	ctx.fillStyle = backgroundColor;
	ctx.fillRect(0,0,canvas.width,canvas.height);
	for (var y = 0; y<rows; y++) {
		for (var x = 0; x<cols; x++) {
			if (grid[y][x] instanceof Wall) {
				grid[y][x].show(wallColor);
			} else {
				if (grid[y][x].condition == 0) {
					grid[y][x].show(blankColor);
				} else if (grid[y][x].condition == 1) {
					grid[y][x].show(openColor);
				} else {
					grid[y][x].show(closedColor);
				}
			}
		}
	}
}

function draw() {
	// delete old path
	if (oldCurrent!=null) {
		var oldCurrentCopy = oldCurrent;
		while (oldCurrentCopy.cameFrom!=null) {
			oldCurrentCopy.show(closedColor);
			oldCurrentCopy = oldCurrentCopy.cameFrom;
		}
		oldCurrentCopy.show(closedColor);
	}
	if (finished || impossible) {
		// stop looper
		stopIterate();
	} else {
		// update neighbors
		var neighbors = current.getNeighbors();
		for (var i = 0; i<neighbors.length; i++) {
			if (neighbors[i].condition==1) {
				neighbors[i].show(openColor);
			} else {
				neighbors[i].show(closedColor);
			}
		}
		current.show(closedColor);
	}
	if (!impossible) {
		// draw new path
		var currentCopy = current;
		while (currentCopy.cameFrom!=null) {
			currentCopy.show(pathColor);
			currentCopy = currentCopy.cameFrom;
		}
		currentCopy.show(pathColor);

		oldCurrent=current;
	}
}
