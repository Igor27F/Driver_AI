const carCanvas = document.getElementById('carCanvas');
carCanvas.width = 200;
const networkCanvas = document.getElementById('networkCanvas');
networkCanvas.width = 300;

const carCtx = carCanvas.getContext('2d');
const networkCtx = networkCanvas.getContext('2d');

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);

let bestScore = 0;
let counter = 0;
const species = 3;
const N = 500;
const cars = generateCars(N);
const traffic = [
];
for(let i=0; i<50; i++){
    traffic.push(new Car(road.getLaneCenter(parseInt(Math.random() * 1000 % 3)),
    - 250 - 150 * i + Math.random() * 100, 30, 50, 'OBSTACLE', 3,
    'rgb('+ parseInt(Math.random()*255)+','+parseInt(Math.random()*255)+','+parseInt(Math.random()*255)+')'
    ));
}
let bestCars = [cars[0],cars[1],cars[2]];
// let bestCar = cars[0];
// if(localStorage.getItem('bestBrain')){
//     for(let i=0; i<cars.length; i++){
//         if(i<=cars.length*0.9){
//             cars[i].brain = JSON.parse(localStorage.getItem('bestBrain'));
//             if(i!=0){
//                 if(i<=cars.length*0.6){
//                     NeuralNetwork.mutate(cars[i].brain,0.1);
//                 }else{
//                     NeuralNetwork.mutate(cars[i].brain,0.2);
//                 }
//             }
//         }
//     }
// }
if(localStorage.getItem('bestBrain'+0)){
    for(let i=0; i<cars.length; i++){
        if(i<=cars.length*0.9){
                cars[i].brain = JSON.parse(localStorage.getItem('bestBrain'+0));
                if(i!=0){
                        if(i>cars.length*0.3){
                            if(i>cars.length*0.5){
                                if(i>cars.length*0.7){
                                    if(i>cars.length*0.8){
                                        NeuralNetwork.mutate(cars[i].brain,1,JSON.parse(localStorage.getItem('bestBrain'+2)));
                                    }
                                    else{
                                        NeuralNetwork.mutate(cars[i].brain,Math.random(),JSON.parse(localStorage.getItem('bestBrain'+2)));
                                    }
                                }
                                else{
                                    NeuralNetwork.mutate(cars[i].brain,1,JSON.parse(localStorage.getItem('bestBrain'+1)));
                                }
                            }
                            else{
                                NeuralNetwork.mutate(cars[i].brain,Math.random(),JSON.parse(localStorage.getItem('bestBrain'+1)));
                            }
                        }
                        else{
                            NeuralNetwork.mutate(cars[i].brain,0.2);
                        }
                }
        }
    }
}


animate();

function save(){
    //localStorage.setItem('bestBrain', JSON.stringify(bestCar.brain))
    for(let i=0; i<species; i++){
        localStorage.setItem('bestBrain'+i, JSON.stringify(bestCars[i].brain))
    }
}

function discard(){
    for(let i=0; i<species; i++){
        localStorage.removeItem('bestBrain'+i);
    }
}

function generateCars(N){
    const cars = [];
    for(let i=0; i<N; i++){
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, 'AI', 7));
    }
    return cars;
}

function animate(time){
    for(let i=0; i<traffic.length; i++){
        traffic[i].update([],[]);
    }
    const scores = [];
    for(let i=0; i<cars.length; i++){
        scores.push(0);
    }
    
    for(let i=0; i<cars.length; i++){
        let score = 0;
        cars[i].update(road.borders, traffic);
        for(let j=0; j<traffic.length; j++){
            if(cars[i].y < traffic[j].y){
                scores[i]++;
                score++;
            }
        }
        if(score > bestScore){
            counter = 0;
            bestScore = score;
        }
    }

    aux = [...scores]
    for(let i=0; i<species; i++){
        maxScore = aux.indexOf(Math.max(...aux));
        bestCars[i] = cars[maxScore];
        aux[maxScore] = 0; 
    }   

    counter++;
    if(counter >= 300){
        if(bestScore > 10){
            save();
        }
        window.location.reload();
    }

    //bestCar = cars.find(c=>c.y == Math.min(...cars.map(c=>c.y)));

    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    carCtx.save();
    carCtx.translate(0, -bestCars[0].y + carCanvas.height * 0.7);

    road.draw(carCtx);
    for(let i=0; i<traffic.length; i++){
        traffic[i].draw(carCtx);
    }

    carCtx.globalAlpha = 0.2;

    for(let i=0; i<cars.length; i++){
        cars[i].draw(carCtx);
    }

    carCtx.globalAlpha = 1;
    bestCars[0].draw(carCtx, true);

    carCtx.restore();

    networkCtx.lineDashOffset = time/50;
    Visualizer.drawNetwork(networkCtx, bestCars[0].brain);
    requestAnimationFrame(animate);
}
