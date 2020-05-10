let canvas = document.querySelector('canvas');
let ctx_ = document.getElementById('panel').getContext('2d');

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

window.onload = updateCanvas();
window.addEventListener('resize', e => reset());
window.addEventListener('keyup', e => {
    if (e.keyCode == 67) {
        reset();
    }
});

const panelHeight = 28;
const panelWidth = 28;

let mouseX = 0;
let mouseY = 0;

let pixels = [];

class Pixel {
    constructor(x, y, dim) {
        this.x = x;
        this.y = y;
        this.isOn = false;
        this.dim = dim;
        this.bounding = [x, x + dim, y, y + dim];
    }
    swipe() {
        if (!this.isOn) {
            ctx.fillStyle = '#0d0d0d';
            ctx.strokeStyle = '#0d0d0d';
        } else {
            ctx.fillStyle = '#d3d3d3';
            ctx.strokeStyle = '#d3d3d3'
        }
        ctx.beginPath();
        ctx.fillRect(this.x, this.y, this.dim, this.dim);
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.dim, this.dim);
    }
}

let createPanel = () => {

    pixelDim = 20;
    anchorX = (canvas.width / 2) - (pixelDim * (gridWidth / 2));
    anchorY = canvas.height / 2 - (pixelDim * (gridHeight / 5));

    gridBounding = [anchorX, anchorX + (pixelDim * gridWidth), anchorY, anchorY + (pixelDim * gridHeight)];

    for (let i = 0; i < gridHeight; i++) {
		let x = anchorX + (pixelDim * i);
		for (let j = 0; j < gridWidth; j++) {
			let y = anchorY + (pixelDim * j);
			let p = new Pixel(x, y, pixelDim);
			p.draw();
			pixels.push(p);
		}
	}
}

let inBounds = (x, y, target) => {
	return (x > target[0] && x < target[1]) &&
		(y > target[2] && y < target[3]);
}

let pixelDim = null;
let anchorX = null;
let anchorY = null;
let gridBounding = null;