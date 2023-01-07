// canvas2 для прорисовки проекций плоскостей (!!!) и графика.
const canvas2 = document.getElementById('canvas2');
const ctx2 = canvas2.getContext('2d');

canvas2.width = 600;
canvas2.height = 600;

// выбор параметра
const menu = document.getElementById('fixParameter');

// canvas - рабочая зона
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// системы координат - Based, Screen и Discret

canvas.width = 600;
canvas.height = 600;

// ширина линий
ctx.lineWidth = 2;

// препятствия
let obstacles = [];

// дискрет препятствия в рабочей зоне
let discret = 4;
// дискрет угла
let discretFi = 2;

document.getElementById('f1').step = discretFi;
document.getElementById('f1').max = 360 - discretFi;

document.getElementById('f2').step = discretFi;
document.getElementById('f1').max = 360 - discretFi;

document.getElementById('f3').step = discretFi;
document.getElementById('f1').max = 360 - discretFi;

let f1 = 0;
let f2 = 180;
let f3 = 180;

// пространство состояний
let PS = [];

// фронты
let FRONTS = [];

// do you know it?
let way = [];

let startPosIsFixed = false;
let finPosIsFixed = false;

// длина звеньев
const l = 100;

// координаты начальной точки
const x0 = 300;
const y0 = 300;

// заполняем пространство состояний
for (let i = 0; i < 360 / discretFi; i++) {
    PS.push([]);
    FRONTS.push([]);
    for (let j = 0; j < 360 / discretFi; j++) {
        PS[i].push([]);
        FRONTS[i].push([]);
        for (let k = 0; k < 360 / discretFi; k++) {
            PS[i][j].push(0);
            FRONTS[i][j].push(0);
            // с запретом пересечения 1 и 3 звеньев
            // if ((j*discretFi > 270) && (k*discretFi > 900 - 2*j*discretFi)) {
            //     PS[i][j].push(1);
            // } else {
            //     if ((j*discretFi < 90) && (k*discretFi <= 180 - 2*j*discretFi)) {
            //         PS[i][j].push(1);
            //     } else {
            //         PS[i][j].push(0);
            //     }
            // }
        }
    }
}

make(f1, f2, f3);

ctx2.strokeStyle = "black";
ctx2.lineWidth = 5;
ctx2.moveTo(0, 200);
ctx2.lineTo(600, 200);
ctx2.moveTo(0, 400);
ctx2.lineTo(600, 400);
ctx2.stroke();

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

function compareTriples(t1, t2) {
    return (t1[0] === t2[0]) && (t1[1] === t2[1]) && (t1[2] === t2[2]);
}

