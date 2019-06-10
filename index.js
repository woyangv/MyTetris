class Index {
    constructor({xCount = 10, yCount = 20} = {}) {
        this.randomList = []
        this.randomOne()
        this.xCount = xCount
        this.yCount = yCount
        this.clear()
    }

    configController() {
        orderMap[UP] = () => {
            this.state2Move('rotate')
        }
        orderMap[DOWN] = () => {
            this.state2Move('down')
        }
        orderMap[LEFT] = () => {
            this.state2Move('left')
        }
        orderMap[RIGHT] = () => {
            this.state2Move('right')
        }

        document.onkeydown = function (event) {
            var e = event
            if (e && orderMap[e.keyCode]) {
                orderMap[e.keyCode]()
            }
        }
    }

    state2Move(order) {
        this.stateHolder.state2Transfer(order)
        this.display.drawRect(this.stateHolder.state)
    }

    randomOne() {
        let index = Math.floor(Math.random() * dataMap.length)
        this.randomList.push(index)
    }

    randomState2() {
        this.randomOne()
        let index = this.randomList.shift()
        let data = Util.copy(dataMap[index])
        data = data.map((item) => {
            item.x += Math.ceil(this.xCount / 2)
            item.y += this.yCount
            return item
        })
        this.stateHolder.setState2(data)
    }

    haveInterval() {
        this.timer = setInterval(() => {
            this.display.drawRect(this.stateHolder.state)
            this.display1.drawRect(dataMap[this.randomList[0]])
            document.getElementById('area3').innerText = this.stateHolder.score
            if (this.stopTag) {
                this.stateHolder.state2Transfer('down')
            }
        }, 500)
    }

    firstStart() {
        this.randomState2()
        this.haveInterval()
    }

    set stopTag(value) {
        this.stateHolder.stopTag = value
        this._stopTag = value
    }

    get stopTag() {
        return this._stopTag
    }

    toggle() {
        if (!this.stopTag) {
            this.start()
        } else {
            this.stop()
        }
    }

    start() {
        this.stopTag = true
        this.haveInterval()
    }

    stop() {
        this.stopTag = false
        clearInterval(this.timer)
    }

    clear() {
        this.display = new Display({xCount: this.xCount, yCount: this.yCount})
        this.display1 = new Display({id: 'area2', xCount: 4, yCount: 4})
        this.stateHolder = new StateHolder({xCount: this.xCount, yCount: this.yCount})
        this.timer = null
        this.stopTag = true//true进行中 false暂停中

        this.stateHolder.setState2Listener(() => {
            this.randomState2()
        })

        this.stateHolder.addDeathListener(() => {
            this.stop()
            alert('失败了')
        })

        this.configController()
    }

    restart() {
        this.stop()
        this.clear()
        this.firstStart()
    }

}

class StateHolder {

    constructor({xCount = 20, yCount = 20} = {}) {
        this.score = 0
        this.deathHappen = []
        this.stopTag = true
        this.xCount = xCount
        this.yCount = yCount
        this.state1 = []
        for (let i = 0; i < this.xCount; i++) {
            this.state1.push({x: i, y: -1})
        }
        for (let i = 0; i < this.yCount; i++) {
            this.state1.push({x: -1, y: i})
            this.state1.push({x: this.xCount, y: i})
        }
        this.state2 = []
    }

    get state() {
        return this.state1.concat(this.state2)
    }

    setState2Listener(fun) {
        this.newState2Event = fun
    }

    addDeathListener(fun) {
        this.deathHappen.push(fun)
    }

    setState2(data) {
        this.state2 = data
    }

    checkDeath() {
        for (let item of this.state1) {
            if (item.y >= this.yCount) {
                return true
            }
        }
        return false
    }

    add() {
        this.state1 = this.state
        this.state2.length = 0
    }

    delete(arr) {
        for (let it of arr) {
            this.state1 = this.state1.filter(item => {
                return item.y !== it
            })
            let data = this.state1.filter(item => {
                return item.y > it
            })
            transferMap['down'](data)
            for (let i = 0; i < arr.length; i++) {
                arr[i] = arr[i] - 1
            }
        }
        this.score += arr.length
    }

