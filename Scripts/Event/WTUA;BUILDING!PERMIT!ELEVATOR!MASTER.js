// WTUA:Building/Permit/Elevator/Master
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
    } else if (appMatch("Building/Permit/Elevator/Installation")) {
        expField = 'Annual Quarter'
        expFieldValue = getAppSpecific(expField, capId);
        if (expFieldValue == 'Q1 - March') {
            expDate = "03/31/" + thisYear;
        } else if (expFieldValue == 'Q2 - June') {
            expDate = "06/30/" + thisYear;
        } else if (expFieldValue == 'Q3 - September') {
            expDate = "09/30/" + thisYear;
        } else {
            expFieldValue = 'Q4 - December';
            expDate = "12/31/" + thisYear; //nextYear
        }
        expDate = getAppSpecific(expDateField, capId);
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
    // 6B: The Annual Certificate of Compliance Fee will automatically be added to the Renewal record based on Number of Elevators that are 'In Service' as the Qty. 
    // Get Number of 'In Service' Elevators
    if (newCapId) {
        var elevatorsCount = 0;
        var tableName = "CC-BLD-ELEVATOR";
        var tableElevators = loadASITable(tableName);
        if (typeof (tableElevators) != "object") tableElevators = null;
        if (tableElevators && tableElevators.length > 0) {
            for (xx in tableElevators) {
                var tableRow = tableElevators[xx];
                logDebug(tableName + "[" + xx + "]: Name/ID#: " + tableRow["Name/ID#"] + " Elevator Type: " + tableRow["Elevator Type"] + " Out of Service: " + tableRow["Out of Service"]);
                if (tableRow["Out of Service"] && exists(tableRow["Out of Service"], ["CHECKED"])) continue;
                elevatorsCount++;
            }
        }
        if (elevatorsCount > 0) {
            logDebug("Adding CC-BLD_ELEVATOR.ELEVATOR fee for Qty: " + elevatorsCount);
            addFee("ELEVATOR", "CC-BLD-ELEVATOR", "FINAL", elevatorsCount, "Y", newCapId);
        }
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
