const { ethers } = require("ethers");
const fs = require("fs");
const readline = require("readline");

const provider = new ethers.providers.JsonRpcProvider("https://klaytn.rpc.defikingdoms.com/")
const abi = require('./abi/QuestCoreV2.2.json')

const contractAddress = "0x8dc58d6327E1f65b18B82EDFb01A361f3AAEf624"
const JADE_MINING_ADDR = "0x20B274262FA6da57B5Ff90498EC373c0266eF901"
const JEWEL_USDT_GARDEN_ADDR = "0x0831f733870e847263907F32B3367De2f47CeAf0"
const QuestCoreV2 = new ethers.Contract(contractAddress, abi, provider)
let wallet;


const main = async () => {

    QuestCoreV2.getAccountActiveQuests("0x2B57a6d9c5aC697d6BCDCB28ADB2e660640e0bc5").then((result) => {
        let quest;
        let timer;
        // check if results has an element 'questAddress' with value JADE_MINING_ADDR
        // if yes print 'Jade Mining Quest is active'
        // if no print 'Jade Mining Quest is not active'
        if (result.some((quest) => quest.questAddress === JADE_MINING_ADDR)) {
            quest = result.find((quest) => quest.questAddress === JADE_MINING_ADDR)
            timer = ((quest.completeAtTime.toNumber() - Date.now() / 1000) / 60).toFixed(2)
            if (parseInt(timer) < 0) {
                console.log(`[${(new Date(Date.now())).toGMTString()}] Jade Mining Quest ended ${parseInt(timer) * (-1)} minutes ago`)
                completeQuest(quest.heroes[0], wallet)
            } else if (parseInt(timer) > 0) {
                console.log(`[${(new Date(Date.now())).toGMTString()}] Jade Mining Quest: Active and ending in ${timer} minutes`)
            }
        } else {
            console.log(`[${(new Date(Date.now())).toGMTString()}] Jade Mining Quest: Jade Mining Quest is not active`)
            findMiners().then(
                (miners) => {
                    if(miners === null) {
                        console.log(`[${(new Date(Date.now())).toGMTString()}] Jade Mining Quest: No miners ready to start a quest`)
                        return
                    }
                    startQuest('Jade Mining', JADE_MINING_ADDR, wallet, 15, miners)
                }
            )
        }

        if (result.some((quest) => quest.questAddress === JEWEL_USDT_GARDEN_ADDR)) {
            quest = result.find((quest) => quest.questAddress === JEWEL_USDT_GARDEN_ADDR)
            timer = ((quest.completeAtTime.toNumber() - Date.now() / 1000) / 60).toFixed(2)
            if (parseInt(timer) < 0) {
                console.log(`[${(new Date(Date.now())).toGMTString()}] Klaytn Garden Quest ended ${parseInt(timer) * (-1)} minutes ago`)
                completeQuest(quest.heroes[0], wallet)
            } else if (parseInt(timer) > 0) {
                console.log(`[${(new Date(Date.now())).toGMTString()}] Klaytn Garden Quest: Active and ending in ${timer} minutes`)
            }
        } else {
            console.log(`[${(new Date(Date.now())).toGMTString()}] Klaytn Garden Quest: Jewel USDT Garden Quest is not active`)
            findGardeners().then(
                (gardeners) => {
                    if(gardeners === null) {
                        console.log(`[${(new Date(Date.now())).toGMTString()}] Klaytn Garden Quest: No gardeners ready to start a quest`)
                        return
                    }
                    startQuest('Klaytn Garden', JEWEL_USDT_GARDEN_ADDR, wallet, 20, gardeners)
                }
            )
        }
    })
}