    checkDelete() {//连成了一行
        let result = []

        for (let i = 0; i < this.yCount; i++) {
            let count = 0
            for (let item2 of this.state1) {
                if (i === item2.y) {
                    count++
                }
            }
            if (count === this.xCount + 2) {
                result.push(i)
            }
        }

        return result
    }

    checkState2Transfer() {//发生碰撞
        for (let item of this.state1) {
            if (Util.isIncludes(this.state2, item)) {
                return true
            }
        }
        return false
    }

    state2Transfer(name) {
        if (!this.stopTag) {
            return
        }
        let fun = transferMap[name]
        let temp = Util.copy(this.state2)
        fun(this.state2)
        if (this.checkState2Transfer()) {
            this.setState2(temp)
            if (name === 'down') {
                this.add()
                let deleteArr = this.checkDelete()
                console.log(deleteArr)
                if (deleteArr.length > 0) {
                    this.delete(deleteArr)
                }
                if (this.checkDeath()) {
                    for (let fun of this.deathHappen) {
                        fun()
                    }
                }
                this.newState2Event()
            }
        }
    }
}

class Display {

    constructor({id = 'area1', width = 10, height = width, xCount = 4, yCount = 4, color1 = 'pink', color2 = 'black'} = {}) {
        this.id = id
        this.width = width
        this.height = height
        this.xCount = xCount
        this.yCount = yCount
        this.color1 = color1
        this.color2 = color2
    }

    clearRect() {
        let dom = document.getElementById(this.id)
        dom.innerHTML = ''
    }

    drawRect(data) {
        this.clearRect()
        let borderWidth = 1
        let dom = document.getElementById(this.id)
        let domWidth = this.xCount * (this.width + borderWidth * 2)
        dom.style.width = `${domWidth}px`
        dom.style.display = 'flex'
        dom.style.flexWrap = 'wrap-reverse'

        for (let i = 0; i < this.yCount; i++) {
            for (let j = 0; j < this.xCount; j++) {
                if (Util.isIncludes(data, {x: j, y: i})) {
                    this.border = `${borderWidth}px solid ${this.color2}`
                } else {
                    this.border = `${borderWidth}px solid ${this.color1}`
                }
                let smallRect = this.createSmallRect()
                dom.appendChild(smallRect)
            }

        }
    }

    createSmallRect() {
        let smallRect = document.createElement('div')
        smallRect.style.width = this.width + 'px'
        smallRect.style.height = this.height + 'px'
        smallRect.style.border = this.border
        return smallRect
    }
}

class Point {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    equals(that) {
        return this.x === that.x && this.y === that.y
    }
}

class Util {
    static isIncludes(data, that) {
        for (let item of data) {
            if (Point.prototype.equals.call(item, that)) {
                return true
            }
        }
        return false
    }

    static copy(obj) {
        return JSON.parse(JSON.stringify(obj))
    }
}

let transferMap = {
    down: function (data) {
        data.forEach((item) => {
            item.y -= 1
        })
    },
    left: function (data) {
        data.forEach((item) => {
            item.x -= 1
        })
    },
    right: function (data) {
        data.forEach((item) => {
            item.x += 1
        })
    },
    rotate: function (data) {
        let center
        let totalPoint = data.reduce((total, item) => {
            total.x += item.x
            total.y += item.y
            return total
        }, {x: 0, y: 0})
        center = {
            x: totalPoint.x / data.length,
            y: totalPoint.y / data.length
        }

        data.forEach((item) => {
            let temp = Util.copy(item)
            item.x = Math.floor(Math.ceil(temp.y - center.y) + center.x)
            item.y = Math.floor(Math.ceil(-(temp.x - center.x)) + center.y)
        })
    },
}

let dataMap = [
    [{x: 0, y: 0}, {x: 0, y: 1}, {x: 0, y: 2}, {x: 0, y: 3}],

    [{x: 0, y: 0}, {x: 1, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}],

    [{x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 1, y: 1}],

    [{x: 1, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}, {x: 0, y: 2}],
    [{x: 0, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}, {x: 1, y: 2}],

    [{x: 0, y: 0}, {x: 1, y: 0}, {x: 0, y: 1}, {x: 0, y: 2}],
    [{x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 1}, {x: 1, y: 2}],

]

let [UP, DOWN, LEFT, RIGHT] = ['38', '40', '37', '39']
let orderMap = {}

