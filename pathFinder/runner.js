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

window.onload = function() {
	window.addEventListener('resize', resizeCanvas, false);
	setup();
	resizeCanvas();
};

function resizeCanvas() {
	var size=Math.min(window.innerWidth,window.innerHeight);
	canvas.width = size;
	canvas.height = size;

	canvas.style.width = size+"px";
	canvas.style.height = size+"px";

	initialDraw();
	iterate();
}

function iterate() {
	animationFrameID=requestAnimationFrame(iterate);

	now = Date.now();
	delta = now-then;
	if (delta > interval) {
		then = now - (delta % interval);
		aStarStep();
		draw();
	}
}

function stopIterate() {
	window.cancelAnimationFrame(animationFrameID)
}