const findMiners = async () => {
    const groupedMiners = require('./data/groupedMiners.json')

    groupedMiners.forEach((heroes, index) => {
        if (heroes.miners.includes(null)) {
            heroes.miners.splice(heroes.miners.indexOf(null))
        }
    })

    const minersStamina = []
    for (let i = 0; i < groupedMiners.length; i += 1) {
        const miners = groupedMiners[i].miners
        const staminas = [
            miners[0] ? await QuestCoreV2.getCurrentStamina(miners[0].id) : null,
            miners[1] ? await QuestCoreV2.getCurrentStamina(miners[1].id) : null,
            miners[2] ? await QuestCoreV2.getCurrentStamina(miners[2].id) : null,
            miners[3] ? await QuestCoreV2.getCurrentStamina(miners[3].id) : null,
            miners[4] ? await QuestCoreV2.getCurrentStamina(miners[4].id) : null,
            miners[5] ? await QuestCoreV2.getCurrentStamina(miners[5].id) : null
        ]

        minersStamina.push({
            group: i + 1,
            stamina: [
                staminas[0]?.toNumber(),
                staminas[1]?.toNumber(),
                staminas[2]?.toNumber(),
                staminas[3]?.toNumber(),
                staminas[4]?.toNumber(),
                staminas[5]?.toNumber()
            ]
        })
    }

    minersStamina.forEach((staminas, index) => {
        if (staminas.stamina.includes(undefined)) {
            staminas.stamina.splice(staminas.stamina.indexOf(undefined))
        }
    })

    for (let i = 0; i < minersStamina.length; i += 1) {
        const group = minersStamina[i]
        console.log(`[${(new Date(Date.now())).toGMTString()}] Miners #${group.group}: ${group.stamina[0] ? group.stamina[0] : '--'} / ${group.stamina[1] ? group.stamina[1] : '--'} / ${group.stamina[2] ? group.stamina[2] : '--'} / ${group.stamina[3] ? group.stamina[3] : '--'} / ${group.stamina[4] ? group.stamina[4] : '--'} / ${group.stamina[5] ? group.stamina[5] : '--'}`)
    }

    const readiness = readyGroups(minersStamina, 15)
    const average = averageStamina(minersStamina)

    console.log(`[${(new Date(Date.now())).toGMTString()}] Ready Mining Groups: ${readiness}`)
    console.log(`[${(new Date(Date.now())).toGMTString()}] Average Mining Stamina: ${average}`)

    const higherStaminaIndex = average.indexOf(Math.max(...average))

    const teamIds = groupedMiners[higherStaminaIndex].miners.map((miner) => {
        return miner.id
    })


    return readiness[higherStaminaIndex] ? teamIds : null
}

const findGardeners = async () => {
    const groupedGardeners = require('./data/groupedGardeners.json')

    groupedGardeners.forEach((heroes, index) => {
        if (heroes.gardeners.includes(null)) {
            heroes.gardeners.splice(heroes.gardeners.indexOf(null))
        }
    })

    const gardenersStamina = []
    for (let i = 0; i < groupedGardeners.length; i += 1) {
        const gardeners = groupedGardeners[i].gardeners
        const staminas = [
            gardeners[0] ? await QuestCoreV2.getCurrentStamina(gardeners[0].id) : null,
            gardeners[1] ? await QuestCoreV2.getCurrentStamina(gardeners[1].id) : null
        ]
        gardenersStamina.push({
            group: i + 1,
            stamina: [
                staminas[0]?.toNumber(),
                staminas[1]?.toNumber()
            ]
        })
    }

    gardenersStamina.forEach((staminas, index) => {
        if (staminas.stamina.includes(undefined)) {
            staminas.stamina.splice(staminas.stamina.indexOf(undefined))
        }
    })

    for (let i = 0; i < gardenersStamina.length; i += 1) {
        const group = gardenersStamina[i]
        console.log(`[${(new Date(Date.now())).toGMTString()}] Garneders #${group.group} : ${group.stamina[0] ? group.stamina[0] : '--'} / ${group.stamina[1] ? group.stamina[1] : '--'}`)
    }

    const readiness = readyGroups(gardenersStamina, 20)
    const average = averageStamina(gardenersStamina)

    console.log(`[${(new Date(Date.now())).toGMTString()}] Ready Gardening Groups: ${readiness}`)
    console.log(`[${(new Date(Date.now())).toGMTString()}] Average Gardening Stamina: ${average}`)

    const higherStaminaIndex = average.indexOf(Math.max(...average))

    const teamIds = groupedGardeners[higherStaminaIndex].gardeners.map((gardener) => {
        return gardener.id
    })

    return readiness[higherStaminaIndex] ? teamIds : null
}

const readyGroups = (groupStamina, requiredStamina) => {
    // should check if each group in groupStamina has enough requiredStamina to run the quest	
    const readyGroups = groupStamina.map((group) => {
        return (group.stamina.filter((stamina) => stamina >= requiredStamina).length >= group.stamina.length ? true : false)
    })

    return readyGroups
}

