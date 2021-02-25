/*------------------------------------------------------------------------------------------------------/
| Program: BatchCISNewServices  Trigger: Batch
| Client : Chesterfield County
|
/------------------------------------------------------------------------------------------------------*/


/*------------------------------------------------------------------------------------------------------/
| START: USER CONFIGURABLE PARAMETERS
/------------------------------------------------------------------------------------------------------*/
var emailText = "";
var debugText = "";
var showDebug = 3;
var showMessage = false;
var message = "";
var maxSeconds = 10 * 60;
var br = "<br>";
var useAppSpecificGroupName = false;
feeSeqList = new Array();
paymentPeriodList = new Array();
publicUser = false;
var currentUserID = "ADMIN";
var paramsOK = true;

var sysDate = aa.date.getCurrentDate();
var sysDateMMDDYYYYHHMMSS = dateFormatted(sysDate.getMonth(),sysDate.getDayOfMonth(),sysDate.getYear(),sysDate.getHourOfDay(),sysDate.getMinute(),sysDate.getSecond());
var batchJobID = aa.batchJob.getJobID().getOutput();
var batchJobName = "" + aa.env.getValue("batchJobName");
var agencyName = aa.getServiceProviderCode();
var fileName="CISNewService_" + sysDateMMDDYYYYHHMMSS;
aa.print(fileName);


//Global variables
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var runDate = new Date();
var appGroup = "Utilities";
var appTypeType = "ServiceConnection|ResidentialCompanionMeter";
var appSubtype = "NA";
var appCategory = "NA";
var appStatus = "Ready for CIS";
var startDate = new Date();
var timeExpired = false;
var startTime = startDate.getTime();
var appType = appGroup + "/" + appTypeType + "/" + appSubtype + "/" + appCategory;
var delim = "|";

/*------------------------------------------------------------------------------------------------------/
| BEGIN Includes
/------------------------------------------------------------------------------------------------------*/
var SCRIPT_VERSION = 9.0;
var useCustomScriptFile = true;  // if true, use Events->Custom Script and Master Scripts, else use Events->Scripts->INCLUDES_*
var useSA = false;
var SA = null;
var SAScript = null;
var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_FOR_EMSE");
if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") {
    useSA = true;
    SA = bzr.getOutput().getDescription();
    bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_INCLUDE_SCRIPT");
    if (bzr.getSuccess()) {
        SAScript = bzr.getOutput().getDescription();
    }
}

var controlFlagStdChoice = "EMSE_EXECUTE_OPTIONS";
var doStdChoices = true; // compatibility default
var doScripts = false;
var bzr = aa.bizDomain.getBizDomain(controlFlagStdChoice).getOutput().size() > 0;
if (bzr) {
    var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice, "STD_CHOICE");
    doStdChoices = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I";
    var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice, "SCRIPT");
    doScripts = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I";
    var bvr3 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice, "USE_MASTER_INCLUDES");
    if (bvr3.getSuccess()) { if (bvr3.getOutput().getDescription() == "No") useCustomScriptFile = false };
}
if (SA) {
    eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", SA, useCustomScriptFile));
    eval(getScriptText("INCLUDES_ACCELA_GLOBALS", SA, useCustomScriptFile));
    eval(getScriptText(SAScript, SA));
} else {
    eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, useCustomScriptFile));
    eval(getScriptText("INCLUDES_ACCELA_GLOBALS", null, useCustomScriptFile));
}
eval(getScriptText("INCLUDES_CUSTOM"));
eval(getScriptText("INCLUDES_BATCH"));
eval(getScriptText("INCLUDES_DATA_LOAD"));


overRide = "function logDebug(dstr) { debugText += dstr + br; } function logMessage(dstr) { debugText += dstr + br }";
eval(overRide);

