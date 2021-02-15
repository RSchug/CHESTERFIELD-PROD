/*
Name: 			DS_ASI_002 NumberOfDwellingUnits
Execute In:		ACA Only
Execute Fields:	OnSubmit
ASI::PROJECT SCOPE::Number of Dwelling Units

 */
var expressionName = expression.expressionName;
var showMessage = false; // Set to true to see results in form message
var showDebug = false; // Set to true to see debug messages in form message
var disableTokens = false; // turn off tokenizing of std choices (enables use of "{} and []")
var useAppSpecificGroupName = false; // Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = false; // Use Group name when populating Task Specific Info Values
var enableVariableBranching = true; // Allows use of variable names in branching.  Branches are not followed in Doc Only
var maxEntries = 99; // Maximum number of std choice entries.  Entries must be Left Zero Padded
var debugUserIDs = ["500501"];
var supervisor = false;
var supervisorUserIDs = [];

var cancel = false;
var debug = "";
var message = "";
var br = "<BR>";

var msgFormatInfoBegin = "<font color=Blue>";
var msgFormatInfoEnd = "</font>";
var msgFormatWarnBegin = "<font color=Orange>";
var msgFormatWarnEnd = "</font>";
var msgFormatDebugBegin = "<font color=Purple>";
var msgFormatDebugEnd = "</font>";

/*------------------ Set context variables -------------------/
| Include the expression object for the ASI fields you want to update here
| Not sure why these are needed but they will not update if not included here
| Even when commented out they are still read by the expression engine
/------------------------------------------------------------*/
var thisForm = expression.getValue("ASI::FORM"); // be sure to update this as neccessary depending on target portlet.

var asiFields = [];
asiFields["Number of Dwelling Units"] = expression.getValue("ASI::PROJECT SCOPE::Number of Dwelling Units");
asiFields["Building Number"] = expression.getValue("ASI::ADDITIONAL ADDRESS INFO::Building Number");
asiFields["Project Classification"] = expression.getValue("ASI::PROJECT CLASSIFICATION::Project Classification");

/*---------------- Required variables for using included functions and scripts ----------------------------*/
var aa = expression.getScriptRoot();
var servProvCode = expression.getValue("$$servProvCode$$").value;
var userID = expression.getValue("$$userID$$").value;
var gaUserID = expression.getValue("$$gaUserID$$").value;
var userfullname = expression.getValue("$$userfullname$$").value;
var userGroup = expression.getValue("$$userGroup$$").value;
var publicuser_email = expression.getValue("$$publicuser_email$$").value;

var totalRowCount = expression.getTotalRowCount();
var startTime = new Date();
var SCRIPT_VERSION = 3.0;

currentUserID = userID;
if (userID != gaUserID) {
    publicUser = true;
    publicUserID = userID;
    publicUserEmail = publicuser_email;
} else {
    publicUser = false;
    publicUserID = null;
    publicUserEmail = null;
}

// Migrated to INCLUDES_EXPRESSION_GLOBALS
if (exists(currentUserID, debugUserIDs))
    showDebug = true; // Set to true to see debug messages in form message (Debug Users)
var supervisor = false;
if (exists(currentUserID, supervisorUserIDs))
    supervisor = true;

/*---------------- If needed pull in includes ------------------*/
try {
    var useCustomScriptFile = true; // if true, use Events->Custom Script and Master Scripts, else use Events->Scripts->INCLUDES_*
    //	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",null,useCustomScriptFile));
    //	eval(getScriptText("INCLUDES_CUSTOM",null,useCustomScriptFile));
    eval(getScriptText("INCLUDES_EXPRESSION", null));
    eval(getScriptText("INCLUDES_EXPRESSION_GLOBALS", null));
} catch (err) {
    handleError_EXP(err, expressionName);
}
/*------------------- Overridden Standard Functions --------------------- */
if (true) { // Override Standard Function. These should normally be placed in INCLUDES_EXPRESSION script.
    function handleError(err, context) { // Override INCLUDES_ACCELA_FUNCTIONS so message is displayed on Form.
        var rollBack = true;
        var showError = true;

        if (showError)
            showDebug = true;
        thisForm.message = "**Error " + err.message + " In " + context + " Line " + err.lineNumber;
        expression.setReturn(thisForm);

        aa.print((rollBack ? "**ERROR** " : "ERROR: ") + err.message + " In " + context + " Line " + err.lineNumber);
        aa.print("Stack: " + err.stack);
    }

    function logDebug(dstr) { // Override INCLUDES_ACCELA_FUNCTIONS
        debug += dstr + br;
    }

    function logMessage(dstr) { // Override INCLUDES_ACCELA_FUNCTIONS
        message += dstr + br;
    }
    var toPrecision = function (value) {
        var multiplier = 100;
        return Math.round(value * multiplier) / multiplier;
    }
}

