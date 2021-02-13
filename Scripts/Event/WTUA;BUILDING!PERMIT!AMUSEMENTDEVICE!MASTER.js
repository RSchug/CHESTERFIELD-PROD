// WTUA:Building/Permit/AmusementDevice/Master
// 8B: For Elevator Installation Record when Workflow Task 'Certificate of Inspection' is 'Completed' then create a related 'Building/Permit/Elevator/Annual' Record as the Parent.
var newCapId = null, newCapAppType = null;
today = new Date(aa.util.now());
if (typeof (startDate) != "undefined") today = startDate;
thisMonth = today.getMonth();
thisYear = today.getFullYear();
nextYear = thisYear + 1;
logDebug("Today: " + today + ", month: " + thisMonth + ", year: " + thisYear + ", Next Year: " + nextYear);

var newCapId = null, newAppTypeString = null, newAppTypeArray = null;
if (wfTask == 'Annual Status' && wfStatus == 'Pending Renewal') {
    var newCapId = null, newAppTypeString = null, newAppTypeArray = null;
    logDebug("Checking what License to Create");
    var newAppTypeString = appTypeArray[0] + "/" + appTypeArray[1] + "/" + appTypeArray[2] + "/" + "Renewal";
    var newCapName = capName;
    var newCapIdString = null; // capIDString.substr(0, (capIDString.length() - 1)) + 'L';
    if (newCapIdString) logDebug("newCapIdString: " + newCapIdString);
    var newCapRelation = "Child";
    var srcCapId = capId;
    var copySections = null; // Use Default (most common sections).
    var initStatus = null;
    var expField = null, expFieldValue = null;
    var expMonths = 12;
    var expDateField = "Permit Expiration Date";
    var expStatus = null, expDate = null;
    // var expStatus = "Active";

    if (appMatch("Building/Permit/AmusementDevice/Installation")) {
        newCapRelation = "Parent";
    }
    logDebug("Expiration Date: " + expDate);
    //expDate = (expMonths ? dateAddMonths(expDate, expMonths) : expDate);
    //logDebug("New Expiration Date: " + expDate);

    if (newAppTypeString) newAppTypeArray = newAppTypeString.split("/");
    if (newAppTypeArray.length == 4) {
        var newCapId = createCap_TPS(newAppTypeString, newCapName, newCapIdString, newCapRelation, srcCapId, copySections, initStatus);
    }
    var newCapIdString = null;
    if (newCapId) {
        newCapIdString = newCapId.getCustomID();
        // This code gives the License the same # as tha APP 
        // Get Exp Year 
        var expYear = (new Date()).getFullYear();
        if (expDate) {
            var expDateJS = convertDate(expDate);
            if (expDateJS) expYear = expDate.getFullYear();
        }
        var editIdString = capIDString.substr(0, (capIDString.length() - 1)) + 'R' + (expYear + "").substr(-2);
        logDebug("newCapId: " + newCapId + ", newCapIdString: " + newCapIdString + ", editIdString: " + editIdString);
        if (editIdString) {   // Update Record ID
            aa.cap.updateCapAltID(newCapId, editIdString);
            // get newCapId object with updated capId.
            var s_capResult = aa.cap.getCapID(editIdString);
            if (s_capResult.getSuccess() && s_capResult.getOutput()) {
                newCapId = s_capResult.getOutput();
                newCapIdString = newCapId.getCustomID();
            } else {
                logDebug("ERROR: updating Cap ID " + newCapIdString + " to " + editIdString + ": " + s_capResult.getErrorMessage());
            }
        } else {
            newCapIdString = newCapId.getCustomID();
        }

        // ************START expiration Date code Options 
        logDebug("Setting expiration info");
        logDebug("expField: " + expField + ", value: " + expFieldValue);
        if (expField) { // Update expiration field: Annual Quarter or License Duration
            editAppSpecific(expField, expFieldValue, newCapId)
        }
        var expFieldValue = getAppSpecific(expField, newCapId);

        logDebug("expiration" + (expDateField ? " field: " + expDateField:":")
            + (expStatus ? " Status: " + expStatus : "")
            + " Date: " + expDate);
        if (expDate && expDateField) {      // set custom field with expiration date
            editAppSpecific(expDateField, expDate, newCapId)
        } else if (expStatus && expDate) {  // set expiration Info
            try {
                logDebug("NEW expiration"
                    + (expStatus ? " Status: " + expStatus : "")
                    + (expDate ? " Date: " + expDate : ""));
                var thisLic = new licenseObject(newCapIdString, newCapId);
                if (thisLic) {
                    if (expStatus) thisLic.setStatus("expStatus");
                    if (expDate) thisLic.setExpiration(dateAdd(expDate, 0));
                }
            } catch (err) {
                logDebug("ERROR: NEW expiration"
                    + (expStatus ? " Status: " + expStatus : "")
                    + (expDate ? " Date: " + expDate : "")
                    + ": " + err);
            }
        }
    }
    // ******************END expiration Date code Options
    //updateTask('Annual Status', 'In Service', '', '');
    // After the Submit button is selected an Administrative Fee with a Qty of 1 and Fee of $57 will automatically be added
    // 6B: The Annual Certificate of Compliance Fee will automatically be added to the Renewal record based on Number of Devices that are 'In Service' as the Qty.
    // Get Number of 'In Service' Devices
    if (newCapId) {
        deviceFeeMap = {
            "Small Mechanical or Inflatable": "SMALL",
            "Circular/Flat": "CIRCULAR",
            "Spectacular": "SPECTACULAR",
            "Coasters": "COASTER",
            "Other": null,
            "Small mechanical ride or inflatable amusement device": "SMALL",
            "Circular or flat rides less than 20' in height": "CIRCULAR",
            "Spectacular Rides": "SPECTACULAR",
            "Rollercoasters more than 30 feet in height": "COASTER",
            "SMALL": "SMALL25",
            "CIRCULAR": "CIRCULAR25",
            "SPECTACULAR": "SPECTACUL25",
            "COASTER": "COASTER25"
        }
        // Count Devices by Type.
        var deviceCounts = [];
        var tableName = "CC-BLD-AD-DL";  
        var tableDevices = loadASITable(tableName);
        if (typeof (tableDevices) != "object") tableDevices = null;
        if (tableDevices && tableDevices.length > 0) {
            for (xx in tableDevices) {
                var tableRow = tableDevices[xx];
                logDebug(tableName + "[" + xx + "]: Device Name: " + tableRow["Device name"] + " Device Type: " + tableRow["Device Type"] + " Out of Service: " + tableRow["Out of Service"]);
                if (tableRow["Out of Service"] && exists(tableRow["Out of Service"], ["CHECKED"])) continue;
                var deviceType = tableRow["Device Type"];
                logDebug("deviceType: " + deviceType + " mapped: " + deviceFeeMap[deviceType]);
                if (typeof (deviceFeeMap[deviceType]) == "undefined") {
                    logDebug("No fee associated with Device Type: " + deviceType);
                    continue;
                }
                feeType = deviceFeeMap[deviceType];
                if (typeof (deviceCounts[feeType]) == "undefined") 
                    deviceCounts[feeType] = 0;
                deviceCounts[feeType]++;
            }
        }
        var capIdChild = capId; // Default to current capId if Installation not found.
        var childIdsArray = getChildren("Building/Permit/AmusementDevice/Installation", capId);
        for (var c in childIdsArray) {
            var capIdChild = childIdsArray[c];
            logDebug("Found Installation: " + (capIdChild ? " " + capIdChild.getCustomID() : capIdChild));
        }
        var svCapId = capId;
        capId = capIdChild;         // Required for feeExists.
        for (deviceFeeType in deviceCounts) {
            feeType1 = deviceFeeType;
            feeType2 = deviceFeeMap[feeType];
            if (feeExists(feeType1, "INVOICED"))      // Check if Fee exists on Installation
                feeType = feeType1
            else if (feeExists(feeType2, "INVOICED")) // Check if Alternate Fee exists on Installation
                feeType = feeType2
            else // New Device Type
                feeType = feeType1;

            logDebug("Adding CC-BLD_AD-DL.LIST OF DEVICES " + feeType + " fee for Qty: " + deviceCounts[deviceFeeType] + "; " + deviceFeeType);
            addFee(feeType, "CC-BLD-AMUSEMENT", "FINAL", deviceCounts[deviceFeeType], "Y", newCapId);
        }
        capId = svCapId;
    }
}

// If setting the License status manually from the workflow
if (wfTask == 'Annual Status' && wfStatus == 'Pending Renewal') {
    var expStatus = null, expDate = null;
    // var expStatus = "About to Expire";
    try {
        if (expStatus || expDate) {         // set the expiration
            logDebug("Updating expiration" 
                + (expStatus? " Status: " + expStatus:"") 
                + (expDate? " Date: " + expDate:""));
            var thisLic = new licenseObject(capIDString);
            if (thisLic) {
                if (expStatus) thisLic.setStatus("expStatus");
                if (expDate) thisLic.setExpiration(dateAdd(expDate, 0));
            }
        }
    } catch (err) {
        logDebug("ERROR: Updating expiration"
            + (expStatus ? " Status: " + expStatus : "")
            + (expDate ? " Date: " + expDate : "")
            + ": " + err);
    }
}
