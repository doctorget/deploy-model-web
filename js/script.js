let canvas = document.querySelector('canvas');
let ctx_ = document.getElementById('chart').getContext('2d');

let ctx = canvas.getContext('2d');
let isWriting = false;

let updateCanvas = () => {
	canvas.height = window.innerHeight;
	canvas.width = window.innerWidth;
}

let reset = () => {
    updateCanvas();
	pixels = [];
	createGrid();
}