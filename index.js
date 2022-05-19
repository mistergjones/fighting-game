const canvas = document.querySelector("canvas");

// establish the context for the canvas
const c = canvas.getContext("2d");
const gravity = 0.7;

// rezise screen.
canvas.width = 1024;
canvas.height = 576;

// default background for canvas
c.fillRect(0, 0, canvas.width, canvas.height);

const background = new Sprite({
    position: {
        x: 0,
        y: 0,
    },
    imageSrc: "./img/background.png",
});
const shop = new Sprite({
    position: {
        x: 600,
        y: 137,
    },
    imageSrc: "./img/shop.png",
    scale: 2.75,
    framesMax: 6,
});

// Instantiate the players
const player = new Fighter({
    position: {
        x: 200,
        y: 0,
    },
    velocity: {
        x: 0,
        y: 0,
    },
    offset: {
        x: 0,
        y: 0,
    },
    imageSrc: "./img/samuraiMack/Idle.png",
    framesMax: 8,
    scale: 2.5,
    offset: {
        x: 215,
        y: 167,
    },
    sprites: {
        idle: {
            imageSrc: "./img/samuraiMack/Idle.png",
            framesMax: 8,
        },
        run: {
            imageSrc: "./img/samuraiMack/Run.png",
            framesMax: 8,
        },
        jump: {
            imageSrc: "./img/samuraiMack/Jump.png",
            framesMax: 2,
        },
        fall: {
            imageSrc: "./img/samuraiMack/Fall.png",
            framesMax: 2,
        },
        attack1: {
            imageSrc: "./img/samuraiMack/Attack1.png",
            framesMax: 6,
        },
        takeHit: {
            imageSrc: "./img/samuraiMack/Take Hit - white silhouette.png",
            framesMax: 4,
        },
        death: {
            imageSrc: "./img/samuraiMack/Death.png",
            framesMax: 6,
        },
    },
    attackBox: {
        offset: {
            x: 100,
            y: 50,
        },
        width: 160,
        height: 50,
    },
});

// INSTANTIATE THE ENEMY
const enemy = new Fighter({
    position: {
        x: 800,
        y: 100,
    },
    velocity: {
        x: 0,
        y: 0,
    },
    offset: {
        x: -50,
        y: 0,
    },
    color: "blue",
    imageSrc: "./img/kenji/Idle.png",
    framesMax: 4,
    scale: 2.5,
    offset: {
        x: 215,
        y: 180,
    },
    sprites: {
        idle: {
            imageSrc: "./img/kenji/Idle.png",
            framesMax: 4,
        },
        run: {
            imageSrc: "./img/kenji/Run.png",
            framesMax: 8,
        },
        jump: {
            imageSrc: "./img/kenji/Jump.png",
            framesMax: 2,
        },
        fall: {
            imageSrc: "./img/kenji/Fall.png",
            framesMax: 2,
        },
        attack1: {
            imageSrc: "./img/kenji/Attack1.png",
            framesMax: 4,
        },
        takeHit: {
            imageSrc: "./img/kenji/TakeHit.png",
            framesMax: 3,
        },
        death: {
            imageSrc: "./img/kenji/Death.png",
            framesMax: 7,
        },
    },
    attackBox: {
        offset: {
            x: -200,
            y: 50,
        },
        width: 160,
        height: 50,
    },
});

const keys = {
    a: {
        pressed: false,
    },
    d: {
        pressed: false,
    },
    w: {
        pressed: false,
    },
    ArrowLeft: {
        pressed: false,
    },
    ArrowRight: {
        pressed: false,
    },
    ArrowUp: {
        pressed: false,
    },
};

decreaseTimer();