function contains3(arr, triple) {
    for (let i = 0; i < arr.length; i++) {
        if (compareTriples(arr[i], triple)) {
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

    ctx.strokeStyle = "black";
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.closePath();
    ctx.stroke();
    ctx.arc(x0, y0, 5, 0, Math.PI*2, false);
    ctx.fill();

    ctx.strokeStyle = "green";
    ctx.fillStyle = "green";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.stroke();
    ctx.arc(x1, y1, 5, 0, Math.PI*2, false);
    ctx.fill();

    ctx.strokeStyle = "purple";
    ctx.fillStyle = "purple";
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
    ctx.stroke();
    ctx.arc(x2, y2, 5, 0, Math.PI*2, false);
    ctx.fill();
}

function makeGray(fi1Degs, fi2Degs, fi3Degs) {
    let fi1 = degToRads(fi1Degs);
    let fi2 = degToRads(fi2Degs);
    let fi3 = degToRads(fi3Degs);

    x1 = x0 - l*Math.cos(fi1);
    y1 = y0 - l*Math.sin(fi1);
    x2 = x0 - l*Math.cos(fi1) + l*Math.cos(fi1 + fi2);
    y2 = y0 - l*Math.sin(fi1) + l*Math.sin(fi1 + fi2);
    x3 = x0 - l*Math.cos(fi1) + l*Math.cos(fi1 + fi2) - l*Math.cos(fi1 + fi2 + fi3);
    y3 = y0 - l*Math.sin(fi1) + l*Math.sin(fi1 + fi2) - l*Math.sin(fi1 + fi2 + fi3);

    ctx.strokeStyle = "gray";
    ctx.fillStyle = "gray";
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.closePath();
    ctx.stroke();
    ctx.arc(x0, y0, 3, 0, Math.PI*2, false);
    ctx.fill();

    ctx.strokeStyle = "gray";
    ctx.fillStyle = "gray";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.stroke();
    ctx.arc(x1, y1, 3, 0, Math.PI*2, false);
    ctx.fill();

    ctx.strokeStyle = "gray";
    ctx.fillStyle = "gray";
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
    ctx.stroke();
    ctx.arc(x2, y2, 3, 0, Math.PI*2, false);
    ctx.fill();
}

function makeGreen(fi1Degs, fi2Degs, fi3Degs) {
    let fi1 = degToRads(fi1Degs);
    let fi2 = degToRads(fi2Degs);
    let fi3 = degToRads(fi3Degs);

    x1 = x0 - l*Math.cos(fi1);
    y1 = y0 - l*Math.sin(fi1);
    x2 = x0 - l*Math.cos(fi1) + l*Math.cos(fi1 + fi2);
    y2 = y0 - l*Math.sin(fi1) + l*Math.sin(fi1 + fi2);
    x3 = x0 - l*Math.cos(fi1) + l*Math.cos(fi1 + fi2) - l*Math.cos(fi1 + fi2 + fi3);
    y3 = y0 - l*Math.sin(fi1) + l*Math.sin(fi1 + fi2) - l*Math.sin(fi1 + fi2 + fi3);

    ctx.strokeStyle = "green";
    ctx.fillStyle = "green";
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.closePath();
    ctx.stroke();
    ctx.arc(x0, y0, 3, 0, Math.PI*2, false);
    ctx.fill();

    ctx.strokeStyle = "green";
    ctx.fillStyle = "green";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.stroke();
    ctx.arc(x1, y1, 3, 0, Math.PI*2, false);
    ctx.fill();

    ctx.strokeStyle = "green";
    ctx.fillStyle = "green";
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
    ctx.stroke();
    ctx.arc(x2, y2, 3, 0, Math.PI*2, false);
    ctx.fill();
}

function clear() {
    ctx.clearRect(0, 0, 600, 600);
    
    if (startPosIsFixed === true) {
        ctx.lineWidth = 1;
        makeGray(f1start, f2start, f3start);
        ctx.lineWidth = 2;
    }
    
    if (finPosIsFixed === true) {
        ctx.lineWidth = 1;
        makeGreen(f1fin, f2fin, f3fin);
        ctx.lineWidth = 2;
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
    points = [];
    let lxCounter = 0;
    for (let obstacleIndex = 0; obstacleIndex < obstacles.length; obstacleIndex++) {

        cur = obstacles[obstacleIndex];
        r = dist(0, 0, cur[0], cur[1]);
        fi = radToDegs(fiPrepInRads(cur[0], cur[1]));

        abandoned = fiToDiscret(fi);
        let neighs = null;
        // все касания первого звена
        if (r <= l) {
            for (let i = 0; i < 360 / discretFi; i++) {
                for (let j = 0; j < 360 / discretFi; j++) {
                    if (abandoned === 360 / discretFi) {
                        abandoned = 0;
                    }
                    PS[abandoned][i][j] = 1;
                    // points.push([abandoned*discretFi, i*discretFi, j*discretFi]);

                    // расширение
                    neighs = neighbors6(abandoned, i, j);
                    for (let neighborIndex = 0; neighborIndex < neighs.length; neighborIndex++) {
                        [abandoned_f1, abandoned_f2, abandoned_f3] = neighs[neighborIndex];
                        PS[abandoned_f1][abandoned_f2][abandoned_f3] = 1;
                    }
                }
            }
        }
        // все касания второго звена
        for (let i = 0; i < 360 / discretFi; i++) {
            lxCounter = 0;
            for (let lx = (r < l) ? l - r : r - l; lx <= l; lx += 0.125) {
                lxCounter++;
                if (lxCounter < 10) {
                    for (let intermediateLx = lx; intermediateLx < lx + 0.125; intermediateLx += 0.01) {
                        abandoned_f1 = fiToDiscret(radToDegs(degToRads(fi) - Math.acos(Number(((l**2 + r**2 - intermediateLx**2) / (2 * l * r)).toFixed(10)))) + 360);
                        abandoned_f1 = (abandoned_f1 === 360 / discretFi) ? 0 : abandoned_f1

                        abandoned_f2 = fiToDiscret(radToDegs(Math.PI*2 - Math.acos(Number(((l**2 + intermediateLx**2 - r**2) / (2*l*intermediateLx)).toFixed(10)))) + 360);
                        abandoned_f2 = (abandoned_f2 === 360 / discretFi) ? 0 : abandoned_f2;

                        if (PS[abandoned_f1][abandoned_f2][i] === 0) {
                            PS[abandoned_f1][abandoned_f2][i] = 1;

                            // PS[abandoned_f1][abandoned_f2 + 1][i] = 1;
                            // PS[abandoned_f1][abandoned_f2 - 1][i] = 1;
                            // PS[abandoned_f1][abandoned_f2 + 2][i] = 1;
                            // PS[abandoned_f1][abandoned_f2 - 2][i] = 1;
                            // PS[abandoned_f1][abandoned_f2 + 3][i] = 1;
                            // PS[abandoned_f1][abandoned_f2 - 3][i] = 1;
                        }


                        abandoned_f1 = fiToDiscret(radToDegs(degToRads(fi) + Math.acos(Number(((l**2 + r**2 - intermediateLx**2) / (2*l*r)).toFixed(10)))));
                        abandoned_f1 = (abandoned_f1 === 360 / discretFi) ? 0 : abandoned_f1;

                        abandoned_f2 = fiToDiscret(radToDegs(Math.acos(Number(((l**2 + intermediateLx**2 - r**2) / (2*l*intermediateLx)).toFixed(10)))));
                        abandoned_f2 = (abandoned_f2 === 360 / discretFi) ? 0 : abandoned_f2;

                        if (PS[abandoned_f1][abandoned_f2][i] === 0) {
                            PS[abandoned_f1][abandoned_f2][i] = 1;

                            // PS[abandoned_f1][abandoned_f2 + 1][i] = 1;
                            // PS[abandoned_f1][abandoned_f2 - 1][i] = 1;
                            // PS[abandoned_f1][abandoned_f2 + 2][i] = 1;
                            // PS[abandoned_f1][abandoned_f2 - 2][i] = 1;
                            // PS[abandoned_f1][abandoned_f2 + 3][i] = 1;
                            // PS[abandoned_f1][abandoned_f2 - 3][i] = 1;
                        }

                    }
                } else {
                    abandoned_f1 = fiToDiscret(radToDegs(degToRads(fi) - Math.acos(Number(((l**2 + r**2 - lx**2) / (2 * l * r)).toFixed(10)))) + 360);
                    abandoned_f1 = (abandoned_f1 === 360 / discretFi) ? 0 : abandoned_f1

                    abandoned_f2 = fiToDiscret(radToDegs(Math.PI*2 - Math.acos(Number(((l**2 + lx**2 - r**2) / (2*l*lx)).toFixed(10)))) + 360);
                    abandoned_f2 = (abandoned_f2 === 360 / discretFi) ? 0 : abandoned_f2;

                    PS[abandoned_f1][abandoned_f2][i] = 1;
                    // расширение
                        neighs = neighbors6(abandoned_f1, abandoned_f2, i);
                        for (let neighborIndex = 0; neighborIndex < neighs.length; neighborIndex++) {
                            [abandoned_f1, abandoned_f2, abandoned_f3] = neighs[neighborIndex];
                            PS[abandoned_f1][abandoned_f2][abandoned_f3] = 1;
                        }

                    // points.push([abandoned_f1*discretFi, abandoned_f2*discretFi, i*discretFi]);

                    abandoned_f1 = fiToDiscret(radToDegs(degToRads(fi) + Math.acos(Number(((l**2 + r**2 - lx**2) / (2*l*r)).toFixed(10)))));
                    abandoned_f1 = (abandoned_f1 === 360 / discretFi) ? 0 : abandoned_f1;

                    abandoned_f2 = fiToDiscret(radToDegs(Math.acos(Number(((l**2 + lx**2 - r**2) / (2*l*lx)).toFixed(10)))));
                    abandoned_f2 = (abandoned_f2 === 360 / discretFi) ? 0 : abandoned_f2;

                    PS[abandoned_f1][abandoned_f2][i] = 1;
                    // расширение
                    neighs = neighbors6(abandoned_f1, abandoned_f2, i);
                    for (let neighborIndex = 0; neighborIndex < neighs.length; neighborIndex++) {
                        [abandoned_f1, abandoned_f2, abandoned_f3] = neighs[neighborIndex];
                        PS[abandoned_f1][abandoned_f2][abandoned_f3] = 1;
                    }

                    // points.push([abandoned_f1*discretFi, abandoned_f2*discretFi, i*discretFi]);
                }
            }
        }
        // третье звено
        lxCounter = 0;
        for (let i = 0; i < 360 / discretFi; i++) {
            [newX, newY] = toNew(cur[0], cur[1], i*discretFi);
            newR = dist(0, 0, newX, newY);
            newFi = radToDegs(fiPrepInRads(newX, newY));
            lxCounter = 0;  
            for (let lx = (newR <= l) ? l - newR: newR - l; lx <= l; lx += 0.125) {
                lxCounter++;
                if (lxCounter < 10) {
                    for (let intermediateLx = lx; intermediateLx < lx + 0.125; intermediateLx += 0.01) {
                        abandoned_f2 = fiToDiscret(180 + radToDegs(degToRads(newFi) - Math.acos(Number(((l**2 + newR**2 - intermediateLx**2) / (2 * l * newR)).toFixed(10)))));
                        abandoned_f2 = abandoned_f2 === 360 / discretFi ? 0 : abandoned_f2;

                        abandoned_f3 = fiToDiscret(radToDegs(Math.PI*2 - Math.acos(Number(((l**2 + intermediateLx**2 - newR**2) / (2*l*intermediateLx)).toFixed(10)))));
                        abandoned_f3 = abandoned_f3 === 360 / discretFi ? 0 : abandoned_f3;

                        if (PS[i][abandoned_f2][abandoned_f3] === 0) {
                            PS[i][abandoned_f2][abandoned_f3] = 1;

                            [newAban1, newAban2, newAban3] = makePointValid([i, abandoned_f2, abandoned_f3 + 1]);
                            PS[newAban1][newAban2][newAban3] = 1;

                            [newAban1, newAban2, newAban3] = makePointValid([i, abandoned_f2, abandoned_f3 - 1]);
                            PS[newAban1][newAban2][newAban3] = 1;

                            [newAban1, newAban2, newAban3] = makePointValid([i, abandoned_f2, abandoned_f3 + 2]);
                            PS[newAban1][newAban2][newAban3] = 1;

                            [newAban1, newAban2, newAban3] = makePointValid([i, abandoned_f2, abandoned_f3 - 2]);
                            PS[newAban1][newAban2][newAban3] = 1;

                            [newAban1, newAban2, newAban3] = makePointValid([i, abandoned_f2, abandoned_f3 + 3]);
                            PS[newAban1][newAban2][newAban3] = 1;

                            [newAban1, newAban2, newAban3] = makePointValid([i, abandoned_f2, abandoned_f3 - 3]);
                            PS[newAban1][newAban2][newAban3] = 1;
                        }

                        abandoned_f2 = fiToDiscret(180 + radToDegs(degToRads(newFi) + Math.acos(Number(((l**2 + newR**2 - intermediateLx**2) / (2*l*newR)).toFixed(10)))));
                        abandoned_f2 = abandoned_f2 === 360 / discretFi ? 0 : abandoned_f2;

                        abandoned_f3 = fiToDiscret(radToDegs(Math.acos(Number(((l**2 + intermediateLx**2 - newR**2) / (2*l*intermediateLx)).toFixed(10)))));
                        abandoned_f3 = abandoned_f3 === 360 / discretFi ? 0 : abandoned_f3;

                        if (PS[i][abandoned_f2][abandoned_f3] === 0) {

                            PS[i][abandoned_f2][abandoned_f3] = 1;

                            [newAban1, newAban2, newAban3] = makePointValid([i, abandoned_f2, abandoned_f3 + 1]);
                            PS[newAban1][newAban2][newAban3] = 1;

                            [newAban1, newAban2, newAban3] = makePointValid([i, abandoned_f2, abandoned_f3 - 1]);
                            PS[newAban1][newAban2][newAban3] = 1;

                            [newAban1, newAban2, newAban3] = makePointValid([i, abandoned_f2, abandoned_f3 + 2]);
                            PS[newAban1][newAban2][newAban3] = 1;

                            [newAban1, newAban2, newAban3] = makePointValid([i, abandoned_f2, abandoned_f3 - 2]);
                            PS[newAban1][newAban2][newAban3] = 1;

                            [newAban1, newAban2, newAban3] = makePointValid([i, abandoned_f2, abandoned_f3 + 3]);
                            PS[newAban1][newAban2][newAban3] = 1;

                            [newAban1, newAban2, newAban3] = makePointValid([i, abandoned_f2, abandoned_f3 - 3]);
                            PS[newAban1][newAban2][newAban3] = 1;
                        }
                    }
                } else {

                    abandoned_f2 = fiToDiscret(180 + radToDegs(degToRads(newFi) - Math.acos(Number(((l**2 + newR**2 - lx**2) / (2 * l * newR)).toFixed(10)))));
                    abandoned_f2 = abandoned_f2 === 360 / discretFi ? 0 : abandoned_f2;

                    abandoned_f3 = fiToDiscret(radToDegs(Math.PI*2 - Math.acos(Number(((l**2 + lx**2 - newR**2) / (2*l*lx)).toFixed(10)))));
                    abandoned_f3 = abandoned_f3 === 360 / discretFi ? 0 : abandoned_f3;

                    PS[i][abandoned_f2][abandoned_f3] = 1;

                    // расширение
                    neighs = neighbors6(i, abandoned_f2, abandoned_f3);
                    for (let neighborIndex = 0; neighborIndex < neighs.length; neighborIndex++) {
                        [abandoned_f1, abandoned_f2, abandoned_f3] = neighs[neighborIndex];
                        PS[abandoned_f1][abandoned_f2][abandoned_f3] = 1;
                    }

                    // points.push([i*discretFi, abandoned_f2*discretFi, abandoned_f3*discretFi]);

                    abandoned_f2 = fiToDiscret(180 + radToDegs(degToRads(newFi) + Math.acos(Number(((l**2 + newR**2 - lx**2) / (2*l*newR)).toFixed(10)))));
                    abandoned_f2 = abandoned_f2 === 360 / discretFi ? 0 : abandoned_f2;

                    abandoned_f3 = fiToDiscret(radToDegs(Math.acos(Number(((l**2 + lx**2 - newR**2) / (2*l*lx)).toFixed(10)))));
                    abandoned_f3 = abandoned_f3 === 360 / discretFi ? 0 : abandoned_f3;

                    PS[i][abandoned_f2][abandoned_f3] = 1;

                    // расширение
                    neighs = neighbors6(i, abandoned_f2, abandoned_f3);
                    for (let neighborIndex = 0; neighborIndex < neighs.length; neighborIndex++) {
                        [abandoned_f1, abandoned_f2, abandoned_f3] = neighs[neighborIndex];
                        PS[abandoned_f1][abandoned_f2][abandoned_f3] = 1;
                    }
                    
                    // points.push([i*discretFi, abandoned_f2*discretFi, abandoned_f3*discretFi]);
                }
            }
        }
    }
    console.log('OK');
    // console.log(points);
    // setInterval(tick, 100)
    // let ind = 0;
    // function tick() {
    //     clear();
    //     [foo, bar, baz] = points[ind];
    //     make(foo, bar, baz);
    //     ind += 1;
    // }
}

// fi в градусах.
function toNew(x, y, fiLocal) {
    return [
        x*Math.cos(degToRads(fiLocal)) - y*Math.sin(degToRads(fiLocal)) + l,
        x*Math.sin(degToRads(fiLocal)) + y*Math.cos(degToRads(fiLocal))
        ];
}

function makeProjection() {
    ctx2.clearRect(0, 0, 600, 600);
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
                } else {
                    ctx2.fillStyle = "green";
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
                } else {
                    ctx2.fillStyle = "green";
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
                } else {
                    ctx2.fillStyle = "green";
                    ctx2.fillRect(i*discretFi, 360 - j*discretFi, discretFi, discretFi);
                }
            }
        }
    }
}


