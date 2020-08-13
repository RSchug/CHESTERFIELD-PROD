/*------------------------------------------------------------------------------------------------------/
| Script : ACA_ADDRESS_BEFORE.js
| Event   : ACA_Before
|
| Usage   : Stop application if private parcel
|
|
| Client  : HCFL
|
| Notes   : Stop application if private parcel
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START User Configurable Parameters
|
|     Only variables in the following section may be changed.  If any other section is modified, this
|     will no longer be considered a "Master" script and will not be supported in future releases.  If
|     changes are made, please add notes above.
/------------------------------------------------------------------------------------------------------*/
var showMessage = false; // Set to true to see results in popup window
var showDebug = false; // Set to true to see debug messages in popup window
var useAppSpecificGroupName = false; // Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = false; // Use Group name when populating Task Specific Info Values
var enableVariableBranching = false; // Allows use of variable names in branching.  Branches are not followed in Doc Only
var maxEntries = 99; // Maximum number of std choice entries.  Entries must be Left Zero Padded

//Add Custom variables
var bIncludeProductizedScripts = true; //Reference productized master scripts

/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var cancel = false;
var startDate = new Date();
var startTime = startDate.getTime();
var message = ""; // Message String
var debug = ""; // Debug String
var br = "<BR>"; // Break Tag
var feeSeqList = new Array(); // invoicing fee list
var paymentPeriodList = new Array(); // invoicing pay periods


/*------------------------------------------------------------------------------------------------------/
| Add Includes
/------------------------------------------------------------------------------------------------------*/
eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getScriptText("INCLUDES_CUSTOM", null, bIncludeProductizedScripts));

function getScriptText(vScriptName, servProvCode, useProductScripts) {
    if (!servProvCode)
        servProvCode = aa.getServiceProviderCode();
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    try {
        if (useProductScripts) {
            var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
        } else {
            var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
        }
        return emseScript.getScriptText() + "";
    } catch (err) {
        return "";
    }
}

var servProvCode = aa.getServiceProviderCode() // Service Provider Code
    var currentUserID = aa.env.getValue("CurrentUserID");
var cap = aa.env.getValue("CapModel");
var capModel = cap;
var capId = cap.getCapID();
var capIDString = capId.getCustomID(); // alternate cap id string
var appTypeResult = cap.getCapType();
var appTypeString = appTypeResult.toString(); // Convert application type to string ("Building/A/B/C")
var appTypeArray = appTypeString.split("/"); // Array of application type string
var pAInfo = [];

var AInfo = new Array(); // Create array for tokenized variables
loadAppSpecific4ACA(AInfo); // Add AppSpecific Info
/*------------------------------------------------------------------------------------------------------/
| END Includes
/------------------------------------------------------------------------------------------------------*/
try {
    parcel = cap.getParcelModel();
    message += "Parcel:" + parcel;
    if (parcel && parcel.getParcelNo()) {
        ParcelValidatedNumber = parcel.getParcelNo();

        message += "ParcelValidatedNumber:" + ParcelValidatedNumber;
        message += "gIS:" + getGisAttributeValues(ParcelValidatedNumber, "Parcels", "CON");
        var isPriv = getGisAttributeValues(ParcelValidatedNumber, "Parcels", "CON") == 'Y';

        if (isPriv) {
            displayMessage("For this parcel please come to the office.")
        }
    }
    var testVar = getGISInfoByParcel(ParcelValidatedNumber, 'PASCO', 'Parcels', 'CON');
    message += "testvar:" + testVar
    displayMessage(message);
} catch (err) {
    showDebug = false;
    logDebug("Error in pageflow ACA_ADDRESS_BEFORE, err: " + err + ". " + err.stack);
    aa.sendMail("antonio.ledezma@gmail.com", "jal@byrnesoftware.com", "", "Log", "Debug: <br>" + debug + "<br>Message: <br>" + message);
}
/*------------------------------------------------------------------------------------------------------/
| BEGIN CUSTOM FUNCTIONS
/------------------------------------------------------------------------------------------------------*/
//display message in ACA - stop from moving forward to next page
function displayMessage(str) {
    if (str) {
        //STOP EXECUTION OF THE PAGE FLOW SCRIPT FROM ADVANCING TO NEXT PAGE
        cancel = true;
        aa.env.setValue("ErrorCode", "0");
        aa.env.setValue("ErrorMessage", str);
    }
}

function describeObject(obj2describe) {
    displayMessage("Object Class: " + obj2describe.getClass());

    displayMessage("List Object Functions ...");
    //Print function list
    for (x in obj2describe)
        if (typeof(obj2describe[x]) == "function")
            displayMessage("  " + x)

            displayMessage("");
    displayMessage("List Object Properties ...");

    //Print properties and values of the current function
    for (x in obj2describe)
        if (typeof(obj2describe[x]) != "function")
            displayMessage("  " + x + " = " + obj2describe[x]);

}

function getFieldValue(fieldName, asiGroups, ASIsubgroup) {
    var permitID = "None";
    if (asiGroups == null) {
        return;
    }

    var iteGroups = asiGroups.iterator();
    while (iteGroups.hasNext()) {
        var group = iteGroups.next();
        var groupName = group.getGroupName();
        if (groupName) {
            if (groupName.toUpperCase() == ASIsubgroup) {
                var fields = group.getFields();
                if (fields) {
                    var theFields = fields.iterator();
                    while (theFields.hasNext()) {
                        var field = theFields.next();
                        if (fieldName.toUpperCase() == field.getCheckboxDesc().toUpperCase()) {
                            permitID = field.getChecklistComment();
                        }
                    } //End while
                } //End if (fields)
            } //End if (groupName = ASIsubgroup)
        } //End if (groupName)
    } //End while (iteGroups.hasNext())
    return permitID;
} //End function

