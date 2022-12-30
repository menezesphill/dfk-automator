// Read Heroes from JSON files at ./data/gardeners.json and ./data/miners.json
// Sort Heroes by 'gardening' and 'mining' level
// Then group gardeners in groups of 2 with higher 'gardening' level paired with lower 'gardening' level
// Then group miners in groups of 5 or 6 with higher 'mining' level paired with lower 'mining' level

const gardeners = require('../data/gardeners.json')
const miners = require('../data/miners.json')

// pair gardeners with higher gardening level with lower gardening level

const sortedGardeners = gardeners.heroes.sort((a, b) => b.gardening - a.gardening)

// pair miners with higher mining level with lower mining level

const sortedMiners = miners.heroes.sort((a, b) => b.mining - a.mining)

// randomize order of sortedMiners and sortedGardeners

const groupedGardeners = []
for (let i = 0; i < (sortedGardeners.length/2); i += 1) {
    groupedGardeners.push({
        group: i + 1,
        gardeners: [
            sortedGardeners[i],
            sortedGardeners[i + sortedGardeners.length/2]
        ]
    })
    }

const groupedMiners = []
for (let i = 0; i < (sortedMiners.length/6); i += 1) {
    groupedMiners.push({
        group: i + 1,
        miners: [
            sortedMiners[i],
            sortedMiners[i + Math.ceil(sortedMiners.length/6)],
            sortedMiners[i + 2 * (Math.ceil(sortedMiners.length/6))],
            sortedMiners[i + 3 * (Math.ceil(sortedMiners.length/6))],
            sortedMiners[i + 4 * (Math.ceil(sortedMiners.length/6))],
            sortedMiners[i + 5 * (Math.ceil(sortedMiners.length/6))]
        ]       
    })
}

// write grouped gardeners and miners to JSON files at ./data/groupedGardeners.json and ./data/groupedMiners.json

const fs = require('fs')

// remove all null values from groupedGardeners and groupedMiners

const formatedGardeners = groupedGardeners.forEach(group => {
    group.gardeners = group.gardeners.filter(gardener => gardener !== null)
})

const formatedMiners = groupedMiners.forEach(group => {
    group.miners = group.miners.filter(miner => miner !== null)
})


fs.writeFileSync('./data/groupedGardeners.json', JSON.stringify(groupedGardeners, null, 2))
fs.writeFileSync('./data/groupedMiners.json', JSON.stringify(groupedMiners, null, 2))





