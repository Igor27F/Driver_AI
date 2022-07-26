class Car{
    constructor(x,y,width,height, type, maxspeed = 5, color = 'black'){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;

        this.speed = 0;
        this.acceleration = 0.2;
        this.maxspeed = maxspeed;
        this.friction = 0.05;
        this.angle = 0;
        this.damaged = false;
        this.notObstacle = type != 'OBSTACLE';

        this.useBrain = type == 'AI';

        if(this.notObstacle){
            this.sensor = new Sensor(this);
            this.brain = new NeuralNetwork([this.sensor.rayCount, 6, 4]);
        }
        this.controls = new Controls(type);
    }

    update(roadBorders, traffic){
        if(this.notObstacle){
            if(!this.damaged){
                this.#move();
                this.polygon = this.#createPolygon();
                this.damaged = this.#assessDamage(roadBorders, traffic);   
            }
            this.sensor.update(roadBorders, traffic);
            const offsets = this.sensor.readings.map(s=> s==null ? 0 : 1 - s.offset);
            const outputs = NeuralNetwork.feedForward(offsets, this.brain);
            //console.log(outputs);

            if(this.useBrain){
                this.controls.forward = outputs[0];
                this.controls.left = outputs[1];
                this.controls.right = outputs[2];
                this.controls.reverse = outputs[3];
            }
        }
        else{
            this.polygon = this.#createPolygon();
            this.#move();
        }
    }

    #assessDamage(roadBorders, traffic){
        for(let i=0; i<roadBorders.length; i++){
            if(polysIntersect(this.polygon, roadBorders[i])){
                return true;
            }
        }
        for(let i=0; i<traffic.length; i++){
            if(polysIntersect(this.polygon, traffic[i].polygon)){
                return true;
            }
        }
        return false;
    }

    #createPolygon(){
        const points = [];
        const rad = Math.hypot(this.width, this.height) / 2;
        const alpha = Math.atan2(this.width, this.height);
        points.push({
            x: this.x - Math.sin(this.angle - alpha) * rad,
            y: this.y - Math.cos(this.angle - alpha) * rad
        })
        points.push({
            x: this.x - Math.sin(this.angle + alpha) * rad,
            y: this.y - Math.cos(this.angle + alpha) * rad
        })
        /*points.push({
            x: this.x - Math.cos(this.angle + alpha) * rad,
            y: this.y - Math.sin(this.angle + alpha) * rad,
        })*/
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
            y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad
        })
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
            y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad
        })
        /*points.push({
            x: this.x - Math.cos(Math.PI + this.angle + alpha) * rad * 1.5,
            y: this.y - Math.sin(Math.PI + this.angle + alpha) * rad * 1.5,
        })*/
        return points;
    }

    #move(){
        if(this.controls.forward){
            this.speed += this.acceleration;
        }
        if(this.controls.reverse){
            this.speed -= this.acceleration;
        }

        if(this.speed > this.maxspeed){
            this.speed = this.maxspeed;
        }
        if(this.speed < -this.maxspeed / 2){
            this.speed = -this.maxspeed / 2;
        }

        if(this.speed > 0){
            this.speed -= this.friction;
        }
        if(this.speed < 0){
            this.speed += this.friction;
        }
        if(Math.abs(this.speed) < this.friction){
            this.speed = 0;
        }

        if(this.speed != 0){
            const flip = this.speed > 0 ? 1 : -1;
            if(this.controls.left){
                this.angle += (this.speed > 1 ? this. speed > 2 ? 0.01 : 0.005 : 0.001) * flip;
            }
            if(this.controls.right){
                this.angle -= (this.speed > 1 ? this. speed > 2 ? 0.01 : 0.005 : 0.001) * flip;
            }
        }

        this.x -= Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;
    }

    draw(ctx, drawSensor = false){
        if(this.notObstacle){
            ctx.fillStyle = this.damaged ? 'red' : this.color;
            if(drawSensor){
                this.sensor.draw(ctx);
            }
        }
        else{
            ctx.fillStyle = this.color;
        }
        ctx.beginPath();
        for(let i=0; i<this.polygon.length; i++){
            i == 0 ? ctx.moveTo(this.polygon[i].x, this.polygon[i].y) : 
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
        }
        ctx.fill();

    }
}
