import { CanvasContext } from './components/canvasContext';
import { Player } from './components/player';
import { Projectile } from './components/projectile';
import { Enemy } from './components/enemy';
import gsap from 'gsap';

const canvasContext = CanvasContext.getInstance();

//player instance
const player = new Player(30, 'white')

player.spawn();

const projectiles: Projectile[] = [];
const enemies: Enemy[] = [];

// animate everything
let isAlive: number;

function animate(): void {
    isAlive = requestAnimationFrame(animate);
    canvasContext.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    canvasContext.ctx.fillRect(0, 0, canvasContext.canvas.width, canvasContext.canvas.height);
    player.spawn();

    projectiles.forEach((projectile, pid) => {
        projectile.update();

        if (projectile.x - projectile.radius < 0 ||
            projectile.x + projectile.radius > canvasContext.canvas.width ||
            projectile.y - projectile.radius < 0 ||
            projectile.y + projectile.radius > canvasContext.canvas.height
            ) {
            projectiles.splice(pid, 1);
            console.log("projectile removed")
        }
    });

    enemies.forEach((enemy, id) => {
        enemy.update();

        const playerDist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (playerDist - enemy.radius - player.radius < 1) {
            cancelAnimationFrame(isAlive);
        }

        projectiles.forEach((projectile, pid) => {
            const dist = Math.hypot(projectile.x - enemy.x,
                projectile.y - enemy.y
            );

            //projectile collider
            if (dist - enemy.radius - projectile.radius < 1) {

                //deal dmg
                if (enemy.radius - 7 > 7) {
                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    });

                    projectiles.splice(pid, 1);
                    enemy.radius -= 7
                    setTimeout(() => {
                        projectiles.splice(pid, 1);
                    }, 0);
                } else {
                    setTimeout(() => {
                        enemies.splice(id, 1)
                        projectiles.splice(pid, 1);
                    }, 0);
                }
            }
        });
    });
}

spawnEnemies();

function spawnEnemies() {
    setInterval(() => {
        //hp, min-hp
        const radius = Math.random() * (35 - 7) + 7;

        let x: number = 0;
        let y: number = 0;

        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvasContext.canvas.width + radius;
            y = Math.random() * canvasContext.canvas.height;
        } else {
            x = Math.random() * canvasContext.canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvasContext.canvas.height + radius;
        }


        const color = `hsl(${Math.random() * 360}, 50%, 50%)`

        const angle = Math.atan2(
            canvasContext.canvas.height / 2 - y,
            canvasContext.canvas.width / 2 - x
        )

        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        enemies.push(new Enemy(x, y, radius, color, velocity));
    }, 1000);
}

//mouse click event
window.addEventListener('click', (event) => {

    const angle = Math.atan2(
        event.clientY - canvasContext.canvas.height / 2,
        event.clientX - canvasContext.canvas.width / 2
    )

    //player fire rate
    const velocity = {
        x: Math.cos(angle) * 1.5,
        y: Math.sin(angle) * 1.5
    }

    //move projectile per frame
    projectiles.push(new Projectile(
        canvasContext.canvas.width / 2, canvasContext.canvas.height / 2,
        7,
        'white', velocity
    ));

});

//start
animate();
