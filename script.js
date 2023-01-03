// canvas2 для прорисовки проекций плоскостей (!!!)
const canvas2 = document.getElementById('canvas2');
const ctx2 = canvas2.getContext('2d');

canvas2.width = 360;
canvas2.height = 360;

// выбор параметра
const menu = document.getElementById('fixParameter');

// canvas - рабочая зона
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// системы координат - Based, Screen и Discret

canvas.width = 600;
canvas.height = 600;

// ширина линий
ctx.lineWidth = 1;

// препятствия
let obstacles = [];

// дискрет препятствия в рабочей зоне
let discret = 4;
// дискрет угла
let discretFi = 4;

let f1 = 0;
let f2 = 180;
let f3 = 180;

// пространство состояний
let PS = [];

let fazeSpace = [];

let startPosIsFixed = false;
let finPosIsFixed = false;

// длина звеньев
const l = 100;

// координаты начальной точки
const x0 = 300;
const y0 = 300;

// заполняем пространство состояний, учитывая пересечение первого и третьего звеньев
for (let i = 0; i < 360 / discretFi; i++) {
    PS.push([]);
    for (let j = 0; j < 360 / discretFi; j++) {
        PS[i].push([])
        for (let k = 0; k < 360 / discretFi; k++) {
            if ((j*discretFi > 270) && (k*discretFi > 900 - 2*j*discretFi)) {
                PS[i][j].push(1);
            } else {
                if ((j*discretFi < 90) && (k*discretFi <= 180 - 2*j*discretFi)) {
                    PS[i][j].push(1);
                } else {
                    PS[i][j].push(0);
                }
            }
        }
    }
}

make(f1, f2, f3);

function comparePairs(p1, p2) {
    return (p1[0] === p2[0]) && (p1[1] === p2[1]);
}

function discretCoords(x, y) {
    return [Math.trunc(x / discret), Math.trunc(y / discret)];
}

function contains(arr, el) {
    for (let i = 0; i < arr.length; i++) {
        if (comparePairs(arr[i], el)) {
            return true;
        }
    }
    return false;
}

function degToRads(angle) {
    return angle * Math.PI / 180;
}
function radToDegs(angle) {
    return angle * 180 / Math.PI;
}

function screenToBased(x, y) {
    return [x - x0, y0 - y];
}
function basedToScreen(x, y) {
    return [x + x0, y0 - y];
}

function dist(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
}

function getQuant(x, y) {
    if (x >= 0) {
        if (y >= 0) {
            return 1;
        }
        return 4;
    }
    if (y >= 0) {
        return 2;
    }
    return 3;
}

// x, y - координаты центра в Based.
function fiPrepInRads(x, y) {
    if (x === 0) {
        if (y === 0) {
            return 0;
        }
        if (y > 0) {
            return 0.5 * Math.PI;
        }
        return 1.5 * Math.PI;
    }
    if (y === 0) {
        if (x > 0) {
            return Math.PI;
        }
        return 0;
    }
    if (x > 0) {
        if (y > 0) {
            return Math.PI - Math.atan(y / x);
        } else {
            return 1.5 * Math.PI - Math.atan(x / (-1*y));
        }
    } else {
        if (y > 0) {
            return Math.atan(y / (-1*x));
        } else {
            return 1.5 * Math.PI + Math.atan(x / y);
        }
    }
}

function get_f1() {
    return Number(document.getElementById('f1').value);
}

function get_f2() {
    return Number(document.getElementById('f2').value);
}

function get_f3() {
    return Number(document.getElementById('f3').value);
}

function set_f1(val) {
    document.getElementById('f1').value = val;
    f1 = val;
    clear();
    make(val, get_f2(), get_f3());
}

function set_f2(val) {
    document.getElementById('f2').value = val;
    f2 = val;
    clear();
    make(get_f1(), val, get_f3());
}

function set_f3(val) {
    document.getElementById('f3').value = val;
    f3 = val;
    clear();
    make(get_f1(), get_f2(), val);
}

// fi в градусах
function fiToDiscret(fi) {
    fi = fi % 360;
    return Math.round(fi / discretFi);
}

function make(fi1Degs, fi2Degs, fi3Degs) {
    let fi1 = degToRads(fi1Degs);
    let fi2 = degToRads(fi2Degs);
    let fi3 = degToRads(fi3Degs);

    x1 = x0 - l*Math.cos(fi1);
    y1 = y0 - l*Math.sin(fi1);
    x2 = x0 - l*Math.cos(fi1) + l*Math.cos(fi1 + fi2);
    y2 = y0 - l*Math.sin(fi1) + l*Math.sin(fi1 + fi2);
    x3 = x0 - l*Math.cos(fi1) + l*Math.cos(fi1 + fi2) - l*Math.cos(fi1 + fi2 + fi3);
    y3 = y0 - l*Math.sin(fi1) + l*Math.sin(fi1 + fi2) - l*Math.sin(fi1 + fi2 + fi3);

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.moveTo(x2, y2);
    ctx.lineTo(x3, y3);

    ctx.stroke();
}

function clear() {
    ctx.clearRect(0, 0, 600, 600);
    
    if (startPosIsFixed === true) {
        ctx.beginPath();
        ctx.strokeStyle = "gray";
        ctx.lineWidth = 1;
        make(f1start, f2start, f2start);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "black";
    }
    
    if (finPosIsFixed === true) {
        ctx.beginPath();
        ctx.strokeStyle = "green";
        ctx.lineWidth = 1;
        make(f1fin, f2fin, f3fin);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "black";
    }
    if (obstacles.length > 0) {
        ctx.fillStyle = "red";
        for (let i = 0; i < obstacles.length; i++) {
            current = basedToScreen(obstacles[i][0], obstacles[i][1]);
            ctx.fillRect(current[0] - discret / 2, current[1] - discret / 2, discret, discret);
        }
        ctx.fillStyle = "black";
    }

}