function getScriptText(vScriptName, servProvCode, useProductScripts) {
    if (!servProvCode) servProvCode = aa.getServiceProviderCode();
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
/*------------------------------------------------------------------------------------------------------/
| END: USER CONFIGURABLE PARAMETERS
/------------------------------------------------------------------------------------------------------*/


/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/------------------------------------------------------------------------------------------------------*/
if (paramsOK) {
    d = new Date().getDay();

        logDebug("Start of " + batchJobName + " Batch Job.");

        c = mainProcess();
        logDebug("Processed " + c + " records");
        logDebug("End of " + batchJobName + " Batch Job, Elapsed Time : " + elapsed() + " Seconds.");

}

aa.print("debugText: " + debugText);
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/
function mainProcess() {
    lines = new Array();
    vCapList = new Array();
    var capCount = 0;
    var emptyCm1 = aa.cap.getCapModel().getOutput();
    var emptyCt1 = emptyCm1.getCapType();
    try {
        typePieces = appTypeType.split('|');
        for (var rIndex = 0;rIndex<typePieces.length;rIndex++) {
            emptyCt1.setGroup(appGroup);
            emptyCt1.setType(typePieces[rIndex]);
            emptyCt1.setSubType(appSubtype);
            emptyCt1.setCategory(appCategory);
            emptyCm1.setCapStatus(appStatus);
            emptyCm1.setCapType(emptyCt1);
            //Accessing all the records of the given type
            var vCapListResult = aa.cap.getCapIDListByCapModel(emptyCm1);
            if (vCapListResult.getSuccess()) {
                tmpList = vCapListResult.getOutput();
                if (tmpList) 
                    vCapList = vCapList.concat(tmpList);
            }
        } 
            
        if (vCapList) {
         //   lines.push(headers());
            logDebug("Found " + vCapList.length + " records to process");
            for (i in vCapList) {
                if (elapsed() > maxSeconds) { // only continue if time hasn't expired
                    logDebug("WARNING","A script timeout has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.") ;
                    timeExpired = true;
    			    break;
    		    }

                capId = aa.cap.getCapID(vCapList[i].getCapID().getID1(), vCapList[i].getCapID().getID2(), vCapList[i].getCapID().getID3()).getOutput();
                if (!capId) {
                    logDebug("Could not get Cap ID");
                    continue;
                }
                altId = capId.getCustomID();
                logDebug("Processing " + altId);         
                capCount++;
                newLine = getLine(capId);
                lines.push(newLine);
                if (appMatch("Utilities/ResidentialCompanionMeter/NA/NA", capId))
                    updateAppStatusLOCAL("Issued", "Set by CIS Batch", capId);
                else
                    updateAppStatusLOCAL("Completed", "Set by CIS Batch", capId);
            }
            if (lines.length > 0) {
                sendFile(lines.join("<br/>"));
            }
        }
        else {
            logDebug("No records meet criteria");
        }

    }
    catch (err) {
        logDebug(err);
    }

    return capCount;
}

/*------------------------------------------------------------------------------------------------------/
| <===========Internal Functions and Classes (Used by this script)
/------------------------------------------------------------------------------------------------------*/

function getLine(capId) {
    cap = aa.cap.getCap(capId).getOutput();
    capStatus = cap.getCapStatus();
    appTypeResult = cap.getCapType();
    appTypeString = appTypeResult.toString();
    appTypeArray = appTypeString.split("/");
    nd = new dataObj(capId);
    nd.populate();
    return nd.toString();
}

function dataObj(capId) {
    this.capId = capId;
    this.ServiceNumber = "X";
    this.ServiceAddressStreetNumber = 0;
    this.ServiceAddressStreetDir = blankStr(1);
    this.ServiceAddressStreetName = "X";
    this.ServiceAddressStreetType = blankStr(4);
    this.ServiceAddressSuite = blankStr(15);
    this.City = "X";
    this.State = "XX";
    this.ServiceAddressZip = "X"; //9
    this.MapGrid = "";
    this.Subdivision = blankStr(50); //11
    this.Lot = blankStr(5);  
    this.NewOrExisting = "N";
    this.ActualMeterSize = blankStr(2);
    this.VirtualMeterSize = blankStr(2);
    this.ServiceLineSize = blankStr(5);
    this.WaterProjectNumber = blankStr(9);
    this.SewerProjectNumber = blankStr(9);
    this.IrrigationProjectNumber = blankStr(9);
    this.Water = "N"; // 20
    this.Sewer = "N";
    this.Irrigation = "N";
    this.Classification = "X";
    this.Cycle = "X";
    this.Route = "X";
    this.NumberOfUnits = 0;
    this.Category = "99";
    this.TreatmentLocation = blankStr(2);
    this.WaterNode = blankStr(5);
    this.ConnectionType = "X";  // 30
    this.IrrigationConnnectionType = "X";
    this.MeterLocationCode = blankStr(1);
    this.DistanceToRightPin = 0;
    this.DistanceToLeftPin = 0;
    this.Comments = blankStr(45);
    this.IrrigationComments = blankStr(45);
    this.CustomerNumber = blankStr(7); // 37
    this.CustomerNameType = "R";
    this.CustomerNamePrefix = blankStr(4);
    this.CustomerFirstName = blankStr(20); // 40
    this.CustomerMiddleName = blankStr(20);
    this.CustomerLastName = "X";
    this.CustomerNameSuffix = blankStr(1);
    this.SpouseNameType = blankStr(1);
    this.SpouseFirstName = blankStr(20);
    this.SpouseMiddleName = blankStr(20);
    this.SpouseLastName = blankStr(35);
    this.SpouseNameSuffix = blankStr(10);
    this.CustomerSSN = blankStr(9);
    this.SpouseSSN = blankStr(9); // 50
    this.BusinessPhone = blankStr(15);
    this.HomePhone = blankStr(15);
    this.Address1 = blankStr(40);
    this.MailingAddressStreetNumber = blankStr(5);
    this.MailingAddressStreetNumberSuffix = blankStr(1);
    this.MailingAddressStreetDir = blankStr(1);
    this.MailingAddressStreetName = blankStr(30); // 57
    this.MailingAddressStreetType = blankStr(4);
    this.MailingAddressSuite = blankStr(15);
    this.MailingAddressPOBox = blankStr(15); // 60
    this.MailingAddressCity = "X"; 
    this.MailingAddressState = "XX";
    this.MailingAddressZip = "X";
    this.MeterSetDate = blankStr(10);
    this.WaterPaidDate = blankStr(10);
    this.SewerPaidDate = blankStr(10);
    this.SewerConnectionDate = blankStr(10);
    this.WaterInstallmentContractNumber = blankStr(5);
    this.WaterInstallmentContractAmount = "0.00";
    this.SewerInstallmentContractNumber = blankStr(5); // 70
    this.SewerInstallmentContractAmount = "0.00";
    this.MeterHoldFlag = "X";
    this.IrrigationHoldFlag = "X";
    this.TapNumber = "X";
    this.BuildingName = "X";

    this.ASI = new Array();
    loadAppSpecific(this.ASI, this.capId);

    this.populate = function() {   
        RCM = false;  
        idStr = this.capId.getCustomID();
        if (idStr.indexOf("RCM") == 0) {
            RCM = true;
        }
        idStr = String(idStr).replace(/-/g, '');
        if (idStr.length > 9) {
            idStr = idStr.substring(idStr.length -9, idStr.length);
        }

        this.WaterProjectNumber = idStr;
        this.SewerProjectNumber = idStr;
        this.IrrigationProjectNumber = idStr;
        capResult = aa.cap.getCap(this.capId);
        if (capResult.getSuccess) {
	        capModel = capResult.getOutput().getCapModel()
            capName = capModel.getSpecialText();
            if (capName && capName != "null" && capName != "")
                this.BuildingName = padChars(capName, 20);
        }
        acctVal = getValue(this.ASI, "Service Number");
        if (acctVal && acctVal != "") {
            this.ServiceNumber = padChars(acctVal, 8);
            //this.CustomerNumber = padChars(acctVal, 8);
        }
        this.populateAddress();
        this.populateParcel();
        neValue = getValue(this.ASI, "New or Existing");
        if (neValue == "New")
            this.NewOrExisting = "N"
        if (neValue == "Existing")
            this.NewOrExisting = "E";       
        actualMeterSizeVal = getValue(this.ASI, "Actual Meter Size");
        if (actualMeterSizeVal && actualMeterSizeVal != "") {
            amsStr = translateMeterSize(actualMeterSizeVal);
            if (amsStr && amsStr != "") {
                this.ActualMeterSize = amsStr;
            }
        }
        vm = getValue(this.ASI, "Virtual Meter");
        if (vm == "CHECKED") {
            this.VirtualMeterSize = translateMeterSize(actualMeterSizeVal);
        }
        serviceLineSizeVal = getValue(this.ASI, "Service Line Size");
        if (serviceLineSizeVal && serviceLineSizeVal != "") {
            amsStr = translateMeterSizeDecimal(serviceLineSizeVal);
            if (amsStr && amsStr != "")
                this.ServiceLineSize = amsStr;
        }
        utilityTypeStr = getValue(this.ASI, "Utility Type");
        if (utilityTypeStr == "Both") {
            this.Water = "Y"; 
            this.Sewer = "Y";
        }
        else {
            if (utilityTypeStr == "Water") this.Water = "Y";
            if (utilityTypeStr == "Sewer") this.Sewer = "Y";
        }
        classValStr = getValue(this.ASI, "Classification");
        classVal = translateClass(classValStr);
        if (classVal && classVal != "") this.Classification = classVal;
        cycleVal = getValue(this.ASI, "Cycle");
        if (cycleVal && cycleVal != "")
            this.Cycle = padChars(cycleVal, 2);
        routeVal = getValue(this.ASI, "Route");
        if (routeVal && routeVal != "")
            this.Route = padChars(routeVal, 4);
        numOfUnits = getValue(this.ASI, "Number of Units");
        if (numOfUnits && numOfUnits != "") 
            this.NumberOfUnits = parseInt(numOfUnits);
        catStr = getValue(this.ASI, "Category");
        if (catStr && catStr != "") {
            if (catStr == "Residential") this.Category = "RS";
            if (catStr == "Multifamily") this.Category = "RSM";
            if (catStr == "Others")      this.Category = " 99";
        }
        treatStr = getValue(this.ASI, "Treatment Code");
        if (treatStr && treatStr != "") {
            this.TreatmentLocation = treatStr.substring(0,2);
        }
        if (RCM) {  // overrides for RCM
            this.Irrigation = "Y";
            this.TapNumber = this.ServiceNumber;
            acctVal = getValue(this.ASI, "Domestic Service Number");
            if (acctVal && acctVal != "") {
                this.ServiceNumber = padChars(acctVal, 8);
                //this.CustomerNumber = padChars(acctVal, 8);
            }
            this.WaterProjectNumber = "";
            this.SewerProjectNumber = "";
            this.VirtualMeterSize = "00";
            this.Water = "N";
            this.WaterNode = "00000";
            this.ConnectionType = "";
            this.IrrigationConnnectionType = "F";
            this.MeterLocationCode = "00";
            meterSetDateVal = getValue(this.ASI, "Meter Set Date");
            if (meterSetDateVal && meterSetDateVal != "") 
                this.MeterSetDate = meterSetDateVal;
            meterHoldVal = getValue(this.ASI, "Meter Hold");
            if (meterHoldVal && meterHoldVal == "CHECKED")
                this.MeterHoldFlag = "Y";
            else 
                this.MeterHoldFlag = "N";
            //conVal = getValue(this.ASI, "Connection Type");
            //if (conVal && conVal != "")
                //this.ConnectionType = conVal;
        }
        this.populateBillingContact();

        var pfResult = aa.finance.getPaymentFeeItems(this.capId, null);
        if (pfResult.getSuccess()) {
            var pfObj = pfResult.getOutput();
            for (var ij in pfObj) {
                payFeeObj = pfObj[ij];
                feeSeqNum = payFeeObj.getFeeSeqNbr();
                paySeqNum = payFeeObj.getPaymentSeqNbr();
                var feeItemScript = aa.finance.getFeeItemByPK(this.capId,feeSeqNum);
		        if(feeItemScript.getSuccess) {
			        var feeItem = feeItemScript.getOutput().getF4FeeItem();
                    feeCode = feeItem.getFeeCod();
                    pReturn = aa.finance.getPaymentByPK(this.capId,paySeqNum,currentUserID);
                    if (pReturn.getSuccess()) {
                        paymentScriptModel = pReturn.getOutput();
                        if (paymentScriptModel) {
                            paymentDate = paymentScriptModel.getPaymentDate(); // ScriptDateTime
                            if (paymentDate) {
                                jsPaymentDate = convertDate(paymentDate);
                                paymentDateStr = jsDateToASIDate(jsPaymentDate);
                                if (String(feeCode).indexOf("WATER") == 0) 
                                    this.WaterPaidDate = paymentDateStr;     
                                if (String(feeCode.indexOf("SEWER") == 0)) {
                                    if (!RCM || (RCM && utilityTypeStr != "Water"))
                                        this.SewerPaidDate = paymentDateStr;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    this.populateBillingContact = function() {
        var capContactResult = aa.people.getCapContactByCapID(this.capId);
        if (capContactResult.getSuccess()) {
            var Contacts = capContactResult.getOutput();
            for (yy in Contacts) {
                if(Contacts[yy].getCapContactModel().getContactType() == "Billing Contact") {
                    var con = Contacts[yy].getCapContactModel();
                    var peop = con.getPeople();
                    bName = peop.getBusinessName();
                    if (bName && bName != "") {
                        this.CustomerNameType = "C";
                        this.CustomerLastName = padChars(bName, 35);
                    }
                    else    
                        this.CustomerNameType = "R";
                    fName = peop.getFirstName();
                    if (fName && fName != "") this.CustomerFirstName = padChars(fName, 20);
                    mName = peop.getMiddleName();
                    if (mName && mName != "") this.CustomerMiddleName = padChars(mName, 20);
                    lName = peop.getLastName();
                    if (lName && lName != "") this.CustomerLastName = padChars(lName, 35);
                    sName = peop.getNamesuffix();
                    if (sName && sName != "") this.CustomerNameSuffix = padChars(sName, 10);
                    phone = peop.getPhone1();
                    if (phone && phone != "") {
                        this.BusinessPhone = padChars(phone, 15);
                        this.HomePhone = padChars(phone, 15);
                    }  
                    var addressList = aa.address.getContactAddressListByCapContact(con).getOutput();
                    if (addressList) {
                        for (add in addressList) {
                            contactAddressModel = addressList[add].getContactAddressModel();
                            addrType = contactAddressModel.getAddressType();
                            if (addrType == "Billing") {
                                mStNum = contactAddressModel.getHouseNumberStart();
                                if (mStNum) this.MailingAddressStreetNumber = padChars("" + mStNum, 5);
                                mStDir = contactAddressModel.getStreetDirection();
                                if (mStDir && mStDir != "") this.MailingAddressStreetDir = mStDir;
                                mStName = contactAddressModel.getStreetName();
                                if (mStName && mStName != "") {
                                    if (mStName.indexOf("PO Box") < 0)
                                        this.MailingAddressStreetName = padChars(mStName, 35);
                                    else 
                                        this.MailingAddressPOBox = padChars(mStName, 35)
                                }
                                mStType = contactAddressModel.getStreetSuffix();
                                if (mStType && mStType != "") this.MailingAddressStreetType = padChars(mStType, 4);
                                mUnitStart = contactAddressModel.getUnitStart();
                                mUnitType = contactAddressModel.getUnitType();
                                mUnitStr = "";
                                if (mUnitType && mUnitType != "") mUnitStr += mUnitType;
                                if (mUnitStart && mUnitStart != "") {
                                    if (mUnitStr == "") mUnitStr = mUnitStart; 
                                    else mUnitStr += " " + mUnitStart;
                                }
                                if (mUnitStr != "") this.MailingAddressSuite = padChars(mUnitStr, 10);
                                mCity = contactAddressModel.getCity();
                                if (mCity && mCity != "") this.MailingAddressCity = padChars(mCity, 35);
                                mState = contactAddressModel.getState();
                                if (mState && mState != "") this.MailingAddressState = mState;
                                mZip = contactAddressModel.getZip();
                                if (mZip && mZip != "") this.MailingAddressZip = padChars(mZip, 9);
                                break;
                            }
                        }
                    }
                }
                break;
            }
        }
    }
    
    this.populateAddress= function() {
            var capAddrResult = aa.address.getAddressByCapId(capId);
            var addressToUse = null;		
            if (capAddrResult.getSuccess()) {
                var addresses = capAddrResult.getOutput();
                if (addresses) {
                    for (zz in addresses) {
                          capAddress = addresses[zz];
                        if (capAddress.getPrimaryFlag() && capAddress.getPrimaryFlag().equals("Y")) 
                            addressToUse = capAddress;
                    }
                    if (addressToUse == null)
                        addressToUse = addresses[0];
        
                    if (addressToUse) {
                        strAddress = addressToUse.getHouseNumberStart();
                        this.ServiceAddressStreetNumber =  padChars(strAddress, 5);
                        var addPart = addressToUse.getStreetDirection();
                        if (addPart && addPart != "") 
                            this.ServiceAddressStreetDir = addPart;                   
                        var addPart = addressToUse.getStreetName();
                        if (addPart && addPart != "") this.ServiceAddressStreetName = padChars(addPart, 30);
                        var addPart = addressToUse.getStreetSuffix();
                        if (addPart && addPart != "") this.ServiceAddressStreetType =  padChars(addPart, 4);	
                        var addPart = addressToUse.getUnitStart();
                        unitStart = addressToUse.getUnitStart();
                        unitType = addressToUse.getUnitType();
                        unitStr = "";
                        if (unitType && unitType != "") unitStr += unitType;
                        if (unitStart && unitStart != "") {
                            if (unitStr == "") unitStr = unitStart; 
                            else unitStr += " " + unitStart;
                        }
                        if (unitStr != "") this.ServiceAddressSuite = padChars(unitStr, 15);
                        var addPart = addressToUse.getCity();
                        if (addPart && addPart != "") this.City = padChars(addPart, 25);
                        var addPart = addressToUse.getState();
                        if (addPart && addPart != "") this.State= addPart;	
                        var addPart = addressToUse.getZip();
                        if (addPart && addPart != "") this.ServiceAddressZip = padChars(addPart, 9);
                        var addPart = addressToUse.getNeighborhood();
                        if (addPart && addPart != "") this.Subdivision = padChars(addPart, 50);
                    }
                }
            }
        }  

    this.populateParcel = function() {
        parcelToUse = null; parcelNum = null;
        var capParcelResult = aa.parcel.getParcelandAttribute(this.capId,null);
        if (capParcelResult.getSuccess()) {
            var Parcels = capParcelResult.getOutput().toArray();
            for (zz in Parcels) {
                thisParcel = Parcels[zz];
                if (thisParcel.getPrimaryParcelFlag() == "Y") {
                    parcelToUse = thisParcel;
                    break;
                }
            }
            if (parcelToUse == null && Parcels.length > 0)
                parcelToUse = Parcels[0];
        }
        if (parcelToUse != null) {
            parcelNum = parcelToUse.getParcelNumber();
            this.MapGrid = padChars(parcelNum, 6);
            pLot = parcelToUse.getLot();
            if (pLot && pLot != "") this.Lot = padChars(pLot, 5);
        }
    }

   
    this.toString = function() {
        return this.ServiceNumber + delim + this.ServiceAddressStreetNumber + delim + this.ServiceAddressStreetDir + delim + this.ServiceAddressStreetName + delim + this.ServiceAddressStreetType + delim +
        this.ServiceAddressSuite + delim + this.City + delim + this.State + delim + this.ServiceAddressZip + delim + this.MapGrid + delim + this.Subdivision + delim + this.Lot + delim + this.NewOrExisting + delim + this.ActualMeterSize +
        delim + this.VirtualMeterSize + delim + this.ServiceLineSize + delim + this.WaterProjectNumber + delim + this.SewerProjectNumber + delim + this.IrrigationProjectNumber + delim + this.Water + delim + this.Sewer + 
        delim + this.Irrigation + delim + this.Classification + delim + this.Cycle + delim + this.Route + delim + this.NumberOfUnits + delim + this.Category + delim + this.TreatmentLocation + delim + this.WaterNode + 
        delim + this.ConnectionType + delim + this.IrrigationConnnectionType + delim + this.MeterLocationCode + delim + this.DistanceToRightPin + delim+ this.DistanceToLeftPin + delim+ this.Comments + delim + 
        this.IrrigationComments + delim + this.CustomerNumber + delim + this.CustomerNameType + delim + this.CustomerNamePrefix + delim + this.CustomerFirstName + delim + this.CustomerMiddleName + delim + 
        this.CustomerLastName + delim + this.CustomerNameSuffix + delim + this.SpouseNameType + delim + this.SpouseFirstName + delim + this.SpouseMiddleName + delim + this.SpouseLastName + delim + 
        this.SpouseNameSuffix + delim + this.CustomerSSN + delim + this.SpouseSSN + delim + this.BusinessPhone + delim + this.HomePhone + delim + this.Address1 + delim + this.MailingAddressStreetNumber + 
        delim + this.MailingAddressStreetNumberSuffix + delim + this.MailingAddressStreetDir + delim + this.MailingAddressStreetName + delim + this.MailingAddressStreetType + delim + this.MailingAddressSuite + 
        delim + this.MailingAddressPOBox + delim + 
        this.MailingAddressCity + delim + this.MailingAddressState + delim + this.MailingAddressZip + delim + this.MeterSetDate + delim + this.WaterPaidDate + delim + this.SewerPaidDate + delim + 
        this.SewerConnectionDate + delim + this.WaterInstallmentContractNumber + delim + this.WaterInstallmentContractAmount + delim + this.SewerInstallmentContractNumber + delim + 
        this.SewerInstallmentContractAmount + delim + this.MeterHoldFlag + delim + this.IrrigationHoldFlag + delim + this.TapNumber + delim + this.BuildingName;

    }
}


function headers() {
    return "ServiceNumber" + delim + "ServiceAddressStreetNumber "+ delim + "ServiceAddressStreetDir" + delim + "ServiceAddressStreetName" + delim + "ServiceAddressStreetType" + delim +
    "ServiceAddressSuite" + delim + "City" + delim + "State" + delim + "ServiceAddressZip" + delim + "MapGrid" + delim + "Subdivision" + delim + "Lot" + delim + "NewOrExisting" + delim + "ActualMeterSize" +
    delim + "VirtualMeterSize" + delim + "ServiceLineSize" + delim + "WaterProjectNumber" + delim + "SewerProjectNumber" + delim + "IrrigationProjectNumber" + delim + "Water" + delim + "Sewer" + 
    delim + "Irrigation" + delim + "Classification" + delim + "Cycle" + delim + "Route" + delim + "NumberOfUnits" + delim + "Category" + delim + "TreatmentLocation" + delim + "WaterNode" + 
    delim + "ConnectionType" + delim + "IrrigationConnnectionType" + delim + "MeterLocationCode" + delim + "DistanceToRightPin" + delim+ "DistanceToLeftPin" + delim+ "Comments" + delim + 
    "IrrigationComments" + delim + "CustomerNumber" + delim + "CustomerNameType" + delim + "CustomerNamePrefix" + delim + "CustomerFirstName" + delim + "CustomerMiddleName" + delim + 
    "CustomerLastName" + delim + "CustomerNameSuffix" + delim + "SpouseNameType" + delim + "SpouseFirstName" + delim + "SpouseMiddleName" + delim + "SpouseLastName" + delim + 
    "SpouseNameSuffix" + delim + "CustomerSSN" + delim + "SpouseSSN" + delim + "BusinessPhone" + delim + "HomePhone" + delim + "Address1" + delim + "MailingAddressStreetNumber" + 
    delim + "MailingAddressStreetNumberSuffix" + delim + "MailingAddressStreetDir" + delim + "MailingAddressStreetName" + delim + "MailingAddressStreetType" + delim + "MailingAddressSuite" + 
    delim + "MailingAddressPOBox" + delim + 
    "MailingAddressCity" + delim + "MailingAddressState" + delim + "MailingAddressZip" + delim + "MeterSetDate" + delim + "WaterPaidDate" + delim + "SewerPaidDate" + delim + 
    "SewerConnectionDate" + delim + "WaterInstallmentContractNumber" + delim + "WaterInstallmentContractAmount" + delim + "SewerInstallmentContractNumber" + delim + 
    "SewerInstallmentContractAmount" + delim + "MeterHoldFlag" + delim + "IrrigationHoldFlag" + delim + "TapNumber" + delim + "BuildingName";
}


function translateMeterSize(s) {
    var retVal = "";
    switch ("" + s) {
        case '5/8"': retVal = "01"; break;
        case  '3/4"': retVal = "05"; break;
        case  '1"': retVal = "10"; break;
        case  '1 1/4"': retVal = "12"; break;
        case  '1 1/2"': retVal = "15"; break;
        case  '2"': retVal = "20"; break;
        case  '2 1/2"': retVal = "25"; break;
        case  '3"': retVal = "30"; break;
        case  '4"': retVal = "40"; break;
        case  '4 1/2"': retVal = "45"; break;
        case  '6"': retVal = "60"; break;
        case  '8"': retVal = "80"; break;
        case  '10"': retVal = "90"; break;
        case  '12"': retVal = "92"; break;
        default: break;
    }
    return retVal;
}


function translateMeterSizeDecimal(s) {
    var retVal = "";
    switch ("" + s) {
        case '5/8"': retVal = "00.68"; break;
        case  '3/4"': retVal = "00.75"; break;
        case  '1"': retVal = "01.00"; break;
        case  '1 1/4"': retVal = "01.25"; break;
        case  '1 1/2"': retVal = "01.50"; break;
        case  '2"': retVal = "02.00"; break;
        case  '2 1/2"': retVal = "02.50"; break;
        case  '3"': retVal = "03.00"; break;
        case  '4"': retVal = "04.00"; break;
        case  '4 1/2"': retVal = "04.50"; break;
        case  '6"': retVal = "06.00"; break;
        case  '8"': retVal = "08.00"; break;
        case  '10"': retVal = "10.00"; break;
        case  '12"': retVal = "12.00"; break;
        default: break;
    }
    return retVal;
}

function translateClass(s) {
    var retVal = "";
    switch ("" + s) {
        case 'Residential': retVal = "1"; break;
        case  'Apartment': retVal = "2"; break;
        case  'Trailer': retVal = "3"; break;
        case  'Business': retVal = "4"; break;
        case  'Industry': retVal = "5"; break;
        case  'Government': retVal = "6"; break;
        case  'Duplex': retVal = "7"; break;
        case  'Wholesale': retVal = "9"; break;
        case  'Apartment Irrigation': retVal = "A"; break;
        case  'Business Irrigation': retVal = "B"; break;
        case  'Government Irrigation': retVal = "G"; break;
        case  'Industry Irrigation': retVal = "I"; break;
        case  'Companion Meter': retVal = "S"; break;
        case  'Trailer Irrigation': retVal = "T"; break;
        case  'Mixed Use': retVal = "O"; break;
        case  'Duplex Irrigation': retVal = "D"; break;
        case  'Portable Meter': retVal = ""; break;
        case  'Installment-Adjustment': retVal = ""; break;
        default: break;
    }
    return retVal;
}

function blankStr(num) {
    retString = "";
  //  for (var i=0;i<num;i++)
  //      retString += ' ';
    return retString;
}

function padChars(sValue, width) {
	padChar = arguments.length > 2 && arguments[2].length > 0 ? padChar = arguments[2] : ' '; // In case pad char has been ommitted
	pSide = arguments.length > 3 ? pSide = arguments[3] : 'LEFT'; // Assumes left pad
	sValue = sValue+'';					// In case it is null
	if(sValue.length >= width){
		return sValue.substring(0, width);
	}
	else {
        //return pSide.toUpperCase() == 'RIGHT' ? sValue + new Array(width - sValue.length+1).join(padChar) : new Array(width - sValue.length+1).join(padChar)+sValue
        return sValue;
	}
}

function getValue(AInfo, fieldName) {
    retVal = "";
    if (AInfo && AInfo[fieldName] && AInfo[fieldName] != "") 
        retVal = AInfo[fieldName];
    return retVal;
}

function elapsed() {
    var thisDate = new Date(aa.util.now());
    var thisTime = thisDate.getTime();
    return ((thisTime - batchStartTime) / 1000)
}

// exists:  return true if Value is in Array
function exists(eVal, eArray) {
    for (ii in eArray)
        if (eArray[ii] == eVal) return true;
    return false;
}

function matches(eVal, argList) {
    for (var i = 1; i < arguments.length; i++)
        if (arguments[i] == eVal)
            return true;

}

function isNull(pTestValue, pNewValue) {
    if (pTestValue == null || pTestValue == "")
        return pNewValue;
    else
        return pTestValue;
}

function isEmptyOrNull(value) {
    return value == null || value === undefined || String(value) == "";
}

 
function updateAppStatusLOCAL(stat,cmt,itemCap) {
    itemCapId = aa.cap.getCapID(itemCap.getID1(), itemCap.getID2(), itemCap.getID3()).getOutput();
	var updateStatusResult = aa.cap.updateAppStatus(itemCapId, "APPLICATION", stat, sysDate, cmt, systemUserObj);
}

function sendFile(s) {
    logDebug("Sending file");
    var dataServiceURL = lookup("DataService", "URL");
    var dataServiceSoapAction = "http://tempuri.org/ITransferService/transferData";

    xmlRequest = '';
    xmlRequest += '<?xml version="1.0" encoding="UTF-8"?>';
    xmlRequest += '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">'
    xmlRequest += ' <soapenv:Header/>'
    xmlRequest += '  <soapenv:Body>'
    xmlRequest += '  <tem:transferData>'
    xmlRequest += '  <tem:filetype>' + 'CIS' + '</tem:filetype>'
    xmlRequest += '  <tem:filename>' + fileName + '</tem:filename>'
    xmlRequest += '  <tem:username>grayquarter</tem:username>'
    xmlRequest += '  <tem:password>wsiL2p83Pl0Z</tem:password>'
    xmlRequest += '  <tem:d>' + Base64.encode(s) + '</tem:d>'
    xmlRequest += '  </tem:transferData>'
    xmlRequest += '</soapenv:Body>'
    xmlRequest +='</soapenv:Envelope>   ';
    var postresp = aa.util.httpPostToSoapWebService(dataServiceURL, xmlRequest, "", "", dataServiceSoapAction);
    
    if (postresp.getSuccess()) {
       var response = postresp.getOutput();
       logDebug("Response: " + response);  
    }
    else {
        logDebug("Error : " + postresp.getErrorMessage());

    }

} 
 
function dateFormatted(pMonth, pDay, pYear, pHour, pMin, pSec)
//returns date string formatted as YYYY-MM-DD or MM/DD/YYYY (default)
{
	var mth = "";
	var day = "";
	var ret = "";
	if (pMonth > 9)
		mth = pMonth.toString();
	else
		mth = "0" + pMonth.toString();

	if (pDay > 9)
		day = pDay.toString();
	else
        day = "0" + pDay.toString();
        
    if (pHour > 9)
		hour = pHour.toString();
	else
        hour = "0" + pHour.toString();
        
    if (pMin > 9)
		min = pMin.toString();
	else
		min = "0" + pMin.toString();

    if (pSec > 9)
		sec = pSec.toString();
	else
        sec = "0" + pSec.toString();
        

	ret = "" + mth  + day + pYear.toString() + "_" + hour + min + sec;

	return ret;
} 