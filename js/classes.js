// CREATE BACKGOUND STUFF
class Sprite {
    constructor({
        position,
        imageSrc,
        scale = 1,
        framesMax = 1,
        offset = { x: 0, y: 10 },
    }) {
        this.position = position;

        this.width = 50;
        this.height = 150;
        this.image = new Image();
        this.image.src = imageSrc;
        this.scale = scale;
        this.framesMax = framesMax;
        this.framesCurrent = 0; // used to cycle through the shop sprites to make it "move"
        this.framesElapsed = 0; // how many frames that have elapsed during the animation
        this.framesHold = 5; //on every 10th frame, do the animation on the shop
        this.offset = offset;
    }

    draw() {
        // use a cavas runctino to draw the background image
        c.drawImage(
            this.image,

            // need to add 4 arguements for the croppping of hte shop sprite firstly
            this.framesCurrent * (this.image.width / this.framesMax), // x position for the shop sprites
            0,
            this.image.width / this.framesMax, /// number of frames
            this.image.height,
            // now for the actual image location
            this.position.x - this.offset.x,
            this.position.y - this.offset.y,
            (this.image.width / this.framesMax) * this.scale,
            this.image.height * this.scale
        );
    }

    // cycle through teh frames
    animateFrames() {
        // update the frames counter
        this.framesElapsed++;

        // for every 10th frame
        if (this.framesElapsed % this.framesHold === 0) {
            // increaste the current frames by 1. The minus 1 is to make sure we stop the flicking of hte background image
            if (this.framesCurrent < this.framesMax - 1) {
                this.framesCurrent++;
            } else {
                this.framesCurrent = 0;
            }
        }
    }

    // update to move things in a loop
    update() {
        this.draw();
        this.animateFrames();
    }
}

//CREATE PLAYERS
class Fighter extends Sprite {
    constructor({
        position,
        velocity,
        color = "red",

        imageSrc,
        scale = 1,
        framesMax = 1,
        offset = { x: 400, y: 0 },
        sprites,
        attackBox = {
            offset: {},
            width: undefined,
            height: undefined,
        },
    }) {
        // need to inherit and set these properties from the parent
        super({
            position,
            imageSrc,
            scale,
            framesMax,
            offset,
        });

        this.velocity = velocity;
        this.width = 50;
        this.height = 150;
        this.lastKey;
        // the attack box will always follow the player/enemy
        this.attackBox = {
            position: {
                x: this.position.x,
                y: this.position.y,
            },
            offset: attackBox.offset,
            width: attackBox.width,
            height: attackBox.height,
        };
        this.color = color;
        this.isAttacking;
        this.health = 100;

        this.framesCurrent = 0; // used to cycle through the shop sprites to make it "move"
        this.framesElapsed = 0; // how many frames that have elapsed during the animation
        this.framesHold = 5; //on every 5th frame, do the animation on the shop
        this.sprites = sprites;
        this.dead = false;

        // creaste the spritse ofject for all sprites and loop through and establish a new instance image for IDLE, RUN sprites etc
        for (const sprite in this.sprites) {
            // create a new image for each type of sprite
            // objject[key]
            sprites[sprite].image = new Image();
            sprites[sprite].image.src = sprites[sprite].imageSrc;
        }
        console.log("The sprites loaded are: ", this.sprites);
    }

    // update to move things in a loop
    update() {
        this.draw();

        if (!this.dead) {
            this.animateFrames(); //make the brwoser cycle throug the  idle frames
        }

        // udpat the the attack bar position so it will follow the player/enemy around
        this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
        this.attackBox.position.y = this.position.y + this.attackBox.offset.y;

        // this is where we draw the attack boxes to see where they are on the screen
        // c.fillRect(
        //     this.attackBox.position.x,
        //     this.attackBox.position.y,
        //     this.attackBox.width,
        //     this.attackBox.height
        // );

        // make it move on the x axis
        this.position.x += this.velocity.x;

        // make palyers fall
        this.position.y += this.velocity.y;

        // GRAVITY FUNCTION
        // get top postition of y + its height
        // prevents it falling off the canvas. Now make sure they stand on the ground by subtracting from the canvas height.
        if (
            this.position.y + this.height + this.velocity.y >=
            canvas.height - 86
        ) {
            this.velocity.y = 0;
            this.position.y = 340.6999999999999; // set the position of the player to always be exactly on the ground. Helps with minimsiing flashing frmes between idle and fall
        } else {
            this.velocity.y += gravity; // else...apply the gravity each time it moves
        }
    }

    attack() {
        // update the sprite to attacking
        this.switchSprite("attack1");
        this.isAttacking = true;
    }

    takeHit() {
        this.health -= 20;

        if (this.health <= 0) {
            this.switchSprite("death");
        } else {
            this.switchSprite("takeHit");
        }
    }

    switchSprite(sprite) {
        // if death animatino is running, nothing else should show
        if (this.image === this.sprites.death.image) {
            if (this.framesCurrent < this.sprites.death.framesMax - 1) {
                this.dead = true;
            }
            return;
        }

        // overriding all other animations with the attack anim
        // disable all other frames and return if we are attacking && only play the attack frames once.
        if (
            this.image === this.sprites.attack1.image &&
            this.framesCurrent < this.sprites.attack1.framesMax - 1
        ) {
            return;
        }

        // // override when fighter gets hit and simply return
        if (
            this.image === this.sprites.takeHit.image &&
            this.framesCurrent < this.sprites.takeHit.framesMax - 1
        )
            return;

        // if we are not attacking, proceed as normal

        switch (sprite) {
            case "idle":
                if (this.image !== this.sprites.idle.image) {
                    this.image = this.sprites.idle.image;
                    this.framesMax = this.sprites.idle.framesMax;
                    this.framesCurrent = 0;
                }
                break;
            case "run":
                if (this.image !== this.sprites.run.image) {
                    this.image = this.sprites.run.image;
                    this.framesMax = this.sprites.run.framesMax;
                    this.framesCurrent = 0;
                }
                break;
            case "jump":
                if (this.image !== this.sprites.jump.image) {
                    this.image = this.sprites.jump.image;
                    this.framesMax = this.sprites.jump.framesMax;
                    this.framesCurrent = 0;
                }
                break;

            case "fall":
                if (this.image !== this.sprites.fall.image) {
                    this.image = this.sprites.fall.image;
                    this.framesMax = this.sprites.fall.framesMax;
                    this.framesCurrent = 0;
                }
                break;
            case "attack1":
                if (this.image !== this.sprites.attack1.image) {
                    this.image = this.sprites.attack1.image;
                    this.framesMax = this.sprites.attack1.framesMax;
                    this.framesCurrent = 0;
                }
                break;
            case "takeHit":
                if (this.image !== this.sprites.takeHit.image) {
                    this.image = this.sprites.takeHit.image;
                    this.framesMax = this.sprites.takeHit.framesMax;
                    this.framesCurrent = 0;
                }
                break;
            case "death":
                if (this.image !== this.sprites.death.image) {
                    this.image = this.sprites.death.image;
                    this.framesMax = this.sprites.death.framesMax;
                    this.framesCurrent = 0;
                }
                break;
        }
    }
}
