const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let window_height = window.innerHeight;
let window_width = window.innerWidth;

canvas.height = window_height;
canvas.width = window_width;

class Circle {
    constructor(x, y, radius, color, text, speed) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;
        this.color = color;
        this.text = text;
        this.speed = speed;

        // Dirección aleatoria inicial
        let angle = Math.random() * Math.PI * 2;
        this.dx = Math.cos(angle) * this.speed;
        this.dy = Math.sin(angle) * this.speed;
    }

    draw(context) {
        context.beginPath();
        context.strokeStyle = this.color;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "bold 18px Arial";
        context.fillText(this.text, this.posX, this.posY);

        context.lineWidth = 2;
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
        context.stroke();
        context.closePath();
    }

    update(context) {
        this.draw(context);

        // Rebote en bordes
        if ((this.posX + this.radius) > window_width || (this.posX - this.radius) < 0) {
            this.dx = -this.dx;
        }
        if ((this.posY + this.radius) > window_height || (this.posY - this.radius) < 0) {
            this.dy = -this.dy;
        }

        this.posX += this.dx;
        this.posY += this.dy;
    }
}

// --- Lógica para N círculos ---
const circles = [];
const n = 20; // Puedes cambiar el número de círculos aquí

for (let i = 0; i < n; i++) {
    let radius = Math.floor(Math.random() * 30 + 30);
    let x = Math.random() * (window_width - radius * 2) + radius;
    let y = Math.random() * (window_height - radius * 2) + radius;
    let color = i % 2 === 0 ? "blue" : "red";
    
    circles.push(new Circle(x, y, radius, color, (i + 1).toString(), 3));
}

// Función para detectar colisión entre dos círculos
function checkCollision(c1, c2) {
    let distance = Math.sqrt(Math.pow(c2.posX - c1.posX, 2) + Math.pow(c2.posY - c1.posY, 2));
    if (distance < c1.radius + c2.radius) {
        // Intercambio simple de direcciones (rebote básico)
        let tempDx = c1.dx;
        let tempDy = c1.dy;
        c1.dx = c2.dx;
        c1.dy = c2.dy;
        c2.dx = tempDx;
        c2.dy = tempDy;
        
        // Pequeña corrección para que no se queden pegados
        c1.posX += c1.dx;
        c1.posY += c1.dy;
    }
}

function animate() {
    ctx.clearRect(0, 0, window_width, window_height);
    
    // Comprobar colisiones entre todos los pares
    for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {
            checkCollision(circles[i], circles[j]);
        }
        circles[i].update(ctx);
    }
    
    requestAnimationFrame(animate);
}

animate();

// Ajustar canvas si se cambia el tamaño de ventana
window.addEventListener("resize", () => {
    window_width = window.innerWidth;
    window_height = window.innerHeight;
    canvas.width = window_width;
    canvas.height = window_height;
});