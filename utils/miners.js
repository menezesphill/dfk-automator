const { GraphQLClient, gql } = require('graphql-request')

const getMiners = async () => {
  const url = 'https://defi-kingdoms-community-api-gateway-co06z8vi.uc.gateway.dev/graphql'
  const query = gql`{
    heroes(
      first: 100, 
      orderBy: mining, 
      orderDirection: desc, 
      where: {
        owner: "0x2B57a6d9c5aC697d6BCDCB28ADB2e660640e0bc5",
        profession: "mining"
      })
    {
      id
      mining
    }
  }`

  const client = new GraphQLClient(url)
  // write data to a file
  client.request(query).then((data) => {
    const fs = require('fs')
    fs.writeFile('./data/miners.json', JSON.stringify(data), (err) => {
      if (err) throw err
      console.log('Miners list written to file at ./data/miners.json')
    })
  })
}

module.exports = getMiners