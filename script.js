const requestAnimFrame =
  window.requestAnimationFrame ||
  window.requestAnimationFrame ||
  window.requestAnimationFrame ||
  function (callback) {
    window.setTimeout(callback, 1000 / 60);
  };
window.addEventListener('DOMContentLoaded', function() {
      var audio = document.getElementById('birthday-audio');
      audio.muted = false;
      audio.play();
    });

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const cw = window.innerWidth;
const ch = window.innerHeight;
canvas.width = cw;
canvas.height = ch;

let fireworks = [];
let particles = [];
let hue = 120;
const timerTotal = 80;
let timerTick = 0;

const random = (min, max) => Math.random() * (max - min) + min;

function calculateDistance(p1x, p1y, p2x, p2y) {
  const xDistance = p1x - p2x;
  const yDistance = p1y - p2y;
  return Math.sqrt(xDistance * xDistance + yDistance * yDistance);
}

function Firework(sx, sy, tx, ty) {
  this.x = sx;
  this.y = sy;
  this.sx = sx;
  this.sy = sy;
  this.tx = tx;
  this.ty = ty;
  this.distanceToTarget = calculateDistance(sx, sy, tx, ty);
  this.distanceTraveled = 0;
  this.coordinates = [];
  for (let i = 0; i < 3; i++) this.coordinates.push([this.x, this.y]);
  this.angle = Math.atan2(ty - sy, tx - sx);
  this.speed = 2;
  this.acceleration = 1.05;
  this.brightness = random(50, 70);
}

Firework.prototype.update = function (index) {
  this.coordinates.pop();
  this.coordinates.unshift([this.x, this.y]);
  this.speed *= this.acceleration;
  const vx = Math.cos(this.angle) * this.speed;
  const vy = Math.sin(this.angle) * this.speed;
  this.distanceTraveled = calculateDistance(this.sx, this.sy, this.x + vx, this.y + vy);
  if (this.distanceTraveled >= this.distanceToTarget) {
    createParticles(this.tx, this.ty);
    fireworks.splice(index, 1);
  } else {
    this.x += vx;
    this.y += vy;
  }
};

Firework.prototype.draw = function () {
  ctx.beginPath();
  ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
  ctx.lineTo(this.x, this.y);
  ctx.strokeStyle = `hsl(${hue},100%,${this.brightness}%)`;
  ctx.stroke();
};

function Particle(x, y) {
  this.x = x;
  this.y = y;
  this.coordinates = [];
  for (let i = 0; i < 5; i++) this.coordinates.push([this.x, this.y]);
  this.angle = random(0, Math.PI * 2);
  this.speed = random(1, 10);
  this.friction = 0.95;
  this.gravity = 1;
  this.hue = random(hue - 20, hue + 20);
  this.brightness = random(50, 80);
  this.alpha = 1;
  this.decay = random(0.015, 0.03);
}

Particle.prototype.update = function (index) {
  this.coordinates.pop();
  this.coordinates.unshift([this.x, this.y]);
  this.speed *= this.friction;
  this.x += Math.cos(this.angle) * this.speed;
  this.y += Math.sin(this.angle) * this.speed + this.gravity;
  this.alpha -= this.decay;
  if (this.alpha <= this.decay) particles.splice(index, 1);
};

Particle.prototype.draw = function () {
  ctx.beginPath();
  ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
  ctx.lineTo(this.x, this.y);
  ctx.strokeStyle = `hsla(${this.hue},100%,${this.brightness}%,${this.alpha})`;
  ctx.stroke();
};

const createParticles = (x, y) => {
  let particleCount = 30;
  while (particleCount--) particles.push(new Particle(x, y));
};

function loop() {
  requestAnimFrame(loop);
  hue += 0.5;
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(0, 0, cw, ch);
  ctx.globalCompositeOperation = "lighter";

  for (let i = fireworks.length; i--; ) {
    fireworks[i].draw();
    fireworks[i].update(i);
  }
  for (let i = particles.length; i--; ) {
    particles[i].draw();
    particles[i].update(i);
  }

  if (timerTick >= timerTotal) {
    fireworks.push(new Firework(cw / 2, ch, random(0, cw), random(0, ch / 2)));
    timerTick = 0;
  } else timerTick++;
}

// Start the animation loop
loop();
 