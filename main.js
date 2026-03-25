const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// Parámetros de simulación
const N_CIRCLES = 12; // Número de círculos que quieres
const MASA_IGUAL = true; // Asumimos que todos los círculos tienen la misma masa para el intercambio de velocidad
const RESTITUCION = 1; // 1 = colisión elástica perfecta (sin pérdida de energía), 0 = inelástica (se pegan)

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

        // Dirección aleatoria inicial con la rapidez constante
        let angle = Math.random() * Math.PI * 2;
        this.dx = Math.cos(angle) * this.speed;
        this.dy = Math.sin(angle) * this.speed;
    }

    draw(context) {
        context.beginPath();
        context.strokeStyle = this.color;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "bold 20px Arial";
        context.fillStyle = "black"; // Color del texto

        // Dibujamos el texto
        context.fillText(this.text, this.posX, this.posY);

        // Dibujamos el contorno del círculo
        context.lineWidth = 2;
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
        context.stroke();
        context.closePath();
    }

    update(context) {
        this.draw(context);

        // Rebote en bordes del canvas
        if ((this.posX + this.radius) > window_width) {
            this.posX = window_width - this.radius; // Asegurar que no se 'atrape'
            this.dx = -this.dx;
        }

        if ((this.posX - this.radius) < 0) {
            this.posX = this.radius;
            this.dx = -this.dx;
        }

        if ((this.posY + this.radius) > window_height) {
            this.posY = window_height - this.radius;
            this.dy = -this.dy;
        }

        if ((this.posY - this.radius) < 0) {
            this.posY = this.radius;
            this.dy = -this.dy;
        }

        // Actualización de posición
        this.posX += this.dx;
        this.posY += this.dy;
    }
}

// --- Lógica para N círculos y colisiones ---
const circles = [];

// Función auxiliar para evitar la superposición al inicio
function isOverlapping(x, y, radius) {
    for (let circle of circles) {
        let distance = Math.sqrt(Math.pow(x - circle.posX, 2) + Math.pow(y - circle.posY, 2));
        if (distance < radius + circle.radius + 10) {
            return true;
        }
    }
    return false;
}

// Generar N círculos
for (let i = 0; i < N_CIRCLES; i++) {
    let radius = Math.floor(Math.random() * 50 + 30); // Radio aleatorio
    let x, y;
    
    // Buscar una posición inicial no superpuesta
    do {
        x = Math.random() * (window_width - radius * 2) + radius;
        y = Math.random() * (window_height - radius * 2) + radius;
    } while (isOverlapping(x, y, radius));

    let color = i % 2 === 0 ? "blue" : "red";
    
    // Rapidez inicial aleatoria
    let speed = Math.random() * 3 + 2;

    circles.push(new Circle(x, y, radius, color, (i + 1).toString(), speed));
}

// Función para manejar la respuesta física a la colisión
function resolveCollision(c1, c2) {
    // 1. Vector normal (del centro de c1 al centro de c2)
    const normalX = c2.posX - c1.posX;
    const normalY = c2.posY - c1.posY;
    
    // Distancia entre centros
    const distance = Math.sqrt(normalX * normalX + normalY * normalY);

    // 2. Normalizar el vector normal (obtener dirección unitaria)
    const unitNormalX = normalX / distance;
    const unitNormalY = normalY / distance;

    // 3. Vector tangencial unitario (90 grados de la normal)
    const unitTangentX = -unitNormalY;
    const unitTangentY = unitNormalX;

    // 4. Proyectar velocidades iniciales en los vectores unitarios (escalares)
    const v1Normal = unitNormalX * c1.dx + unitNormalY * c1.dy;
    const v1Tangent = unitTangentX * c1.dx + unitTangentY * c1.dy;
    const v2Normal = unitNormalX * c2.dx + unitNormalY * c2.dy;
    const v2Tangent = unitTangentX * c2.dx + unitTangentY * c2.dy;

    // 5. Verificar si los círculos se están acercando realmente.
    // Si la velocidad normal relativa es positiva, ya se están alejando.
    if (v1Normal - v2Normal <= 0) {
        return; // No hacer nada
    }

    // 6. Encontrar nuevas velocidades tangenciales (no cambian en una colisión elástica)
    const v1NormalFinal = v2Normal * RESTITUCION;
    const v2NormalFinal = v1Normal * RESTITUCION;

    // 7. Convertir las componentes escalares de vuelta a vectores
    const v1NormalFinalVecX = v1NormalFinal * unitNormalX;
    const v1NormalFinalVecY = v1NormalFinal * unitNormalY;
    const v1TangentFinalVecX = v1Tangent * unitTangentX;
    const v1TangentFinalVecY = v1Tangent * unitTangentY;

    const v2NormalFinalVecX = v2NormalFinal * unitNormalX;
    const v2NormalFinalVecY = v2NormalFinal * unitNormalY;
    const v2TangentFinalVecX = v2Tangent * unitTangentX;
    const v2TangentFinalVecY = v2Tangent * unitTangentY;

    // 8. Actualizar las velocidades finales de los círculos (suma de componentes)
    c1.dx = v1NormalFinalVecX + v1TangentFinalVecX;
    c1.dy = v1NormalFinalVecY + v1TangentFinalVecY;
    c2.dx = v2NormalFinalVecX + v2TangentFinalVecX;
    c2.dy = v2NormalFinalVecY + v2TangentFinalVecY;
}

function animate() {
    ctx.clearRect(0, 0, window_width, window_height);
    
    // Comprobar colisiones entre todos los pares de círculos
    for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {
            let c1 = circles[i];
            let c2 = circles[j];
            
            let distance = Math.sqrt(Math.pow(c2.posX - c1.posX, 2) + Math.pow(c2.posY - c1.posY, 2));

            // Si hay superposición, resolver la colisión
            if (distance < c1.radius + c2.radius) {
                resolveCollision(c1, c2);
            }
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