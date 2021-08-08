//client side

//testing varibles

mp.gui.chat.push(`Bino script loaded`);
let camera;

const _handle = mp.game.graphics.requestScaleformMovie('BINOCULARS');
let taskCompleted = false;


//Camera Controls Config
let b = 0x42; //Activate the binos;

let axisXModifer = 0;
let axisYModifer = 0;
let axisZModifer = 1;
let fovModifer = 30;

//Mouse control varibles
const mouseSensitivity = 2.5;
const zoomSpeed = 1.5;
const minZoom = 5.0;
const maxZoom = 60.0;


let hasBinosDeployed = true;
let binocularsActive = false
let camRot;
const player = mp.players.local;



mp.events.add('render', () => {
    let x = (mp.game.controls.getDisabledControlNormal(7, 1) * mouseSensitivity);
    let y = (mp.game.controls.getDisabledControlNormal(7, 2) * mouseSensitivity);

    let zoomIn = (mp.game.controls.getDisabledControlNormal(2, 40) * zoomSpeed);
    let zoomOut = (mp.game.controls.getDisabledControlNormal(2, 41) * zoomSpeed);
    if (binocularsActive) {
        mp.game.controls.disableAllControlActions(2);
        mp.game.ui.displayRadar(false);

        if (!player.isUsingScenario("WORLD_HUMAN_BINOCULARS")) {
            player.taskStartScenarioInPlace("WORLD_HUMAN_BINOCULARS", 0, true);
            mp.game.wait(500);
        }

        const graphics = mp.game.graphics;
        graphics.drawScaleformMovieFullscreen(_handle, 255, 255, 255, 255, false);

        camera.setActive(true);
        mp.game.cam.renderScriptCams(true, false, 0, true, false);

        camRot = new mp.Vector3(camRot.x - y, 0, camRot.z - x);

        if (camRot.x <= 30 && camRot.x >= -40) {
            camera.setRot(camRot.x, camRot.y, camRot.z, 2);
        } else if (camRot.x < 30) {
            camRot.x = -30;
        } else if (camRot.x > -40) {
            camRot.x = 30;
        }


        if (zoomIn > 0) {
            let currentFov = camera.getFov();
            currentFov -= zoomIn;
            if (currentFov < minZoom)
                currentFov = minZoom;
            camera.setFov(currentFov);
        } else if (zoomOut > 0) {
            let currentFov = camera.getFov();
            currentFov += zoomOut;
            if (currentFov > maxZoom)
                currentFov = maxZoom;
            camera.setFov(currentFov);
        }

    } else if (camera) {
        let lastRot = camera.getRot(2);
        camera.setActive(false);
        mp.game.cam.renderScriptCams(false, false, 0, true, false);
        camera = null;
        player.clearTasks();
        mp.game.ui.displayRadar(true);
        mp.events.callRemote("updatePlayerRotation", lastRot);
        player.setRotation(camRot.x, camRot.y, camRot.z, 0, true);
    }
});

mp.keys.bind(b, true, function () {

    const graphics = mp.game.graphics;
    const playerPos = player.position;

    if (!mp.game.graphics.hasScaleformMovieLoaded(_handle) && !taskCompleted) {
        graphics.pushScaleformMovieFunction(_handle, 'SET_CAM_LOGO');
        graphics.pushScaleformMovieFunctionParameterInt(0);

        graphics.popScaleformMovieFunctionVoid();
        taskCompleted = true;
    }

    camRot = mp.game.cam.getGameplayCamRot(2);
    camera = mp.cameras.new('peekThrough', new mp.Vector3(playerPos.x + axisXModifer, playerPos.y + axisYModifer, playerPos.z + axisZModifer), camRot, fovModifer);
    binocularsActive = !binocularsActive;
});