let Scene = {
  w: 500, h : 500, swarm : [], t : 0, racetrack : 0,
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

class Metrics{
  constructor(){
    this.speedarray = []
    this.densityarray = []
    this.nrhumans = 0
  }
}

class RaceTrack{
  constructor(){
    this.centerpos = createVector(Scene.w/2, Scene.h/2)
    this.lineLength = 320
    this.trackWidth = 16
  }
  
  draw(){
    line(this.centerpos.x-this.lineLength/2, this.centerpos.y+this.trackWidth/2, this.centerpos.x+this.lineLength/2, this.centerpos.y+this.trackWidth/2)
    line(this.centerpos.x-this.lineLength/2, this.centerpos.y-this.trackWidth/2, this.centerpos.x+this.lineLength/2, this.centerpos.y-this.trackWidth/2)
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
    avg_sin /= N; avg_cos /=N; avg_p.div(N); avg_d.div(N); avg_d.mult(20)
    
    let avg_angle = Math.atan2(avg_sin, avg_cos)
    avg_angle += random(-0.25,0.25)
    //this.dir = p5.Vector.fromAngle(avg_angle)
    
    
    let cohesion = p5.Vector.sub(avg_p, this.pos)
    cohesion.div(10)
    
    let racetrack_force = this.racetrack_force_vec(Scene.racetrack)
    racetrack_force.add(p5.Vector.random2D().mult(5))
    racetrack_force.div(10)
    
   
    
    
    let clockwise_force = this.clockwise_force_vec(Scene.racetrack)
    clockwise_force.add(p5.Vector.random2D().mult(5)) 
    clockwise_force.div(10)
     
   
   
    
    this.dir = clockwise_force
    this.dir.add(racetrack_force)
    //ablation study: comment lines below
    this.dir.add(p5.Vector.fromAngle(avg_angle))
    this.dir.add(cohesion)
    this.dir.add(avg_d)
    
    let npos = createVector(0,0) //new position
    npos.add(this.pos)
    npos.add(this.dir)

    let vpos = this.pos //old position
    
    // Crosses starting line
    if (Scene.racetrack.centerpos.y+Scene.racetrack.trackWidth/2 + 10 > npos.y && npos.y> Scene.racetrack.centerpos.y-Scene.racetrack.trackWidth/2 - 10){
      
      if (vpos.x > Scene.racetrack.centerpos.x + Scene.racetrack.lineLength/8 && npos.x < Scene.racetrack.centerpos.x + Scene.racetrack.lineLength/8){
            this.tin = Scene.t
            Scene.metrics.nrhumans += 1
      }
    }
    
    // Keep track of density while being in measurement area
    if (Scene.racetrack.centerpos.y+Scene.racetrack.trackWidth/2 + 10 > npos.y && npos.y> Scene.racetrack.centerpos.y-Scene.racetrack.trackWidth/2 - 10){

      if (npos.x < Scene.racetrack.centerpos.x + Scene.racetrack.lineLength/8 && npos.x > Scene.racetrack.centerpos.x - Scene.racetrack.lineLength/8){

        this.density.push(Scene.metrics.nrhumans)

      }
    }
    
        // Crosses ending line
    if (this.tin !=0){
      if (Scene.racetrack.centerpos.y+Scene.racetrack.trackWidth/2 + 10 > npos.y && npos.y> Scene.racetrack.centerpos.y-Scene.racetrack.trackWidth/2 - 10){
        if (vpos.x > Scene.racetrack.centerpos.x - Scene.racetrack.lineLength/8 && npos.x < Scene.racetrack.centerpos.x - Scene.racetrack.lineLength/8){

              this.tout = Scene.t
              Scene.metrics.nrhumans -= 1
              this.speed = (Scene.racetrack.lineLength/2) /(this.tout-this.tin)
              //generate output to plot
              Scene.metrics.speedarray.push(this.speed)
              const sum = this.density.reduce((a, b) => a + b, 0);
              const avg = (sum / this.density.length) || 0;
              let locdensity = avg / (Scene.racetrack.lineLength / 2)
              Scene.metrics.densityarray.push(locdensity)

              //reset speed and density of this particle
              this.speed = 0
              this.density = []
            }
      }
    }
    
    
    this.pos.add(this.dir)
    Scene.wrap(this.pos)
    this.wrap(Scene.racetrack,this.pos)
    
  }
  
  racetrack_force_vec(racetrack){
    if (this.pos.y > racetrack.centerpos.y+racetrack.trackWidth/2){
      return createVector(0,-5)
    }
    if (this.pos.y < racetrack.centerpos.y-racetrack.trackWidth/2){
      return createVector(0,5)
    }
    else{
      return createVector(0,0)
    }
  }
  
  clockwise_force_vec(racetrack){
    return createVector(-5,0)
  }
  
  wrap(racetrack,pos){
    if(pos.x < racetrack.centerpos.x-racetrack.lineLength/2) pos.x += racetrack.lineLength
  }
  
  draw(){
    fill(0)
    ellipse(this.pos.x, this.pos.y, 5, 5)
  }
 
}

function setup() {
  createCanvas(Scene.w, Scene.h);
  Scene.racetrack = new RaceTrack();
  Scene.metrics = new Metrics();
  for (let i = 0; i<100; i++){
    Scene.swarm.push(new Human())
  }
}

function draw() {
  if (Scene.t == 500){
    const sum_speed = Scene.metrics.speedarray.reduce((a, b) => a + b, 0);
    const avg_speed = (sum_speed / Scene.metrics.speedarray.length) || 0;
    const sum_density = Scene.metrics.densityarray.reduce((a, b) => a + b, 0);
    const avg_density = (sum_density / Scene.metrics.densityarray.length) || 0;
    document.getElementById('output').value += "speed: " + avg_speed + "\n"
  document.getElementById('output').value += "density: " + avg_density + "\n"
     // throw new Error('End of observation')//gives error making it possible to copy textarea
   }
  background(220);
  clear()
  // Create header for iteration output
 // document.getElementById('output').value += "====================\n" || ""
  //document.getElementById('output').value += "t: " + Scene.t + "\n"
  //document.getElementById('output').value += "speedarray: " + Scene.metrics.speedarray + "\n"
  //document.getElementById('output').value += "densityarray: " + Scene.metrics.densityarray + "\n"
  //document.getElementById('output').value += "humans: " + Scene.metrics.nrhumans + "\n"
  
  // Increase iteration counter for output
  Scene.t += 1
  
  for ( let p of Scene.swarm){
    p.step()
    p.draw()
    // Print position of iteration
    //document.getElementById('output').value += "pos: " + p.pos.x + "/" +p.pos.y + "\n" 
    
  }
  // Draw racetrack
  Scene.racetrack.draw()
}