/*------------------------------------------------------------------------------------------------------/
| END CUSTOM FUNCTIONS
/------------------------------------------------------------------------------------------------------*/
function getGisAttributeValues(parcelNumber, layerName, attributeName) {
    varMessage = null
        var distanceType = "feet";
    retArray = new Array;
    var gisObjResult = aa.gis.getParcelGISObjects(parcelNumber); // get gis objects on the parcel number
    if (gisObjResult.getSuccess()) {}
    var fGisObj = gisObjResult.getOutput();
    //var buf = fGisObj[0];
    //buf.addAttributeName(attributeName);
    //var bufchk = aa.gis.getBufferByRadius(fGisObj[0], "0.01", distanceType, buf);


    bufferTargetResult = aa.gis.getGISType("PASCO", layerName);
    if (bufferTargetResult.getSuccess()) {
        buf = bufferTargetResult.getOutput();
        buf.addAttributeName(attributeName);
    }
    var bufchk = aa.gis.getBufferByRadius(fGisObj[0], "0.1", distanceType, buf);

    if (bufchk.getSuccess()) {
        var proxArr = bufchk.getOutput();
    } else {
        aa.print("**WARNING: Retrieving Buffer Check Results.  Reason is: " + bufchk.getErrorType() + ":" + bufchk.getErrorMessage());

        return false
    }

    for (a2 in proxArr) {
        var proxObj = proxArr[a2].getGISObjects();
        for (z1 in proxObj) {
            var v = proxObj[z1].getAttributeValues();
            message += v[0] + "<br>"
            retArray.push(v[0]);
        }
    }
    for (x in retArray) {
        if (varMessage == null) {
            varMessage = retArray[x]
        } else {
            varMessage = varMessage + "," + retArray[x]
        }
    }
    return varMessage;
}

function getGISInfo(itemCap, svc, layer, attributename) {
    // use buffer info to get info on the current object by using distance 0
    // usage:
    //
    // x = getGISInfo("flagstaff","Parcels","LOT_AREA");
    //

    var distanceType = "feet";
    var retString;

    var bufferTargetResult = aa.gis.getGISType(svc, layer); // get the buffer target
    if (bufferTargetResult.getSuccess()) {
        var buf = bufferTargetResult.getOutput();
        buf.addAttributeName(attributename);
    } else {
        logDebug("**WARNING: Getting GIS Type for Buffer Target.  Reason is: " + bufferTargetResult.getErrorType() + ":" + bufferTargetResult.getErrorMessage());
        return false
    }

    var gisObjResult = aa.gis.getCapGISObjects(itemCap); // get gis objects on the cap
    if (gisObjResult.getSuccess())
        var fGisObj = gisObjResult.getOutput();
    else {
        logDebug("**WARNING: Getting GIS objects for Cap.  Reason is: " + gisObjResult.getErrorType() + ":" + gisObjResult.getErrorMessage());
        return false
    }

    for (a1 in fGisObj) // for each GIS object on the Cap.  We'll only send the last value
    {
        var bufchk = aa.gis.getBufferByRadius(fGisObj[a1], "0", distanceType, buf);

        if (bufchk.getSuccess())
            var proxArr = bufchk.getOutput();
        else {
            logDebug("**WARNING: Retrieving Buffer Check Results.  Reason is: " + bufchk.getErrorType() + ":" + bufchk.getErrorMessage());
            return false
        }

        for (a2 in proxArr) {
            var proxObj = proxArr[a2].getGISObjects(); // if there are GIS Objects here, we're done
            for (z1 in proxObj) {
                var v = proxObj[z1].getAttributeValues()
                    retString = v[0];
            }

        }
    }
    return retString
}

function getGISInfoByParcel(pParcelNo, svc, layer, attributename) {
    try {
        var distanceType = "feet";
        var retString;

        //get layer
        var bufferTargetResult = aa.gis.getGISType(svc, layer); // get the buffer target
        if (bufferTargetResult.getSuccess()) {
            var buf = bufferTargetResult.getOutput();
            buf.addAttributeName(attributename);
        } else {
            logDebug("**WARNING: Getting GIS Type for Buffer Target.  Reason is: " + bufferTargetResult.getErrorType() + ":" + bufferTargetResult.getErrorMessage());
            return false
        }

        //get parcel GIS object
        //aa.print("Looking at parcel " + pParcelNo);
        var gisObjResult = aa.gis.getParcelGISObjects(pParcelNo); // get gis objects on the parcel number
        if (gisObjResult.getSuccess()) {
            var fGisObj = gisObjResult.getOutput();
        } else {
            logDebug("**ERROR: Getting GIS objects for Parcel.  Reason is: " + gisObjResult.getErrorType() + ":" + gisObjResult.getErrorMessage());
            return false
        }

        for (a1 in fGisObj) // for each GIS object on the Cap.  We'll only send the last value
        {
            var bufchk = aa.gis.getBufferByRadius(fGisObj[a1], "0", distanceType, buf);

            if (bufchk.getSuccess())
                var proxArr = bufchk.getOutput();
            else {
                logDebug("**WARNING: Retrieving Buffer Check Results.  Reason is: " + bufchk.getErrorType() + ":" + bufchk.getErrorMessage());
                return false
            }

            for (a2 in proxArr) {
                var proxObj = proxArr[a2].getGISObjects(); // if there are GIS Objects here, we're done
                for (z1 in proxObj) {
                    var v = proxObj[z1].getAttributeValues()
                        retString = v[0];
                }
            }
        }
        return retString;
    } catch (err) {
        //logDebug("A JavaScript Error occurred in custom function getGISInfoByParcel(): " + err.message);
        aa.print("A JavaScript Error occurred in custom function getGISInfoByParcel(): " + err.message);
    }
}