function makePointValid(array) {
    let result = [0, 0, 0];
    for (let i = 0; i < array.length; i++) {
        if (array[i] === 360 / discretFi) {
            result[i] = 0;
        } else if (array[i] === -1) {
            result[i] = 360 / discretFi - 1;
        } else {
            result[i] = array[i];
        }
    }
    return result;
}

function neighbors6(df1, df2, df3) {
    return [
        makePointValid([df1 + 1, df2, df3]),
        makePointValid([df1 - 1, df2, df3]),
        makePointValid([df1, df2 + 1, df3]),
        makePointValid([df1, df2 - 1, df3]),
        makePointValid([df1, df2, df3 + 1]),
        makePointValid([df1, df2, df3 - 1])
    ];
}

function neighbors26(df1, df2, df3) {
    return [
        // центры - 6
        makePointValid([df1 + 1, df2, df3]),
        makePointValid([df1 - 1, df2, df3]),
        makePointValid([df1, df2 + 1, df3]),
        makePointValid([df1, df2 - 1, df3]),
        makePointValid([df1, df2, df3 + 1]),
        makePointValid([df1, df2, df3 - 1]),
        // ребра - 12
        makePointValid([df1 + 1, df2 + 1, df3]),
        makePointValid([df1 - 1, df2 - 1, df3]),
        makePointValid([df1, df2 + 1, df3 + 1]),
        makePointValid([df1, df2 - 1, df3 - 1]),
        makePointValid([df1 + 1, df2, df3 + 1]),
        makePointValid([df1 - 1, df2, df3 - 1]),
        makePointValid([df1 + 1, df2 - 1, df3]),
        makePointValid([df1 - 1, df2 + 1, df3]),
        makePointValid([df1, df2 + 1, df3 - 1]),
        makePointValid([df1, df2 - 1, df3 + 1]),
        makePointValid([df1 + 1, df2, df3 - 1]),
        makePointValid([df1 - 1, df2, df3 + 1]),
        // углы - 8
        makePointValid([df1 + 1, df2 + 1, df3 + 1]),
        makePointValid([df1 + 1, df2 + 1, df3 - 1]),
        makePointValid([df1 + 1, df2 - 1, df3 + 1]),
        makePointValid([df1 - 1, df2 + 1, df3 + 1]),
        makePointValid([df1 - 1, df2 - 1, df3 - 1]),
        makePointValid([df1 - 1, df2 - 1, df3 + 1]),
        makePointValid([df1 - 1, df2 + 1, df3 - 1]),
        makePointValid([df1 + 1, df2 - 1, df3 - 1])
    ];
}

