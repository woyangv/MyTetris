function proxy() {
    let cache = {}

    function generateKey() {
        let args = Array.prototype.slice.call(arguments, 0)
        let argsKey = args.join(' ')
        return argsKey
    }

    function check(key) {
        return cache.hasOwnProperty(key)
    }

    function addCache(key, value) {
        cache[key] = value
    }

    function multiplication(key) {
        let args = key.split(' ')
        let result = 1
        while (args.length !== 0) {
            result *= args.shift()
        }
        addCache(key, result)
        return result
    }

    function fromCache(key) {
        return cache[key]
    }

    return function compute() {
        let result
        let key = generateKey(...arguments)
        let flag = check(key)
        if (flag) {
            result = fromCache(key)
        } else {
            result = multiplication(key)
        }

        return result
    }
}

let holder = proxy()
console.log(holder(1, 2, 3))
console.log(holder(1, 2, 3))