const averageStamina = (groupStamina) => {
    // calculate average stamina of each group
    const averageStamina = groupStamina.map((group) => {
        return group.stamina.reduce((a, b) => a + b, 0) / group.stamina.length
    })

    return averageStamina
}

const getEncryptedWallet = async () => {
    console.log(`[${(new Date(Date.now())).toGMTString()}] Hi. You need to enter the password you chose previously.`);
    let pw = await promptForInput(`[${(new Date(Date.now())).toGMTString()}] Enter your password: `, "password");

    try {
        let encryptedWallet = fs.readFileSync(
            "./w.json",
            "utf8"
        );
        let decryptedWallet = ethers.Wallet.fromEncryptedJsonSync(
            encryptedWallet,
            pw
        );
        return decryptedWallet.connect(provider);
    } catch (err) {
        throw new Error(
            `[${(new Date(Date.now())).toGMTString()}] Unable to read your encrypted wallet. Try again, making sure you provide the correct password. If you have forgotten your password, delete the file "w.json" and run the application again.`
        );
    }
}

const createWallet = async () => {
    console.log(`[${(new Date(Date.now())).toGMTString()}] Hi. You have not yet encrypted your private key.`);
    let pw = await promptForInput(
        `[${(new Date(Date.now())).toGMTString()}] Choose a password for encrypting your private key, and enter it here: `,
        "password"
    );
    let pk = await promptForInput(
        `[${(new Date(Date.now())).toGMTString()}] Now enter your private key: `,
        "private key"
    );

    try {
        let newWallet = new ethers.Wallet(pk, provider);
        let enc = await newWallet.encrypt(pw);
        fs.writeFileSync("./w.json", enc);
        return newWallet;
    } catch (err) {
        throw new Error(
            `[${(new Date(Date.now())).toGMTString()}] Unable to create your wallet. Try again, making sure you provide a valid private key.`
        );
    }
}

const promptForInput = async (prompt, promptFor) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    try {
        let input = await new Promise((resolve, reject) => {
            rl.question(prompt, (answer) => {
                resolve(answer)
            })
        })
        if (!input) {
            throw new Error(
                `[${(new Date(Date.now())).toGMTString()}] No ${promptFor} provided. Try running the application again, and provide a ${promptFor}.`
            )
        }
        return input
    } finally {
        rl.close()
    }
}

const startQuest = async (quest, questAddr, wallet, attempts, questingGroup) => {
    try {
        console.log(`[${(new Date(Date.now())).toGMTString()}] Starting quest ${quest}`);
        await tryTransaction(
            () =>
                QuestCoreV2
                    .connect(wallet)
                    .startQuest(
                        questingGroup,
                        questAddr,
                        attempts,
                        0,
                        { gasPrice: 30000000000, gasLimit: 5000000 }
                    ),
            2
        );
        console.log(`[${(new Date(Date.now())).toGMTString()}] Started quest ${quest}`);
    } catch (err) {
        console.warn(
            `[${(new Date(Date.now())).toGMTString()}] Error starting quest ${quest} - this will be retried next polling interval`
        );
    }
}

const completeQuest = async (heroId, wallet) => {
    try {
        console.log(`[${(new Date(Date.now())).toGMTString()}] Completing quest led by hero ${heroId}`);

        await tryTransaction(
            () =>
                QuestCoreV2
                    .connect(wallet)
                    .completeQuest(heroId, { gasPrice: 30000000000, gasLimit: 5000000 }),
            2
        );

        console.log(`[${(new Date(Date.now())).toGMTString()}] Completed quest led by hero ${heroId}`);

    } catch (err) {
        console.warn(
            `[${(new Date(Date.now())).toGMTString()}] Error completing quest for heroId ${heroId} - this will be retried next polling interval`
        );
    }
}

const tryTransaction = async (transaction, attempts) => {
    for (let i = 0; i < attempts; i++) {
        try {
            var tx = await transaction();
            let receipt = await tx.wait();
            if (receipt.status !== 1)
                throw new Error(`[${(new Date(Date.now())).toGMTString()}] Receipt had a status of ${receipt.status}`);
            return receipt;
        } catch (err) {
            if (i === attempts - 1) throw err;
        }
    }
}

const login = async () => {
    wallet = fs.existsSync("./w.json")
    ? await getEncryptedWallet()
    : await createWallet();
}

login().then( 
    setInterval(main, 1000 * 60 * 1)
)