function getWayByWaveAlgorithm() {
    if (!startPosIsFixed || !finPosIsFixed) {
        console.log('Не задано начальное или конечное положение!');
        return;
    }

    way = [];
    for (let i = 0; i < 360 / discretFi; i++) {
        for (let j = 0; j < 360 / discretFi; j++) {
            for (let k = 0; k < 360 / discretFi; k++) {
                if (PS[i][j][k] === 1) {
                    FRONTS[i][j][k] = 'OBSTACLE';
                } else {
                    FRONTS[i][j][k] = 'UNFRONTED';
                }
            }
        }
    }

    let df1start = f1start / discretFi;
    let df2start = f2start / discretFi;
    let df3start = f3start / discretFi;
    let df1fin = f1fin / discretFi;
    let df2fin = f2fin / discretFi;
    let df3fin = f3fin / discretFi;

    let front = [[df1fin, df2fin, df3fin]];
    let waveNumber = 1;
    FRONTS[df1fin][df2fin][df3fin] = 0;
    let neighs = null;
    let newFront = null;

    while (true) {
        if (contains3(front, [df1start, df2start, df3start])) {
            break;
        }
        newFront = [];
        for (let i = 0; i < front.length; i++) {
            neighs = neighbors6(front[i][0], front[i][1], front[i][2]);
            for (let neighborIndex = 0; neighborIndex < neighs.length; neighborIndex++) {
                [neif1, neif2, neif3] = neighs[neighborIndex];
                if (FRONTS[neif1][neif2][neif3] === 'UNFRONTED') {
                    FRONTS[neif1][neif2][neif3] = waveNumber;
                    newFront.push([neif1, neif2, neif3]);
                }
            }
        }
        if (newFront.length > 0) {
            front = newFront;
            waveNumber++;
        } else {
            console.log('Пути нет!');
            return;
        }
        
    }
    console.log('Фронты расставлены...');

    neighs = neighbors6(df1start, df2start, df3start);
    while (waveNumber >= 0) {
        for (let neighborIndex = 0; neighborIndex < neighs.length; neighborIndex++) {
            [neif1, neif2, neif3] = neighs[neighborIndex];
            if (FRONTS[neif1][neif2][neif3] === waveNumber - 1) {
                way.push([neif1, neif2, neif3]);
                PS[neif1][neif2][neif3] = 'way_part';
                neighs = neighbors6(neif1, neif2, neif3);
                break;
            }
        }
        waveNumber--;
    }
    console.log('Путь найден!')
}

