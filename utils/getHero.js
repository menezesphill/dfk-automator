const { GraphQLClient, gql } = require('graphql-request')


const getHero = async (id) => {
const url = 'https://defi-kingdoms-community-api-gateway-co06z8vi.uc.gateway.dev/graphql'
const query = gql`
  query getHero($heroId: ID!){
    hero(id: $heroId) {
      id
      mainClass
      owner {
        id
        name
      }
    }
  }`
const variables = {heroId: id}

const client = new GraphQLClient(url)
const data = await client.request(query, variables)
return data
}

module.exports = getHero