const apn = document.getElementById("apn");
const CONFIG_LENGTH = 1;

// Runs the initPage when the document is loaded
document.onload = InitPage();
// Save file button
document.getElementById("save").addEventListener("click", SaveSettings);

// This attempts to read the conf file, if it exists, then it will parse it and fill out the table
// if it fails then the values are loaded with defaults.
function InitPage() {
    
    cockpit.script("/usr/local/share/h31proxy_deploy/scripts/cockpitScript.sh -c")
                .then((content) => SuccessReadFile(content))
                .catch(error => FailureReadFile(error));
    
}

function SuccessReadFile(content) {
    try{
        var splitResult = content.split("\n");
        
        if(splitResult.length >= CONFIG_LENGTH) {
            apn.value = splitResult[1].split("=")[1];
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
    // TODO :: Defaults should go here.

    apn.value = "broadband";
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

function SaveSettings() {
    var fileString = "[Service]\n" + 
        "APN=" + apn.value + "\n" +

    cockpit.file("/usr/local/share/h31proxy_deploy/cellular.conf").replace(fileString)
        .then(Success)
        .catch(Fail);

    cockpit.script("/usr/local/share/h31proxy_deploy/scripts/cockpitScript.sh -a " + apn.value);
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