function start() {
    if (startPosIsFixed && finPosIsFixed) {
        let ind = 0;

        ctx2.clearRect(0, 0, 600, 600);
        ctx2.strokeStyle = "black";
        ctx2.lineWidth = 2;
        ctx2.moveTo(0, 200);
        ctx2.lineTo(600, 200);
        ctx2.moveTo(0, 400);
        ctx2.lineTo(600, 400);
        ctx2.stroke();

        let deltaX = 600 / way.length;
        let deltaY = 200 / 360;

        let currentX = deltaX / 2;

        let f1traj = [];
        let f2traj = [];
        let f3traj = [];

        // let f3GraphCoords = [];
        // let f2GraphCoords = [];
        // let f1GraphCoords = [];

        for (let i = 0; i < way.length; i++) {
            f1traj.push(way[i][0] * discretFi);
            f2traj.push(way[i][1] * discretFi);
            f3traj.push(way[i][2] * discretFi);
        }

        let interval = setInterval( function tick() {
            if (ind < way.length) {
                clear();
                make(way[ind][0]*discretFi, way[ind][1]*discretFi, way[ind][2]*discretFi);
                ctx2.fillStyle = "black";
                ctx2.strokeStyle = "black";
                // ctx2.beginPath();
                // ctx2.arc(currentX, 600 - f1traj[ind] * deltaY, 3, 0, Math.PI * 2, false);
                // ctx2.fill();
                // ctx2.closePath();

                ctx2.beginPath();
                ctx2.moveTo(currentX, 600 - f1traj[ind] * deltaY);
                ctx2.lineTo(currentX + deltaX, 600 - f1traj[ind + 1] * deltaY);
                ctx2.stroke();
                ctx2.closePath();

                ctx2.fillStyle = "green";
                ctx2.strokeStyle = "green";
                // ctx2.beginPath();
                // ctx2.arc(currentX, 400 - f2traj[ind] * deltaY, 3, 0, Math.PI * 2, false);
                // ctx2.fill();
                // ctx2.closePath();

                ctx2.beginPath();
                ctx2.moveTo(currentX, 400 - f2traj[ind] * deltaY);
                ctx2.lineTo(currentX + deltaX, 400 - f2traj[ind + 1] * deltaY);
                ctx2.stroke();
                ctx2.closePath();

                ctx2.fillStyle = "purple";
                ctx2.strokeStyle = "purple";
                // ctx2.beginPath();
                // ctx2.arc(currentX, 200 - f3traj[ind] * deltaY, 3, 0, Math.PI * 2, false);
                // ctx2.fill();
                // ctx2.closePath();

                ctx2.beginPath();
                ctx2.moveTo(currentX, 200 - f3traj[ind] * deltaY);
                ctx2.lineTo(currentX + deltaX, 200 - f3traj[ind + 1] * deltaY);
                ctx2.stroke();
                ctx2.closePath();
                
                currentX += deltaX;
                ind++;
            } else {
                clearInterval(interval);
            }
        }, 25);
    } else {
        console.log('Не поехали.');
    }   
}