function animate() {
    // call which functino to loop over again to udpate he screen
    window.requestAnimationFrame(animate);
    c.fillStyle = "black"; // set canvas colour to black
    c.fillRect(0, 0, canvas.width, canvas.height);

    // load the background image
    background.update();
    shop.update();

    c.fillStyle = "rgba(255,255,255, 0.3";
    c.fillRect(0, 0, canvas.width, canvas.height);

    player.update();
    enemy.update();

    // make sure velocty is set at ZERO first and for when we are not pressing down a key
    player.velocity.x = 0;
    enemy.velocity.x = 0;

    //************************ */
    // PLAYER & ENEMY MOVEMENT
    //************************ */

    // 1a) PLAYER: make sure you capture the last key pressed
    if (keys.a.pressed && player.lastKey === "a") {
        player.velocity.x = -5;
        // call the function to show the run images
        player.switchSprite("run");
    } else if (keys.d.pressed && player.lastKey === "d") {
        player.velocity.x = 5;
        // call the function to show the run images
        player.switchSprite("run");
    } else {
        // default image for each frame when a key is not pressed
        player.switchSprite("idle");
    }

    // 1a) PLAYER JUMPING
    // set the jump image when our V position is < 0. i.e. we are in the air
    if (player.velocity.y < 0) {
        // call the function to show the run images
        player.switchSprite("jump");
    } else if (player.velocity.y > 0) {
        // when we are actually falling
        player.switchSprite("fall");
    }

    // 1a) PLAYER COLLISON and they hit the enemy
    if (
        rectangularCollision({ rectangle1: player, rectangle2: enemy }) &&
        player.isAttacking &&
        player.framesCurrent === 4
    ) {
        enemy.takeHit();
        player.isAttacking = false;
        // decrease health

        // document.querySelector("#enemyHealth").style.width = enemy.health + "%";
        gsap.to("#enemyHealth", {
            width: enemy.health + "%",
        });
    }

    // CATER FOR PLAYER MISSING - when it is in the middle of sword swing
    if (player.isAttacking && player.framesCurrent === 4) {
        player.isAttacking = false;
    }

    // 1b) ENEMY MOVEMENT
    if (keys.ArrowLeft.pressed && enemy.lastKey === "ArrowLeft") {
        enemy.velocity.x = -5;
        enemy.switchSprite("run");
    } else if (keys.ArrowRight.pressed && enemy.lastKey === "ArrowRight") {
        enemy.velocity.x = 5;
        enemy.switchSprite("run");
    } else {
        // default image for each frame when a key is not pressed
        enemy.switchSprite("idle");
    }

    // 1b) ENEMY JUMPING
    // set the jump image when our V position is < 0. i.e. we are in the air
    if (enemy.velocity.y < 0) {
        // moving upwards
        // call the function to show the run images
        enemy.switchSprite("jump");
    } else if (enemy.velocity.y > 0) {
        // moving downwards
        // when we are actually falling
        enemy.switchSprite("fall");
    }

    // 1b) ENEMY COLLISON  - where the player gets hit
    if (
        rectangularCollision({ rectangle1: enemy, rectangle2: player }) &&
        enemy.isAttacking
    ) {
        player.takeHit();
        enemy.isAttacking = false && enemy.framesCurrent === 2;

        // decrease health
        // document.querySelector("#playerHealth").style.width =
        //     player.health + "%";

        gsap.to("#playerHealth", {
            width: player.health + "%",
        });
    }
    // CATER FOR ENEMY MISSING - when it is in the middle of sword swing
    if (enemy.isAttacking && enemy.framesCurrent === 2) {
        enemy.isAttacking = false;
    }

    // end game based on health
    if (enemy.health <= 0 || player.health <= 0) {
        determineWinner({ player, enemy, timerId });
    }
}

animate();

// listen for any key press
window.addEventListener("keydown", (event) => {
    if (!player.dead) {
        switch (event.key) {
            case "d":
                keys.d.pressed = true;
                player.lastKey = "d";
                break;
            case "a":
                keys.a.pressed = true;
                player.lastKey = "a";
                break;
            case "w":
                player.velocity.y = -20;
                break;
            case " ":
                player.attack();
                break;

            default:
                break;
        }
    }

    if (!enemy.dead) {
        switch (event.key) {
            // cater for the enemy
            case "ArrowRight":
                keys.ArrowRight.pressed = true;
                enemy.lastKey = "ArrowRight";
                break;
            case "ArrowLeft":
                keys.ArrowLeft.pressed = true;
                enemy.lastKey = "ArrowLeft";
                break;
            case "ArrowUp":
                enemy.velocity.y = -20;
                break;
            case "ArrowDown":
                enemy.isAttacking = true;
                enemy.attack();
                break;
        }
    }
});

window.addEventListener("keyup", (event) => {
    switch (event.key) {
        case "d":
            keys.d.pressed = false;
            break;
        case "a":
            keys.a.pressed = false;
            break;
        case "w":
            keys.w.pressed = false;
            break;
        // cater for the enemy keys up
        case "ArrowRight":
            keys.ArrowRight.pressed = false;
            break;
        case "ArrowLeft":
            keys.ArrowLeft.pressed = false;
            break;
        case "ArrowUp":
            keys.ArrowUp.pressed = false;
            break;

        default:
            break;
    }
});
