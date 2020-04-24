function loadCanvas() {
	var canvas = document.getElementById("myCanvas"),
	ctx = canvas.getContext("2d");

	var map = [
		{x: 0, y: 0, w: 100, h: 60, c: "#FF0000"},
		{x: 100, y: 0, w: 40, h: 10, c: "#FFAA00"},
		{x: 140, y: 0, w: 40, h: 10, c: "#00FF00"},
		{x: 180, y: 0, w: 20, h: 10, c: "#0000FF"}
	];

	var hover = false, id;
	var _i, _b;
	function renderMap() {
		for(_i = 0; _b = map[_i]; _i ++) {
			ctx.globalAlpha = (hover && id === _i) ? 1 : 0.5;
			ctx.fillStyle = _b.c;
			ctx.fillRect(_b.x, _b.y,  _b.w, _b.h);
		}
	}
	// Render everything
	renderMap();
	canvas.onmousemove = function(e) {
		// Get the current mouse position
		var r = canvas.getBoundingClientRect(),
			x = e.clientX - r.left, y = e.clientY - r.top;
		hover = false;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		for(var i = map.length - 1, b; b = map[i]; i--) {
			if(x >= b.x && x <= b.x + b.w &&
			   y >= b.y && y <= b.y + b.h) {
				// The mouse honestly hits the rect
				hover = true;
				id = i;
				break;
			}
		}
		// Draw the rectangles by Z (ASC)
		renderMap();
	}
}
