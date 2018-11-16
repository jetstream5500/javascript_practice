var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
// http://codetheory.in/controlling-the-frame-rate-with-requestanimationframe/
// Drawing Cycling
var fps=60;
var now;
var then = Date.now();
var interval = 1000/fps;
var delta;
var animationFrameID;
var iterating = true;
var retina = 2;

document.addEventListener('keydown', function(event) {
    if (event.keyCode == 32) {
		if (iterating) {
			stopIterate();
		} else {
			iterate();
		}

    }
}, true);

window.onload = function() {
	window.addEventListener('resize', resizeCanvas, false);
	setup();
	resizeCanvas();
};

function resizeCanvas() {
	var size=Math.min(window.innerWidth,window.innerHeight);
	canvas.width = size*retina;
	canvas.height = size*retina;

	canvas.style.width = size+"px";
	canvas.style.height = size+"px";
	var ctx = canvas.getContext("2d");
	ctx.scale(retina,retina);

	draw();
	if (iterating) {
		iterate();
	}
}

function iterate() {
	iterating = true;
	animationFrameID=requestAnimationFrame(iterate);

	now = Date.now();
	delta = now-then;
	if (delta > interval) {
		then = now - (delta % interval);
		graphStep();
		draw();
	}
}

function stopIterate() {
	iterating = false;
	window.cancelAnimationFrame(animationFrameID)
}
