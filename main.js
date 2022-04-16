const data = {
    score: 0,
    best: 0,
    cells: [

    ]
};

const cellsIndex = {
    // 向左移
    "a": [
        [0, 1, 2, 3],
        [4, 5, 6, 7],
        [8, 9, 10, 11],
        [12, 13, 14, 15],
    ],
    "ArrowLeft": [
        [0, 1, 2, 3],
        [4, 5, 6, 7],
        [8, 9, 10, 11],
        [12, 13, 14, 15],
    ],
    // 向上移
    "w": [
        [0, 4, 8, 12],
        [1, 5, 9, 13],
        [2, 6, 10, 14],
        [3, 7, 11, 15],
    ],
    "ArrowUp": [
        [0, 4, 8, 12],
        [1, 5, 9, 13],
        [2, 6, 10, 14],
        [3, 7, 11, 15],
    ],
    // 向右移
    "d": [
        [3, 2, 1, 0],
        [7, 6, 5, 4],
        [11, 10, 9, 8],
        [15, 14, 13, 12],
    ],
    "ArrowRight": [
        [3, 2, 1, 0],
        [7, 6, 5, 4],
        [11, 10, 9, 8],
        [15, 14, 13, 12],
    ],
    // 向下移
    "s": [
        [12, 8, 4, 0],
        [13, 9, 5, 1],
        [14, 10, 6, 2],
        [15, 11, 7, 3],
    ],
    "ArrowDown": [
        [12, 8, 4, 0],
        [13, 9, 5, 1],
        [14, 10, 6, 2],
        [15, 11, 7, 3],
    ]
};

class View {
    constructor() {
        this.score = document.getElementById('score'),
        this.bestScore = document.getElementById('best-score'),
        this.addScore = document.getElementById('score-add'),
        this.winningContainer = document.getElementById('winning'),
        this.failureContainer = document.getElementById('failure'),
        this.tileContainer = document.getElementById('tile-container');
    }

    addCell(index, score) {
        let pos = this.getPos(this.getIndexPos(index));
        let tile = {
            pos,
            index,
            val: data.cells[index].val,
            classList: ['tile', 'new-tile'],
        }
        let newTile = this.createTileHtml(tile);
        this.tileContainer.appendChild(newTile);
    }

    removeCell(index) {
        let tile = this.getTile(index);
        this.tileContainer.removeChild(tile);
    }

    updateScore(score, add) {
        this.score.innerText = score;
        this.addScoreAnimation(add);
    }

    addScoreAnimation(add) {
        // 添加分数增加动画
        this.addScore.innerText = '+' + add;
        this.addScore.classList.add('action');
        let addScore = this.addScore;
        setTimeout(function() {
            addScore.classList.remove('action');
        }, 500);
    }

    updateBest(score) {
        this.bestScore.innerText = score;
    }

    createTileHtml(tile) {
        let newTile = document.createElement('div');
        newTile.innerText = tile.val;
        tile.classList.forEach(item => newTile.classList.add(item));
        newTile.setAttribute('data-index', tile.index);
        newTile.setAttribute('data-val', tile.val);
        this.setPos(newTile, tile.pos);
        return newTile;
    }

    getIndexPos(index) {
        return {
            x: Math.floor(index / 4) + 1,
            y: index % 4 + 1
        }
    }

    getPos(index) {
        let gridCell = document.querySelector(`.grid-container .grid-row:nth-child(${index.x}) .grid-cell:nth-child(${index.y})`);
        return {
            top: gridCell.offsetTop,
            left: gridCell.offsetLeft
        };
    }
    
    setPos(elem, pos) {
        elem.style.left = pos.left + 'px';
        elem.style.top = pos.top + 'px';
    }

    move(old_index, new_index) {
        let tile = this.getTile(old_index);
        let pos = this.getPos(this.getIndexPos(new_index));
        this.setInfo(tile, pos, new_index);
    }

    getTile(index) {
        return document.querySelector(`.tile[data-index='${index}']`);
    }

    setInfo(elem, pos, index) {
        elem.style.left = pos.left + 'px';
        elem.style.top = pos.top + 'px';
        elem.setAttribute("data-index", index);
    }

    updateVal(index, val) {
        let tile = this.getTile(index);
        tile.setAttribute("data-val", val);
        tile.innerText = val;
        tile.classList.add('move');
        setTimeout(() => {
            tile.classList.remove('move');
            tile.classList.remove('new-tile');
        }, 300);
    }

    winning() {
        this.winningContainer.classList.add('action');
    }

    failure() {
        this.failureContainer.classList.add('action');
    }
}

class Game {
    constructor(view) {
        this.view = view;
        this.cells = data.cells;
        this.over = false; // 游戏是否结束
        this.score = 0;  // 分数
        this.best = 0;  // 最高分
    }

    init() {
        // 初始化cell
        this.initCell();
        // 初始化随机两个元素
        this.start();
    }

    initCell() {
        for (let i = 0; i < 16; i++) {
            this.cells.push({
                val: 0,
                index: i
            });
        }
    }

    start() {
        for (let i = 0; i < 2; i++) {
            this.randomAddItem();
        }
    }

    restart() {
        
    }

    random(start, end) {
        // 返回start 到 end 之间的随机数
        return Math.floor(Math.random() * (end - start) + start);
    }

    randomAddItem() {
        // 随机向表格中添加元素
        if (this.isFull()) return;
        let index;
        do {
            index = this.random(0, 16);
        } while(this.cells[index].val > 0);
        this.addItem(index, 2);
    }

    addItem(index, val) {
        this.cells[index].val = val;
        this.score += 2;
        this.view.addCell(index);
        this.view.updateScore(this.score, 2);
        this.checkBest();
    }

