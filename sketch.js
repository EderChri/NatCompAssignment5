let writer =  p5.prototype.createWriter('output.txt');
let stopExec = 0;
writer.write(["humans","neighhbours","array length","density", 
              "speed\n"])
// Change parameters here for initial setup.
// nr_humans defines number of humans initially spawned
// neighbour_distance defines initial euclidean distance in which to consider neighbours
// separation_mult defines the multiplication of the separation force
let Scene = {
  w: 500, h : 500, swarm : [], t : 0, racetrack : 0, nr_humans : 100, neighbour_distance : 20, separation_mult : 30,
  neighbours : function (x){
    let r = []
    for (let p of this.swarm){
      if(dist(p.pos.x,p.pos.y,x.x,x.y) <= this.neighbour_distance){
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
    // Defines the amplitude of the curves
    this.circleRadius = 58
    // Defines the length of the straight parts of the racetrack
    this.lineLength = 80
    // Defines the height of each of the straight parts of the racetrack
    this.racetrackHeight = 16
    // Defines the distance between the curves to the right and left, respectivly
    this.racetrackWidth = 24
    // Defines the width of the drawn racetrack lines
    this.width = 1
    let halfLineLength = this.lineLength/2
    
    // Outer Points
    // ===================
    // Left Outer Anchor and Control points
    this.leftUpperOuterAnchor = createVector(this.centerpos.x - halfLineLength, 
                                            this.centerpos.y - this.circleRadius - this.racetrackHeight)
    this.leftUpperOuterControl = createVector(this.centerpos.x - halfLineLength - this.circleRadius - this.racetrackWidth, 
                                              this.centerpos.y - this.circleRadius)
    this.leftLowerOuterControl = createVector(this.centerpos.x - halfLineLength - this.circleRadius - this.racetrackWidth, 
                                              this.centerpos.y + this.circleRadius)
    this.leftLowerOuterAnchor = createVector(this.centerpos.x - halfLineLength, 
                                            this.centerpos.y + this.circleRadius + this.racetrackHeight)
    
    // Right Outer Anchor and Control points
    this.rightUpperOuterAnchor = createVector(this.centerpos.x + halfLineLength, 
                                             this.centerpos.y - this.circleRadius - this.racetrackHeight)
    this.rightUpperOuterControl = createVector(this.centerpos.x + halfLineLength + this.circleRadius + this.racetrackWidth, 
                                               this.centerpos.y - this.circleRadius)
    this.rightLowerOuterControl = createVector(this.centerpos.x + halfLineLength + this.circleRadius + this.racetrackWidth, 
                                               this.centerpos.y + this.circleRadius)
    this.rightLowerOuterAnchor = createVector(this.centerpos.x + halfLineLength, 
                                             this.centerpos.y + this.circleRadius + this.racetrackHeight)
    
    // Inner Points
    // ===================
    // Left Inner Anchor and Control points
    this.leftUpperInnerAnchor = createVector(this.leftUpperOuterAnchor.x, this.leftUpperOuterAnchor.y + this.racetrackHeight)
    this.leftUpperInnerControl = createVector(this.leftUpperOuterControl.x + this.racetrackWidth, 
                                              this.leftUpperOuterControl.y)
    this.leftLowerInnerControl = createVector(this.leftLowerOuterControl.x + this.racetrackWidth, 
                                              this.leftLowerOuterControl.y)
    this.leftLowerInnerAnchor = createVector(this.leftLowerOuterAnchor.x, this.leftLowerOuterAnchor.y - this.racetrackHeight)
    
    // Right Inner Anchor and Control points
    this.rightUpperInnerAnchor = createVector(this.rightUpperOuterAnchor.x, this.rightUpperOuterAnchor.y + this.racetrackHeight)
    this.rightUpperInnerControl = createVector(this.rightUpperOuterControl.x - this.racetrackWidth, 
                                              this.rightUpperOuterControl.y)
    this.rightLowerInnerControl = createVector(this.rightLowerOuterControl.x - this.racetrackWidth, 
                                              this.rightLowerOuterControl.y)
    this.rightLowerInnerAnchor = createVector(this.rightLowerOuterAnchor.x, this.rightLowerOuterAnchor.y - this.racetrackHeight)
  }
  
  draw_track(leftUpperAnchor, leftUpperControl, leftLowerControl, leftLowerAnchor,
             rightUpperAnchor, rightUpperControl, rightLowerControl, rightLowerAnchor){
      // Draw the left half circle of the racetrack
    noFill();
    strokeWeight(this.width);
    bezier(leftUpperAnchor.x, leftUpperAnchor.y,
           leftUpperControl.x, leftUpperControl.y, 
           leftLowerControl.x, leftLowerControl.y,
           leftLowerAnchor.x, leftLowerAnchor.y);

    // Draw the right half circle of the racetrack
    noFill();
    bezier(rightUpperAnchor.x, rightUpperAnchor.y,
       rightUpperControl.x, rightUpperControl.y, 
       rightLowerControl.x, rightLowerControl.y,
       rightLowerAnchor.x, rightLowerAnchor.y);

    // Draw the straight line connecting the half circles
    line(leftUpperAnchor.x, leftUpperAnchor.y, rightUpperAnchor.x, rightUpperAnchor.y);
    line(leftLowerAnchor.x, leftLowerAnchor.y, rightLowerAnchor.x, rightLowerAnchor.y);
    strokeWeight(1);
  }
  
  draw(){
    // Draw inner track
    this.draw_track(this.leftUpperInnerAnchor, this.leftUpperInnerControl, this.leftLowerInnerControl, this.leftLowerInnerAnchor, this.rightUpperInnerAnchor, this.rightUpperInnerControl, this.rightLowerInnerControl, this.rightLowerInnerAnchor)
    // Draw outer track
    this.draw_track(this.leftUpperOuterAnchor, this.leftUpperOuterControl, this.leftLowerOuterControl, this.leftLowerOuterAnchor, this.rightUpperOuterAnchor, this.rightUpperOuterControl, this.rightLowerOuterControl, this.rightLowerOuterAnchor)
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
    this.length = 40

  }
  step(){
    let N=0, avg_sin = 0, avg_cos = 0, avg_p = createVector(0,0), avg_d = createVector(0,0)
    for (let n of Scene.neighbours(this.pos)){
      avg_p.add(n.pos)
      if(n != this){
        let away = p5.Vector.sub(this.pos,n.pos)
      away.div(away.magSq())
        avg_d.add(away)
        avg_sin += Math.sin(n.dir.heading())
        avg_cos += Math.cos(n.dir.heading())
      }
      N++
    }
    avg_sin /= N; avg_cos /=N; avg_p.div(N); avg_d.div(N); avg_d.mult(Scene.separation_mult)
    
    let own_angle = Math.atan2(Math.sin(this.dir.heading()),
                             Math.cos(this.dir.heading()))
    
    let avg_angle = Math.atan2(avg_sin, avg_cos)
    avg_angle += random(-0.25,0.25)
    this.dir = p5.Vector.fromAngle(own_angle)
    
    let cohesion = p5.Vector.sub(avg_p, this.pos)
    cohesion.div(10)
    
    let racetrack_force = p5.Vector.sub(this.racetrack_force_vec(Scene.racetrack), this.pos)
    racetrack_force.div(40)
    
    let clockwise_target = this.clockwise_force_vec(Scene.racetrack)
    let clockwise_distance = dist(this.pos.x, this.pos.y, clockwise_target.x, clockwise_target.y)
    let clockwise_force = p5.Vector.sub(clockwise_target, this.pos)
    clockwise_force.div(clockwise_distance)
    clockwise_force.div(10)
    
    this.dir.add(clockwise_force)
    this.dir.add(racetrack_force)
    //ablation study: comment lines below
    //this.dir.add(p5.Vector.fromAngle(avg_angle))
    this.dir.add(cohesion)
    this.dir.add(avg_d)
    
    let npos = createVector(0,0) //new position
    npos.add(this.pos)
    npos.add(this.dir)

    let vpos = this.pos //old position
    
    // Crosses starting line
    if (Scene.racetrack.rightLowerOuterAnchor.y + 10 > npos.y && npos.y> Scene.racetrack.rightLowerInnerAnchor.y - 10){
      
      if (vpos.x > Scene.racetrack.rightLowerOuterAnchor.x - Scene.racetrack.lineLength/4 && npos.x < Scene.racetrack.rightLowerOuterAnchor.x - Scene.racetrack.lineLength/4){
            this.tin = Scene.t
            Scene.metrics.nrhumans += 1
      }
    }
    
    // Keep track of density while being in measurement area
    if (Scene.racetrack.rightLowerOuterAnchor.y + 10 > npos.y && npos.y> Scene.racetrack.rightLowerInnerAnchor.y - 10){

      if (Scene.racetrack.rightLowerOuterAnchor.x - Scene.racetrack.lineLength/4 > npos.x && npos.x > Scene.racetrack.leftLowerOuterAnchor.x + Scene.racetrack.lineLength/4){

        this.density.push(Scene.metrics.nrhumans)

      }
    }
    // Checks if spawned within measurement area
    if(this.tin != 0){
      // Crosses ending line
      if (Scene.racetrack.rightLowerOuterAnchor.y + 10 > npos.y && npos.y> Scene.racetrack.rightLowerInnerAnchor.y - 10){
        if (vpos.x > Scene.racetrack.leftLowerOuterAnchor.x + Scene.racetrack.lineLength/4 && npos.x < Scene.racetrack.leftLowerOuterAnchor.x + Scene.racetrack.lineLength/4){

              this.tout = Scene.t
              Scene.metrics.nrhumans -= 1
              this.speed = this.length/(this.tout-this.tin)
              //generate output to plot
              Scene.metrics.speedarray.push(this.speed)
              const sum = this.density.reduce((a, b) => a + b, 0);
              const avg = (sum / this.density.length) || 0;
              let locdensity = avg / this.length
              Scene.metrics.densityarray.push(locdensity)

              //reset speed and density of this particle
              this.speed = 0
              this.density = []
            }
      }
    }
    this.pos.add(this.dir)
    Scene.wrap(this.pos)
  }
  
  draw(){
    fill(0)
    ellipse(this.pos.x, this.pos.y, 5, 5)
  }
  within_rectangle(leftUpper,rightLower){
    return (this.pos.x <= rightLower.x && 
       this.pos.x >= leftUpper.x && 
       this.pos.y <= rightLower.y &&
       this.pos.y >= leftUpper.y)
  }
  
  closest_point_on_curve(anchor1, control1, control2, anchor2){
    let t = 0.5
    let x = bezierPoint(anchor1.x, control1.x, control2.x, anchor2.x, t)
    let y = bezierPoint(anchor1.y, control1.y, control2.y, anchor2.y, t)
    let middlePoint = createVector(x,y)
    let consideredPoints = [createVector(anchor1.x, anchor1.y),
                            createVector(anchor2.x, anchor2.y), middlePoint]
    let distances = []
    for (let i = 0; i<10; i++){
      distances = []
      for (let p of consideredPoints){
        distances.push(dist(this.pos.x,this.pos.y,p.x,p.y))
      }
      if(distances[0] > distances[2]){
        consideredPoints[0] = consideredPoints[1]
        t += t/2
      } else {
        consideredPoints[2] = consideredPoints[1]
        t -= t/2
      }
      x = bezierPoint(anchor1.x, control1.x, control2.x, anchor2.x, t)
      y = bezierPoint(anchor1.y, control1.y, control2.y, anchor2.y, t)
      consideredPoints[1] = createVector(x,y)
    }
    let minDistIdx = distances.reduce((iMin, x, i, arr) => x < arr[iMin] ? i : iMin, 0)
    return [consideredPoints[minDistIdx], distances[minDistIdx]]
  }
  
  get_min_dist_to_curves(anchor1outer, control1outer, 
                         control2outer, anchor2outer,
                         anchor1inner, control1inner,
                         control2inner, anchor2inner){
    let [minDistPtOuter, minDistOuter] = this.closest_point_on_curve(anchor1outer, control1outer,
                            control2outer,anchor2outer)
    let [minDistPtInner, minDistInner] = this.closest_point_on_curve(anchor1inner, control1inner,
                                                                       control2inner, anchor2inner)
    return [minDistInner, minDistPtInner, minDistOuter, minDistPtOuter]
  }

  racetrack_force_vec(racetrack){
    
    // If within top or bottom rectangle, do not add directional force
        if(this.within_rectangle(racetrack.leftUpperOuterAnchor,racetrack.rightUpperInnerAnchor) ||
      this.within_rectangle(racetrack.leftLowerInnerAnchor,racetrack.rightLowerOuterAnchor)){
      return createVector(this.pos.x, this.pos.y)
    } 
    // If right of the rectangles
    if(this.pos.x >= racetrack.rightUpperOuterAnchor.x){
      let [minDistInner, minDistPtInner, minDistOuter, minDistPtOuter] = this.get_min_dist_to_curves(racetrack.rightUpperOuterAnchor,
                            racetrack.rightUpperOuterControl, 
                            racetrack.rightLowerOuterControl,
                            racetrack.rightLowerOuterAnchor,
                            racetrack.rightUpperInnerAnchor,
                            racetrack.rightUpperInnerControl,
                            racetrack.rightLowerInnerControl,
                            racetrack.rightLowerInnerAnchor)
      // If within curve, return current position
      if(minDistInner <= racetrack.racetrackWidth*1.5 &&
        minDistOuter <= racetrack.racetrackWidth*1.5){
        return createVector(this.pos.x, this.pos.y)
      } else {
        // Else return clostest point of closest curve 
        minDistPtOuter.x -= racetrack.racetrackWidth
        minDistPtInner.x += racetrack.racetrackWidth
        return ((minDistInner > minDistOuter) ? minDistPtOuter : minDistPtInner)
      }
    }
    // If left of the rectangles
    if(this.pos.x <= racetrack.leftUpperOuterAnchor.x){
      let [minDistInner, minDistPtInner, minDistOuter, minDistPtOuter] = this.get_min_dist_to_curves(racetrack.leftLowerOuterAnchor,
                            racetrack.leftLowerOuterControl, 
                            racetrack.leftUpperOuterControl,
                            racetrack.leftUpperOuterAnchor,
                            racetrack.leftLowerInnerAnchor,
                            racetrack.leftLowerInnerControl,
                            racetrack.leftUpperInnerControl,
                            racetrack.leftUpperInnerAnchor)
      // If within curve, return current position
      if(minDistInner <= racetrack.racetrackWidth*1.5 &&
        minDistOuter <= racetrack.racetrackWidth*1.5){
        return createVector(this.pos.x, this.pos.y)
      } else {
        // Else return clostest point of closest curve 
        minDistPtOuter.x += racetrack.racetrackWidth
        minDistPtInner.x -= racetrack.racetrackWidth
        return ((minDistInner > minDistOuter) ? minDistPtOuter : minDistPtInner)
      }
    }
    // Above top rectangle
    if(this.pos.y < racetrack.leftUpperOuterAnchor.y){
      return createVector(this.pos.x, racetrack.leftUpperOuterAnchor.y)
    }
    // Below bottom rectangle
    if(this.pos.y > racetrack.leftLowerOuterAnchor.y){
      return createVector(this.pos.x, racetrack.leftLowerOuterAnchor.y)
    }
    // Between rectangles
    if(this.pos.y > racetrack.leftUpperInnerAnchor.y && 
       this.pos.y < racetrack.leftLowerInnerAnchor.y){
      let upperDist = this.pos.y - racetrack.leftUpperInnerAnchor.y
      let lowerDist = racetrack.leftLowerInnerAnchor.y - this.pos.y
      return createVector(this.pos.x,
                         (upperDist > lowerDist) ?
                          racetrack.leftLowerInnerAnchor.y : 
                          racetrack.leftUpperInnerAnchor.y)
    }
  }
  
  clockwise_force_vec(racetrack){
    // Force to top if left of left-most anchor
    if(this.pos.x <= racetrack.leftUpperOuterAnchor.x) {
      // Force towards the control point
      if(this.pos.y >= racetrack.centerpos.y){
        return createVector(racetrack.leftUpperOuterControl.x+racetrack.racetrackWidth, 
                            racetrack.centerpos.y)
      } else // Force towards top from control point
      {
        return createVector(racetrack.leftUpperOuterAnchor.x, 
                              racetrack.leftUpperOuterAnchor.y+racetrack.racetrackHeight/2)
      }
    }
    // Force to bottom if right of right-most anchor
    if(this.pos.x >= racetrack.rightLowerOuterAnchor.x) {
      // Force towards the control point
      if(this.pos.y <= racetrack.centerpos.y){
        return createVector(racetrack.rightUpperOuterControl.x-racetrack.racetrackWidth, 
                            racetrack.centerpos.y)
      } else // Force towards bottom from control point
      {
        return createVector(racetrack.rightLowerOuterAnchor.x, 
                            racetrack.rightLowerOuterAnchor.y-racetrack.racetrackHeight/2)
      }
    }
      
    // Force to right, if above centerpos
    if(this.pos.y <= racetrack.centerpos.y){
      return createVector(racetrack.rightUpperOuterAnchor.x, this.pos.y)
    }
    // Force to left, if below centerpos
    if(this.pos.y >= racetrack.centerpos.y){
      return createVector(racetrack.leftUpperOuterAnchor.x, this.pos.y)
    }
  }
}


function setup() {
  createCanvas(Scene.w, Scene.h);
  Scene.racetrack = new RaceTrack();
  Scene.metrics = new Metrics();
  for (let i = 0; i<Scene.nr_humans; i++){
    Scene.swarm.push(new Human())
  }
}

function draw() {
  if(stopExec){
      throw new Error('End of observation')
  }
  background(220);
  clear()
  // Increase iteration counter for output
  Scene.t += 1
  
  for ( let p of Scene.swarm){
    p.step()
    p.draw()    
  }
  // Draw racetrack
  Scene.racetrack.draw()
}

function getStandardDeviation (array) {
  const n = array.length
  const mean = array.reduce((a, b) => a + b) / n
  return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n)
}

function getAvg(array){
  let sum = array.reduce((a, b) => a + b, 0)
  return (sum / array.length) || 0
}

// Defines the length of each experiment, currently 10s
const Interval = setInterval(restart, 10000);
// Defines the length of the whole simulation, currently 100s
setTimeout(write, 100000);

function restart() {
  writer.write([Scene.nr_humans, ""])
  writer.write([Scene.neighbour_distance, ""])
  writer.write([Scene.metrics.densityarray.length, ""])
  
  writer.write([Scene.metrics.densityarray, ""])

  writer.write([Scene.metrics.speedarray + "\n"])
  
  Scene.swarm = []
  // Change parameter to add/substract humans in each experiment 
  Scene.nr_humans += 0
  // Change parameter to add/substract to the distance in which to consider neighbours
  Scene.neighbour_distance +=0
  // Change parameter to add/substract to separation multiplication parameter
  Scene.separation_mult += 0
  setup(); // Call setup() function to restart the simulation
}

// Function to write out file at the end of the simulation
function write(){
  // close the PrintWriter and save the file
  writer.close();
  clearInterval(Interval);
  stopExec = 1;
}