try {
    if (exists(currentUserID, debugUserIDs))
        showDebug = true;
    var supervisor = false;
    if (exists(currentUserID, supervisorUserIDs))
        supervisor = true;

    var fieldName = "Number of Dwelling Units";
    var fieldValue = asiFields[fieldName].value;
    if (asiFields[fieldName].getHidden() == false
         && (!publicUser || isFieldLoadedinACAPage(asiFields[fieldName]))) { // Is AA User or is Field shows on ACA Page.
        logDebug("Checking field: " + fieldName
             + ", value: " + asiFields[fieldName].value
             + ", value*1: " + asiFields[fieldName].value * 1
             + ", Hidden: " + asiFields[fieldName].getHidden()
             + ", Required: " + asiFields[fieldName].getRequired()
             + ", blank: " + (asiFields[fieldName].getValue() == "")
             + ", null: " + (asiFields[fieldName].getValue() == null));
        if ((asiFields[fieldName].getRequired() != false // Field is Required
                 || !(fieldValue == null || fieldValue == "")) // or Field has a value.
             && (fieldValue * 1) < toPrecision(0)) {
            var errorMsg = fieldName + " (" + fieldValue + ") must be >= 0";
            var errorMsgDetails = errorMsg
                 + " " + asiFields[fieldName].getValue()
                 + ", Hidden: " + asiFields[fieldName].getHidden()
                 + ", Required: " + asiFields[fieldName].getRequired()
                 + ", blank: " + (asiFields[fieldName].getValue() == "")
                 + ", null: " + (asiFields[fieldName].getValue() == null)
                 + ", 0: " + (asiFields[fieldName].getValue() == 0)
                //              + " " + asiFields[fieldName].getName()
                 + ", isFieldLoaded: " + isFieldLoadedinACAPage(asiFields[fieldName])
                 + ", userId: " + userID
                 + ", gaUserID: " + gaUserID + (gaUserID && gaUserID != "" ? " " + gaUserID : "null");
            var errorMsgDetails = null;

            asiFields[fieldName].message = errorMsg;
            cancel = true;
            logDebug(errorMsg);
            // Show Error Message on other ACA Pages or Fields when field is hidden.
            if (publicUser && errorMsgDetails) {
                for (f in asiFields) {
                    if (f == fieldName)
                        continue;
                    asiFields[f].message = errorMsgDetails
                        expression.setReturn(asiFields[f]);
                }
            }
        }
    } else {
        asiFields[fieldName].message = "";
    }
    expression.setReturn(asiFields[fieldName]);
    // Show Debug
    if (cancel && supervisor)
        logDebug("** Supervisor override allowed **")
        if (debug && debug != "" && (showDebug || debug.indexOf("**ERROR:") >= 0)) {
            thisForm.message = (message == "" ? "" : message + br) + msgFormatDebugBegin + "DEBUG: " + debug + msgFormatDebugEnd;
            expression.setReturn(thisForm);
        } else if (message != "") {
            thisForm.message = message;
            expression.setReturn(thisForm);
        }
    if (cancel && !supervisor) {
        thisForm.blockSubmit = true;
        expression.setReturn(thisForm);
    }
} catch (err) {
    handleError_EXP(err, expressionName);
}
/*------------------- Required Expression Functions --------------------- */
function handleError_EXP(err, context) {
    thisForm.message = "**Error " + err.message + " In " + context + " Line " + err.lineNumber + "<br>" + "Stack: " + err.stack;
    thisForm.blockSubmit = true;
    expression.setReturn(thisForm);

    thisForm.message = msgFormatInfoBegin + debug + msgFormatInfoEnd;
    thisForm.blockSubmit = true;
    expression.setReturn(thisForm);
}
function logDebug(dstr) {
    debug += dstr + br;
}
function logMessage(dstr) {
    message += dstr + br;
    thisForm.message = dstr;
    expression.setReturn(thisForm);
}

function exists(eVal, eArray) {
    ignoreCase = true;
    if (arguments.length > 2 && arguments[2] != null)
        ignoreCase = (arguments[2] ? true : false);
    for (ii in eArray) {
        if (eArray[ii] == eVal)
            return true;
        if (ignoreCase && eVal && String(eVal).equalsIgnoreCase(eArray[ii]))
            return true;
    }
    return false;
}

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

function isFieldLoadedinACAPage(field) {
    // This function take advantage of how ACA replaces the Name with the ACA Field Place Holder if the field is on the page.
    // This only works ASI fields if they are not Y/N fields.
    // Example: ASI::AFFORDABLE HOUSING IMPACT FEE::Fee Total,
    // 		normal name: app_spec_info_AFFORDABLE_HOUSING_IMPACT_FEE_Fee_Total%0cDENVER%0cBuilding_Log
    //		ACA shown name: ctl00_PlaceHolderMain_AppSpec3FDFBDFBEdit_DENVER_txt_0_8
    if (!publicUser) { // AA User
        logDebug("isFieldLoadedinACAPage: true. !publicUser: " + (!publicUser))
        return true;
    }
    var fieldName = String(field);
    if (field.getClass && field.getClass() == "class com.accela.aa.aamain.expression.ExpressionFieldModel") {
        var fieldName = field.getName();
        if (String(field.usage).equalsIgnoreCase("VARIABLE") && field.variableKey.indexOf("ASI::") == -1)
            return null; // Check Only works for ASI Fields.
        if (field.type == 3)
            return null;
    }

    logDebug("isFieldLoadedinACAPage: " + (fieldName.indexOf("PlaceHolderMain") >= 0) + ". fieldName: " + fieldName + (field && field.getName ? " " + field.getName() : ""));
    /* It only works for ASI fields */
    if (fieldName.indexOf("PlaceHolderMain") >= 0) {
        return true;
    } else {
        return false;
    }
}
