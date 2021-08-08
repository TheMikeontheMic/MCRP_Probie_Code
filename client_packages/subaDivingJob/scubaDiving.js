//Client side varibles

let scubaGearPos = new mp.Vector3(-1666, -979, 8);
let goldHorder = new mp.Vector3(-1668, -995, 8);
let treasureCollected = 0;
let scubaGearOn = false;
let origianlOxygen = mp.game.invoke('0xA1FCF8E6AF40B731', mp.players.local)
let collecting = false;
let activeTreasureLocations = [];
let indexOfCurrentTreasure = 0;

//Gear marker

mp.markers.new(35, scubaGearPos, 2.1, {
    color: [255, 255, 0, 150],
    visible: true,
    dimension: 0,
});

//Gold Horder Marker

mp.markers.new(29, goldHorder, 2.1, {
    color: [255, 255, 0, 150],
    visible: true,
    dimension: 0,
});

//Interact distance from player to start the job:

let calcDistanceBetweenTwoVectors = (pos1, pos2) => {
    let newPos = new mp.Vector3((pos1.x - pos2.x), (pos1.y - pos2.y), (pos1.z - pos2.z));
    return Math.sqrt((newPos.x * newPos.x) + (newPos.y * newPos.y) + (newPos.z * newPos.z));
};

let treasureLocationBetweenTwoVectors = (playerPos) => {
    for (let locations of activeTreasureLocations) {
        if (calcDistanceBetweenTwoVectors(locations.coord, playerPos) <= locations.range) {
            return locations;
        }
    }
    return false;
};

mp.keys.bind(0x59, true, function () {
    const player = mp.players.local;
    const playerPos = player.position;
    if (calcDistanceBetweenTwoVectors(scubaGearPos, playerPos) <= 2) {

        mp.events.callRemote('scubaDivingJob');

        //This here is a mock up of having having the scuba gear on
        if (scubaGearOn === false) {
            scubaGearOn = true;
            mp.game.invoke('0x6BA428C528D9E522', mp.players.local.handle, mp.game.invoke('0xA1FCF8E6AF40B731', mp.players.local) + 95000000);
            mp.game.invoke('0xF99F62004024D506', mp.players.local.handle, true);
            mp.events.callRemote('scubaGear');

        } else if (scubaGearOn === true) {
            scubaGearOn = false;
            mp.game.invoke('0x6BA428C528D9E522', mp.players.local.handle, origianlOxygen);
            mp.game.invoke('0xF99F62004024D506', mp.players.local.handle, false);
        }
    } else if (scubaGearOn && treasureLocationBetweenTwoVectors(playerPos)) {

        mp.events.callRemote('startAnimation', 'amb@world_human_welding@male@idle_a', 'idle_a');
        collecting = true;

        setTimeout(() => {
            mp.events.callRemote('endAnimation');
            indexOfCurrentTreasure = treasureLocationBetweenTwoVectors(playerPos);
            mp.events.callRemote('removeActiveLocation', indexOfCurrentTreasure.id);
            collecting = false;
            mp.gui.chat.push(`You have collected treasure`);
            treasureCollected++;
            activeTreasureLocations.splice(indexOfCurrentTreasure, 1, null);
        }, 5000);
    } else if (calcDistanceBetweenTwoVectors(goldHorder, playerPos) <= 10) {
        mp.events.callRemote('sellTreasure', treasureCollected);
        mp.gui.chat.push(`You have sold your treasures.`);
        treasureCollected = 0;
    }
});

mp.events.add('render', () => {

    if (collecting === true) {
        mp.game.graphics.drawText("Collecting treasure", [0.5, 0.900], {
            font: 7,
            color: [255, 255, 255, 185],
            scale: [1.2, 1.2],
            outline: true
        });
    }
});

mp.events.add('updateActiveTreasureLocations', (treasureLocations) => {
    treasureLocations = JSON.parse(treasureLocations);
    activeTreasureLocations = treasureLocations;
});

mp.events.add('updateActiveTreasureLocations', (treasureLocations) => {
    treasureLocations = JSON.parse(treasureLocations);
    activeTreasureLocations = treasureLocations;
});