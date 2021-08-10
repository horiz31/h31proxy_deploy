const serialNum = document.getElementById("serialNum");
const deviceTok = document.getElementById("deviceTok");
const serverUrl = document.getElementById("serverUrl");

const CONFIG_LENGTH = 3;

// Save file button
document.getElementById("save").addEventListener("click", SaveSettings);

document.onload = InitPage();

function InitPage() {
    cockpit.file("/usr/share/conf/mavnet.conf").read().then((content, tag) => SuccessReadFile(content))
    .catch(error => FailureReadFile(error));
}

function SuccessReadFile(content) {
    try{
        var splitResult = content.split("\n");
        
        if(splitResult.length >= CONFIG_LENGTH) {
            serialNum.value = splitResult[1].split("=")[1];
            deviceTok.value = splitResult[2].split("=")[1];
            serverUrl.value = splitResult[3].split("=")[1];
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
    serialNum.value = "987654321";
    deviceTok.value = "";
    serverUrl.value = "https://mavnet.online";

}

function SaveSettings() {

    cockpit.file("/usr/share/conf/mavnet.conf").replace("[Service]\n" + 
        "SERIAL_NUMBER=" + serialNum.value + "\n" +
        "DEVICE_TOKEN=" + deviceTok.value + "\n" +
        "SERVER_ADDRESS=" + serverUrl.value + "\n")
        .then(Success)
        .catch(Fail);

    cockpit.spawn(["systemctl", "restart", "h31proxy"]);
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
