const scriptLocation = "/usr/local/h31/scripts/"
const confLocation = "/usr/local/h31/conf/"
const losHost = document.getElementById("losHost");
const losPort = document.getElementById("losPort");
const losIface = document.getElementById("losIface");
const backupHost = document.getElementById("backupHost");
const backupPort = document.getElementById("backupPort");
const backupIface = document.getElementById("backupIface");
const fmuDevice = document.getElementById("fmuDevice");
const baudrate = document.getElementById("baudrate");
const fmuId = document.getElementById("fmuId");
const atakHost = document.getElementById("atakHost");
const atakPort = document.getElementById("atakPort");
const CONFIG_LENGTH = 11;
// standard Baud rates
const baudRateArray = [ 38400, 57600, 115200, 230400, 460800, 500000, 921600 ];

enabled = true;
// Runs the initPage when the document is loaded
document.onload = InitPage();
// Enable button
document.getElementById("enable").addEventListener("click", EnableButtonClicked);
// Save file button
document.getElementById("save").addEventListener("click", SaveSettings);

// This attempts to read the conf file, if it exists, then it will parse it and fill out the table
// if it fails then the values are loaded with defaults.
function InitPage() {
    cockpit.file(confLocation + "h31proxy.conf")
        .read().then((content, tag) => SuccessReadFile(content))
            .catch(error => FailureReadFile(error));
}

