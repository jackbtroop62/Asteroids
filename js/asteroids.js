/* This portion of code was created by Ryan Solorzano
 * Asteroid object code
 * CPE 123- Computational art
 * Final Project
 */


var asteroids = [];

// Methods: this.spark(sparkX, sparkY, direction): creates a spark particle system at given point in direction of vector given (magnitude changes max speed)
//            this.explode(): creates little rocks (should be used after destruction of asteroid)
//            this.destroy(): removes all instances of this from asteroids
//            this.draw(): draws the asteroid (and the spark and/or small pieces particle system if there is any)
//            this.updatePosition(): changes the postion and of the asteroid and particles based on the velocity, spinSpeed, 
//            rgb HAS TO BE AN ARRAY sorry :(
//            this.isInside(x, y): returns true or false for if the given point is inside the asteroid (only if the main asteroid is being drawn, otherwise returns false)

function asteroid(x, y, size, lives, spinSpeed, velocity, rgb) {
    this.mainAsteroid = new asteroid2(x, y, size, spinSpeed, velocity, 255, rgb);
    this.hits = lives;

    this.rgb = rgb;
    this.particles = [];
    this.numParticles = random(30, 50);

    this.pieces = [];
    this.piecesLifeRatios = [];
    this.piecesLife = [];
    this.numPieces = random(3, 6);

    this.drawAsteroid = true;
    this.explosionSound = new Audio('Sound Assets/explosion4.wav');

    this.spark = function (sparkX, sparkY, direction) {
        var tempVector;
        for (var i = 0; i < this.numParticles; i++) {
            tempVector = p5.Vector.fromAngle(direction.heading() + random(-1, 1));
            tempVector.setMag(random(1, direction.mag()));
            var tempPart = new particle(sparkX, sparkY, tempVector, random(10, 20));
            this.particles.push(tempPart);
        }
        this.hits--;
		if(customizations[1].bought)
			this.hits-=4;
		
        if (this.hits <= 0) {
            this.drawAsteroid = false;
            this.explode();
        }
    }

    this.explode = function () {
        for (var i = 0; i < this.numPieces; i++) {
            var tempAsteroid = new asteroid2(this.mainAsteroid.xPos, this.mainAsteroid.yPos, this.mainAsteroid.scale / 5, random(-.1, .1), createVector(random(-3, 3), random(-3, 3)), 255, rgb);
            var tempLifeTime = Math.ceil(random(10, 50));
            this.pieces.push(tempAsteroid);
            this.piecesLife.push(tempLifeTime);
            this.piecesLifeRatios.push(255 / tempLifeTime);
        }
        this.explosionSound.play(); 
    }

    this.destroy = function () {
        delete this.mainAsteroid;
        delete asteroids.splice(asteroids.indexOf(this), 1);
    }

    this.draw = function () {
        if (this.drawAsteroid)
            this.mainAsteroid.draw();
        else {
            for (var i = 0; i < this.pieces.length; i++) {
                this.pieces[i].draw();
            }
        }

        for (var i = 0; i < this.particles.length; i++) {
            this.particles[i].draw();
            if (this.particles[i].lifeSpan <= 0)
                delete this.particles.splice(this.particles.indexOf(this.particles[i]), 1);
        }
    }

    this.updatePosition = function () {
        if (this.drawAsteroid)
            this.mainAsteroid.updatePosition();
        else {
            for (var i = 0; i < this.pieces.length; i++) {
                this.pieces[i].updatePosition();
                this.piecesLife[i]--;
                this.pieces[i].clarity -= this.piecesLifeRatios[i];
                if (this.piecesLife[i] <= 0) {
                    delete this.pieces.splice(i, 1);
                    this.piecesLife.splice(i, 1);
                }
            }
        }

        if (this.hits <= 0 && this.particles.length === 0 && this.pieces.length === 0)
            this.destroy();

        for (var i = 0; i < this.particles.length; i++)
            this.particles[i].updatePosition();
    }

    this.isInside = function (x, y) {
        if (this.drawAsteroid)
            return this.mainAsteroid.isInside(x, y);
        else
            return false;
    }
}
// Methods: this.draw() draws the asteroid
//          this.updatePosition() updates the asteroid's position
//          this.setup() sets up the points to draw the asteroid 
//            this.isInside(x, y): returns true or false for if the given point is inside the asteroid 
//          rgb HAS TO BE AN ARRAY sorry :(        

