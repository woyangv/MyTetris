class Index {
    constructor() {
        this.clear()
    }

    configController() {
        orderMap[UP] = () => {
            this.stateHolder.setState2(this.stateHolder.transfer(this.stateHolder.state2, 'rotate'))
            let state = this.stateHolder.state1.concat(this.stateHolder.state2)
            this.display.drawRect(state)
        }
        orderMap[DOWN] = () => {
            this.stateHolder.setState2(this.stateHolder.transfer(this.stateHolder.state2, 'down'))
            let state = this.stateHolder.state1.concat(this.stateHolder.state2)
            this.display.drawRect(state)
        }
        orderMap[LEFT] = () => {
            this.stateHolder.setState2(this.stateHolder.transfer(this.stateHolder.state2, 'left'))
            let state = this.stateHolder.state1.concat(this.stateHolder.state2)
            this.display.drawRect(state)
        }
        orderMap[RIGHT] = () => {
            this.stateHolder.setState2(this.stateHolder.transfer(this.stateHolder.state2, 'right'))
            let state = this.stateHolder.state1.concat(this.stateHolder.state2)
            this.display.drawRect(state)
        }

        document.onkeydown = function (event) {
            var e = event
            if (e && orderMap[e.keyCode]) {
                orderMap[e.keyCode]()
            }
        }
    }

    randomState2() {
        let index = Math.floor(Math.random() * dataMap.length)
        let data = Util.copy(dataMap[index])
        data = data.map((item) => {
            item.x += 10
            item.y += 20
            return item
        })
        let state1 = Util.copy(this.stateHolder.state1)
        this.clear()
        this.stateHolder.setState2(data)
        this.stateHolder.setState1(state1)
    }

    haveInterval() {
        this.timer = setInterval(() => {
            let state = this.stateHolder.state1.concat(this.stateHolder.state2)
            console.log('111', state)
            this.display.drawRect(state)
            if (!this.stopTag) {
                this.stateHolder.setState2(this.stateHolder.transfer(this.stateHolder.state2, 'down'))
            }
        }, 2000)
    }

    start() {
        this.randomState2()
        this.haveInterval()
    }

    stop() {
        this.stopTag = false
        clearInterval(this.timer)
    }

    clear() {
        this.display = new Display({xCount: 20, yCount: 20})
        this.stateHolder = new StateHolder()
        this.timer = null
        this.stopTag = false

        this.stateHolder.setListener(() => {
            this.randomState2()
        })

        this.configController()
    }

    restart() {
        this.clear()
        this.start()
    }

    success() {

    }

    fail() {

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

class StateHolder {

    constructor({state1 = [], state2 = [], width = 20} = {}) {
        this.state1 = state1
        this.state2 = state2
        this.width = width
    }

    setListener(fun) {
        this.newState2Event = fun
    }

    setState1(data) {
        this.state1 = data
    }

    setState2(data) {
        this.state2 = data
    }

    state1TopBorder() {
        let result = []
        let temp = Util.copy(this.state1)
        let flag = false
        for (let item of temp) {
            for (let i = 0; i < result.length; i++) {
                let it = result[i]
                if (it.x === item.x) {
                    flag = true
                    if (it.y < item.y) {
                        result[i] = item
                    }
                }
            }
            if (!flag) {
                result.push(item)
            }
        }
        return result
    }

    state2BottomBorder() {
        let result = []
        let temp = Util.copy(this.state2)
        let flag = false
        for (let item of temp) {
            for (let i = 0; i < result.length; i++) {
                let it = result[i]
                if (it.x === item.x) {
                    flag = true
                    if (it.y > item.y) {
                        result[i] = item
                    }
                }
            }
            if (!flag) {
                result.push(item)
            }
        }
        return result
    }

    add() {
        this.state1 = this.state1.concat(this.state2)
    }

    delete(data) {
        this.transfer(this.state1, 'down')
    }

    touchAdd() {
        let state1TopData = this.state1TopBorder()
        let state2BottomData = this.state2BottomBorder()
        for (let i = 0; i < this.width; i++) {
            state1TopData.push({x: i, y: -1})
        }
        for (let state2Item of state2BottomData) {
            for (let state1Item of state1TopData) {
                let temp = Util.copy(state1Item)
                temp.y += 1
                if (Point.prototype.equals.call(state2Item, temp)) {
                    // 发生了
                    this.add()
                    this.newState2Event()
                    return
                }
            }
        }
    }

    touchDelete() {

    }

    transfer(data, name) {
        let fun = transferMap[name]
        let result = fun(data)
        this.touchAdd()
        return result
    }
}

let transferMap = {
    down: function (data) {
        return data.map((item) => {
            item = Util.copy(item)
            item.y -= 1
            return item
        })
    },
    left: function (data) {
        return data.map((item) => {
            item = Util.copy(item)
            item.x -= 1
            return item
        })
    },
    right: function (data) {
        return data.map((item) => {
            item = Util.copy(item)
            item.x += 1
            return item
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

        return data.map((item) => {
            let temp = Util.copy(item)
            let temp1 = Util.copy(item)
            temp.x = Math.floor(Math.ceil(temp1.y - center.y) + center.x)
            temp.y = Math.floor(Math.ceil(-(temp1.x - center.x)) + center.y)
            return temp
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
        let area1 = document.getElementById(this.id)
        area1.innerHTML = ''
    }

    drawRect(data) {
        this.clearRect()
        let borderWidth = 1
        let area1 = document.getElementById(this.id)
        let area1Width = this.xCount * (this.width + borderWidth * 2)
        area1.style.width = `${area1Width}px`
        area1.style.display = 'flex'
        area1.style.flexWrap = 'wrap-reverse'

        for (let i = 0; i < this.yCount; i++) {
            for (let j = 0; j < this.xCount; j++) {
                if (Util.isIncludes(data, {x: j, y: i})) {
                    this.border = `${borderWidth}px solid ${this.color2}`
                } else {
                    this.border = `${borderWidth}px solid ${this.color1}`
                }
                let smallRect = this.createSmallRect()
                area1.appendChild(smallRect)
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
