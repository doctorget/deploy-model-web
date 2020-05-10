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
    createPanel();
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

let pixelDim = null;
let anchorX = null;
let anchorY = null;
let gridBounding = null;


let createPanel = () => {

    pixelDim = 20;
    anchorX = (canvas.width / 2) - (pixelDim * (panelWidth / 2));
    anchorY = canvas.height / 2 - (pixelDim * (panelHeight / 5));

    gridBounding = [anchorX, anchorX + (pixelDim * panelWidth), anchorY, anchorY + (pixelDim * panelHeight)];

    for (let i = 0; i < panelHeight; i++) {
        let x = anchorX + (pixelDim * i);
        for (let j = 0; j < panelWidth; j++) {
            let y = anchorY + (pixelDim * j);
            let p = new Pixel(x, y, pixelDim);
            p.swipe();
            pixels.push(p);
        }
    }
}

let inBounds = (x, y, target) => {
    return (x > target[0] && x < target[1]) &&
        (y > target[2] && y < target[3]);
}

window.addEventListener('mousedown', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (inBounds(mouseX, mouseY, gridBounding)) {
        isWriting = true;
    }
});

window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!inBounds(mouseX, mouseY, gridBounding)) {
        isWriting = false;
    }
    else if (isWriting) {
        pixels.forEach(p => {
            if (!p.isOn) {
                if (inBounds(mouseX, mouseY, p.bounding)) {
                    p.isOn = true;
                    p.swipe();
                }
            }
        });
    }
});

window.addEventListener('mouseup', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (isWriting) {
        raw_matrix = parsePanel();
        // Predict with CNN.
        let softmax = predict(raw_matrix).dataSync();
        let preds = Array.from(softmax).map(n => parseFloat(n.toPrecision(4)));
        console.log(preds);

        let bar = Chart.Bar(ctx_, {
            // The data for our dataset
            data: {
                labels: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
                datasets: [{
                    backgroundColor: 'rgba(247, 127, 155, 0.5)',
                    borderColor: 'black',
                    data: preds,
                    borderWidth: 2
                }]
            },
            // Configuration options
            options: {
                legend: {
                    display: false,
                },
                responsive: false,
                scales: {
                    xAxes: [{
                        ticks: {
                            fontSize: 30
                        }

                    }],
                    yAxes: [{
                        ticks: {
                            fontSize: 25
                        }
                    }]
                }
            }
        });
    }
    isWriting = false;
});

// Load MNIST_Model...

let model = null;

async function loadNeuralNet() {
    // link for your model.json
    model = await tf.loadLayersModel('https://raw.githubusercontent.com/doctorget/deploy-model-web/master/model/model.json');
}

// Parses our grid into a matrix so we can then convert to a tensor.
let parsePanel = () => {
	matrix = [];
	for (let i = 0; i < panelHeight; i++) {
		matrix_col = [];
		for (let j = 0; j < panelWidth; j++) {
			if (pixels[j + (panelHeight * i)].isOn) {
				matrix_col.push(1.);
			} else {
				matrix_col.push(0);
			}
		}
		matrix.push(matrix_col);
	}
	// Transpose the matrix...
	return matrix[0].map((col, i) => matrix.map(row => row[i]));
}

let predict = (r) => {
	tensor = tf.tensor(r, [28, 28, 1], 'float32');
	tensor = tf.expandDims(tensor, 0);
	return model.predict(tensor);
};

createPanel();
loadNeuralNet();