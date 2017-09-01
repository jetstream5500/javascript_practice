// A*
var rows = 500;
var cols = 500;
var start = {x:0,y:0};
var end = {x:cols-1,y:rows-1}
var percentWalls = 0.4;
var epsilon = 2;
var diagOn = true;
var includeHeuristic = true;

var grid = [];
var openSet = [];
var closedSet = [];
var oldCurrent = null;
var current = null;
var finished = false;
var impossible = false;
var heuristicPower = diagOn ? 2 : 1;

var backgroundColor = "#ffffff"
var blankColor = "#ffffff";
var wallColor = "#000000";
var openColor = "#ffff00";
var closedColor = "#00ffff";
var pathColor = "#ff00ff";

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
		this.f = Infinity;
		this.g = Infinity;
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
		if (diagOn) {
			if (this.y > 0 && this.x > 0 && !(grid[this.y-1][this.x-1] instanceof Wall)) {
				neighbors.push(grid[this.y-1][this.x-1]);
			}
			if (this.y > 0 && this.x < cols-1 && !(grid[this.y-1][this.x+1] instanceof Wall)) {
				neighbors.push(grid[this.y-1][this.x+1]);
			}
			if (this.y < rows-1 && this.x > 0 && !(grid[this.y+1][this.x-1] instanceof Wall)) {
				neighbors.push(grid[this.y+1][this.x-1]);
			}
			if (this.y < rows-1 && this.x < cols-1 && !(grid[this.y+1][this.x+1] instanceof Wall)) {
				neighbors.push(grid[this.y+1][this.x+1]);
			}
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
	start.f=heuristic(start,end,heuristicPower);
}

function heuristic(c1, c2, power) {
	return Math.pow(Math.pow(Math.abs(c1.x-c2.x),power)+Math.pow(Math.abs(c1.y-c2.y),power),1.0/power);
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
					var possG = current.g+heuristic(n,current,heuristicPower);
					if (possG < n.g) {
						n.cameFrom = current;
						n.g = possG;
						n.f = possG;
						if (includeHeuristic) {
							n.f+=epsilon*heuristic(n,end,heuristicPower);
						}
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
		initialDraw();
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