canvas.onmousedown = function addObstacle(e) {
    d_coords = discretCoords(e.offsetX, e.offsetY);

    centerScreenCoords = [d_coords[0]*discret + (discret / 2), d_coords[1]*discret + (discret / 2)];

    ctx.fillStyle = "red";
    ctx.fillRect(d_coords[0]*discret, d_coords[1]*discret, discret, discret);
    ctx.fillStyle = "black";

    newCoords = screenToBased(centerScreenCoords[0], centerScreenCoords[1]);

    if (!(contains(obstacles, newCoords))) {
        obstacles.push(newCoords)
    }
}

canvas.onmousemove = function drawIfPressed (e) {
    if (e.buttons > 0) {
        d_coords = discretCoords(e.offsetX, e.offsetY);

        centerScreenCoords = [d_coords[0]*discret + (discret / 2), d_coords[1]*discret + (discret / 2)];

        ctx.fillStyle = "red";
        ctx.fillRect(d_coords[0]*discret, d_coords[1]*discret, discret, discret);
        ctx.fillStyle = "black";

        newCoords = screenToBased(centerScreenCoords[0], centerScreenCoords[1]);

        if (!(contains(obstacles, newCoords))) {
            obstacles.push(newCoords)
        }
    }
}

function fixStartPos() {
    f1start = get_f1();
    f2start = get_f2();
    f3start = get_f3();
    startPosIsFixed = true;
}

function fixFinPos() {
    f1fin = get_f1();
    f2fin = get_f2();
    f3fin = get_f3();
    finPosIsFixed = true;
}

function linkChange() {
    clear();
    f1 = get_f1();
    f2 = get_f2();
    f3 = get_f3();
    make(f1, f2, f3);
}

function handleObstacles() {
    already = [];
    for (let obstacleIndex = 0; obstacleIndex < obstacles.length; obstacleIndex++) {
        cur = obstacles[obstacleIndex];
        r = dist(0, 0, cur[0], cur[1]);
        fi = radToDegs(fiPrepInRads(cur[0], cur[1]));
        if (r <= l) {
            abandoned = fiToDiscret(fi);
            // первое звено
            for (let i = 0; i < 360 / discretFi; i++) {
                for (let j = 0; j < 360 / discretFi; j++) {
                    if (!(already.includes(abandoned))) {
                        console.log(abandoned);
                        already.push(abandoned);
                    }
                    if (abandoned === 360 / discretFi) {
                        abandoned = 0;
                    }
                    PS[abandoned][i][j] = 1;
                    // расширяем.
                    if (abandoned > 0 && abandoned < 360 / discretFi - 1) {
                        PS[abandoned + 1][i][j] = 1;
                        PS[abandoned - 1][i][j] = 1;
                    }
                }
            }
            // второе звено
            
        }
    }
    console.log('OK');
}

function makeProjection() {
    ctx2.clearRect(0, 0, 720, 720);
    let fixed = document.getElementById('fixParameter').value;
    if (fixed === 'fi1') {
        let value = document.getElementById('valueInput').value;
        for (let i = 0; i < 360 / discretFi; i++) {
            for (let j = 0; j < 360 / discretFi; j++) {
                current_discret = fiToDiscret(value);
                if ((PS[current_discret === 360 / discretFi ? 0 : current_discret][i][j]) === 1) {
                    ctx2.fillStyle = "black";
                    ctx2.fillRect(i*discretFi, 360 - j*discretFi, discretFi, discretFi);
                } else if ((PS[current_discret === 360 / discretFi ? 0 : current_discret][i][j]) === 0){
                    ctx2.fillStyle = "gray";
                    ctx2.fillRect(i*discretFi, 360 - j*discretFi, discretFi, discretFi);
                }
            }
        }
    } else if (fixed === 'fi2') {
        let value = document.getElementById('valueInput').value;
        for (let i = 0; i < 360 / discretFi; i++) {
            for (let j = 0; j < 360 / discretFi; j++) {
                if ((PS[i][fiToDiscret(value)][j]) === 1) {
                    ctx2.fillStyle = "black";
                    ctx2.fillRect(i*discretFi, 360 - j*discretFi, discretFi, discretFi);
                } else if ((PS[i][fiToDiscret(value)][j]) === 0){
                    ctx2.fillStyle = "gray";
                    ctx2.fillRect(i*discretFi, 360 - j*discretFi, discretFi, discretFi);
                }
            }
        }
    } else if (fixed === 'fi3') {
        let value = document.getElementById('valueInput').value;
        for (let i = 0; i < 360 / discretFi; i++) {
            for (let j = 0; j < 360 / discretFi; j++) {
                if ((PS[i][j][fiToDiscret(value)]) === 1) {
                    ctx2.fillStyle = "black";
                    ctx2.fillRect(i*discretFi, 360 - j*discretFi, discretFi, discretFi);
                } else if ((PS[i][j][fiToDiscret(value)]) === 0){
                    ctx2.fillStyle = "gray";
                    ctx2.fillRect(i*discretFi, 360 - j*discretFi, discretFi, discretFi);
                }
            }
        }
    }
}
