# A script that runs 'getter.js' then 'sorter.js'
# to prepare the groups for the next step

# Run the getter script only if the ./data/gardeeners.json nor ./data/miners.json file does not exist
if [ ! -f ./data/gardeners.json ] || [ ! -f ./data/miners.json ]; then
  node ./utils/getter.js
fi

# Run the sorter script only
node ./utils/sorter.js

