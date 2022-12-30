// Call getGardeners from garneders.js and getMiners from miners.js and save in a local variable
const getGardeners = require('./gardeners')
const getMiners = require('./miners')

// Call getGardeners and getMiners and save in a local variable
const getHeroes = async () => {
getGardeners()
getMiners()
}

getHeroes()




