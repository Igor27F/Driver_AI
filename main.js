const carCanvas = document.getElementById('carCanvas');
carCanvas.width = 200;
const networkCanvas = document.getElementById('networkCanvas');
networkCanvas.width = 300;

const carCtx = carCanvas.getContext('2d');
const networkCtx = networkCanvas.getContext('2d');

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);

let bestScore = 0;
let counter = 0;
const N = 500;
const cars = generateCars(N);
const traffic = [
];
for(let i=0; i<30; i++){
    traffic.push(new Car(road.getLaneCenter(parseInt(Math.random() * 1000 % 3)),
    - 250 - 150 * i + Math.random() * 100, 30, 50, 'OBSTACLE', 3,
    'rgb('+ parseInt(Math.random()*255)+','+parseInt(Math.random()*255)+','+parseInt(Math.random()*255)+')'
    ));
}
let bestCar = cars[0];
if(localStorage.getItem('bestBrain')){
    for(let i=0; i<cars.length; i++){
        if(i>cars.length*0.8){
            generateCars(1);
        }
        else{
            bestCar.brain = JSON.parse(localStorage.getItem('bestBrain'));
            if(i!=0){
                if(i<=cars.length*0.6){
                    NeuralNetwork.mutate(cars[i].brain,0.2);
                }else{
                    NeuralNetwork.mutate(cars[i].brain,0.1);
                }
            }            
        }
    }
}

animate();

function save(){
    localStorage.setItem('bestBrain', JSON.stringify(bestCar.brain))
}

function discard(){
    localStorage.removeItem('bestBrain');
}

function generateCars(N){
    const cars = [];
    for(let i=0; i<N; i++){
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, 'AI', 5));
    }
    return cars;
}

function animate(time){
    for(let i=0; i<traffic.length; i++){
        traffic[i].update([],[]);
    }
    
    for(let i=0; i<cars.length; i++){
        cars[i].update(road.borders, traffic);
        let score = 0;
        for(let j=0; j<traffic.length; j++){
            if(cars[i].y < traffic[j].y){
                score++;
            }
        }
        if(score > bestScore){
            bestCar = cars[i];
            bestScore = score;
            counter = 0;
        }
    }
    counter++;
    if(counter >= 300){
        if(bestScore >= 10){
            save();
        }
        window.location.reload();
    }

    //bestCar = cars.find(c=>c.y == Math.min(...cars.map(c=>c.y)));

    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    carCtx.save();
    carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);

    road.draw(carCtx);
    for(let i=0; i<traffic.length; i++){
        traffic[i].draw(carCtx);
    }

    carCtx.globalAlpha = 0.2;

    for(let i=0; i<cars.length; i++){
        cars[i].draw(carCtx);
    }

    carCtx.globalAlpha = 1;
    bestCar.draw(carCtx, true);

    carCtx.restore();

    networkCtx.lineDashOffset = time/50;
    Visualizer.drawNetwork(networkCtx, bestCar.brain);
    requestAnimationFrame(animate);
}
