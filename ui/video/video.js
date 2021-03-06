const scriptLocation = "/usr/local/h31/scripts/"
const confLocation = "/usr/local/h31/conf/"
const deviceH264 = document.getElementById("deviceH264");
const deviceX = document.getElementById("deviceX");
const widthAndHeight = document.getElementById("widthAndHeight");
const fps = document.getElementById("fps");
const losBitrate = document.getElementById("losBitrate");
const losHost = document.getElementById("losHost");
const losPort = document.getElementById("losPort");
const losIface = document.getElementById("losIface");
const mavHost = document.getElementById("mavHost");
const mavPort = document.getElementById("mavPort");
const mavIface = document.getElementById("mavIface");
const mavBitrate = document.getElementById("mavBitrate");
const atakHost = document.getElementById("atakHost");
const atakPort = document.getElementById("atakPort");
const atakIface = document.getElementById("atakIface");
const atakBitrate = document.getElementById("atakBitrate");
const videoHost = document.getElementById("videoHost");
const videoPort = document.getElementById("videoPort");
const videoBitrate = document.getElementById("videoBitrate");
const videoOrg = document.getElementById("videoOrg");
const videoName = document.getElementById("videoName");
const audioPort = document.getElementById("audioPort");
const audioBitrate = document.getElementById("audioBitrate");
const platform = document.getElementById("platform");
const CONFIG_LENGTH = 24;


const losBitrateArray = [ "Disabled", "500", "750", "1000", "1250", "1500", "1750", "2000", "2500", "3000", "3500", "4000", "4500", "5000" ];
// used for mav, atak, and video
const serverBitrateArray = [ "Disabled", "250", "500", "750", "1000", "1250", "1500" ];
const audioBitrateArray = [ "Disabled", "64", "128", "256" ];
const widthAndHeightArray = [ "640x360", "960x540", "1280x720", "1920x1080", "2560x1440" ];
const fpsArray = [ 15, 30 ];

document.onload = InitPage();

document.getElementById("save").addEventListener("click", SaveSettings);

function InitPage() {
    cockpit.file(confLocation + "video.conf").read().then((content, tag) => SuccessReadFile(content))
    .catch(error => FailureReadFile(error));
}

function SuccessReadFile(content) {
    try{
        var splitResult = content.split("\n");
        
        if(splitResult.length >= CONFIG_LENGTH) {
            cockpit.script(scriptLocation + "cockpitScript.sh -d")
                .then((content) => AddDropDown(deviceH264, AddPathToDeviceFile(content.split("\n")), splitResult[1].split("=")[1]))
                .catch(error => Fail(error));
            cockpit.script(scriptLocation + "cockpitScript.sh -d")
                .then((content) => AddDropDown(deviceX, AddPathToDeviceFile(content.split("\n")), splitResult[2].split("=")[1]))
                .catch(error => Fail(error));
            AddDropDown(widthAndHeight, widthAndHeightArray, splitResult[3].split("=")[1] + "x" + splitResult[4].split("=")[1]);
            AddDropDown(fps, fpsArray, splitResult[5].split("=")[1]);
            AddDropDown(losBitrate, losBitrateArray, splitResult[6].split("=")[1]);
            losHost.value = splitResult[7].split("=")[1];
            losPort.value = splitResult[8].split("=")[1];
            cockpit.script(scriptLocation + "cockpitScript.sh -i")
                .then((content) => AddDropDown(losIface, content.split("\n"), splitResult[9].split("=")[1]))
                .catch(error => Fail(error));
            mavHost.value = splitResult[10].split("=")[1];
            mavPort.value = splitResult[11].split("=")[1];
            cockpit.script(scriptLocation + "cockpitScript.sh -i")
                .then((content) => AddDropDown(mavIface, content.split("\n"), splitResult[12].split("=")[1]))
                .catch(error => Fail(error));
            AddDropDown(mavBitrate, serverBitrateArray, splitResult[13].split("=")[1]);
            atakHost.value = splitResult[14].split("=")[1];
            atakPort.value = splitResult[15].split("=")[1];
            cockpit.script(scriptLocation + "cockpitScript.sh -i")
                .then((content) => AddDropDown(atakIface, content.split("\n"), splitResult[16].split("=")[1]))
                .catch(error => Fail(error));
            // atakBitrateDefault = splitResult[17].split("=")[1];
            AddDropDown(atakBitrate, serverBitrateArray, splitResult[17].split("=")[1]);
            videoHost.value = splitResult[18].split("=")[1];
            videoPort.value = splitResult[19].split("=")[1];
            AddDropDown(videoBitrate, serverBitrateArray, splitResult[20].split("=")[1]);
            videoOrg.value = splitResult[21].split("=")[1];
            videoName.value = splitResult[22].split("=")[1];
            audioPort.value = splitResult[23].split("=")[1];
            AddDropDown(audioBitrate, audioBitrateArray, splitResult[24].split("=")[1]);
            platform.value = splitResult[25].split("=")[1];
        }
        else{
            FailureReadFile(new Error("To few parameters in file"));
        }
    }
    catch(e){
        FailureReadFile(e);
    }
}