function asteroid2(x, y, size, spinSpeed, velocity, alpha, rgb) {
    this.xPos = x;
    this.yPos = y;
    this.scale = size;
    this.spin = spinSpeed;
    this.vel = velocity;
    this.clarity = alpha;
    this.shade = rgb;

    this.points = [];
    this.numPoints = Math.ceil(random(2, 5)) * 2;
    this.rot = 0;

    this.draw = function () {
        if (this.points.length === 0)
            this.setup();
        push();
        translate(this.xPos, this.yPos);
        rotate(this.rot);
        scale(this.scale);
        fill(this.shade[0], this.shade[1], this.shade[2], this.clarity);
        stroke(0);
        beginShape();
        curveVertex(this.points[0][0] - this.xPos, this.points[0][1] - this.yPos);
        for (var i = 0; i < this.numPoints; i++)
            curveVertex(this.points[i][0] - this.xPos, this.points[i][1] - this.yPos);
        endShape(CLOSE);
        pop();
    }

    this.updatePosition = function () {
        for (var i = 0; i < this.points.length; i++) {
            this.points[i][0] += this.vel.x;
            this.points[i][1] += this.vel.y;
        }
        this.xPos += this.vel.x;
        this.yPos += this.vel.y;
        this.rot += this.spin;
        //this.setup(); <------ why did I have this here.... maybe I should stop coding at 2 am
    }

    this.setup = function () {
        var theta = 0;
        for (var i = 0; i < this.numPoints; i++) {
            if (i % 2 === 0)
                this.points.push(parametricCircle(this.xPos, this.yPos, theta, 20));
            else
                this.points.push(parametricCircle(this.xPos, this.yPos, theta, 20 + random(-10, 10)));
            theta += (1 / this.numPoints) * 2 * Math.PI;
        }
    }

    this.isInside = function (x, y) {
        var returnValue = true;
        if (this.points.length === 0)
            return;
        for (var i = 0; i < this.points.length - 1; i++) {
            if (implicitLine(this.points[i], this.points[i + 1], x, y) < 0)
                return false;
        }
        return true;
    }
}

// Methods: this.draw(): draws the particle 
//          this.updatePosition(): updates position and colors of particle based off of velocity and lifetime
function particle(x, y, velocity, lifetime) {
    this.xPos = x;
    this.yPos = y;
    this.vel = velocity;
    this.red = 255;
    this.green = 255;
    this.blue = 255;
    this.alpha = 255;

    this.totalLifeSpan = lifetime;
    this.lifeSpan = lifetime;

    var ratio = 255 / this.totalLifeSpan;


    this.draw = function () {
        noStroke();
        fill(this.red, this.green, this.blue, this.alpha);
        ellipse(this.xPos, this.yPos, 1);
    }

    this.updatePosition = function () {
        this.xPos += this.vel.x;
        this.yPos += this.vel.y;
        this.lifeSpan--;
        this.green -= 1.5 * ratio;
        this.blue -= 3 * ratio;
        this.alpha -= ratio;

        if (this.lifeSpan <= 0)
            delete this;
    }
}

function explosion(x, y, duration, numParticles) {
    var tempVector;
    this.particles = [];
    for (var i = 0; i < numParticles; i++) {
        tempVector = p5.Vector.fromAngle(random(2 * Math.PI));
        tempVector.setMag(random(1, 3));
        var tempPart = new particle(x, y, tempVector, random(10, duration));
        this.particles.push(tempPart);
    }

    this.draw = function () {
        for(var i = 0; i< this.particles.length; i++) 
            this.particles[i].draw();
    }

    this.updatePosition = function() {
        var temp = [];
        for(var i = 0; i < this.particles.length; i++){
            this.particles[i].updatePosition();
            if(this.particles[i].lifeSpan <= 0){
                delete this.particles.splice(i, 1);
                i--;
            }
        }
    }
    this.run = function () {
        this.draw();
        this.updatePosition();
    }
}

function parametricCircle(cx, cy, theta, r) {
    return [cx + r * Math.cos(theta), cy + r * Math.sin(theta)];
}

function implicitLine(point0, point1, x, y) {
    return (point0[1] - point1[1]) * x + (point1[0] - point0[0]) * y + point0[0] * point1[1] - point1[0] * point0[1];
}
