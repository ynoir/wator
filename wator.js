/**
 * Setup
 */
const ENERGY_INCREASE = 1

const Types = {
    EMPTY: 0,
    FISH: 1,
    SHARK: 2,
}

let tickDelay = 100
let cellSize = 4
let gridSize = Math.ceil(600/cellSize)

const color = ['#3e4fad', '#328c6d', '#7f38a0']
const reproductionTimes = [0, 3, 4]
const energy = [0, 0, 3]

let grid = []
let actionGrid = []

const c = document.getElementById("wator")
const ctx = c.getContext("2d")

/**
 * Helpers
 */

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function forEachCell(action) {
    for (const field of actionGrid) {
        action(grid[field.x][field.y], field.x, field.y)
    }
}

function randomInt(upperBound) {
    return Math.floor(Math.random() * Math.floor(upperBound))
}

function findNeighbors(x, y, type) {
    const fields = [
        { x: x==0 ? gridSize-1 : x-1, y: y },
        { x: (x+1) % (gridSize-1), y: y },
        { x: x, y: y==0 ? gridSize-1 : y-1 },
        { x: x, y: (y+1) % (gridSize-1) },
    ]
    return fields.filter(_ => grid[_.x][_.y].type == type)
}

function initActionGrid() {
    actionGrid = []
    for (let x=0; x<gridSize; x++) {
        for (let y=0; y<gridSize; y++) {
            actionGrid.push({ x: x, y: y })
        }
    }
    shuffle(actionGrid)
}

function initGrid() {
    grid = []
    for (let x=0; x<gridSize; x++) {
        const row = []
        for (let y=0; y<gridSize; y++) {
            const rnd = Math.random()
            let type = Types.EMPTY
            if (rnd < 0.5) {
                type = Types.FISH
            } else if (rnd < 0.7) {
                type = Types.SHARK
            }
            // const type = randomInt(3)
            const cell = {
                type: type,
                age: randomInt(reproductionTimes[type]),
                energy: energy[type],
            }
            row.push(cell)
        }
        grid.push(row)
    }    
}

/**
 * Logic
 */

function move(cell, x, y) {
    const emptyNeighbours = findNeighbors(x, y, Types.EMPTY)
    if (emptyNeighbours.length > 0) {
        const newField = emptyNeighbours[randomInt(emptyNeighbours.length)]
        grid[newField.x][newField.y] = cell
        grid[x][y] = { type: 0 }
    }
}

function eat(cell, x, y) {
    const fishNeighbours = findNeighbors(x, y, Types.FISH)
    if (fishNeighbours.length > 0) {
        const newField = fishNeighbours[randomInt(fishNeighbours.length)]
        grid[newField.x][newField.y] = cell
        cell.energy += ENERGY_INCREASE
        grid[x][y] = { type: 0 }
        return true
    }
    return false
}

function reproduce(cell, x, y) {
    if (cell.age == reproductionTimes[cell.type]) {
        cell.age = 0
        if (grid[x][y].type == Types.EMPTY) {
            grid[x][y] = {
                type: cell.type,
                age: randomInt(reproductionTimes[cell.type]),
                energy: energy[cell.type],
            }
        }
    }
}

function calculateState() {
    forEachCell((cell, x, y) => {
        cell.done = true
        if (cell.type != Types.EMPTY) {
            cell.age++
        }
        if (cell.type == Types.FISH) {
            move(cell, x, y)
        } else if (cell.type == Types.SHARK) {
            if (eat(cell, x, y) == false) {
                move(cell, x, y)
            }
            if (--cell.energy == 0) {
                grid[x][y] = { type: Types.EMPTY, age: 0 }
                cell.type = Types.EMPTY
            }
        }
        reproduce(cell, x, y)
    })
}

function renderGrid() {
    ctx.fillStyle = color[Types.EMPTY]
    ctx.fillRect(0, 0, 600, 600)
    forEachCell((cell, x, y) => {
        if (cell.type != Types.EMPTY) {
            ctx.fillStyle = color[cell.type]
            ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize)
        }
    })
}

function tick() {
    calculateState()
    renderGrid()
}

/**
 * Run
 */

initGrid()
initActionGrid()
let timerId = setInterval(() => tick(), tickDelay)

/**
 * Controls
 */

const restartButton = document.getElementById("restart")
restartButton.onclick = () => {
    clearInterval(timerId)
    cellSize = document.getElementById("cell_size").value
    gridSize = Math.ceil(600/cellSize)
    tickDelay = document.getElementById("tick_delay").value
    initGrid()
    initActionGrid()
    timerId = setInterval(() => tick(), tickDelay)
}
