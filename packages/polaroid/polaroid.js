//Server Side

mp.events.add('updatePlayerRotation2', (player) => {
    player.setVariable('heading', player.heading);
});