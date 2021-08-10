//client side

//testing varibles

mp.gui.chat.push(`Pola script loaded`);
let camera;

const _handle = mp.game.graphics.requestScaleformMovie('CAMERA_SHUTTER');
let taskCompleted = false;


//Camera Controls Config
let o = 0x4F; //Activate the Pola
let space = 0x20; //Take screenshot
let tab = 0x09; //Selfie Camera

let axisXModifer = 0;
let axisYModifer = 0;
let axisZModifer = 1.0;
let fovModifer = 60;
let lastCamRot;
let isRagdoll;
let isJumping;


//Mouse control varibles
const mouseSensitivity = 2.5;
const zoomSpeed = 1.5;
const minZoom = 5.0;
const maxZoom = 60.0;

let hasPolaDeployed = true;
let PolaroidActive = false;
let selfieCamera = false;
let selfieCamRotZ;
let camRot;
const player = mp.players.local;
let phoneObject = mp.objects.new(413312110, player.position, {
    dimension: 0
});

phoneObject.setVisible(false, false);



mp.events.add('render', () => {
    let x = (mp.game.controls.getDisabledControlNormal(7, 1) * mouseSensitivity);
    let y = (mp.game.controls.getDisabledControlNormal(7, 2) * mouseSensitivity);

    let zoomIn = (mp.game.controls.getDisabledControlNormal(2, 40) * zoomSpeed);
    let zoomOut = (mp.game.controls.getDisabledControlNormal(2, 41) * zoomSpeed);
    if (PolaroidActive && !isRagdoll && !isJumping) {
        mp.game.controls.disableAllControlActions(2);
        mp.game.ui.displayRadar(false);


        camera.setActive(true);
        mp.game.cam.renderScriptCams(true, false, 0, true, false);

        if (player.vehicle && camera && !selfieCamera) {
            const playerPos = player.position;
            camera.setCoord(playerPos.x, playerPos.y, playerPos.z + .6);
        } else if (player.vehicle && camera && selfieCamera) {
            mp.gui.chat.push(`Sorry you are unable to use selfie mode in a vehicle.`);
        }

        camRot = new mp.Vector3(camRot.x - y, 0, camRot.z - x);
        if (camRot.x <= (selfieCamera ? 15 : 30) && camRot.x >= (selfieCamera ? -15 : -10)) {
            camera.setRot(camRot.x, camRot.y, camRot.z, 2);
            //mp.gui.chat.push(`${camRot.x}`)
        } else if (camRot.x < (selfieCamera ? 15 : 30)) {
            camRot.x = (selfieCamera ? -15 : -10);
        } else if (camRot.x > (selfieCamera ? -20 : -10)) {
            camRot.x = (selfieCamera ? 15 : 30);
        }

        if (selfieCamera && camRot.z <= selfieCamRotZ + 30 && camRot.z >= selfieCamRotZ - 30) {
            camera.setRot(camRot.x, camRot.y, camRot.z, 2);
        } else if (selfieCamera && camRot.z < selfieCamRotZ + 30) {
            camRot.z = selfieCamRotZ - 30;
        } else if (selfieCamera && camRot.z > selfieCamRotZ - 40) {
            camRot.z = selfieCamRotZ + 30;
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
        camera.setActive(false);
        mp.game.cam.renderScriptCams(false, false, 0, true, false);
        camera = null;
        mp.game.ui.displayRadar(true);
        mp.gui.chat.show(true);
        mp.gui.chat.activate(true);
        if (!player.vehicle) {
            player.clearTasks();
            player.freezePosition(false);
            setTimeout(() => {
                phoneObject.setVisible(PolaroidActive, false);
            }, 200);
        }
        selfieCamera = false;
    }
});

mp.keys.bind(o, true, function () {

    const graphics = mp.game.graphics;
    const playerPos = player.position;

    isRagdoll = player.isRagdoll();
    isJumping = player.isJumping();

    // mp.gui.chat.push(`DEBUG: RagDoll state = ${isRagdoll} and Jumping State = ${isJumping}`);


    if (!mp.game.graphics.hasScaleformMovieLoaded(_handle) && !taskCompleted) {
        graphics.pushScaleformMovieFunction(_handle, 'OPEN_SHUTTER');
        graphics.pushScaleformMovieFunctionParameterInt(2);
        graphics.popScaleformMovieFunctionVoid();
        taskCompleted = true;
    }

    camRot = lastCamRot = mp.game.cam.getGameplayCamRot(2);
    //mp.gui.chat.push(`${JSON.stringify(mp.game.cam.getGameplayCamRot(2))}`)
    camera = mp.cameras.new('peekThrough', new mp.Vector3(playerPos.x + axisXModifer, playerPos.y + axisYModifer, playerPos.z + axisZModifer), camRot, fovModifer);
    PolaroidActive = !PolaroidActive;
    mp.gui.chat.show(false);
    mp.gui.chat.activate(false);
    if (!player.vehicle && !isRagdoll && !isJumping) {

        setTimeout(() => {
            phoneObject.attachTo(player.handle, 90, 0, 0, 0, 0, 0, lastCamRot.z, true, true, false, false, 0, false);
            phoneObject.setVisible(PolaroidActive, true);
        }, 200);

        player.freezePosition(true);
        PolaroidActive ? mp.events.callRemote('startAnimation', 'cellphone@self@michael@', 'finger_point') : mp.events.callRemote('stopAnimation');
    }
});

mp.keys.bind(tab, true, function () {
    const playerPos = player.position;
    selfieCamera = !selfieCamera;
    if (selfieCamera && !player.vehicle) {
        mp.events.callRemote('updatePlayerRotation2');
    } else {
        //mp.gui.chat.push(`${JSON.stringify(lastCamRot)}`)
        camRot = lastCamRot;
        camera = mp.cameras.new('peekThrough', new mp.Vector3(playerPos.x + axisXModifer, playerPos.y + axisYModifer, playerPos.z + axisZModifer), lastCamRot, fovModifer);
        selfieCamera = !selfieCamera;
    }
});

mp.events.addDataHandler('heading', function (entity, value) {
    if (selfieCamera && PolaroidActive) {
        const playerPos = player.position;
        //mp.gui.chat.push(`${value}`);
        camRot = new mp.Vector3(0, 50, value - 180);
        player.setRotation(0, 0, value + 28, 0, true);
        camera = mp.cameras.new('selfieCamera', new mp.Vector3(playerPos.x + (0.8 * Math.sin(-value * Math.PI / 180)), playerPos.y + (0.8 * Math.cos(-value * Math.PI / 180)), playerPos.z + 0.6), camRot, fovModifer);
        selfieCamRotZ = camRot.z;
    }
});

mp.keys.bind(space, true, function () {
    if (PolaroidActive) {
        let currDate = new Date();

        let date = ("0" + currDate.getDate()).slice(-2);
        let month = ("0" + (currDate.getMonth() + 1)).slice(-2);
        let year = currDate.getFullYear();
        let hours = currDate.getHours();
        let minutes = currDate.getMinutes();
        let seconds = currDate.getSeconds();

        mp.gui.takeScreenshot(`Screenshot - ${year + "-" + month + "-" + date + " " + hours + "." + minutes + "." + seconds}.jpg`, 0, 85, 50);
        mp.gui.chat.push(`You have taken a screenshot`);
    }
});