function AddPathToDeviceFile(incomingArray){
    for(let t = 0; t < incomingArray.length; t++){
        incomingArray[t] = "/dev/" + incomingArray[t];
    }
    return incomingArray;
}

function AddDropDown(box, theArray, defaultValue){
    try{
        for(let t = 0; t < theArray.length; t++){
            var option = document.createElement("option");
            option.text = theArray[t];
            box.add(option);
            if(defaultValue == option.text){
                box.value = option.text;
            }
        }
    }
    catch(e){
        Fail(e)
    }
}

function FailureReadFile(error) {
    // Display error message
    output.innerHTML = "Error : " + error.message;

    // Defaults
    fps.value = "30";
    losHost.value = "224.11.";
    losPort.value = "5600";
    mavHost.value = "225.11.";
    mavPort.value = "5600";
    atakHost.value = "239.10.";
    atakPort.value = "5600";
    videoHost.value = "video.horizon31.online";
    videoPort.value = "1935";
    videoOrg.value = "H31";
    videoName.value = "NVID-serialnumber.py";
    audioPort.value = "5601"
    platform.value = "NVID";
}

function CheckDisabled(disable){
    if(disable == "Disabled"){
        return "0";
    }
    return disable;
}

function SaveSettings() {
    var splitDims = widthAndHeight.value.split("x");

    cockpit.file(confLocation + "video.conf").replace("[Service]\n" + 
        "DEVICE_H264=" + deviceH264.value + "\n" +
        "DEVICE_XRAW=" + deviceX.value + "\n" +
        "LOS_WIDTH=" + splitDims[0] + "\n" +
        "LOS_HEIGHT=" + splitDims[1] + "\n" +
        "LOS_FPS=" + fps.value + "\n" +
        "LOS_BITRATE=" + CheckDisabled(losBitrate.value) + "\n" +
        "LOS_HOST=" + losHost.value + "\n" +
        "LOS_PORT=" + losPort.value + "\n" +
        "LOS_IFACE=" + losIface.value + "\n" +
        "MAVPN_HOST=" + mavHost.value + "\n" +
        "MAVPN_PORT=" + mavPort.value + "\n" +
        "MAVPN_IFACE=" + mavIface.value + "\n" +
        "MAVPN_BITRATE=" + CheckDisabled(mavBitrate.value) + "\n" +
        "ATAK_HOST=" + atakHost.value + "\n" +
        "ATAK_PORT=" + atakPort.value + "\n" +
        "ATAK_IFACE=" + atakIface.value + "\n" +
        "ATAK_BITRATE=" + CheckDisabled(atakBitrate.value) + "\n" +
        "VIDEOSERVER_HOST=" + videoHost.value + "\n" +
        "VIDEOSERVER_PORT=" + videoPort.value + "\n" +
        "VIDEOSERVER_BITRATE=" + videoBitrate.value + "\n" +
        "VIDEOSERVER_ORG=" + videoOrg.value + "\n" +
        "VIDEOSERVER_STREAMNAME=" + videoName.value + "\n" +
        "AUDIO_PORT=" + audioPort.value + "\n" +
        "AUDIO_BITRATE=" + CheckDisabled(audioBitrate.value) + "\n" +
        "PLATFORM=" + platform.value + "\n")
        .then(Success)
        .catch(error => Fail(new Error("Failure, settings NOT changed!")));

    cockpit.spawn(["systemctl", "restart", "video"]);
    cockpit.spawn(["systemctl", "restart", "h31proxy"]);
}

function Success() {
    result.style.color = "green";
    result.innerHTML = "Success, video and telemetry restarting...";
}

function Fail(error) {
    result.style.color = "red";
    result.innerHTML = error.message;
}

// Send a 'init' message.  This tells integration tests that we are ready to go
cockpit.transport.wait(function() { });