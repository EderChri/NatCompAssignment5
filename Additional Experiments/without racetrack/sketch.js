let Scene = {
  w: 500, h : 500, swarm : [], t : 0,
  neighbours : function (x){
    let r = []
    for (let p of this.swarm){
      if(dist(p.pos.x,p.pos.y,x.x,x.y) <= 20){
        r.push(p)
      }
    }
    return r
  },
  wrap: function (x){
    if(x.x < 0) x.x += this.w
    if(x.y < 0) x.y += this.h
    if(x.x >= this.w) x.x -= this.w
    if(x.y >= this.h) x.y -= this.h
  }
  
}


class Human{
  constructor(){
    this.pos  = createVector (random(0,Scene.w),random(0,Scene.h))
    
    this.dir = p5.Vector.random2D()
    this.tin = 0
    this.tout = 0
    this.speed = 0
    this.density = []

  }
  step(){
    let N=0, avg_sin = 0, avg_cos = 0, avg_p = createVector(0,0), avg_d = createVector(0,0)
    for (let n of Scene.neighbours(this.pos)){
      avg_p.add(n.pos)
      if(n != this){
        let away = p5.Vector.sub(this.pos,n.pos)
      away.div(away.magSq())
        avg_d.add(away)
      }
      
      avg_sin += Math.sin(n.dir.heading())
      avg_cos += Math.cos(n.dir.heading())
      N++
    }
    avg_sin /= N; avg_cos /=N; avg_p.div(N); avg_d.div(N); avg_d.mult(30)
    
    let avg_angle = Math.atan2(avg_sin, avg_cos)
    avg_angle += random(-0.25,0.25)
    this.dir = p5.Vector.fromAngle(avg_angle)
    
    let cohesion = p5.Vector.sub(avg_p, this.pos)
    cohesion.div(10)
    
    
    this.dir.add(cohesion)
    this.dir.add(avg_d)
    
    this.pos.add(this.dir)
    Scene.wrap(this.pos)
  }
  
  draw(){
    fill(0)
    ellipse(this.pos.x, this.pos.y, 5, 5)
  }
}


function setup() {
  createCanvas(Scene.w, Scene.h);
  for (let i = 0; i<100; i++){
    Scene.swarm.push(new Human())
  }
}

function draw() {
  background(220);
  clear()
  // Create header for iteration output
  
  // Increase iteration counter for output
  Scene.t += 1
  
  for ( let p of Scene.swarm){
    p.step()
    p.draw()
    // Print position of iteration
    //document.getElementById('output').value += "pos: " + p.pos.x + "/" +p.pos.y + "\n" 
    
  }
  // Draw racetrack
}