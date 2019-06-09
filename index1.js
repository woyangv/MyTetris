// 每两秒发送一批任务
function taskHolder() {
    let taskArr = []
    let timer

    function addTask(value) {
        taskArr.push(value)
    }

    function handTaskArr() {
        while (taskArr.length !== 0) {
            let value = taskArr.shift()
            doTask(value)
        }
    }

    function doTask(value) {
        console.log(value)
    }

    return function (value) {
        addTask(value)
        if(!timer){
            timer = setTimeout(() => {
                handTaskArr()
                clearTimeout(timer)
                timer = undefined
                console.log('---------------------------')
            }, 2000)
        }
    }
}

let addValue = taskHolder()
