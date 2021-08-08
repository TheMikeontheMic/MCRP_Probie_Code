//Server side

mp.events.add('updatePlayerRotation', (player, lastRot) => {
    player.heading = lastRot.z;
});