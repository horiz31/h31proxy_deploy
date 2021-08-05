const device = document.getElementById("device");
const width = document.getElementById("width");
const height = document.getElementById("height");
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
const platform = document.getElementById("platform");
const CONFIG_LENGTH = 22;

document.onload = InitPage();

document.getElementById("save").addEventListener("click", SaveSettings);

function InitPage() {
    cockpit.file("/etc/systemd/video.conf").read().then((content, tag) => SuccessReadFile(content))
    .catch(error => FailureReadFile(error));
}

function SuccessReadFile(content) {
    try{
        var splitResult = content.split("\n");
        
        if(splitResult.length >= CONFIG_LENGTH) {
            device.value = splitResult[1].split("=")[1];
            width.value = splitResult[2].split("=")[1];
            height.value = splitResult[3].split("=")[1];
            fps.value = splitResult[4].split("=")[1];
            losBitrate.value = splitResult[5].split("=")[1];
            losHost.value = splitResult[6].split("=")[1];
            losPort.value = splitResult[7].split("=")[1];
            losIface.value = splitResult[8].split("=")[1];
            mavHost.value = splitResult[9].split("=")[1];
            mavPort.value = splitResult[10].split("=")[1];
            mavIface.value = splitResult[11].split("=")[1];
            mavBitrate.value = splitResult[12].split("=")[1];
            atakHost.value = splitResult[13].split("=")[1];
            atakPort.value = splitResult[14].split("=")[1];
            atakIface.value = splitResult[15].split("=")[1];
            atakBitrate.value = splitResult[16].split("=")[1];
            videoHost.value = splitResult[17].split("=")[1];
            videoPort.value = splitResult[18].split("=")[1];
            videoBitrate.value = splitResult[19].split("=")[1];
            videoOrg.value = splitResult[20].split("=")[1];
            videoName.value = splitResult[21].split("=")[1];
            platform.value = splitResult[22].split("=")[1];
        }
        else{
            FailureReadFile(new Error("To few parameters in file"));
        }
    }
    catch(e){
        FailureReadFile(e);
    }
}

function FailureReadFile(error) {
    // Display error message
    output.innerHTML = "Error : " + error.message;

    // Defaults
    device.value = "/dev/video1";
    width.value = "1280";
    height.value = "720";
    fps.value = "15";
    losBitrate.value = "2000";
    losHost.value = "224.11.169.215";
    losPort.value = "5600";
    losIface.value = "eth0";
    mavHost.value = "225.11.169.215";
    mavPort.value = "5600";
    mavIface.value = "edge0";
    mavBitrate.value = "1000";
    atakHost.value = "223.10.10.10";
    atakPort.value = "5600";
    atakIface.value = "eth0";
    atakBitrate.value = "500";
    videoHost.value = "video.mavnet.online";
    videoPort.value = "1935";
    videoBitrate.value = "750";
    videoOrg.value = "ORNL";
    videoName.value = "NVID00044bea5fdb";
    platform.value = "NVID";
}

function SaveSettings() {

    cockpit.file("/etc/systemd/video.conf").replace("[Service]\n" + 
        "DEVICE_H264=" + device.value + "\n" +
        "DEVICE_XRAW=" + device.value + "\n" +
        "LOS_WIDTH=" + width.value + "\n" +
        "LOS_HEIGHT=" + height.value + "\n" +
        "LOS_FPS=" + fps.value + "\n" +
        "LOS_BITRATE=" + losBitrate.value + "\n" +
        "LOS_HOST=" + losHost.value + "\n" +
        "LOS_PORT=" + losPort.value + "\n" +
        "LOS_IFACE=" + losIface.value + "\n" +
        "MAVPN_HOST=" + mavHost.value + "\n" +
        "MAVPN_PORT=" + mavPort.value + "\n" +
        "MAVPN_IFACE=" + mavIface.value + "\n" +
        "MAVPN_BITRATE=" + mavBitrate.value + "\n" +
        "ATAK_HOST=" + atakHost.value + "\n" +
        "ATAK_PORT=" + atakPort.value + "\n" +
        "ATAK_IFACE=" + atakIface.value + "\n" +
        "ATAK_BITRATE=" + atakBitrate.value + "\n" +
        "VIDEOSERVER_HOST=" + videoHost.value + "\n" +
        "VIDEOSERVER_PORT=" + videoPort.value + "\n" +
        "VIDEOSERVER_BITRATE=" + videoBitrate.value + "\n" +
        "VIDEOSERVER_ORG=" + videoOrg.value + "\n" +
        "VIDEOSERVER_STREAMNAME=" + videoName.value + "\n" +
        "PLATFORM=" + platform.value + "\n")
        .then(Success)
        .catch(Fail);

    cockpit.spawn(["systemctl", "restart", "mavnet"]);
}

function Success() {
    result.style.color = "green";
    result.innerHTML = "success";
}

function Fail() {
    result.style.color = "red";
    result.innerHTML = "fail";
}

// Send a 'init' message.  This tells integration tests that we are ready to go
cockpit.transport.wait(function() { });