function SuccessReadFile(content) {
    try{
        var splitResult = content.split("\n");
        
        if(splitResult.length >= CONFIG_LENGTH) {
            cockpit.script(scriptLocation + "cockpitScript.sh -s")
                .then((content) => AddDropDown(fmuDevice, AddPathToDeviceFile(content.split("\n")), splitResult[1].split("=")[1]))
                .catch(error => Fail(error));
            AddDropDown(baudrate, baudRateArray, splitResult[2].split("=")[1]);
            fmuId.value = splitResult[3].split("=")[1];
            losHost.value = splitResult[4].split("=")[1];
            losPort.value = splitResult[5].split("=")[1];
            cockpit.script(scriptLocation + "cockpitScript.sh -i")
                .then((content) => AddDropDown(losIface, content.split("\n"), splitResult[6].split("=")[1]))
                .catch(error => Fail(error));
            backupHost.value = splitResult[7].split("=")[1];
            backupPort.value = splitResult[8].split("=")[1];
            cockpit.script(scriptLocation + "cockpitScript.sh -i")
                .then((content) => AddDropDown(backupIface, content.split("\n"), splitResult[9].split("=")[1]))
                .catch(error => Fail(error));        
            atakHost.value = splitResult[10].split("=")[1];
            atakPort.value = splitResult[11].split("=")[1];
            enabled = (splitResult[12].split("=")[1] == "true");
        }
        else{
            FailureReadFile(new Error("To few parameters in file"));
        }
    }
    catch(e){
        FailureReadFile(e);
    }
    // This checks to see if the service is enabled, if it is
    // then we show the rest of the table
    if(enabled == true){
        document.getElementById("enable").innerHTML = "Disable";
        document.getElementById("the-table").hidden = false;
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
    // TODO :: Defaults should go here.

    losHost.value = "224.10.10.10";
    losPort.value = "14550";
    backupHost.value = "225.10.10.10";
    backupPort.value = "14560";
    fmuId.value = "1";
    atakHost.value = "239.2.3.1";
    atakPort.value = "6969";    
}

// The callback on the enable button
function EnableButtonClicked() {
    if(enabled == false) {
        EnableService();
    }
    else{
        DisableService();
    }
}

// If we are enabling the service (either for the first time or not)
function EnableService(){
    enabled = true;
    document.getElementById("enable").innerHTML = "Disable";
    document.getElementById("the-table").hidden = false;

    var fileString = "[Service]\n" + 
        "FMU_SERIAL=" + fmuDevice.value + "\n" +
        "FMU_BAUDRATE=" + baudrate.value + "\n" +
        "FMU_SYSID=" + fmuId.value + "\n" +
        "LOS_HOST=" + losHost.value + "\n" +
        "LOS_PORT=" + losPort.value + "\n" +
        "LOS_IFACE=" + losIface.value + "\n" +
        "BACKUP_HOST=" + backupHost.value + "\n" +
        "BACKUP_PORT=" + backupPort.value + "\n" +
        "BACKUP_IFACE=" + backupIface.value + "\n" +
        "ATAK_HOST=" + atakHost.value + "\n" +
        "ATAK_PORT=" + atakPort.value + "\n" +
        "ENABLED=" + enabled.toString() + "\n";

    cockpit.file(confLocation + "h31proxy.conf").replace(fileString)
        .then(CreateSystemDService).catch(error => {output.innerHTML = error.message});
}

function CreateSystemDService(){
    // copy the the service over
    cockpit.spawn(["cp", "-rf", "/usr/local/share/h31proxy_deploy/h31proxy.service", "/lib/systemd/system/"]);
    // make ln for multi-user
    cockpit.spawn(["ln", "-sf", "/etc/systemd/system/h31proxy.service", "/etc/systemd/system/multi-user.target.wants/h31proxy.service"]);
}

// When disable is pressed we need to re write the conf file to 
// make sure the enabled feature is false and also remove
// the service files so they will not start up again
function DisableService(){
    enabled = false;
    document.getElementById("enable").innerHTML = "Enable";
    document.getElementById("the-table").hidden = true;

    var fileString = "[Service]\n" + 
        "FMU_SERIAL=" + fmuDevice.value + "\n" +
        "FMU_BAUDRATE=" + baudrate.value + "\n" +
        "FMU_SYSID=" + fmuId.value + "\n" +
        "LOS_HOST=" + losHost.value + "\n" +
        "LOS_PORT=" + losPort.value + "\n" +
        "LOS_IFACE=" + losIface.value + "\n" +
        "BACKUP_HOST=" + backupHost.value + "\n" +
        "BACKUP_PORT=" + backupPort.value + "\n" +
        "BACKUP_IFACE=" + backupIface.value + "\n" +
        "ATAK_HOST=" + atakHost.value + "\n" +
        "ATAK_PORT=" + atakPort.value + "\n" +
        "ENABLED=" + enabled.toString() + "\n";

    cockpit.file(confLocation + "h31proxy.conf").replace(fileString)
        .then(RemoveSystemLinks).catch(error => {output.innerHTML = error.message});
}

// removes the links
function RemoveSystemLinks(){
    // remove the service file
    cockpit.spawn(["rm", "-rf", "/lib/systemd/system/h31proxy.service"]);
    // remove ln for multi-user
    cockpit.spawn(["rm", "-rf", "/etc/systemd/system/multi-user.target.wants/h31proxy.service"]);
    result.innerHTML = "Removed Serivce files";
}

function SaveSettings() {
    var fileString = "[Service]\n" + 
        "FMU_SERIAL=" + fmuDevice.value + "\n" +
        "FMU_BAUDRATE=" + baudrate.value + "\n" +
        "FMU_SYSID=" + fmuId.value + "\n" +
        "LOS_HOST=" + losHost.value + "\n" +
        "LOS_PORT=" + losPort.value + "\n" +
        "LOS_IFACE=" + losIface.value + "\n" +
        "BACKUP_HOST=" + backupHost.value + "\n" +
        "BACKUP_PORT=" + backupPort.value + "\n" +
        "BACKUP_IFACE=" + backupIface.value + "\n" +      
        "ATAK_HOST=" + atakHost.value + "\n" +
        "ATAK_PORT=" + atakPort.value + "\n" +
        "ENABLED=" + enabled.toString() + "\n";

    cockpit.file(confLocation + "h31proxy.conf").replace(fileString)
        .then(Success)
        .catch(Fail);

    cockpit.spawn(["systemctl", "restart", "h31proxy"]);
}

function Success() {
    result.style.color = "green";
    result.innerHTML = "success";
}

function Fail(error) {
    result.style.color = "red";
    result.innerHTML = error.message;
}
// Send a 'init' message.  This tells integration tests that we are ready to go
cockpit.transport.wait(function() { });
