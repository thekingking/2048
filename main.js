let data = {
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

    addCell(index) {
        // 向视图中添加tile
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
        // 从视图中删除tile
        let tile = this.getTile(index);
        this.tileContainer.removeChild(tile);
    }

    clear() {
        // 清空所有元素
        this.tileContainer.innerHTML = '';
    }

    setup() {
        // 移除winning图标和failure图标
        this.winningContainer.classList.remove('action');
        this.failureContainer.classList.remove('action');
    }

    updateScore(score) {
        // 更新分数
        this.score.innerText = score;
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
        // 更新最高分
        this.bestScore.innerText = score;
    }

    createTileHtml(tile) {
        // 创建tile元素
        let newTile = document.createElement('div');
        newTile.innerText = tile.val;
        tile.classList.forEach(item => newTile.classList.add(item));
        newTile.setAttribute('data-index', tile.index);
        newTile.setAttribute('data-val', tile.val);
        this.setPos(newTile, tile.pos);
        return newTile;
    }

    getIndexPos(index) {
        // 返回元素对应表格中的坐标
        return {
            x: Math.floor(index / 4) + 1,
            y: index % 4 + 1
        }
    }

    getPos(index) {
        // 获取对应坐标的grid-cell的偏移量
        let gridCell = document.querySelector(`.grid-container .grid-row:nth-child(${index.x}) .grid-cell:nth-child(${index.y})`);
        return {
            top: gridCell.offsetTop,
            left: gridCell.offsetLeft
        };
    }
    
    setPos(elem, pos) {
        // 设置传入元素的left和top
        elem.style.left = pos.left + 'px';
        elem.style.top = pos.top + 'px';
    }

    move(old_index, new_index) {
        // 将old_index位置的tile移动到new_index位置上
        let tile = this.getTile(old_index);
        let pos = this.getPos(this.getIndexPos(new_index));
        this.setInfo(tile, pos, new_index);
    }

    getTile(index) {
        // 获取对应index的元素
        return document.querySelector(`.tile[data-index='${index}']`);
    }

    setInfo(elem, pos, index) {
        // 设置tile的属性
        elem.style.left = pos.left + 'px';
        elem.style.top = pos.top + 'px';
        elem.setAttribute("data-index", index);
    }

    updateVal(index, val) {
        // 更新数值
        let tile = this.getTile(index);
        tile.setAttribute("data-val", val);
        tile.innerText = val;
    }

    moveTileAnimation(index) {
        // 添加tile移动的动画
        let tile = this.getTile(index);
        tile.classList.add('move');
        setTimeout(() => {
            tile.classList.remove('move');
            tile.classList.remove('new-tile');
        }, 300);
    }

    winning() {
        // 添加胜利动画
        this.winningContainer.classList.add('action');
    }

    failure() {
        // 添加失败动画
        this.failureContainer.classList.add('action');
    }

    resize() {
        // 重绘tile的位置
        data.cells.forEach((_, index) => {
            let tile = this.getTile(index);
            if (!tile) return;
            let pos = this.getPos(this.getIndexPos(index));
            this.setPos(tile, pos);
        });
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
        if (this.getHistory()) {
            this.restoreHistory();
        } else {
            // 初始化cell
            this.initCell();
            // 初始化随机两个元素
            this.start();
        }
    }

    initCell() {
        for (let i = 0; i < 16; i++) {
            this.cells[i] = {
                val: 0,
                index: i
            };
        }
    }

    start() {
        for (let i = 0; i < 2; i++) {
            this.randomAddItem();
        }
    }

    restart() {
        this.clear(); // 清空所有游戏数据
        this.initCell();  // 初始化元素属性
        this.view.setup();  // 清除胜利或失败图标
        this.start();  // 重新生成tile
    }

    clear() {
        // 清空原有的游戏数据
        this.view.clear();  // 清空所有tile
        this.clearHistory();  // 清空游戏数据
        this.score = 0;  // 重置分数
        this.cells = data.cells;  // 重新获取元素
        this.over = false; // 重置游戏状态
    }

    getHistory() {
        // 获取本地存储的数据，初始化数据
        let mes = JSON.parse(localStorage.getItem("data"));
        // 判断是否存在本地存储数据
        if (mes) {
            data = mes;
            this.score = data.score;
            this.best = data.best;
            this.cells = data.cells;
            // 判断是否存储元素信息
            if (this.cells.length) {
                return true;
            }
        }
        return false;
    }

    restoreHistory() {
        this.view.updateScore(this.score);
        this.view.updateBest(this.best);
        this.cells.forEach(item => {
            if (item.val > 0) {
                this.view.addCell(item.index);
            }
        })
    }

    clearHistory() {
        // 清空除best外的数据信息
        data.cells = [];
        data.score = 0;
        localStorage.setItem("data", JSON.stringify(data));
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
        // 添加tile
        this.cells[index].val = val;
        this.score += 2;
        this.view.addCell(index);
        this.view.updateScore(this.score);
        this.view.addScoreAnimation(2);
        this.checkBest();
    }

    checkBest() {
        // 检测分数是否到达最高分，若是则更新
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
        });

        if (this.isFull()) {
            if (this.checkWinning()) {
                this.over = true;
                this.view.winning();
                this.clearHistory();
            } else if (this.checkFailure()) {
                this.over = true;
                this.view.failure();
                this.clearHistory();
            }
        } else {
            this.randomAddItem();
            // 存储数据
            this.save();
        }
    }

    save() {
        // 本地存储数据
        data.score = this.score;
        data.best = this.best;
        localStorage.setItem("data", JSON.stringify(data));
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
        // 横向移动
        let newCells = [];
        this.cells.forEach((_, index, array) => {
            if (index % 4 == 0) {
                newCells.push(array.slice(index, index + 4));
            }
        });
        return newCells;
    }

    chunkY() {
        // 纵向移动
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
        let cells = arr.filter(item => item.val > 0);  // 过滤出将要移动的tile

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
        this.removeItem(arr[num1].index);  // 删除前一个元素
        this.updateItem(arr[num2].index, index[num3]);  // 移动后一个元素
        this.updateVal(index[num3]);  // 更新移动后元素的数值
        this.view.moveTileAnimation(index[num3]);  // 添加移动的动画
    }

    updateVal(index) {
        // 更新元素的数值
        this.cells[index].val *= 2;
        this.view.updateVal(index, this.cells[index].val);
    }

    removeItem(index) {
        // 删除tile
        this.cells[index].val = 0;
        this.view.removeCell(index);
    }

    normalMove(arr, index) {
        // 平滑移动所有元素
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

function addTouchEvent(game) {
    let startX,
        startY,
        endX,
        endY,
        offsetX,
        offsetY;
    window.addEventListener("touchstart", (event) => {
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
    });

    window.addEventListener("touchend", (event) => {
        endX = event.changedTouches[0].clientX;
        endY = event.changedTouches[0].clientY;
        offsetX = endX - startX;
        offsetY = endY - startY;
        if (Math.abs(offsetX) < 10 && Math.abs(offsetY) < 10) {
            return;
        } else if (Math.abs(offsetX) >= Math.abs(offsetY)) {
            game.move(offsetX > 0 ? 'd': 'a');
        } else {
            game.move(offsetY > 0 ? 's': 'w');
        }
    })
}

function addEvent(game) {
    const key = ['w', 'd', 's', 'a', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'];
    let moving = true; // 避免长按重复触发移动事件
    const restartBtn = document.getElementById('restart-btn');
    let id;

    window.addEventListener("keydown", (event) => {
        if (moving && key.includes(event.key)) {
            moving = false;
            game.move(event.key);
        }
    });

    window.addEventListener("keyup", () => {
        moving = true;
    });

    restartBtn.addEventListener("click", () => {
        game.restart();
    });

    window.addEventListener("resize", () => {
        // 节流
        clearTimeout(id);
        id = setTimeout(() => {
            game.view.resize();
        }, 10);
    });

    addTouchEvent(game);
}

let main = function() {
    let view = new View();
    let game = new Game(view);
    game.init();
    addEvent(game);
}

main();