    checkBest() {
        if (this.score > this.best) {
            this.best = this.score;
            this.view.updateBest(this.best);
        }
    }

    isFull() {
        // 判断表格是否已填满
        return this.cells.every((el) => el.val > 0);
    }

    move(key) {
        if (this.over) return;
        let newCells = [];
        // 将所有移动元素转换成向左移动元素
        if (key == 'a' || key == 'd' || key == 'ArrowLeft' || key == 'ArrowRight') {
            newCells = this.chunkX();
        } else if (key == 'w' || key == 's' || key == 'ArrowUp' || key == 'ArrowDown') {
            newCells = this.chunkY();
        }
        if (key == 'd' || key == 's' || key == 'ArrowRight' || key == 'ArrowDown') {
            newCells.forEach(item => item.reverse());
        }

        // 元素移动
        newCells.forEach((item, index) => {
            this.moving(item, cellsIndex[key][index]);
        })

        if (this.isFull()) {
            if (this.checkWinning()) {
                this.over = true;
                this.view.winning();
            } else if (this.checkFailure()) {
                this.over = true;
                this.view.failure();
            }
        } else {
            this.randomAddItem();
        }
    }

    checkWinning() {
        // 元素最大值到达2048即游戏胜利
        return this.cells.some(item => item.val == 2048);
    }

    checkFailure() {
        // 检测是否所有相邻元素都不相等
        return !(this.check(this.chunkX()) || this.check(this.chunkY()));
    }

    check(cells) {
        // 检测传入的二维数组是否存在相邻元素相等
        return cells.some(arr => arr.some((item, index, list) => {
            if (index == list.length - 1) {
                return false;
            }
            if (item.val == list[index + 1].val) {
                return true;
            }
            return false;
        }))
    }

    chunkX() {
        let newCells = [];
        this.cells.forEach((_, index, array) => {
            if (index % 4 == 0) {
                newCells.push(array.slice(index, index + 4));
            }
        });
        return newCells;
    }

    chunkY() {
        let arr = this.chunkX();
        let newCells = [
            [],
            [],
            [],
            []
        ];
        for (let i = 0; i < arr.length; i++) {
            for (let j = 0; j < arr.length; j++) {
                newCells[j][i] = arr[i][j];
            }
        }
        return newCells;
    }

    moving(arr, index) {
        let cells = arr.filter(item => item.val > 0);
        if (cells.length == 1) {  // 一行或一列中只有一个元素
            this.normalMove(cells, index);
        } else if (cells.length == 2) {
            if (cells[0].val == cells[1].val) {  // 两个元素相等
                this.mergeMove(cells, index, 0, 1, 0);
            } else {  // 两个元素不相等，一起移动
                this.normalMove(cells, index);
            }
        } else if (cells.length == 3) {
            if (cells[0].val == cells[1].val) {  // 前两个元素相等
                this.mergeMove(cells, index, 0, 1, 0);
                this.updateItem(cells[2].index, index[1]);
            } else if (cells[1].val == cells[2].val) {  // 后两个元素相等
                this.updateItem(cells[0].index, index[0]);
                this.mergeMove(cells, index, 1, 2, 1);
            } else { // 三个元素互不相等，一起移动
                this.normalMove(cells, index);
            }
        } else if (cells.length == 4) {
            if (cells[0].val == cells[1].val) {  // 前两个元素相等
                this.mergeMove(cells, index, 0, 1, 0);
                if (cells[2].val == cells[3].val) {  // 后两个元素相等
                    this.mergeMove(cells, index, 2, 3, 1);
                } else {  // 后两个元素不相等
                    this.updateItem(cells[2].index, index[1]);
                    this.updateItem(cells[3].index, index[2]);
                }
            } else if (cells[1].val == cells[2].val) {  // 中间两个元素不相等，第一个元素不用移动
                this.mergeMove(cells, index, 1, 2, 1);
                this.updateItem(cells[3].index, index[2]);
            } else if (cells[2].val == cells[3].val) {  // 后两个元素不相等，前两个元素不相等
                this.mergeMove(cells, index, 2, 3, 2);
            }
        }
    }

    mergeMove(arr, index, num1, num2, num3) {
        // 合并移动，将两个元素合并后移动
        this.removeItem(arr[num1].index);
        this.updateItem(arr[num2].index, index[num3]);
        this.updateVal(index[num3]);
    }

    updateVal(index) {
        // 更新元素的数值
        this.cells[index].val *= 2;
        this.view.updateVal(index, this.cells[index].val);
    }

    removeItem(index) {
        this.cells[index].val = 0;
        this.view.removeCell(index);
    }

    normalMove(arr, index) {
        arr.forEach((item, i) => {
            this.updateItem(item.index, index[i]);
        });
    }

    updateItem(old_index, new_index) {
        // 移动元素从old_index到new_index位置
        if (old_index == new_index) return;
        this.updatePos(old_index, new_index);
        this.view.move(old_index, new_index);
    }

    updatePos(old_index, new_index) {
        // 改变移动前后对应元素中的数值
        this.cells[new_index].val = this.cells[old_index].val;
        this.cells[old_index].val = 0;
    }

    test() {
        // 测试
        const key = ['w', 'd', 's', 'a', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'];
        let _this = this;
        setInterval(() => {
            _this.move(key[_this.random(0, 8)]);
        }, 100);
    }
}

function addEvent(game) {
    const key = ['w', 'd', 's', 'a', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'];
    let moving = true;

    window.addEventListener("keydown", (event) => {
        if (moving && key.includes(event.key)) {
            moving = false;
            game.move(event.key);
        }
    });

    window.addEventListener("keyup", () => {
        moving = true;
    })
}

let main = function() {
    let view = new View();
    let game = new Game(view);
    game.init();
    addEvent(game);
}

main();