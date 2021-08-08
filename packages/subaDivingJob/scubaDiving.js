//Server side.

//Global treasure Locations

let locationRefreshRate = 300000;

let treasureLocations = [{
        'id': 1,
        'coord': new mp.Vector3(-1707, -995, 6),
        'range': 6
    }, //PRODUCTION: -1967, -1130, -12,  TESTING: -1707, -993, 6 Barrel
    {   
        'id': 2,
        'coord': new mp.Vector3(-1743, -964, 8),
        'range': 5
    }, //PRODUCTION: -2839, -440, -31,  TESTING: -1706, -950, 8 Fence
    {   
        'id': 3,
        'coord': new mp.Vector3(-1706, -949, 6),
        'range': 8
    } //PRODUCTION: -3547, 648, -63,  TESTING: -1725, -980, 6 Lamp
]
let activeTreasureLocations = [];

//Active Locations

function refreshLocations() {
    activeTreasureLocations = [];
    for (let numberOfLocations = 0; numberOfLocations < 2; numberOfLocations++) {
        let randomIndex = Math.floor(Math.random() * treasureLocations.length);
        while (activeTreasureLocations.includes(treasureLocations[randomIndex])) {
            randomIndex = Math.floor(Math.random() * treasureLocations.length);
        }
        activeTreasureLocations.push(treasureLocations[randomIndex]);
    }
    mp.players.forEach(player => {
        player.call('updateActiveTreasureLocations', [JSON.stringify(activeTreasureLocations)]);
    });
    console.log(`The server has updated the Treasure Locations they are now ${JSON.stringify(activeTreasureLocations)}`);
}

refreshLocations();

setInterval(() => {
    refreshLocations();
}, locationRefreshRate);


//idk figure it out later

mp.events.add('scubaDivingJob', (player) => {
    if (!player.customData || !player.customData.job) {

        player.customData.job = "scuba";
        player.outputChatBox(`${player.name} has started the Scuba job.`);
        console.log(`${player.name} signed up for Scuba job.`);

    } else if (player.customData && player.customData.job) {

        player.customData = {
            job: null
        };

        player.outputChatBox(`${player.name} has quit the Scuba job.`);
        console.log(`${player.name} has quit the Scuba job.`);

    }
});

mp.events.add('scubaGear', (player) => {

    player.setClothes(4, 16, 0, 0);
    player.setClothes(8, 57, 0, 0);
    player.setClothes(11, 15, 0, 0);
    player.setClothes(3, 15, 0, 0);
    player.setClothes(6, 67, 0, 0);
    player.setClothes(1, 166, 0, 0);

});

mp.events.add('sellTreasure', (player, treasureCollected) => {
    let treasurePrice = 2500;
    console.log(treasureCollected);
    player.customData.payStub += treasurePrice * treasureCollected;
    console.log(`${player.name} now has ${player.customData.payStub} in their cheque`);
});

mp.events.add('startAnimation', (player, animdict, name) => {

    player.playAnimation(animdict, name, 1, 6)

});

mp.events.add('endAnimation', (player) => {

    player.stopAnimation();
});

mp.events.add('playerJoin', (player) => {
    player.call('updateActiveTreasureLocations', [JSON.stringify(activeTreasureLocations)]);
});

mp.events.add('removeActiveLocation', (player, indexOfCurrentTreasure) => {
    const indexOfValue = activeTreasureLocations.findIndex((s) => s.id == indexOfCurrentTreasure);
    delete activeTreasureLocations[indexOfValue];
    activeTreasureLocations.splice(indexOfValue, 1);

    mp.players.forEach(player => {
        player.call('updateActiveTreasureLocations', [JSON.stringify(activeTreasureLocations)]);
    });

    console.log(`${player.name} has collected a treasure, current locations are ${JSON.stringify(activeTreasureLocations)}`);

});