logDebug("Loading Events>Scripts>INCLUDES_CUSTOM");
/*------------------------------------------------------------------------------------------------------/
| Accela Automation
| Accela, Inc.
| Copyright (C): 2012
|
| Program : INCLUDES_CUSTOM.js
| Event   : N/A
|
| Usage   : Custom Script Include.  Insert custom EMSE Function below and they will be 
|	    available to all master scripts
|
| Notes   : 
|
|-------------------------------------------------------------------------------------------------------/
|
|  Standard INCLUDES_ACCELA_FUNCTIONS version ?.?: These were added because some events are calling older master scripts
|  They can be removed once the events are updated to use newer master scripts.
|  	function name
|  ----------
|  Modified from INCLUDES_ACCELA_FUNCTIONS
|  	function
|
| ------------------------------------------------------------------------------------------------------
|
| Change Log: 
| 04/21/2020 TRUEPOINT / MHELVICK Added loadCustomScript, getVendor, NOTIFICATION TEMPLATE functions, DIGEPLAN EDR custom functions
| 05/??/2020 DB Added doScriptActions for sending email via ACA
| 05/??/2020 Alex Charlton Added createChildLic, getCapWorkDesModel, copyDetailedDescription, getParentCapIDForReview, appHasConditiontrue
| 05/11/2020 Ray Schug Added ownerExistsOnCap
| 05/19/2020 Ray Schug Added getLicenseProf
| 05/21/2020 Ray Schug Added wasCapStatus, wasTaskStatus_TPS, isTaskStatus_TPS
| 06/03/2020 Ray Schug Initial Import of existing INCLUDES_CUSTOM from SUPP & PROD
| 06/10/2020 Ray Schug Added isTaskComplete_TPS
| 09/08/2020 Boucher updated addParcelStdCondition_TPS so status would be set correctly
| 12/03/2020 Boucher added new funtion per Melissa
| 12/26/2020 Boucher added new functions for Ref Parcel, Address and Owner to record from table
| 01-19-2021 Boucher added new function for overallCodeSchema so that it can be called from different events
| 03-10-2021 Graf added new functions for DPOR functionality and expression
|
/------------------------------------------------------------------------------------------------------*/
//This function activates or deactivates the given wfTask.
//Parameters capID,workflow task name, activateTask "Y" for activate, "N" for deactivate
function activateWFTName(capID,wfTaskName,activateTask){
	
	try{
		var workflowResult = aa.workflow.getTasks(capID);
		if (workflowResult.getSuccess())
			var wfObj = workflowResult.getOutput();
		else
			{ logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }
		
		for (i in wfObj)
		{
			var fTask = wfObj[i];
			if (fTask.getTaskDescription().toUpperCase().equals(wfTaskName.toUpperCase()))
			{
				var stepnumber = fTask.getStepNumber();
				if (!matches(fTask.getDisposition(),null,"",undefined)) {
					var completeFlag = "Y";
				} else {
					var completeFlag = fTask.getCompleteFlag();
				}
				//adjust task
				aa.workflow.adjustTask(capID, stepnumber, activateTask, completeFlag, null, null)

				// log wf task action into log file
				if(activateTask.toUpperCase()=="Y"){
					logDebug("Method name: activateWFTName. Message: Activating Workflow Task: " + wfTaskName + ". CapID:" + capID);
					return true;
				}else{
					logDebug("Method name: activateWFTName. Message: Deactivating Workflow Task: " + wfTaskName + ". CapID:" + capID);
					return true;
				}
			}			
		}
	}catch(err){
		logDebug("Method name: activateWFTName. Message: Error-" + err.message + ". CapID:" + capID);
		return false;
	}
}
//12-2020 D.Boucher added for adding new address from table data
function addAddressFromRef_TPS(fulladdress) {
	var s_id1 = aa.env.getValue("PermitId1");
	var s_id2 = aa.env.getValue("PermitId2");
	var s_id3 = aa.env.getValue("PermitId3");
	var targetCapID =  aa.cap.getCapID(s_id1, s_id2, s_id3).getOutput();
	var serviceProviderCode = aa.getServiceProviderCode();
	var currentUserID = aa.getAuditID();
	/** Adding addresses(look up refAddress) to a record. **/
	var searchRefAddressModel = aa.proxyInvoker.newInstance("com.accela.aa.aamain.address.RefAddressModel").getOutput();
	searchRefAddressModel.setFullAddress(fulladdress);

	//Look up the refAddressModel.
	var searchResult = aa.address.getRefAddressByServiceProviderRefAddressModel(searchRefAddressModel);
	if (searchResult.getSuccess())
	{
		var refAddressModelArray = searchResult.getOutput();
		for (yy in refAddressModelArray)
		{
			var refAddressModel = refAddressModelArray[yy];

			//Set the new addressModel attributes.
			var newAddressModel = refAddressModel.toAddressModel();
			newAddressModel.setCapID(targetCapID);
			newAddressModel.setServiceProviderCode(serviceProviderCode);
			newAddressModel.setAuditID(currentUserID);
			newAddressModel.setPrimaryFlag("Y");
			
			//Create new address for cap.
			aa.address.createAddress(newAddressModel);
			//createAddresses(targetCapID, newAddressModel);
		}
	}
}
//addAgenda(capID, hearingItem.getMeetingGroupIdString(),hearingItem.getMeetingIdString(),60,null,"Added via script");
function addAgenda(capID,meetingGroupID,meetingID,duration,reason,comments){
	try
	{
		var result = aa.meeting.scheduleMeeting(capID, meetingGroupID, meetingID, duration, reason, comments);
		if(result.getSuccess())
		{
			logDebug("Meeting is scheduled successfully.");
		}
		else
		{ 
			logDebug("Failed to schedule a meeting to a Record.");
		}
	}catch(err){
		logDebug("Method name: addAgenda. Message: Error-" + err.message + ". CapID:" + capID);
		return false;
	}	
}

function addASITable(tableName, tableValueArray) // optional capId
{
	//  tableName is the name of the ASI table
	//  tableValueArray is an array of associative array values.  All elements MUST be either a string or asiTableVal object
	var itemCap = capId
	if (arguments.length > 2)
		itemCap = arguments[2]; // use cap ID specified in args

	var tssmResult = aa.appSpecificTableScript.getAppSpecificTableModel(itemCap, tableName)

	if (!tssmResult.getSuccess()) {
		logDebug("**WARNING: error retrieving app specific table " + tableName + " " + tssmResult.getErrorMessage());
		return false
	}

	var tssm = tssmResult.getOutput();
	var tsm = tssm.getAppSpecificTableModel();
	var fld = tsm.getTableField();
	var fld_readonly = tsm.getReadonlyField(); // get Readonly field

	for (thisrow in tableValueArray) {

		var col = tsm.getColumns()
		var coli = col.iterator();
		while (coli.hasNext()) {
			var colname = coli.next();


			if (!tableValueArray[thisrow][colname.getColumnName()]) {
				logDebug("addToASITable: null or undefined value supplied for column " + colname.getColumnName() + ", setting to empty string");
				tableValueArray[thisrow][colname.getColumnName()] = "";
			}

			if (typeof(tableValueArray[thisrow][colname.getColumnName()].fieldValue) != "undefined") // we are passed an asiTablVal Obj
			{
				fld.add(tableValueArray[thisrow][colname.getColumnName()].fieldValue);
				fld_readonly.add(tableValueArray[thisrow][colname.getColumnName()].readOnly);
				//fld_readonly.add(null);
			} else // we are passed a string
			{
				fld.add(tableValueArray[thisrow][colname.getColumnName()]);
				fld_readonly.add(null);
			}
		}

		tsm.setTableField(fld);

		tsm.setReadonlyField(fld_readonly);

	}

	var addResult = aa.appSpecificTableScript.editAppSpecificTableInfos(tsm, itemCap, currentUserID);

	if (!addResult.getSuccess()) {
		logDebug("**WARNING: error adding record to ASI Table:  " + tableName + " " + addResult.getErrorMessage());
		return false
	} else
		logDebug("Successfully added record to ASI Table: " + tableName);

}

/**
 * Perform date arithmetic on a string
 * @param {string} td       - can be "mm/dd/yyyy" (or any string that will convert to JS date)
 * @param {inte} amt        - can be positive or negative (5, -3) days
 * @param {bool} useWorking - if optional parameter #3 is present, use working days only
 */
function addDate(td, amt) {

    var useWorking = false;
    if (arguments.length == 3)
        useWorking = true;

    if (!td)
        dDate = new Date();
    else
        dDate = convertDate(td);

    var i = 0;
    if (useWorking)
        if (!aa.calendar.getNextWorkDay) {
            logDebug("getNextWorkDay function is only available in Accela Automation 6.3.2 or higher.");
            while (i < Math.abs(amt)) {
                dDate.setTime(dDate.getTime() + (1000 * 60 * 60 * 24 * (amt > 0 ? 1 : -1)));
                if (dDate.getDay() > 0 && dDate.getDay() < 6)
                    i++
            }
        } else {
            while (i < Math.abs(amt)) {
                dDate = new Date(aa.calendar.getNextWorkDay(aa.date.parseDate(dDate.getMonth() + 1 + "/" + dDate.getDate() + "/" + dDate.getFullYear())).getOutput().getTime());
                i++;
            }
        }
    else
        dDate.setTime(dDate.getTime() + (1000 * 60 * 60 * 24 * amt));

    return (dDate.getMonth() + 1) + "/" + dDate.getDate() + "/" + dDate.getFullYear();
}

function addFee_Violations() {
	var fsched = (arguments.length > 0 && arguments[0]? arguments[0]:"CC-ENF-STORMWATER"); // 	CC-ENF-ESC 
	var feeCapId = (arguments.length > 1 && arguments[1]? arguments[1]:capId);
	var tableName = (arguments.length > 2 && arguments[2]? arguments[2]:"VIOLATIONS");
	logDebug("Loading " + tableName);
	var	tableUpdate = false;
	var tableArray = loadASITable(tableName,feeCapId);
	if (!tableArray) tableArray = [];
	for (xx in tableArray) {
		var tableRow = tableArray[xx];
		logDebug(tableName+"["+xx+"]: Violation Status: " + tableRow["Violation Status"] + " Assess Fee: " + tableRow["Assess Fee"]);
		if (tableRow["Violation Status"] && !exists(tableRow["Violation Status"],["Penalty"])) continue;
		if (tableRow["Assess Fee"] && !exists(tableRow["Assess Fee"],["CHECKED"])) continue;
		if (fsched == "CC-ENF-ESC") 
			var ordianceSection = tableRow["Standards or Ordinance Section"]; // ESC Table
		else
			var ordianceSection = tableRow["Ordinance Section"];
		if (!ordianceSection || ordianceSection == "") continue; // No Ordiance Section
		var severity = parseInt(tableRow["Severity"]);
		var penaltyDays = parseInt(tableRow["Penalty Days"]);
		var refFee = getRefFee(fsched,null,ordianceSection);
		if (!refFee){
			logDebug("Fee not found: " + ordianceSection);
			continue; // Fee not Found
		}
		var fperiod = "FINAL";
		var fcode = refFee.getFeeCod();
		var fRate = (refFee && refFee.getFormula()? parseFloat(refFee.getFormula()):0);
		var finvoice = "N";
		var UDF1 = null, UDF2 = null, fComment = null;
		if (fsched == "CC-ENF-ESC") {
			var fqty = penaltyDays;
			var fComment = null;
		} else {
			var fqty = severity * penaltyDays;
			var fComment = severity + " * " + penaltyDays + " days * $" + fRate + "/ day";
		}

		// Look for fee to update.
		var feeSeq = null, thisFee = null;
		var fees = loadFees(feeCapId);
		for (var tFeeNum in fees) {
			if (fees[tFeeNum].status != "NEW") continue;
			if (fees[tFeeNum].code != fcode) continue;
			if (fees[tFeeNum].sched != fsched) continue;
			var thisFee = fees[tFeeNum];
			feeSeq = thisFee.sequence;
		}
		if (feeSeq) {	// Update existing "NEW" fee qty & extra data
			logDebug("Adding Fee: " + fsched + "." + fcode + ", qty: " + fqty + ", comment: " + fComment);
			var editResult = aa.finance.editFeeItemUnit(feeCapId, fqty, feeSeq);
			if (editResult.getSuccess()) {
				logDebug("Updated Qty on Existing Fee Item: " + feeSeq + " " + fcode + " to Qty: " + fqty);
				if (finvoice == "Y") {
					feeSeqList.push(feeSeq);
					paymentPeriodList.push(fperiod);
				}
				var fsm = aa.finance.getFeeItemByPK(feeCapId, feeSeq).getOutput().getF4FeeItem();
				if (fComment || UDF1 || UDF2) {
					if (fComment) fsm.setFeeNotes(fComment);
					if (UDF1) fsm.setUdf1(UDF1);
					if (UDF2) fsm.setUdf2(UDF2);
					aa.finance.editFeeItem(fsm);
				}
			} else {
				logDebug("**ERROR: updating qty on fee item (" + fcode + "): " + editResult.getErrorMessage());
			}
		} else {
			logDebug("Adding Fee: " + fsched + "." + fcode + ", qty: " + fqty + ", comment: " + fComment);
			addFeeWithExtraData(fcode, fsched, fperiod, fqty, finvoice, feeCapId, fComment, null, null);
		}
		if (tableRow["Assess Fee"].columnName) tableRow["Assess Fee"].fieldValue = "UNCHECKED";
		else tableRow["Assess Fee"].columnName = "UNCHECKED";
		tableUpdate = true;
	}
	if (tableUpdate) {
		var tssmResult = aa.appSpecificTableScript.removeAppSpecificTableInfos(tableName,feeCapId,"ADMIN");
	    addASITable(tableName, tableArray, feeCapId);
	}
}
//12-2020 D.Boucher added for adding new parcel to record from table data
function addParcelFromRef_TPS(parcel) {
    var ownerName = (arguments.length > 1 ? arguments[1] : null);
    var streetStart = (arguments.length > 2 ? arguments[2] : null);
    var streetEnd = (arguments.length > 3 ? arguments[3] : null);
    var houseFractionStart = (arguments.length > 4 ? arguments[4] : null);
    var houseFractionEnd = (arguments.length > 5 ? arguments[5] : null);
    var houseNumberAlphaStart = (arguments.length > 6 ? arguments[6] : null);
    var houseNumberAlphaEnd = (arguments.length > 7 ? arguments[7] : null);
    var streetDirection = (arguments.length > 8 ? arguments[8] : null);
    var streetPrefix = (arguments.length > 9 ? arguments[9] : null);
    var streetName = (arguments.length > 10 ? arguments[10] : null);
    var streetSuffix = (arguments.length > 11 ? arguments[11] : null);
    var streetSuffixDirection = (arguments.length > 12 ? arguments[12] : null);
    var unitType = (arguments.length > 13 ? arguments[13] : null);
    var unitStart = (arguments.length > 14 ? arguments[14] : null);
    var unitEnd = (arguments.length > 15 ? arguments[15] : null);
    var city = (arguments.length > 16 ? arguments[16] : null);
    var state = (arguments.length > 17 ? arguments[17] : null);
    var zipCode = (arguments.length > 18 ? arguments[18] : null);
    var county = (arguments.length > 19 ? arguments[19] : null);
    var country = (arguments.length > 20 ? arguments[20] : null);
    var levelPrefix = (arguments.length > 21 ? arguments[21] : null);
    var levelNumberStart = (arguments.length > 22 ? arguments[22] : null);
    var levelNumberEnd = (arguments.length > 23 ? arguments[23] : null);
    var refAddressId = (arguments.length > 24 ? arguments[24] : null);
    var primaryParcel = (arguments.length > 25 && exists(arguments[25], [false, "N"]) ? "N" : "Y");
    var itemCap = (arguments.length > 26 && arguments[26] ? arguments[26] : capId);

    var capParcelObj = null;

    var fMsg = "";
    fMsg += " to " + (arguments.length > 2 && arguments[2] != null ? "itemCap: " : "capId: ") + (itemCap && itemCap.getCustomID ? itemCap.getCustomID() : itemCap);
    if (parcel) {
        fMsg = "parcel # " + parcel + fMsg;
        //logDebug("Looking for reference parcel using " + fMsg);
        var refParcelValidateModelResult = aa.parcel.getParceListForAdmin(parcel, null, null, null, null, null, null, null, null, null);
        //var refParcelValidateModelResult = aa.parcel.getParceListForAdmin(parcel, streetStart, streetEnd, streetDirection, streetName, streetSuffix, unitStart, unitEnd, city, ownerName, houseNumberAlphaStart, houseNumberAlphaEnd, levelPrefix, levelNumberStart, levelNumberEnd);
    } else if (refAddressId) {
        fMsg = "refAddress # " + refAddressId + fMsg;
        //logDebug("Looking for reference parcel using " + fMsg);
        var refParcelValidateModelResult = aa.parcel.getPrimaryParcelByRefAddressID(refAddressId, "Y");
    } else if (addressStart && addressStreetName && addressStreetSuffix) {
        fMsg = "address # " + streetStart
            + (streetEnd ? " - " + streetEnd : "")
            + (streetDirection ? " " + streetDirection : "")
            + (streetName ? " " + streetName : "")
            + (streetSuffix ? " " + streetSuffix : "")
            + (unitStart ? ", Unit(s): " + unitStart : "")
            + (unitEnd ? " - " + unitEnd : "")
            + (addressCity ? " - " + addressCity : "");
        + (ownerName ? ", ownerName: " + ownerName : "")
            + fMsg;
        //logDebug("Looking for reference parcel using " + fMsg);
        var refParcelValidateModelResult = aa.address.getParceListForAdmin(null, streetStart, streetEnd, streetDirection, streetName, streetSuffix, unitStart, unitEnd, city, ownerName, houseNumberAlphaStart, houseNumberAlphaEnd, levelPrefix, levelNumberStart, levelNumberEnd);
    } else {
        logDebug("Failed to create transactional Parcel. No parcel/address identified");
        return false;
    }

    if (!refParcelValidateModelResult.getSuccess()) {
        logDebug("xxFailed to get reference Parcel for " + fMsg + " Reason: " + refParcelValidateModelResult.getErrorMessage());
        return false;
    }

    var refParcelNumber = null;
    var refParcelModels = refParcelValidateModelResult.getOutput();
    if (refParcelModels && refParcelModels.length) {
        var prcl = refParcelModels[0].getParcelModel(); // Use 1st matching reference parcel
        var refParcelNumber = prcl.getParcelNumber();
        //if (primaryParcel) 
        prcl.setPrimaryParcelFlag("Y");
        var capPrclResult = aa.parcel.warpCapIdParcelModel2CapParcelModel(itemCap, prcl);
        if (capPrclResult.getSuccess()) {
            capPrcl = capPrclResult.getOutput();
            if (!capPrcl.l1ParcelNo) { logDebug("Updated Wrapped Parcel L1ParcelNo:" + prcl.getL1ParcelNo()); capPrcl.setL1ParcelNo(prcl.getL1ParcelNo()); }
            if (!capPrcl.UID) { logDebug("Updated Wrapped Parcel UID:" + prcl.getUID()); capPrcl.setUID(prcl.getUID()); }
            logDebug("Wrapped Transactional Parcel " + refParcelNumber + " with Reference Data: "
                + (capPrcl && capPrcl.parcelNumber ? ", parcelNumber: " + capPrcl.parcelNumber : "")
                + (capPrcl && capPrcl.l1ParcelNo ? ", l1ParcelNo: " + capPrcl.l1ParcelNo : "")
                + (capPrcl && capPrcl.UID ? ", UID: " + capPrcl.UID : ""));
            var capPrclCreateResult = aa.parcel.createCapParcel(capPrcl);
            if (capPrclCreateResult.getSuccess()) {
                logDebug("Created Transactional Parcel " + refParcelNumber + " with Reference Data");
                //capParcelObj = capPrclCreateResult.getOutput(); // Returns null
                //capParcelObj = getCapParcelObj();
                capParcelObj = true;
            } else {
                logDebug("Failed to create Transactional Parcel with APO Attributes for " + refParcelNumber + " on " + itemCap + " Reason: " + capPrclCreateResult.getErrorMessage());
            }
        } else {
            logDebug("Failed to create Transactional Parcel with APO Attributes for " + refParcelNumber + " on " + itemCap + " Reason: " + capPrclResult.getErrorMessage());
        }
    } else {
        logDebug("No matching reference Parcel for " + fMsg);
        return false;
    }

    return (capParcelObj ? capParcelObj : false);
}

function addParcelStdCondition_TPS(parcelNum,cType,cDesc,cShortComment,cLongComment)
//if parcelNum is null, condition is added to all parcels on CAP
{
	if (!parcelNum)	{
		var capParcelResult = aa.parcel.getParcelandAttribute(capId,null);
		if (capParcelResult.getSuccess()) {
			var Parcels = capParcelResult.getOutput().toArray();
			for (zz in Parcels) {
				logDebug("Adding Condition to parcel #" + zz + " = " + Parcels[zz].getParcelNumber());
				var standardConditions = aa.capCondition.getStandardConditions(cType,cDesc).getOutput();
				for (i = 0; i < standardConditions.length; i++) {
					standardCondition = standardConditions[i];
					var addParcelCondResult = aa.parcelCondition.addParcelCondition(Parcels[zz].getParcelNumber(), standardCondition.getConditionType(), standardCondition.getConditionDesc(), (cShortComment? cShortComment:standardCondition.getConditionComment()), null, null, standardCondition.getImpactCode(), "Applied(Applied)", sysDate, null, sysDate, sysDate, systemUserObj, systemUserObj, "Notice", standardCondition.getDisplayConditionNotice(), standardCondition.getIncludeInConditionName(), standardCondition.getIncludeInShortDescription(), standardCondition.getInheritable(), (cLongComment? cLongComment:standardCondition.getLongDescripton()), standardCondition.getPublicDisplayMessage(), standardCondition.getResolutionAction(), standardCondition.getConditionGroup(), standardCondition.getDisplayNoticeOnACA(), standardCondition.getDisplayNoticeOnACAFee(), standardCondition.getPriority()); 
					if (addParcelCondResult.getSuccess()) {
						logDebug("Successfully added condition to Parcel " + Parcels[zz].getParcelNumber() + ":  " + cDesc);
					}
					else {
						logDebug( "ERROR: adding condition to Parcel " + Parcels[zz].getParcelNumber() + ": " + addParcelCondResult.getErrorMessage());
					}
				}
			}
		}
	} else {
		logDebug("Adding Condition to parcel #" + parcelNum);
		var standardConditions = aa.capCondition.getStandardConditions(cType,cDesc).getOutput();
		for (i = 0; i < standardConditions.length; i++) {
			standardCondition = standardConditions[i];
			var addParcelCondResult = aa.parcelCondition.addParcelCondition(Parcels[zz].getParcelNumber(), standardCondition.getConditionType(), standardCondition.getConditionDesc(), (cShortComment? cShortComment:standardCondition.getConditionComment()), null, null, standardCondition.getImpactCode(), "Applied(Applied)", sysDate, null, sysDate, sysDate, systemUserObj, systemUserObj, "Notice", standardCondition.getDisplayConditionNotice(), standardCondition.getIncludeInConditionName(), standardCondition.getIncludeInShortDescription(), standardCondition.getInheritable(), (cLongComment? cLongComment:standardCondition.getLongDescripton()), standardCondition.getPublicDisplayMessage(), standardCondition.getResolutionAction(), standardCondition.getConditionGroup(), standardCondition.getDisplayNoticeOnACA(), standardCondition.getDisplayNoticeOnACAFee(), standardCondition.getPriority()); 
			if (addParcelCondResult.getSuccess()) {
				logDebug("Successfully added condition to Parcel " + parcelNum + ":  " + cDesc);
			}
			else {
				logDebug( "ERROR: adding condition to Parcel " + parcelNum + ": " + addParcelCondResult.getErrorMessage());
			}
		}
	}
}

function addToASITable(tableName, tableValues) // optional capId
{
	//  tableName is the name of the ASI table
	//  tableValues is an associative array of values.  All elements must be either a string or asiTableVal object
	itemCap = capId
	if (arguments.length > 2)
		itemCap = arguments[2]; // use cap ID specified in args

	var tssmResult = aa.appSpecificTableScript.getAppSpecificTableModel(itemCap, tableName)

	if (!tssmResult.getSuccess()) {
		logDebug("**WARNING: error retrieving app specific table " + tableName + " " + tssmResult.getErrorMessage());
		return false
	}

	var tssm = tssmResult.getOutput();
	var tsm = tssm.getAppSpecificTableModel();
	var fld = tsm.getTableField();
	var col = tsm.getColumns();
	var fld_readonly = tsm.getReadonlyField(); //get ReadOnly property
	var coli = col.iterator();

	while (coli.hasNext()) {
		colname = coli.next();

		if (!tableValues[colname.getColumnName()]) {
			logDebug("addToASITable: null or undefined value supplied for column " + colname.getColumnName() + ", setting to empty string");
			tableValues[colname.getColumnName()] = "";
		}

		if (typeof(tableValues[colname.getColumnName()].fieldValue) != "undefined") {
			fld.add(tableValues[colname.getColumnName()].fieldValue);
			fld_readonly.add(tableValues[colname.getColumnName()].readOnly);
		} else // we are passed a string
		{
			fld.add(tableValues[colname.getColumnName()]);
			fld_readonly.add(null);
		}
	}

	tsm.setTableField(fld);
	tsm.setReadonlyField(fld_readonly); // set readonly field

	addResult = aa.appSpecificTableScript.editAppSpecificTableInfos(tsm, itemCap, currentUserID);
	if (!addResult.getSuccess()) {
		logDebug("**WARNING: error adding record to ASI Table:  " + tableName + " " + addResult.getErrorMessage());
		return false
	} else
		logDebug("Successfully added record to ASI Table: " + tableName);
}

//S21 - This script looks at all the related record types and returnes all CAP IDs that are of a particular record type
function allRelatedCapsofAType(capID,recordType){
	try{
		var typeMatchedArray = new Array(); // new array
		
		// if recordType is null return null
		if(recordType==null){
			logDebug("Method name: allRelatedCapsofAType. Message: recordType is null. CapID:" + capID);
			return null;
		}
		
		// get the list of all the related child caps
		var tmpdirectChld = getAllRelatedCaps(capID);
		if (tmpdirectChld!=null)
		{
			//loop thru the list
			for(ff in tmpdirectChld) {
				//aa.print("tmpdirectChld[ff]:" + tmpdirectChld[ff]);
				if (tmpdirectChld[ff]) {
					var getCapResult =aa.cap.getCapID(tmpdirectChld[ff]).getOutput();
					var capChld = aa.cap.getCap(getCapResult).getOutput(); 	// Cap object 
					var appTypeChldResult = capChld.getCapType(); 							// get the child cap's type
					var appTypeChldString = appTypeChldResult.toString(); 					// get the child cap's type string
					//aa.print("appTypeChldString:" + appTypeChldString);
					
					// compare the related child cap's type with recordType. if both match add it to the array
					if(appTypeChldString.toUpperCase().equals(recordType.toUpperCase())){
						var chldCapId = aa.cap.getCapID(tmpdirectChld[ff]).getOutput(); //.getCapID().getCustomID()
						typeMatchedArray.push(chldCapId.getCustomID());
					}
				}
			}
		}
		return typeMatchedArray;
	}catch(err){
		logDebug("Method name: allRelatedCapsofAType. Message: Error-" + err.message + ". CapID:" + capID);
		return null;
	}
}
function appHasConditiontrue(pType,pStatus,pDesc,pImpact,capid)
	{
	// Checks to see if conditions have been added to CAP
	// 06SSP-00223
	//
	if (pType==null)
		var condResult = aa.capCondition.getCapConditions(capid);
	else
		var condResult = aa.capCondition.getCapConditions(capid,pType);
		
	if (condResult.getSuccess())
		var capConds = condResult.getOutput();
	else
		{ 
		logMessage("**ERROR: getting cap conditions: " + condResult.getErrorMessage());
		logDebug("**ERROR: getting cap conditions: " + condResult.getErrorMessage());
		return false;
		}
	
	var cStatus;
	var cDesc;
	var cImpact;
	
	for (cc in capConds)
		{
		var thisCond = capConds[cc];
		var cStatus = thisCond.getConditionStatus();
		var cDesc = thisCond.getConditionDescription();
		var cImpact = thisCond.getImpactCode();
		var cType = thisCond.getConditionType();
		if (cStatus==null)
			cStatus = " ";
		if (cDesc==null)
			cDesc = " ";
		if (cImpact==null)
			cImpact = " ";
		//Look for matching condition
		
		if ( (pStatus==null || pStatus.toUpperCase().equals(cStatus.toUpperCase())) && (pDesc==null || pDesc.toUpperCase().equals(cDesc.toUpperCase())) && (pImpact==null || pImpact.toUpperCase().equals(cImpact.toUpperCase())))
			return true; //matching condition found
		}
	return false; //no matching condition found
	} //function

function assignInspection_CHESTERFIELD(inspId) {
    // TODO: Update with GIS Info based on record type or insp type.
    // use inspId is null then it will use inspType & cap info to determine inspector.
    var inspectorId = (arguments.length > 1 && arguments[1] != null ? arguments[1] : null);
    var itemCap = (arguments.length > 2 && arguments[2] != null ? arguments[2] : capId);
    var inspType = (arguments.length > 3 && arguments[3] != null ? arguments[3] : null);

    if (arguments.length > 2 && arguments[2] != null) {
        var cap = aa.cap.getCap(itemCap).getOutput();
        var capTypeResult = cap.getCapType();
        var capTypeString = capTypeResult.toString();
        var appTypeArray = capTypeString.split("/");
    } else {
        var appTypeArray = appTypeString.split("/");
    }

    if (inspId) {
        iObjResult = aa.inspection.getInspection(itemCap, inspId);
        if (!iObjResult.getSuccess()) {
            logDebug("**WARNING retrieving inspection " + inspId + " : " + iObjResult.getErrorMessage());
            return false;
        }
        iObj = iObjResult.getOutput();
        inspType = null;
        if (iObj) {
            inspType = iObj.getInspection().getInspectionType();
        }
    }

    var inspDiscipline = appTypeArray[0], inspDistrict = null;
    var gisLayerName = null, gisLayerAbbr = null, gisLayerField = null;
    if (typeof (gisMapService) == "undefined") gisMapService = null; // Check for global.
    if (appMatch("Enforcement/*/*/*")) {
        inspDiscipline = "Enforcement";
        gisLayerName = "Enforcement Boundaries";
        gisLayerField = "InspectorID";
    } else if (appMatch("EnvEngineering/*/*/*")) {
        inspDiscipline = "EnvEngineering";
        inspDistrict = AInfo["ParcelAttribute.InspectionDistrict"];
        gisLayerName = "Parcel";
        gisLayerField = "EE Inspector";
    }
    if (inspectorId == "") inspectorId == null;

    // Use USER_DISTRICTS, inspDiscipline & inspDistrict to determine inspector.
    if (inspectorId == null) {
        if (inspDistrict == null) {
            if (gisMapService != null && gisLayerName != null && gisLayerField != null) { // Auto assign inspector based on GIS
                inspDistrict = getGISInfo(gisMapService, gisLayerName, gisLayerField);
            }
        }

        if (typeof (inspDistrict) == "undefined") inspDistrict = null;
        if (typeof (inspDiscipline) == "undefined") inspDiscipline = null;
        // Check for inspection discipline & district mapping to inspectors
        inspectorId = lookup("USER_DISTRICTS", (inspDiscipline ? inspDiscipline : "") + (inspDistrict ? "-" + inspDistrict : ""));
        if (typeof (inspectorId) == "undefined" && inspDiscipline)
            inspectorId = lookup("USER_DISTRICTS", inspDiscipline);
        if (typeof (inspectorId) == "undefined" && inspDistrict)
            inspectorId = lookup("USER_DISTRICTS", inspDistrict);
        if (typeof (inspectorId) == "undefined") inspectorId = null;
        if (inspectorId == "") inspectorId == null;
    }

    // Check for valid inspector id.
    var iName = inspectorId;
    var iInspector = getInspectorObj(iName);

    if (!iInspector) {
        logDebug("**WARNING could not find inspector or department: " + iName + ", no assignment was made");
        return false;
    }

    if (inspId) {
        if (inspectorId != null && inspectorId != "" && false) {
            assignInspection(inspId, inspectorId, itemCap);
            logDebug("assigning inspection " + inspId + " to " + inspectorId);
            /* iObj.setInspector(iInspector);
            if (iObj.getScheduledDate() == null) {
                iObj.setScheduledDate(sysDate);
            }
            aa.inspection.editInspection(iObj) */
        } else if (iInspector) { // Department
            logDebug("assigning inspection " + inspId + " to department " + iName);
            iObj.setInspector(iInspector);
            if (iObj.getScheduledDate() == null) {
                iObj.setScheduledDate(sysDate);
            }
            var inspResult = aa.inspection.editInspection(iObj)
            if (inspResult.getSuccess()) {
                logDebug("Successfully assigned inspection: " + inspId
                    + (inspType ? " " + inspType : "") + " to "
                    + (iInspector && iInspector.getGaUserID() ? "inspector: " : "department: ") + iName
                    + (iInspector && iInspector.getGaUserID() && iInspector.getFullName() ? ", Name: " + iInspector.getFullName() : "")
                    + (inspDiscipline ? ", Discipline: " + inspDiscipline : "")
                    + (inspDistrict ? ", District: " + inspDistrict : "")
                );
            } else {
                logDebug("ERROR: assigning inspection: " + inspId
                    + (inspType ? " " + inspType : "") + " to "
                    + (iInspector && iInspector.getGaUserID() ? "inspector: " : "department: ") + iName
                    + (iInspector && iInspector.getGaUserID() && iInspector.getFullName() ? ", Name: " + iInspector.getFullName() : "")
                    + (inspDiscipline ? ", Discipline: " + inspDiscipline : "")
                    + (inspDistrict ? ", District: " + inspDistrict : "")
                    + ": " + inspResult.getErrorMessage());
            }
        }
    } else {
        logDebug("Found "
            + (iInspector && iInspector.getGaUserID() ? "inspector: " : "department: ") + iName
            + (iInspector && iInspector.getGaUserID() && iInspector.getFullName() ? ", Name: " + iInspector.getFullName() : "")
            + (inspDiscipline ? ", Discipline: " + inspDiscipline : "")
            + (inspDistrict ? ", District: " + inspDistrict : "")
        );
    }
    return iInspector;
}

function associatedLicensedProfessionalWithPublicUser(licnumber, publicUserID) {
	var mylicense = aa.licenseScript.getRefLicenseProfBySeqNbr(aa.getServiceProviderCode(), licnumber);
	var puser = aa.publicUser.getPublicUserByPUser(publicUserID);
	if (puser.getSuccess())
		aa.licenseScript.associateLpWithPublicUser(puser.getOutput(), mylicense.getOutput());
}

function associatedRefContactWithRefLicProf(capIdStr, refLicProfSeq, servProvCode, auditID) {
	var contact = getLicenseHolderByLicenseNumber(capIdStr);
	if (contact && contact.getRefContactNumber()) {
		linkRefContactWithRefLicProf(parseInt(contact.getRefContactNumber()), refLicProfSeq, servProvCode, auditID)
	} else {
		logMessage("**ERROR:cannot find license holder of license");
	}
}

/**
 * Calculates the fee CC-BLD-COMM-AE.CC-BLDCAE-03
 * Estimated construction cost less than or equal to $1,000 - minimun $59.00. 
 * For each additional $1,000 or fraction thereof, 
 * of the estimated cost over $1,000 -- $6.60
 * 
 * @return null
 */
function calcFee_CC_BLD_COMM_AE_CC_BLDCAE_03() {

	//fee variables
	var fcode = "CC-BLDCAE-03";
	var fsched = "CC-BLD-COMM-AE";
	var fperiod = "FINAL";
	var fqty = 59.00;
	var finvoice = "N";

	try {
		// get the ASI field needed for the fee calculation.
		var totalCostOfWork = AInfo["Total Cost of Work"];

		if (totalCostOfWork == "" || totalCostOfWork == null) {
			logDebug("Total Cost of Work amount is required to calculate fee.");
			return false;
		}
		
		// calculation code here.
		totalCostOfWork = parseFloat(totalCostOfWork);
		if (totalCostOfWork >= 1000.00) {
			fqty = fqty + (Math.floor((totalCostOfWork / 1000)) * 6.60);
		}

		// check if the fee is already added.
		if (feeExists(fcode)) {
			updateFee(fcode, fsched, fperiod, fqty, finvoice);
		} else {
			addFee(fcode, fsched, fperiod, fqty, finvoice);
		}

	} catch (err) {
		logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
	}
}

/**
 * Calculates the fee CC-BLD-COMM-AG.CC-BLD-CAG01
 * $59.00 minimun with estimated construction cost less than or equal to $1,000. 
 * $6.60 for each additional $1,000 or fraction thereof, of the estimated cost over $1,000.
 * 
 * @return null
 */
function calcFee_CC_BLD_COMM_AG_CC_BLD_CAG01() {

	//fee variables
	var fcode = "CC-BLD-CAG01";
	var fsched = "CC-BLD-COMM-AG";
	var fperiod = "FINAL";
	var fqty = 59.00;
	var finvoice = "N";

	try {
		// get the ASI field needed for the fee calculation.
		var totalCostOfWork = AInfo["Total Cost of Work"];

		if (totalCostOfWork == "" || totalCostOfWork == null) {
			logDebug("Total Cost of Work amount is required to calculate fee.");
			return false;
		}
		
		// calculation code here.
		totalCostOfWork = parseFloat(totalCostOfWork);
		if (totalCostOfWork >= 1000.00) {
			fqty = fqty + (Math.floor((totalCostOfWork / 1000)) * 6.60);
		}

		// check if the fee is already added.
		if (feeExists(fcode)) {
			updateFee(fcode, fsched, fperiod, fqty, finvoice);
		} else {
			addFee(fcode, fsched, fperiod, fqty, finvoice);
		}

	} catch (err) {
		logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
	}
}

/**
 * Calculates the fee CC-BLD-COMM-AUX-BOILER.CC-BLD-CAB01
 * $59.00 minimun with estimated construction cost less than or equal to $1,000. 
 * $6.60 for each additional $1,000 or fraction thereof, of the estimated cost over $1,000.
 * 
 * @return null
 */
function calcFee_CC_BLD_COMM_AUX_BOILER_CC_BLD_CAB01() {

	//fee variables
	var fcode = "CC-BLD-CAB01";
	var fsched = "CC-BLD-COMM-AUX-BOILER";
	var fperiod = "FINAL";
	var fqty = 59.00;
	var finvoice = "N";

	try {
		// get the ASI field needed for the fee calculation.
		var totalCostOfWork = AInfo["Total Cost of Work"];

		if (totalCostOfWork == "" || totalCostOfWork == null) {
			logDebug("Total Cost of Work amount is required to calculate fee.");
			return false;
		}
		
		// calculation code here.
		totalCostOfWork = parseFloat(totalCostOfWork);
		if (totalCostOfWork >= 1000.00) {
			fqty = fqty + (Math.floor((totalCostOfWork / 1000)) * 6.60);
		}

		// check if the fee is already added.
		if (feeExists(fcode)) {
			updateFee(fcode, fsched, fperiod, fqty, finvoice);
		} else {
			addFee(fcode, fsched, fperiod, fqty, finvoice);
		}

	} catch (err) {
		logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
	}
}

/**
 * Calculates the fee CC-BLD-COMM-AUX-FIRE.CC-BLD-CAF01
 * Estimated construction cost less than or equal to $1,000 - minimun $59.00. 
 * For each additional $1,000 or fraction thereof, of the estimated cost over $1,000 -- $7.40
 * 
 * @return null
 */
function calcFee_CC_BLD_COMM_AUX_FIRE_CC_BLD_CAF01() {

	//fee variables
	var fcode = "CC-BLD-CAF01";
	var fsched = "CC-BLD-COMM-AUX-FIRE";
	var fperiod = "FINAL";
	var fqty = 59.00;
	var finvoice = "N";

	try {
		// get the ASI field needed for the fee calculation.
		var totalCostOfWork = AInfo["Total Cost of Work"];

		if (totalCostOfWork == "" || totalCostOfWork == null) {
			logDebug("Total Cost of Work amount is required to calculate fee.");
			return false;
		}
		
		// calculation code here.
		totalCostOfWork = parseFloat(totalCostOfWork);
		if (totalCostOfWork > 1000.00) {
			fqty = fqty + (Math.floor((totalCostOfWork / 1000)) * 7.40);
		}

		// check if the fee is already added.
		if (feeExists(fcode)) {
			updateFee(fcode, fsched, fperiod, fqty, finvoice);
		} else {
			addFee(fcode, fsched, fperiod, fqty, finvoice);
		}

	} catch (err) {
		logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
	}
}

/**
 * Calculates the fee CC-BLD-COMM-AUX-MECH.CC-BLD-CAM01
 * Estimated construction cost less than or equal to $1,000 - minimun $59.00. 
 * For each additional $1,000 or fraction thereof, of the estimated cost over $1,000 -- $6.60
 * 
 * @return null
 */
function calcFee_CC_BLD_COMM_AUX_MECH_CC_BLD_CAM01() {

	//fee variables
	var fcode = "CC-BLD-CAM01";
	var fsched = "CC-BLD-COMM-AUX-MECH";
	var fperiod = "FINAL";
	var fqty = 59.00;
	var finvoice = "N";

	try {
		// get the ASI field needed for the fee calculation.
		var totalCostOfWork = AInfo["Total Cost of Work"];

		if (totalCostOfWork == "" || totalCostOfWork == null) {
			logDebug("Total Cost of Work amount is required to calculate fee.");
			return false;
		}
		
		// calculation code here.
		totalCostOfWork = parseFloat(totalCostOfWork);
		if (totalCostOfWork > 1000.00) {
			fqty = fqty + (Math.floor((totalCostOfWork / 1000)) * 6.60);
		}

		// check if the fee is already added.
		if (feeExists(fcode)) {
			updateFee(fcode, fsched, fperiod, fqty, finvoice);
		} else {
			addFee(fcode, fsched, fperiod, fqty, finvoice);
		}

	} catch (err) {
		logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
	}
}

/**
 * Calculates the fee CC-BLD-COMM-AUX-PLUMBING.CC-BLD-CAP01
 * Estimated construction cost less than or equal to $1,000 - minimun $59.00. 
 * For each additional $1,000 or fraction thereof, of the estimated cost over $1,000 -- $6.60
 * 
 * @return null
 */
function calcFee_CC_BLD_COMM_AUX_PLUMBING_CC_BLD_CAP01() {

	//fee variables
	var fcode = "CC-BLD-CAP01";
	var fsched = "CC-BLD-COMM-AUX-PLUMBING";
	var fperiod = "FINAL";
	var fqty = 59.00;
	var finvoice = "N";

	try {
		// get the ASI field needed for the fee calculation.
		var totalCostOfWork = AInfo["Total Cost of Work"];

		if (totalCostOfWork == "" || totalCostOfWork == null) {
			logDebug("Total Cost of Work amount is required to calculate fee.");
			return false;
		}
		
		// calculation code here.
		totalCostOfWork = parseFloat(totalCostOfWork);
		if (totalCostOfWork > 1000.00) {
			fqty = fqty + (Math.floor((totalCostOfWork / 1000)) * 6.60);
		}

		// check if the fee is already added.
		if (feeExists(fcode)) {
			updateFee(fcode, fsched, fperiod, fqty, finvoice);
		} else {
			addFee(fcode, fsched, fperiod, fqty, finvoice);
		}

	} catch (err) {
		logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
	}
}

/**
 * Calculates the fee CC-BLD-COMM.CC-BLD-001
 * $7.40 for each $1000 or fraction with a minimum of $297.00
 * 
 * @return null
 */
function calcFee_CC_BLD_COMM_CC_BLD_001() {

	//fee variables
	var fcode = "CC-BLD-001";
	var fsched = "CC-BLD-COMM";
	var fperiod = "FINAL";
	var fqty = 297.00;
	var finvoice = "N";

	try {
		// get the ASI field needed for the fee calculation.
		var totalCostOfWork = AInfo["Total Cost of Work"];

		if (totalCostOfWork == "" || totalCostOfWork == null) {
			logDebug("Total Cost of Work amount is required to calculate fee.");
			return false;
		}

		// calculation code here.
		totalCostOfWork = parseFloat(totalCostOfWork);
		if (totalCostOfWork > 1000.00) {
			fqty = fqty + (Math.floor((totalCostOfWork / 1000)) * 7.40);
		}

		// check if the fee is already added.
		if (feeExists(fcode)) {
			updateFee(fcode, fsched, fperiod, fqty, finvoice);
		} else {
			addFee(fcode, fsched, fperiod, fqty, finvoice);
		}

	} catch (err) {
		logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
	}
}

/**
 * Calculates the fee CC-BLD-COMM.CC_BLD_04
 * $7.40 for each $1000 or fraction with a minimum of $178.00
 * 
 * @return null
 */
function calcFee_CC_BLD_COMM_CC_BLD_04() {

	//fee variables
	var fcode = "CC_BLD_04";
	var fsched = "CC-BLD-COMM";
	var fperiod = "FINAL";
	var fqty = 178.00;
	var finvoice = "N";

	try {
		// get the ASI field needed for the fee calculation.
		var totalCostOfWork = AInfo["Total Cost of Work"];

		if (totalCostOfWork == "" || totalCostOfWork == null) {
			logDebug("Total Cost of Work amount is required to calculate fee.");
			return false;
		}
		
		// calculation code here.
		totalCostOfWork = parseFloat(totalCostOfWork);
		if (totalCostOfWork > 1000.00) {
			fqty = fqty + (Math.floor((totalCostOfWork / 1000)) * 7.40);
		}

		// check if the fee is already added.
		if (feeExists(fcode)) {
			updateFee(fcode, fsched, fperiod, fqty, finvoice);
		} else {
			addFee(fcode, fsched, fperiod, fqty, finvoice);
		}

	} catch (err) {
		logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
	}
}

/**
 * Calculates the fee CC-BLD-COMM.CC_BLD_06
 * Fee for $2,000 or less of the estimated construction cost, 
 * (less the cost used to calculate auxiliary permit fees) $119.00. 
 * For each additional $1,000 of the estimated construction cost, 
 * or fraction thereof $7.40
 * 
 * @return null
 */
function calcFee_CC_BLD_COMM_CC_BLD_06() {

	//fee variables
	var fcode = "CC_BLD_06";
	var fsched = "CC-BLD-COMM";
	var fperiod = "FINAL";
	var fqty = 119.00;
	var finvoice = "N";

	try {
		// get the ASI field needed for the fee calculation.
		var totalCostOfWork = AInfo["Total Cost of Work"];

		if (totalCostOfWork == "" || totalCostOfWork == null) {
			logDebug("Total Cost of Work amount is required to calculate fee.");
			return false;
		}
		
		// calculation code here.
		totalCostOfWork = parseFloat(totalCostOfWork);
		if (totalCostOfWork > 2000.00) {
			fqty = fqty + (Math.floor((totalCostOfWork / 1000)) * 7.40);
		}

		// check if the fee is already added.
		if (feeExists(fcode)) {
			updateFee(fcode, fsched, fperiod, fqty, finvoice);
		} else {
			addFee(fcode, fsched, fperiod, fqty, finvoice);
		}

	} catch (err) {
		logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
	}
}

/**
 * Calculates the fee CC-BLD-CV.CC-BLD-CV-02
 * $48 per elevator car. ****
 * The actual construction permit cost for Esc and Elev are covered through 
 * the Bldg and Mech auxiliary permits. This is the annual certificate for 
 * operation after construction. Add up the counts in the ASIT (list of 
 * equipments) do not include escalators.
 * 
 * @return null
 */
function calcFee_CC_BLD_CV_CC_BLD_CV_02() {

    //fee variables
    var fcode = "CC-BLD-CV-02";
    var fsched = "CC-BLD-CV";
    var fperiod = "FINAL";
    var fqty = 48.00;
    var finvoice = "N";

    try {
        // get the ASI field needed for the fee calculation.
        var tblName = "CC-BLD-CV-EL";
        var totalElevators = 0;

        var equipmentArray = loadASITable(tblName);

        if (!equipmentArray) {
            logDebug("Can't find ASI Table: " + tblName);
            return null;
        }

        for (e in equipmentArray) {
            var equipment = equipmentArray[e];

            if (!equipment.Type.fieldValue.toUpperCase().equals("ESCALATOR")) {
                var count = parseInt(equipment.Count.fieldValue);
                totalElevators += count;
            }
        }

        // calculation code here.
        if (totalElevators == 0) {
            logDebug("No elevators found. Can't assess fee " + fsched + "." + fcode);
            return null;
        } else {
            fqty = fqty * totalElevators;
            logDebug("Total elevators found: " + totalElevators);
        }


        // check if the fee is already added.
        if (feeExists(fcode)) {
            updateFee(fcode, fsched, fperiod, fqty, finvoice);
        } else {
            addFee(fcode, fsched, fperiod, fqty, finvoice);
        }

    } catch (err) {
        logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
    }

}

/**
 * Calculates the fee CC-BLD-CV.CC-BLD-CV-03
 * The actual construction permit cost for Esc and Elev are covered through the 
 * Bldg and Mech auxiliary permits. This is the annual certificate for operation 
 * after construction. Add up the floors in the ASIT (list of equipments) 
 * only for escalator equipment type
 * $48 per floor travelled $48.00 ****
 * 
 * @return null
 */
function calcFee_CC_BLD_CV_CC_BLD_CV_03() {

	//fee variables
	var fcode = "CC-BLD-CV-03";
	var fsched = "CC-BLD-CV";
	var fperiod = "FINAL";
	var fqty = 48.00;
	var finvoice = "N";

    try {
        // get the ASI field needed for the fee calculation.
        var tblName = "CC-BLD-CV-EL";
        var totalFloorsTraveled = 0;

        var equipmentArray = loadASITable(tblName);

        if (!equipmentArray) {
            logDebug("Can't find ASI Table: " + tblName);
            return null;
        }

        for (e in equipmentArray) {
            var equipment = equipmentArray[e];

            if (equipment.Type.fieldValue.toUpperCase().equals("ESCALATOR")) {
                var count = parseInt(equipment["Floors Travelled"].fieldValue);
                totalFloorsTraveled += count;
            }
        }

        // calculation code here.
        if (totalFloorsTraveled == 0) {
            logDebug("No escalators with floors travelled found. Can't assess fee " + fsched + "." + fcode);
            return null;
        } else {
            fqty = fqty * totalFloorsTraveled;
            logDebug("Total floors travelled found: " + totalFloorsTraveled);
        }


        // check if the fee is already added.
        if (feeExists(fcode)) {
            updateFee(fcode, fsched, fperiod, fqty, finvoice);
        } else {
            addFee(fcode, fsched, fperiod, fqty, finvoice);
        }

    } catch (err) {
        logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
    }
}

/**
 * Calculates the fee CC-BLD-MIXEDUSE.CC_BLDC002
 * The minimum fee applies if calculation is less than minimum fees below. 
 * -- New Construction $297.00, or Addition $178 ****
 * Look through ASIT Work Description Commercial and Residential ASITs. 
 * The first Nature of the work found that starts with the word "New" we 
 * will assume New Construction. If "New" not found, then assume addition. 
 * If no records in either ASITs then assume New Construction.
 * 
 * @return null
 */
function calcFee_CC_BLD_MIXEDUSE_CC_BLDC002() {

    //fee variables
    var newConstFeeCode = "CC_BLDC002";
    var additionFeeCode = "CC_BLDC004";

    var fcode = newConstFeeCode; // default fee code
    var fsched = "CC-BLD-MIXEDUSE";
    var fperiod = "FINAL";
    var fqty = 297.00;
    var finvoice = "N";

    try {
        // get the ASIT field needed for the fee calculation.
        var tblName = "CC-BLD-MIXEDUSE-WD-COMMERCIAL";
        var totalNewCommercial = 0;
        var newConstruction = false;

        var workDescriptionCommercialArray = null;
        if (CCBLDMIXEDUSEWDCOMMERCIAL) {
            workDescriptionCommercialArray = CCBLDMIXEDUSEWDCOMMERCIAL;
        } else {
            workDescriptionCommercialArray = loadASITable(tblName);
        }

        if (!workDescriptionCommercialArray) {
            logDebug("Can't find ASI Table: " + tblName);
        } else {
            for (i in workDescriptionCommercialArray) {
                var workDescription = workDescriptionCommercialArray[i];

                if (workDescription["Nature of work"].fieldValue.toUpperCase().indexOf("NEW") >= 0) {
                    totalNewCommercial += 1;
                }
            }
        }

        var tblName = "CC-BLD-MIXEDUSE-WD-RESIDENTIAL";
        var totalNewResidential = 0;

        var workDescriptionResidentialArray = null;
        if (CCBLDMIXEDUSEWDRESIDENTIAL) {
            workDescriptionResidentialArray = CCBLDMIXEDUSEWDRESIDENTIAL;
        } else {
            workDescriptionResidentialArray = loadASITable(tblName);
        }

        if (!workDescriptionResidentialArray) {
            logDebug("Can't find ASI Table: " + tblName);
        } else {
            for (i in workDescriptionResidentialArray) {
                var workDescription = workDescriptionResidentialArray[i];

                if (workDescription["Nature of work"].fieldValue.toUpperCase().indexOf("NEW") >= 0) {
                    totalNewResidential += 1;
                }
            }
        }

        var calculatedFee = 0.00;
        var minimumFee = 297.00;
        var totalAmountPaid = 0.00;

        if (totalCostOfWork == "" || totalCostOfWork == null) {
            totalCostOfWork = 0.00;
        }

        // check if New construction, otherwise is an addition.
        newConstruction = ((workDescriptionResidentialArray.length > 0 && totalNewResidential > 0) || 
            (workDescriptionCommercialArray.length > 0 && totalNewCommercial > 0) || 
            (workDescriptionCommercialArray.length == 0 && workDescriptionResidentialArray.length == 0));

        if (!newConstruction) {
            fcode = additionFeeCode
            minimumFee = 178.00
        }

        // bypass the Total cost of work if ACA
        if (!publicUser) {
            var totalCostOfWork = AInfo["Total cost of work"];
            totalCostOfWork = parseFloat(totalCostOfWork);
            if (totalCostOfWork > 1000.00) {
                calculatedFee = minimumFee + (Math.floor((totalCostOfWork / 1000)) * 7.40);
            } else {
                calculatedFee = minimumFee;
            }
        } else {
            calculatedFee = minimumFee;
        }

        // check if any of the related fees is already assessed and paid.
        var feeArray = loadFees();
        for (f in feeArray) {
            fee = feeArray[f];

            if (fee.code.toUpperCase().equals(fcode) && fee.sched.toUpperCase().equals(fsched) && fee.status.toUpperCase().equals("NEW")) {
                totalAmountPaid += fee.amountPaid;
                logDebug("Amount: " + currencyFormat(fee.amount));
                logDebug("Amount Paid: " + currencyFormat(fee.amountPaid));
            }

        }

        fqty = calculatedFee;

        if (calculatedFee > 0 && totalAmountPaid > 0 && calculatedFee > totalAmountPaid) {
            fqty = calculatedFee - totalAmountPaid;
        }
        

        logDebug("totalAmountPaid: " + totalAmountPaid);
        logDebug("calculatedFee: " + calculatedFee);
        logDebug("minimumFee: " + minimumFee);
        logDebug("Fee: " + fqty);

        // remove the related not invoiced fees.
        logDebug("Removing fee: " + newConstFeeCode);
        removeFee(newConstFeeCode, fperiod);
        logDebug("Removing fee: " + additionFeeCode);
        removeFee(additionFeeCode, fperiod);

        // check if the fee is already added.
        if (feeExists(fcode)) {
            logDebug("Updating fee: " + fcode);
            updateFee(fcode, fsched, fperiod, fqty, finvoice);
        } else {
            logDebug("Adding fee: " + fcode);
            addFee(fcode, fsched, fperiod, fqty, finvoice);
        }

    } catch (err) {
        logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
    }
}

/**
 * Calculates the fee CC-BLD-MIXEDUSE.CC_BLDC004
 * ****
 * 
 * @return null
 */
function calcFee_CC_BLD_MIXEDUSE_CC_BLDC004() {

	//fee variables
	var fcode = "CC_BLDC004";
	var fsched = "CC-BLD-MIXEDUSE";
	var fperiod = "FINAL";
	var fqty = 1.00;
	var finvoice = "N";

	try {
		// get the ASI field needed for the fee calculation.
		
		// calculation code here.

		// check if the fee is already added.
		if (feeExists(fcode)) {
			updateFee(fcode, fsched, fperiod, fqty, finvoice);
		} else {
			addFee(fcode, fsched, fperiod, fqty, finvoice);
		}

	} catch (err) {
		logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
	}
}

/**
 * Calculates the fee CC-BLD-MIXEDUSE.CC_BLDR018
 * Resulting in a change of use or an increase in square footage. 
 * Unfinished space to finished, without footings. -- $171.00 ****
 *
 * Search "Work Description - Residential" Nature of work column, look 
 * for "Change of Use" or "Addition" if found add $171.00, else $114.00.
 * 
 * @return null
 */
function calcFee_CC_BLD_MIXEDUSE_CC_BLDR018() {

	//fee variables
	var fcode = "CC_BLDR018";
	var fsched = "CC-BLD-MIXEDUSE";
	var fperiod = "FINAL";
	var fqty = 171.00;
	var finvoice = "N";

	try {
		// get the ASI field needed for the fee calculation.
        var tblName = "CC-BLD-MIXEDUSE-WD-RESIDENTIAL";
        var changeOfUse = false;

        var workDescriptionResidentialArray = null;
        if (CCBLDMIXEDUSEWDRESIDENTIAL) {
            workDescriptionResidentialArray = CCBLDMIXEDUSEWDCOMMERCIAL;
        } else {
            workDescriptionResidentialArray = loadASITable(tblName);
        }

        if (!workDescriptionResidentialArray) {
            logDebug("Can't find ASI Table: " + tblName);
        } else {
            for (i in workDescriptionResidentialArray) {
                var workDescription = workDescriptionResidentialArray[i];
                var natureOfWork = workDescription["Nature of work"].fieldValue;

                if (natureOfWork.toUpperCase().indexOf("CHANGE OF USE") >= 0 || 
                	natureOfWork.toUpperCase().indexOf("ADDITION") >= 0) {
                    changeOfUse = true;
                }
            }
        }
		
		// calculation code here.
		if (!changeOfUse) fqty = 114.00;

		// check if the fee is already added.
		if (feeExists(fcode)) {
			updateFee(fcode, fsched, fperiod, fqty, finvoice);
		} else {
			addFee(fcode, fsched, fperiod, fqty, finvoice);
		}

	} catch (err) {
		logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
	}
}

/**
 * Calculates the fee CC-BLD-MIXEDUSE.CC_GEN_111
 * Past due reinspection fee penalty the greater of 10% or $10.00. ****
 *
 * Look for invoiced and unpaid fees CC-BLD-G-011 with invoice date older 
 * than DUE_DAYS add the 10% of the sum of the unpaid fees or $10 if the 10% is less than $10.
 * 
 * @return null
 */
function calcFee_CC_BLD_MIXEDUSE_CC_GEN_111() {

    //fee variables
    var fcode = "CC_GEN_111";
    var fsched = "CC-BLD-MIXEDUSE";
    var fperiod = "FINAL";
    var fqty = 10.00;
    var finvoice = "N";
    var fcodeSearchFor = "CC-BLD-G-011";
    var fschedSearchFor = "CC-BLD-GENERAL";

    try {
        // get the ASI field needed for the fee calculation.
        var feeTermsDueDays = lookup("INSPECTION_FEE_TERMS", "DUE_DAYS");
        if (!feeTermsDueDays) feeTermsDueDays = 30; // default due days if none was defined.

        // check if any of the related fees is already assessed and paid.
        var feeArray = loadFees();
        var totalAmount = 0;

        for (f in feeArray) {
            fee = feeArray[f];

            if (fee.code.toUpperCase().equals(fcodeSearchFor) && fee.sched.toUpperCase().equals(fschedSearchFor) && fee.status.toUpperCase().equals("INVOICED") &&
                dateDiff(sysDate, fee.applyDate) >= feeTermsDueDays && (fee.amountPaid == 0.00 || fee.amountPaid < fee.amount)) {
                totalAmount += fee.amount;
                logDebug("Apply Date: " + fee.applyDate);
                logDebug("Amount: " + currencyFormat(fee.amount));
                logDebug("Amount Paid: " + currencyFormat(fee.amountPaid));
            }
        }
                
        // calculation code here.
        if (totalAmount * 0.10 > 10.00) fqty = totalAmount * 0.10;

        // check if the fee is already added.
        if (feeExists(fcode)) {
            updateFee(fcode, fsched, fperiod, fqty, finvoice);
        } else {
            addFee(fcode, fsched, fperiod, fqty, finvoice);
        }

    } catch (err) {
        logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
    }
}

/**
 * Calculates the fee CC-BLD-MIXEDUSE.CC_GEN_131
 * Past due reinspection fee penalty the greater of 10% or $10.00. ****
 *
 * Look for invoiced and unpaid fees CC-BLD-G-013 with invoice date older 
 * than DUE_DAYS add the 10% of the sum of the unpaid fees or $10 if the 10% is less than $10.
 * 
 * @return null
 */
function calcFee_CC_BLD_MIXEDUSE_CC_GEN_131() {

	//fee variables
	var fcode = "CC_GEN_131";
	var fsched = "CC-BLD-MIXEDUSE";
	var fperiod = "FINAL";
	var fqty = 10.00;
	var finvoice = "N";
    var fcodeSearchFor = "CC-BLD-G-013";
    var fschedSearchFor = "CC-BLD-GENERAL";

	try {
        // get the ASI field needed for the fee calculation.
        var feeTermsDueDays = lookup("INSPECTION_FEE_TERMS", "DUE_DAYS");
        if (!feeTermsDueDays) feeTermsDueDays = 30; // default due days if none was defined.

        // check if any of the related fees is already assessed and paid.
        var feeArray = loadFees();
        var totalAmount = 0;

        for (f in feeArray) {
            fee = feeArray[f];

            if (fee.code.toUpperCase().equals(fcodeSearchFor) && fee.sched.toUpperCase().equals(fschedSearchFor) && fee.status.toUpperCase().equals("INVOICED") &&
                dateDiff(sysDate, fee.applyDate) >= feeTermsDueDays && (fee.amountPaid == 0.00 || fee.amountPaid < fee.amount)) {
                totalAmount += fee.amount;
                logDebug("Apply Date: " + fee.applyDate);
                logDebug("Amount: " + currencyFormat(fee.amount));
                logDebug("Amount Paid: " + currencyFormat(fee.amountPaid));
            }
        }
                
        // calculation code here.
        if (totalAmount * 0.10 > 10.00) fqty = totalAmount * 0.10;

		// check if the fee is already added.
		if (feeExists(fcode)) {
			updateFee(fcode, fsched, fperiod, fqty, finvoice);
		} else {
			addFee(fcode, fsched, fperiod, fqty, finvoice);
		}

	} catch (err) {
		logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
	}
}

/**
 * Calculates the fee CC-BLD-MULTIUNIT.CC_BLDGF015
 * Past due reinspection fee penalty the greater of 10% or $10.00. ****
 *
 * Look for invoiced and unpaid fees CC_BLDGF014 with invoice date older 
 * than DUE_DAYS add the 10% of the sum of the unpaid fees or $10 if the 10% is less than $10.
 * 
 * @return null
 */
function calcFee_CC_BLD_MULTIUNIT_CC_BLDGF015() {

	//fee variables
	var fcode = "CC_BLDGF015";
	var fsched = "CC-BLD-MULTIUNIT";
	var fperiod = "FINAL";
	var fqty = 10.00;
	var finvoice = "N";
    var fcodeSearchFor = "CC_BLDGF014";
    var fschedSearchFor = "CC-BLD-MULTIUNIT";

	try {
        // get the ASI field needed for the fee calculation.
        var feeTermsDueDays = lookup("INSPECTION_FEE_TERMS", "DUE_DAYS");
        if (!feeTermsDueDays) feeTermsDueDays = 30; // default due days if none was defined.

        // check if any of the related fees is already assessed and paid.
        var feeArray = loadFees();
        var totalAmount = 0;

        for (f in feeArray) {
            fee = feeArray[f];

            if (fee.code.toUpperCase().equals(fcodeSearchFor) && fee.sched.toUpperCase().equals(fschedSearchFor) && fee.status.toUpperCase().equals("INVOICED") &&
                dateDiff(sysDate, fee.applyDate) >= feeTermsDueDays && (fee.amountPaid == 0.00 || fee.amountPaid < fee.amount)) {
                totalAmount += fee.amount;
                logDebug("Apply Date: " + fee.applyDate);
                logDebug("Amount: " + currencyFormat(fee.amount));
                logDebug("Amount Paid: " + currencyFormat(fee.amountPaid));
            }
        }
                
        // calculation code here.
        if (totalAmount * 0.10 > 10.00) fqty = totalAmount * 0.10;

		// check if the fee is already added.
		if (feeExists(fcode)) {
			updateFee(fcode, fsched, fperiod, fqty, finvoice);
		} else {
			addFee(fcode, fsched, fperiod, fqty, finvoice);
		}

	} catch (err) {
		logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
	}
}

/**
 * Calculates the fee CC-BLD-MULTIUNIT.CC_BLDGF017
 * Past due reinspection fee penalty the greater of 10% or $10.00. ****
 *
 * Look for invoiced and unpaid fees CC_BLDGF016 with invoice date older 
 * than DUE_DAYS add the 10% of the sum of the unpaid fees or $10 if the 10% is less than $10.
 * 
 * @return null
 */
function calcFee_CC_BLD_MULTIUNIT_CC_BLDGF017() {

	//fee variables
	var fcode = "CC_BLDGF017";
	var fsched = "CC-BLD-MULTIUNIT";
	var fperiod = "FINAL";
	var fqty = 10.00;
	var finvoice = "N";
    var fcodeSearchFor = "CC_BLDGF014";
    var fschedSearchFor = "CC-BLD-MULTIUNIT";

	try {
        // get the ASI field needed for the fee calculation.
        var feeTermsDueDays = lookup("INSPECTION_FEE_TERMS", "DUE_DAYS");
        if (!feeTermsDueDays) feeTermsDueDays = 30; // default due days if none was defined.

        // check if any of the related fees is already assessed and paid.
        var feeArray = loadFees();
        var totalAmount = 0;

        for (f in feeArray) {
            fee = feeArray[f];

            if (fee.code.toUpperCase().equals(fcodeSearchFor) && fee.sched.toUpperCase().equals(fschedSearchFor) && fee.status.toUpperCase().equals("INVOICED") &&
                dateDiff(sysDate, fee.applyDate) >= feeTermsDueDays && (fee.amountPaid == 0.00 || fee.amountPaid < fee.amount)) {
                totalAmount += fee.amount;
                logDebug("Apply Date: " + fee.applyDate);
                logDebug("Amount: " + currencyFormat(fee.amount));
                logDebug("Amount Paid: " + currencyFormat(fee.amountPaid));
            }
        }
                
        // calculation code here.
        if (totalAmount * 0.10 > 10.00) fqty = totalAmount * 0.10;

		// check if the fee is already added.
		if (feeExists(fcode)) {
			updateFee(fcode, fsched, fperiod, fqty, finvoice);
		} else {
			addFee(fcode, fsched, fperiod, fqty, finvoice);
		}

	} catch (err) {
		logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
	}
}

/**
 * Calculates the fee CC-BLD-MULTIUNIT.CC_BLDMU003
 * Townhouse, Townhouse building with units sold as condominiums, or Duplex. $684 per unit
 * 
 * @return null
 */
function calcFee_CC_BLD_MULTIUNIT_CC_BLDMU003() {

	//fee variables
	var fcode = "CC_BLDMU003";
	var fsched = "CC-BLD-MULTIUNIT";
	var fperiod = "FINAL";
	var fqty = 684.00;
	var finvoice = "N";

	try {
		// get the ASI field needed for the fee calculation.
        var tblName = "CC-BLD-MULTI-UNIT-DETAIL";
        var unitCount = 0;

        var unitDetailArray = null;
        if (CCBLDMULTIUNITDETAIL) {
            unitDetailArray = CCBLDMULTIUNITDETAIL;
        } else {
            unitDetailArray = loadASITable(tblName);
        }

        if (!unitDetailArray) {
            logDebug("Can't find ASI Table: " + tblName);
        } else {
        	unitCount = unitDetailArray.length;
        }
		
		// calculation code here.
		fqty = fqty * unitCount;
		
		// check if the fee is already added.
		if (feeExists(fcode)) {
			updateFee(fcode, fsched, fperiod, fqty, finvoice);
		} else {
			addFee(fcode, fsched, fperiod, fqty, finvoice);
		}

	} catch (err) {
		logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
	}
}

/**
 * Calculates the fee CC-BLD-RESIDENTIAL.CC_GEN_11
 * Past due reinspection fee penalty the greater of 10% or $10.00. ****
 *
 * Look for invoiced and unpaid fees CC_GEN_10 with invoice date older 
 * than DUE_DAYS add the 10% of the sum of the unpaid fees or $10 if the 10% is less than $10.
 * 
 * @return null
 */
function calcFee_CC_BLD_RESIDENTIAL_CC_GEN_11() {

	//fee variables
	var fcode = "CC_GEN_11";
	var fsched = "CC-BLD-RESIDENTIAL";
	var fperiod = "FINAL";
	var fqty = 10.00;
	var finvoice = "N";
    var fcodeSearchFor = "CC_GEN_10";
    var fschedSearchFor = "CC-BLD-RESIDENTIAL";

	try {
        // get the ASI field needed for the fee calculation.
        var feeTermsDueDays = lookup("INSPECTION_FEE_TERMS", "DUE_DAYS");
        if (!feeTermsDueDays) feeTermsDueDays = 30; // default due days if none was defined.

        // check if any of the related fees is already assessed and paid.
        var feeArray = loadFees();
        var totalAmount = 0;

        for (f in feeArray) {
            fee = feeArray[f];

            if (fee.code.toUpperCase().equals(fcodeSearchFor) && fee.sched.toUpperCase().equals(fschedSearchFor) && fee.status.toUpperCase().equals("INVOICED") &&
                dateDiff(sysDate, fee.applyDate) >= feeTermsDueDays && (fee.amountPaid == 0.00 || fee.amountPaid < fee.amount)) {
                totalAmount += fee.amount;
                logDebug("Apply Date: " + fee.applyDate);
                logDebug("Amount: " + currencyFormat(fee.amount));
                logDebug("Amount Paid: " + currencyFormat(fee.amountPaid));
            }
        }
                
        // calculation code here.
        if (totalAmount * 0.10 > 10.00) fqty = totalAmount * 0.10;

		// check if the fee is already added.
		if (feeExists(fcode)) {
			updateFee(fcode, fsched, fperiod, fqty, finvoice);
		} else {
			addFee(fcode, fsched, fperiod, fqty, finvoice);
		}

	} catch (err) {
		logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
	}
}

/**
 * Calculates the fee CC-BLD-RESIDENTIAL.CC_GEN_13
 * Past due reinspection fee penalty the greater of 10% or $10.00. ****
 *
 * Look for invoiced and unpaid fees CC_GEN_12 with invoice date older 
 * than DUE_DAYS add the 10% of the sum of the unpaid fees or $10 if the 10% is less than $10.
 * 
 * @return null
 */
function calcFee_CC_BLD_RESIDENTIAL_CC_GEN_13() {

	//fee variables
	var fcode = "CC_GEN_13";
	var fsched = "CC-BLD-RESIDENTIAL";
	var fperiod = "FINAL";
	var fqty = 10.00;
	var finvoice = "N";
    var fcodeSearchFor = "CC_GEN_12";
    var fschedSearchFor = "CC-BLD-RESIDENTIAL";

	try {
        // get the ASI field needed for the fee calculation.
        var feeTermsDueDays = lookup("INSPECTION_FEE_TERMS", "DUE_DAYS");
        if (!feeTermsDueDays) feeTermsDueDays = 30; // default due days if none was defined.

        // check if any of the related fees is already assessed and paid.
        var feeArray = loadFees();
        var totalAmount = 0;

        for (f in feeArray) {
            fee = feeArray[f];

            if (fee.code.toUpperCase().equals(fcodeSearchFor) && fee.sched.toUpperCase().equals(fschedSearchFor) && fee.status.toUpperCase().equals("INVOICED") &&
                dateDiff(sysDate, fee.applyDate) >= feeTermsDueDays && (fee.amountPaid == 0.00 || fee.amountPaid < fee.amount)) {
                totalAmount += fee.amount;
                logDebug("Apply Date: " + fee.applyDate);
                logDebug("Amount: " + currencyFormat(fee.amount));
                logDebug("Amount Paid: " + currencyFormat(fee.amountPaid));
            }
        }
                
        // calculation code here.
        if (totalAmount * 0.10 > 10.00) fqty = totalAmount * 0.10;

		// check if the fee is already added.
		if (feeExists(fcode)) {
			updateFee(fcode, fsched, fperiod, fqty, finvoice);
		} else {
			addFee(fcode, fsched, fperiod, fqty, finvoice);
		}

	} catch (err) {
		logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
	}
}

/**
 * Calculates the fee CC-BLD-RESIDENTIAL.CC-PLN-LU-TH
 * Planning Permit or Written Determinations :  Temporary Family Health Care Unit. ****
 *
 * 
 * @return null
 */
function calcFee_CC_BLD_RESIDENTIAL_CC_PLN_LU_TH() {

	//fee variables
	var fcode = "CC-PLN-LU-TH";
	var fsched = "CC-BLD-RESIDENTIAL";
	var fperiod = "FINAL";
	var fqty = 100.00;
	var finvoice = "N";

	try {
        // get the ASI field needed for the fee calculation.

        // check if any of the related fees is already assessed and paid.
                
        // calculation code here.

		// check if the fee is already added.
		if (feeExists(fcode)) {
			updateFee(fcode, fsched, fperiod, fqty, finvoice);
		} else {
			addFee(fcode, fsched, fperiod, fqty, finvoice);
		}

	} catch (err) {
		logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
	}
}

/**
 * Calculates the fee CC-LU-SC.CC-LU-SC-01
 * Schematic or Overall Development Plan # 
 * $1400 plus $70 per acre in access of 1 acre
 *  
 * @return null
 */
function calcFee_CC_LU_SC_CC_LU_SC_01() {

	//fee variables
	var fcode = "CC-LU-SC-01";
	var fsched = "CC-LU-SC";
	var fperiod = "FINAL";
	var fqty = 1400.00;
	var finvoice = "N";

	try {
		var totalAcreage = AInfo["Total site acreage"];
		if (!totalAcreage) {
			logDebug("You need the Total site acreage to assess fee.");
			return null;
		}
		
		totalAcreage = parseFloat(totalAcreage);

		// calculation code here.
		var minimumFee = fqty;
		var calculatedFee = minimumFee;

		if (totalAcreage > 1.00) {
			calculatedFee = minimumFee + ((totalAcreage - 1) * 70.00);
		}

		fqty = calculatedFee;

		// check if the fee is already added.
		if (feeExists(fcode)) {
			updateFee(fcode, fsched, fperiod, fqty, finvoice);
		} else {
			addFee(fcode, fsched, fperiod, fqty, finvoice);
		}

	} catch (err) {
		logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
	}
}

/**
 * Calculates the fee CC-LU-ZC.CC-LU-ZC-01
 * Rezoning
 * $1400 plus $70 per acre in excess of 1 acre
 * 
 * @return null
 */
function calcFee_CC_LU_ZC_CC_LU_ZC_01() {

	//fee variables
	var fcode = "CC-LU-ZC-01";
	var fsched = "CC-LU-ZC";
	var fperiod = "FINAL";
	var fqty = 1400.00;
	var finvoice = "N";

	try {
		// get the ASI field needed for the fee calculation.
		var totalAcreage = AInfo["Total acreage"];
		if (!totalAcreage) {
			logDebug("You need the Total acreage to assess fee.");
			return null;
		}
		
		totalAcreage = parseFloat(totalAcreage);

		// calculation code here.
		var minimumFee = fqty;
		var calculatedFee = minimumFee;

		if (totalAcreage > 1.00) {
			calculatedFee = minimumFee + ((totalAcreage - 1) * 70.00);
		}

		fqty = calculatedFee;
		
		// check if the fee is already added.
		if (feeExists(fcode)) {
			updateFee(fcode, fsched, fperiod, fqty, finvoice);
		} else {
			addFee(fcode, fsched, fperiod, fqty, finvoice);
		}

	} catch (err) {
		logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
	}
}

/**
 * Calculates the fee CC-LU-ZC.CC-LU-ZC-03
 * Conditional use - Communication tower
 * $7500 plus $100 per acre in excess of 1 acre
 * 
 * @return null
 */
function calcFee_CC_LU_ZC_CC_LU_ZC_03() {

	//fee variables
	var fcode = "CC-LU-ZC-03";
	var fsched = "CC-LU-ZC";
	var fperiod = "FINAL";
	var fqty = 7500.00;
	var finvoice = "N";

	try {
		// get the ASI field needed for the fee calculation.
		var totalAcreage = AInfo["Total acreage"];
		if (!totalAcreage) {
			logDebug("You need the Total acreage to assess fee.");
			return null;
		}
		
		totalAcreage = parseFloat(totalAcreage);
		
		// calculation code here.
		var minimumFee = fqty;
		var calculatedFee = minimumFee;

		if (totalAcreage > 1.00) {
			calculatedFee = minimumFee + ((totalAcreage - 1) * 100.00);
		}

		fqty = calculatedFee;

		// check if the fee is already added.
		if (feeExists(fcode)) {
			updateFee(fcode, fsched, fperiod, fqty, finvoice);
		} else {
			logDebug("Adding fee " + fcode + " Qty: " + fqty);
			addFee(fcode, fsched, fperiod, fqty, finvoice);
		}

	} catch (err) {
		logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
	}
}

/**
 * Calculates the fee CC-LU-ZC.CC-LU-ZC-04
 * Conditional use - Computer Controlled Variable Message Electronic (EMC) Sign 
 * $2100 plus 100 per acre in excess of 1 acre
 * 
 * @return null
 */
function calcFee_CC_LU_ZC_CC_LU_ZC_04() {

	//fee variables
	var fcode = "CC-LU-ZC-04";
	var fsched = "CC-LU-ZC";
	var fperiod = "FINAL";
	var fqty = 2100.00;
	var finvoice = "N";

	try {
		// get the ASI field needed for the fee calculation.
		var totalAcreage = AInfo["Total acreage"];
		if (!totalAcreage) {
			logDebug("You need the Total acreage to assess fee.");
			return null;
		}
		
		totalAcreage = parseFloat(totalAcreage);
		
		// calculation code here.
		var minimumFee = fqty;
		var calculatedFee = minimumFee;

		if (totalAcreage > 1.00) {
			calculatedFee = minimumFee + ((totalAcreage - 1) * 100.00);
		}

		fqty = calculatedFee;

		// check if the fee is already added.
		if (feeExists(fcode)) {
			updateFee(fcode, fsched, fperiod, fqty, finvoice);
		} else {
			logDebug("Adding fee " + fcode + " Qty: " + fqty);
			addFee(fcode, fsched, fperiod, fqty, finvoice);
		}

	} catch (err) {
		logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
	}
}

/**
 * Calculates the fee CC-LU-ZC.CC-LU-ZC-06
 * Conditional use - Landfill, quarry, mine, or borrow pit 
 * $7500 plus $100 per acre in excess of 1 acre
 * 
 * @return null
 */
function calcFee_CC_LU_ZC_CC_LU_ZC_06() {

	//fee variables
	var fcode = "CC-LU-ZC-06";
	var fsched = "CC-LU-ZC";
	var fperiod = "FINAL";
	var fqty = 7500.00;
	var finvoice = "N";

	try {
		var totalAcreage = AInfo["Total acreage"];
		if (!totalAcreage) {
			logDebug("You need the Total acreage to assess fee.");
			return null;
		}
		
		totalAcreage = parseFloat(totalAcreage);

		// calculation code here.
		var minimumFee = fqty;
		var calculatedFee = minimumFee;

		if (totalAcreage > 1.00) {
			calculatedFee = minimumFee + ((totalAcreage - 1) * 100.00);
		}

		fqty = calculatedFee;
		
		// check if the fee is already added.
		if (feeExists(fcode)) {
			updateFee(fcode, fsched, fperiod, fqty, finvoice);
		} else {
			addFee(fcode, fsched, fperiod, fqty, finvoice);
		}

	} catch (err) {
		logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
	}
}

/**
 * Calculates the fee CC-LU-ZC.CC-LU-ZC-07
 * Conditional use - Use incidental to principal dwelling to include family day care home - $300.00
 * 
 * @return null
 */
function calcFee_CC_LU_ZC_CC_LU_ZC_07() {

	//fee variables
	var fcode = "CC-LU-ZC-07";
	var fsched = "CC-LU-ZC";
	var fperiod = "FINAL";
	var fqty = 300.00;
	var finvoice = "N";

	try {
		// get the ASI field needed for the fee calculation.
		
		// calculation code here.

		// check if the fee is already added.
		if (feeExists(fcode)) {
			updateFee(fcode, fsched, fperiod, fqty, finvoice);
		} else {
			addFee(fcode, fsched, fperiod, fqty, finvoice);
		}

	} catch (err) {
		logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
	}
}

/**
 * Calculates the fee CC-LU-ZC.CC-LU-ZC-09
 * Conditional use - Adult business $7500 plus $100 per acre in excess of 1 acre
 * 
 * @return null
 */
function calcFee_CC_LU_ZC_CC_LU_ZC_09() {

	//fee variables
	var fcode = "CC-LU-ZC-09";
	var fsched = "CC-LU-ZC";
	var fperiod = "FINAL";
	var fqty = 7500.00;
	var finvoice = "N";

	try {
		var totalAcreage = AInfo["Total acreage"];
		if (!totalAcreage) {
			logDebug("You need the Total acreage to assess fee.");
			return null;
		}
		
		totalAcreage = parseFloat(totalAcreage);

		// calculation code here.
		var minimumFee = fqty;
		var calculatedFee = minimumFee;

		if (totalAcreage > 1.00) {
			calculatedFee = minimumFee + ((totalAcreage - 1) * 100.00);
		}

		fqty = calculatedFee;

		// check if the fee is already added.
		if (feeExists(fcode)) {
			updateFee(fcode, fsched, fperiod, fqty, finvoice);
		} else {
			addFee(fcode, fsched, fperiod, fqty, finvoice);
		}

	} catch (err) {
		logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
	}
}

/**
 * Calculates the fee CC-LU-ZC.CC-LU-ZC-12
 * Conditional use - All others $1400 plus $70 per acre in excess of 1 acre
 * 
 * @return null
 */
function calcFee_CC_LU_ZC_CC_LU_ZC_12() {

	//fee variables
	var fcode = "CC-LU-ZC-12";
	var fsched = "CC-LU-ZC";
	var fperiod = "FINAL";
	var fqty = 1400.00;
	var finvoice = "N";

	try {
		var totalAcreage = AInfo["Total acreage"];
		if (!totalAcreage) {
			logDebug("You need the Total acreage to assess fee.");
			return null;
		}
		
		totalAcreage = parseFloat(totalAcreage);

		// calculation code here.
		var minimumFee = fqty;
		var calculatedFee = minimumFee;

		if (totalAcreage > 1.00) {
			calculatedFee = minimumFee + ((totalAcreage - 1) * 70.00);
		}

		fqty = calculatedFee;

		// check if the fee is already added.
		if (feeExists(fcode)) {
			updateFee(fcode, fsched, fperiod, fqty, finvoice);
		} else {
			addFee(fcode, fsched, fperiod, fqty, finvoice);
		}

	} catch (err) {
		logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
	}
}

/**
 * Calculates the fee CC-LU-ZC.CC-LU-ZC-17
 * Amend conditional use - All others $2000 for first 2 conditions plus 
 * $1000 for each condition thereafter (includes condition of textual statement)
 * 
 * @return null
 */
function calcFee_CC_LU_ZC_CC_LU_ZC_17() {

	//fee variables
	var fcode = "CC-LU-ZC-17";
	var fsched = "CC-LU-ZC";
	var fperiod = "FINAL";
	var fqty = 2000.00;
	var finvoice = "N";

	try {
		// get the ASI field needed for the fee calculation.
		var value = AInfo["No of conditions amending"];
		if (!value) {
			logDebug("You need the No of conditions amending to assess fee.");
			return null;
		}
		
		value = parseFloat(value);		
		// calculation code here.
		var minimumFee = fqty;
		var calculatedFee = minimumFee;

		if (value > 2.00) {
			calculatedFee = minimumFee + (value * 1000.00);
		}

		fqty = calculatedFee;
		// check if the fee is already added.
		if (feeExists(fcode)) {
			updateFee(fcode, fsched, fperiod, fqty, finvoice);
		} else {
			addFee(fcode, fsched, fperiod, fqty, finvoice);
		}

	} catch (err) {
		logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
	}
}

/**
 * Calculates the fee CC-LU-ZC.CC-LU-ZC-18
 * Schematic or Overall Development Plan 
 * $1400 plus $70 per acre in access of 1 acre
 *  
 * @return null
 */
function calcFee_CC_LU_ZC_CC_LU_ZC_18() {

	//fee variables
	var fcode = "CC-LU-ZC-18";
	var fsched = "CC-LU-ZC";
	var fperiod = "FINAL";
	var fqty = 1400.00;
	var finvoice = "N";

	try {
		var totalAcreage = AInfo["Total acreage"];
		if (!totalAcreage) {
			logDebug("You need the Total acreage to assess fee.");
			return null;
		}
		
		totalAcreage = parseFloat(totalAcreage);

		// calculation code here.
		var minimumFee = fqty;
		var calculatedFee = minimumFee;

		if (totalAcreage > 1.00) {
			calculatedFee = minimumFee + ((totalAcreage - 1) * 70.00);
		}

		fqty = calculatedFee;

		// check if the fee is already added.
		if (feeExists(fcode)) {
			updateFee(fcode, fsched, fperiod, fqty, finvoice);
		} else {
			addFee(fcode, fsched, fperiod, fqty, finvoice);
		}

	} catch (err) {
		logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
	}
}

/**
 * Calculates the fee CC-LU-ZC.CC-LU-ZC-19
 * Substantial accord - communication tower 
 * $1400 plus $70 per acre in access of 1 acre
 *  
 * @return null
 */
function calcFee_CC_LU_ZC_CC_LU_ZC_19() {

	//fee variables
	var fcode = "CC-LU-ZC-19";
	var fsched = "CC-LU-ZC";
	var fperiod = "FINAL";
	var fqty = 1400.00;
	var finvoice = "N";

	try {
		var totalAcreage = AInfo["Total acreage"];
		if (!totalAcreage) {
			logDebug("You need the Total acreage to assess fee.");
			return null;
		}
		
		totalAcreage = parseFloat(totalAcreage);

		// calculation code here.
		var minimumFee = fqty;
		var calculatedFee = minimumFee;

		if (totalAcreage > 1.00) {
			calculatedFee = minimumFee + ((totalAcreage - 1) * 70.00);
		}

		fqty = calculatedFee;

		// check if the fee is already added.
		if (feeExists(fcode)) {
			updateFee(fcode, fsched, fperiod, fqty, finvoice);
		} else {
			addFee(fcode, fsched, fperiod, fqty, finvoice);
		}

	} catch (err) {
		logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
	}
}

/**
 * Calculates the fee CC-LU-ZC.CC-LU-ZC-20
 * Substantial Accord - All others 
 * $1400 plus $70 per acre in access of 1 acre
 *  
 * @return null
 */
function calcFee_CC_LU_ZC_CC_LU_ZC_20() {

	//fee variables
	var fcode = "CC-LU-ZC-20";
	var fsched = "CC-LU-ZC";
	var fperiod = "FINAL";
	var fqty = 1400.00;
	var finvoice = "N";

	try {
		var totalAcreage = AInfo["Total acreage"];
		if (!totalAcreage) {
			logDebug("You need the Total acreage to assess fee.");
			return null;
		}
		
		totalAcreage = parseFloat(totalAcreage);

		// calculation code here.
		var minimumFee = fqty;
		var calculatedFee = minimumFee;

		if (totalAcreage > 1.00) {
			calculatedFee = minimumFee + ((totalAcreage - 1) * 70.00);
		}

		fqty = calculatedFee;

		// check if the fee is already added.
		if (feeExists(fcode)) {
			updateFee(fcode, fsched, fperiod, fqty, finvoice);
		} else {
			addFee(fcode, fsched, fperiod, fqty, finvoice);
		}

	} catch (err) {
		logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
	}
}

/**
 * Calculates the fee CC-LU-ZC-SA.CC-LU-SA-01
 * Substantial accord - communication tower 
 * $7500 + $100 per acre in excess of 1 acre.
 *  
 * @return null
 */
function calcFee_CC_LU_ZC_SA_CC_LU_SA_01() {

	//fee variables
	var fcode = "CC-LU-SA-01";
	var fsched = "CC-LU-ZC-SA";
	var fperiod = "FINAL";
	var fqty = 7500.00;
	var finvoice = "N";

	try {
		// get the ASI field needed for the fee calculation.
        var requestType = AInfo["Request type"];
        if (!requestType) {
            logDebug("Can't apply fee " + fcode + ". Request Type is null.");
            return null;
        }

        if (requestType.toUpperCase().indexOf("TOWER") < 0) {
            logDebug("This fee doesn't apply for this Request Type:" + requestType);
            return null;
        }

		var totalAcreage = AInfo["Total Parcel Area"];
		if (!totalAcreage) {
			logDebug("You need the Total Parcel Area to assess fee.");
			return null;
		}
		
		totalAcreage = parseFloat(totalAcreage);

		// calculation code here.
		var minimumFee = fqty;
		var calculatedFee = minimumFee;

		if (totalAcreage > 1.00) {
			calculatedFee = minimumFee + ((totalAcreage - 1) * 100.00);
		}

		fqty = calculatedFee;

		// check if the fee is already added.
		if (feeExists(fcode)) {
			updateFee(fcode, fsched, fperiod, fqty, finvoice);
		} else {
			addFee(fcode, fsched, fperiod, fqty, finvoice);
		}

	} catch (err) {
		logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
	}
}

/**
 * Calculates the fee CC-LU-ZC-SA.CC-LU-SA-02
 * Substantial Accord - All others #
 * $1400 + $70 per acre in excess of 1 acre.
 *  
 * @return null
 */
function calcFee_CC_LU_ZC_SA_CC_LU_SA_02() {

	//fee variables
	var fcode = "CC-LU-SA-01";
	var fsched = "CC-LU-ZC-SA";
	var fperiod = "FINAL";
	var fqty = 1400.00;
	var finvoice = "N";

	try {
		// get the ASI field needed for the fee calculation.
        var requestType = AInfo["Request type"];
        if (!requestType) {
            logDebug("Can't apply fee " + fcode + ". Request Type is null.");
            return null;
        }

        if (requestType.toUpperCase().indexOf("OTHER") < 0) {
            logDebug("This fee doesn't apply for this Request Type:" + requestType);
            return null;
        }

		var totalAcreage = AInfo["Total Parcel Area"];
		if (!totalAcreage) {
			logDebug("You need the Total Parcel Area to assess fee.");
			return null;
		}
		
		totalAcreage = parseFloat(totalAcreage);

		// calculation code here.
		var minimumFee = fqty;
		var calculatedFee = minimumFee;

		if (totalAcreage > 1.00) {
			calculatedFee = minimumFee + ((totalAcreage - 1) * 70.00);
		}

		fqty = calculatedFee;

		// check if the fee is already added.
		if (feeExists(fcode)) {
			updateFee(fcode, fsched, fperiod, fqty, finvoice);
		} else {
			addFee(fcode, fsched, fperiod, fqty, finvoice);
		}

	} catch (err) {
		logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
	}
}

/**
 * Calculates the fee CC-LU-ZC-SA.CC-PLN-ADM02
 * Program Admin Fee-10,000 square feet or more-for Erosion, Sediment Control Review and Enforcement #
 * $1360 + $60 per disturbed acre (commercial projects) or lot (residential projects)
 *  
 * @return null
 */
function calcFee_CC_LU_ZC_SA_CC_PLN_ADM02() {

	//fee variables
	var fcode = "CC-PLN-ADM02";
	var fsched = "CC-PLN-ADM";
	var fperiod = "FINAL";
	var fqty = 1360.00;
	var finvoice = "N";

	try {
		// get the ASI field needed for the fee calculation.
		var value = 0;

        if (appMatch("Planning/SitePlan/Major/NA")) {
            value = AInfo["Total disturbed acreage"];
            if (value || value > 0) {
                value = (value / 43560); // convert sqr ft to acres
            } else {
                value = 0.00;
            }
        } else if (appMatch("Planning/Subdivision/ConstructionPlan/NA")) {
            value = AInfo["No of lots"];
        } else if (appMatch("Planning/LandUse/EandSControlPlan/NA")) {
            value = AInfo["Disturbed acreage"];
        }

        value = parseFloat(value);

        if (!value) {
            logDebug("You need the acreage or lots to assess fee.");
            return null;
        }


		// calculation code here.
		var minimumFee = fqty;
		var calculatedFee = minimumFee;

		if (value > 1.00) {
			calculatedFee = minimumFee + ((value - 1) * 60.00);
		}

		fqty = calculatedFee;

		// check if the fee is already added.
		if (feeExists(fcode)) {
			updateFee(fcode, fsched, fperiod, fqty, finvoice);
		} else {
			addFee(fcode, fsched, fperiod, fqty, finvoice);
		}

	} catch (err) {
		logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
	}
}

/**
 * Calculates the fee CC-PLN-SITE.CC-PLN-SIT01
 * Site plan - Initial Submittal $1400 plus $70 per acre in access of 1 acre
 *  
 * @return null
 */
function calcFee_CC_PLN_SITE_CC_PLN_SIT01() {

	//fee variables
	var fcode = "CC-PLN-SIT01";
	var fsched = "CC-PLN-SITE";
	var fperiod = "FINAL";
	var fqty = 1400.00;
	var finvoice = "N";

	try {
		var totalAcreage = AInfo["Total acreage"];
		if (!totalAcreage) {
			logDebug("You need the Total acreage to assess fee.");
			return null;
		}
		
		totalAcreage = parseFloat(totalAcreage);

		// calculation code here.
		var minimumFee = fqty;
		var calculatedFee = minimumFee;

		if (totalAcreage > 1.00) {
			calculatedFee = minimumFee + ((totalAcreage - 1) * 70.00);
		}

		fqty = calculatedFee;

		// check if the fee is already added.
		if (feeExists(fcode)) {
			updateFee(fcode, fsched, fperiod, fqty, finvoice);
		} else {
			addFee(fcode, fsched, fperiod, fqty, finvoice);
		}

	} catch (err) {
		logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
	}
}

/**
 * Calculates the fee CC-PLN-SUB.CC-PLN-SFP08
 * BMP Maintenance Fee.
 * $100 per lot recorded. Use CC-PLN-FP.CC-LU-PRSTATS.Lots recorded field value.
 *  
 * @return null
 */
function calcFee_CC_PLN_SUB_CC_PLN_SFP08() {

	//fee variables
	var fcode = "CC-PLN-SFP08";
	var fsched = "CC-PLN-SUB";
	var fperiod = "FINAL";
	var fqty = 100.00;
	var finvoice = "N";

	try {
		// get the ASI field needed for the fee calculation.
		var value = AInfo["Lots recorded"];
		if (!value) {
			logDebug("You need the Lots recorded to assess fee.");
			return null;
		}
		
		value = parseFloat(value);

		// calculation code here.
		var minimumFee = fqty;
		var calculatedFee = minimumFee;

		if (value > 1.00) {
			calculatedFee = minimumFee + ((value - 1) * 70.00);
		}

		fqty = calculatedFee;

		// check if the fee is already added.
		if (feeExists(fcode)) {
			updateFee(fcode, fsched, fperiod, fqty, finvoice);
		} else {
			addFee(fcode, fsched, fperiod, fqty, finvoice);
		}

	} catch (err) {
		logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
	}
}

/**
 * Calculates the fee CC-PLN-SUB.CC-PLN-SIT01
 * Preliminary subdivision plat - initial submittal $1000 plus $50 per lot
 *  
 * @return null
 */
function calcFee_CC_PLN_SUB_CC_PLN_SUB01() {

	//fee variables
	var fcode = "CC-PLN-SUB01";
	var fsched = "CC-PLN-SUB";
	var fperiod = "FINAL";
	var fqty = 1000.00;
	var finvoice = "N";

	try {
		// get the ASI field needed for the fee calculation.
		var value = AInfo["Number of Lots"];
		if (!value) {
			logDebug("You need the Number of Lots to assess fee.");
			return null;
		}
		
		value = parseFloat(value);
		
		// calculation code here.
		var minimumFee = fqty;
		var calculatedFee = minimumFee;

		if (value > 0.00) {
			calculatedFee = minimumFee + (value * 50.00);
		}

		fqty = calculatedFee;

		// check if the fee is already added.
		if (feeExists(fcode)) {
			updateFee(fcode, fsched, fperiod, fqty, finvoice);
		} else {
			addFee(fcode, fsched, fperiod, fqty, finvoice);
		}

	} catch (err) {
		logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
	}
}

/**
 * Calculates the fee CC-PLN-SUB.CC-PLN-SUB06
 * Construction plan review - initial submission $1400 + $70 per lot or parcel
 *  
 * @return null
 */
function calcFee_CC_PLN_SUB_CC_PLN_SUB06() {

	//fee variables
	var fcode = "CC-PLN-SUB06";
	var fsched = "CC-PLN-SUB";
	var fperiod = "FINAL";
	var fqty = 1400.00;
	var finvoice = "N";

	try {
		// get the ASI field needed for the fee calculation.
		var value = AInfo["Number of Lots"];
		if (!value) {
			logDebug("You need the Number of Lots to assess fee.");
			return null;
		}
		
		value = parseFloat(value);		
		// calculation code here.
		var minimumFee = fqty;
		var calculatedFee = minimumFee;

		if (value > 0.00) {
			calculatedFee = minimumFee + (value * 70.00);
		}

		fqty = calculatedFee;

		// check if the fee is already added.
		if (feeExists(fcode)) {
			updateFee(fcode, fsched, fperiod, fqty, finvoice);
		} else {
			addFee(fcode, fsched, fperiod, fqty, finvoice);
		}

	} catch (err) {
		logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
	}
}

/**
 * Calculates the fee CC-PLN-SUB-PP.CC-PLN-PP01
 * Preliminary subdivision plat - initial submittal # Plus Two.
 * $1000 + $50 per lot. Subdivision Preliminary (Planning/Subdivision/Preliminary/NA)
 *  
 * @return null
 */
function calcFee_CC_PLN_SUB_PP_CC_PLN_PP01() {

	//fee variables
	var fcode = "CC-PLN-PP01";
	var fsched = "CC-PLN-SUB-PP";
	var fperiod = "FINAL";
	var fqty = 1000.00;
	var finvoice = "N";

	try {
		// get the ASI field needed for the fee calculation.
		if (!appMatch("Planning/Subdivision/Preliminary/NA")) {
			logDebug("Can't assess this fee.");
			return;
		}

		var value = AInfo["Lots recorded"];
		if (!value) {
			logDebug("You need the Lots recorded to assess fee.");
			return null;
		}
		
		value = parseFloat(value);

		// calculation code here.
		var minimumFee = fqty;
		var calculatedFee = minimumFee;

		if (value > 0.00) {
			calculatedFee = minimumFee + (value * 50.00);
		}

		fqty = calculatedFee;

		// check if the fee is already added.
		if (feeExists(fcode)) {
			updateFee(fcode, fsched, fperiod, fqty, finvoice);
		} else {
			addFee(fcode, fsched, fperiod, fqty, finvoice);
		}

	} catch (err) {
		logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
	}
}

/**
 * Calculates the fee SSSSSS_FFFFF
 * @return null
 */
function calcFee_SSSSSS_FFFFF(){
	// don't remove.
	var fName = arguments.callee.toString().match(/function ([^\(]+)/)[1];

	try {
		// do calculations
	} catch(err) {
		logDebug("A JavaScript Error occured: " + fName + " - " + err.message);
	}
}

/**
 * Calculate the due date for a given list of work flow tasks.
 * @param  {Array} taskList     - Array containing the list of task to calculate the due date
 * @param  {int} dueDays        - Number of days to calculate the due date. It will take the file date as base to make the calculation.
 * @param  {string} baseDate    - Date to be used to make the due date calculation.
 * @param  {boolean} useWorking - if optional parameter #3 is present, use working days only
 * @return {boolean}            - False if any error.
 */
function calcWFTDueDate(taskList, dueDays, baseDate) {
    try {
        var useWorking = false;
        if (arguments.length == 3)
            useWorking = true;        

        var dueDate = addDate(baseDate, 10, useWorking);

        for (t in taskList) {
            var thisTask = taskList[t];
            editTaskDueDate(thisTask, dueDate);
        }
        return true;
    } catch (err) {
        logDebug("calcWFTDueDate Message: Error-" + err.message + ". CapID:" + capID);
        return false;
    }
}

//aa.print("cancelMeetingsbyMeetingName:" + cancelMeetingsbyMeetingName(capId, "PLANNING COMMISSION HEARING"));
function cancelMeetingsbyMeetingName(capID, MeetingName)
{
   // This function cancels all active meeting by capId and meeting name
   // and returns the total number of meetings canceled
	try
	{
	   var meetingsCancelled = 0;
	   agendaArr = aa.meeting.getMeetingsByCAP(capID, false).getOutput();
	   for (rec in agendaArr.toArray())
	   {
		  var agendaItem = agendaArr.toArray()[rec];
		  var meetingID = agendaItem.getMeetingID();
		  var meetingGroupID = agendaItem.getMeetingGroupID();
		  var meetingDate = agendaItem.getMeeting().getStartDate();
		  var meetingModel = agendaItem.getMeeting();
		  var tempMeetingType = meetingModel.getMeetingType().toString();
		  aa.print("tempMeetingType:" + tempMeetingType);
		  
		  if (tempMeetingType == MeetingName)
		  {
			 meetingsCancelled ++ ;
			 aa.meeting.removeAgendaFromMeeting(meetingGroupID, meetingID, capID);
		  }
	   }
	   return meetingsCancelled;
	}catch(err){
		logDebug("Method name: cancelMeetingsbyMeetingName. Message: Error-" + err.message + ". CapID:" + capID);
		return false;
	}	
}

function changeCapContactTypes(origType, newType) {
	// Renames all contacts of type origType to contact type of newType and includes Contact Address objects
	//
	var vCapId = capId;
	if (arguments.length == 3)
		vCapId = arguments[2];

	var capContactResult = aa.people.getCapContactByCapID(vCapId);
	var renamed = 0;
	if (capContactResult.getSuccess()) {
		var Contacts = capContactResult.getOutput();
		for (yy in Contacts) {
			var contact = Contacts[yy].getCapContactModel();

			var people = contact.getPeople();
			var contactType = people.getContactType();
			aa.print("Contact Type " + contactType);

			if (contactType == origType) {

				var contactNbr = people.getContactSeqNumber();
				var editContact = aa.people.getCapContactByPK(vCapId, contactNbr).getOutput();
				editContact.getCapContactModel().setContactType(newType)

				aa.print("Set to: " + people.getContactType());
				renamed++;

				var updContactResult = aa.people.editCapContact(editContact.getCapContactModel());
				logDebug("contact " + updContactResult);
				logDebug("contact.getSuccess() " + updContactResult.getSuccess());
				logDebug("contact.getOutput() " + updContactResult.getOutput());
				updContactResult.getOutput();
				logDebug("Renamed contact from " + origType + " to " + newType);
			}
		}
	} else {
		logMessage("**ERROR: Failed to get contacts: " + capContactResult.getErrorMessage());
		return false;
	}
	return renamed;
}

function checkWorkflowTaskAndStatus(capId, workflowTask, taskStatus) {
	var workflowResult = aa.workflow.getTasks(capId);
	if (workflowResult.getSuccess())
		wfObj = workflowResult.getOutput();
	else {
		aa.print("**ERROR: Failed to get workflow object: " + wfObj);
		return false;
	}

	for (i in wfObj) {
		fTask = wfObj[i];
		var status = fTask.getDisposition();
		var taskDesc = fTask.getTaskDescription();

		if (status != null && taskDesc != null && taskDesc.equals(workflowTask) && status.equals(taskStatus))
			return true;
	}

	return false;
}

function cntAssocGarageSales(strnum, strname, city, state, zip, cfname, clname) {

	/***

	Searches for Garage-Yard Sale License records 
	- Created in the current year 
	- Matches address parameters provided
	- Matches the contact first and last name provided
	- Returns the count of records

	***/

	// Create a cap model for search
	var searchCapModel = aa.cap.getCapModel().getOutput();

	// Set cap model for search. Set search criteria for record type DCA/*/*/*
	var searchCapModelType = searchCapModel.getCapType();
	searchCapModelType.setGroup("Licenses");
	searchCapModelType.setType("Garage-Yard Sale");
	searchCapModelType.setSubType("License");
	searchCapModelType.setCategory("NA");
	searchCapModel.setCapType(searchCapModelType);

	searchAddressModel = searchCapModel.getAddressModel();
	searchAddressModel.setStreetName(strname);

	gisObject = new com.accela.aa.xml.model.gis.GISObjects;
	qf = new com.accela.aa.util.QueryFormat;

	var toDate = aa.date.getCurrentDate();
	var fromDate = aa.date.parseDate("01/01/" + toDate.getYear());

	var recordCnt = 0;
	message = "The applicant has reached the Garage-Sale License limit of 3 per calendar year.<br>"

	capList = aa.cap.getCapListByCollection(searchCapModel, searchAddressModel, "", fromDate, toDate, qf, gisObject).getOutput();
	for (x in capList) {
		resultCap = capList[x];
		resultCapId = resultCap.getCapID();
		altId = resultCapId.getCustomID();
		//aa.print("Record ID: " + altId);
		resultCapIdScript = aa.cap.createCapIDScriptModel(resultCapId.getID1(), resultCapId.getID2(), resultCapId.getID3());
		contact = aa.cap.getCapPrimaryContact(resultCapIdScript).getOutput();

		contactFname = contact.getFirstName();
		contactLname = contact.getLastName();

		if (contactFname == cfname && contactLname == clname) {
			recordCnt++;
			message = message + recordCnt + ": " + altId + " - " + contactFname + " " + contactLname + " @ " + strnum + " " + strname + "<br>";
		}
	}

	return recordCnt;

}

// S11B Find the related parent of the given record type and copy the given ASI from the parent to the given ASI in the current cap.
function copyASIfromParent(childCapID,parentRecordType,childASISubGrpfldNm,parentASISubGrpfldNm){
	try{
		
		pCapID = getRelatedParentCap(childCapID, parentRecordType);
		
		if(pCapID==null){
			logDebug("Method name: copyASIfromParent. Error: Parent capID is missing. childCapID:" + childCapID);
			return false;
		}
		
		//aa.print("pCapID:" + pCapID);
		// split it by '-'
		capArr=pCapID.toString().split("-");
		
		// get parent capID
		var getCapResult = aa.cap.getCapID(capArr[0],capArr[1],capArr[2]);
		if (getCapResult.getSuccess()) {
			var prntCapId = getCapResult.getOutput();
		}else{
			logDebug("Method name: copyASIfromParent. Message: Error: Can't get the parent cap." + pCapID);
			return false;
		}
		
		// get the given asi field's value from parent cap
		fldVal = getAppSpecific(parentASISubGrpfldNm,prntCapId);
		if(fldVal==null){
			logDebug("Method name: copyASIfromParent. Error: childASISubGrpfldNm is null. parentASISubGrpfldNm:" + parentASISubGrpfldNm);
			return false;
		}			
		//aa.print("fldVal:" + fldVal);
		
		//update given child field from parent
		editAppSpecific(childASISubGrpfldNm,fldVal,childCapID);
		
		return true;
	}catch(err){
		logDebug("Method name: copyASIfromParent. Message: Error-" + err.message + ". CapID:" + childCapID);
		return false;
	}
}

//editted from original 11-2020 to pass the related parent and copy the given ASI from that parent to the given ASI in the current cap.
function copyASIfromParent_TPS(childCapID,parentCapID,childASISubGrpfldNm,parentASISubGrpfldNm){
	try{
		// get the given asi field's value from parent cap
		fldVal = getAppSpecific(parentASISubGrpfldNm,parentCapID);
		if(fldVal==null){
			logDebug("Method name: copyASIfromParent_TPS. Error: parent ASI is null. parentASISubGrpfldNm:" + parentASISubGrpfldNm);
			return false;
		}			
		//update given child field from parent
		editAppSpecific(childASISubGrpfldNm,fldVal,childCapID);
		return true;
	}catch(err){
		logDebug("Method name: copyASIfromParent_TPS. Message: Error-" + err.message + ". CapID:" + childCapID);
		return false;
	}
}

// S11C Find the related parent of the given record type and copy the given ASIT rows from the parent to the given ASIT rows in the current cap.
function copyASITfromParent(childCapID,parentRecordType,childASITSubGrpfldNm,parentASITSubGrpfldNm){
	try{
		// get related parent
		pCapID = getRelatedParentCap(childCapID, parentRecordType);
		
		if(pCapID==null){
			logDebug("Method name: copyASITfromParent. Error: Parent capID is missing. childCapID:" + childCapID);
			return false;
		}
		
		//aa.print("pCapID:" + pCapID);
		// split it by '-'
		capArr=pCapID.toString().split("-");
		
		// get parent capID
		var getCapResult = aa.cap.getCapID(capArr[0],capArr[1],capArr[2]);
		if (getCapResult.getSuccess()) {
			var prntCapId = getCapResult.getOutput();
		}else{
			logDebug("Method name: copyASITfromParent. Message: Error: Can't get the parent cap." + pCapID);
			return false;
		}
		
		// get asit
		var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(prntCapId).getOutput();
		var ta = gm.getTablesArray()
		var tai = ta.iterator();

		// loop thru tables
		while (tai.hasNext())
		{
			var tsm = tai.next();

			var tempObject = new Array();
			var tempArray = new Array();
			var tn = tsm.getTableName();
			var tblName=tn;
			//logDebug("Table Name+" + tn);
			var numrows = 0;
			//tn = String(tn).replace(/[^a-zA-Z0-9]+/g,'');

			//if (!isNaN(tn.substring(0,1))) tn = "TBL" + tn  // prepend with TBL if it starts with a number

			if (!tsm.rowIndex.isEmpty())
			{
		  
				var tsmfldi = tsm.getTableField().iterator();
				var tsmcoli = tsm.getColumns().iterator();
				var readOnlyi = tsm.getAppSpecificTableModel().getReadonlyField().iterator(); // get Readonly filed
				var numrows = 1;

				while (tsmfldi.hasNext())  // cycle through fields
				{
					if (!tsmcoli.hasNext())  // cycle through columns
					{
						var tsmcoli = tsm.getColumns().iterator();
						tempArray.push(tempObject);  // end of record
						var tempObject = new Array();  // clear the temp obj
						numrows++;
					}
					var tcol = tsmcoli.next();
					var tval = tsmfldi.next();
					var readOnly = 'N';
					if (readOnlyi.hasNext()) {
						readOnly = readOnlyi.next();
					}
					var fieldInfo = new asiTableValObj(tcol.getColumnName(), tval, readOnly);
					tempObject[tcol.getColumnName()] = fieldInfo;
					//tempObject[tcol.getColumnName()] = tval;
				}
				tempArray.push(tempObject);  // end of record
			}

			//var copyStr = "" + tn + " = tempArray";
			//logDebug("ASI Table Array : " + tn + " (" + numrows + " Rows)");
			if (numrows>0){
				addASITable(tblName,tempArray,childCapID);
			}
			//eval(copyStr);  // move to table name
		}
		return true;
	}catch(err){
		logDebug("Method name: copyASITfromParent. Message: Error-" + err.message + ". CapID:" + childCapID);
		return false;
	}
}

function copyCapComments(capId, pCapId) {
    var sCapId = aa.cap.getCapIDModel(capId.getID1(), capId.getID2(), capId.getID3()).getOutput();
    var tCapId = aa.cap.getCapIDModel(pCapId.getID1(), pCapId.getID2(), pCapId.getID3()).getOutput();

    var sourceCapScriptModel = aa.cap.getCap(sCapId).getOutput();
    var targetCapScriptModel = aa.cap.getCap(tCapId).getOutput();

    if (sourceCapScriptModel != null && targetCapScriptModel != null) {
        aa.cap.copyComments(sourceCapScriptModel, targetCapScriptModel);
    }
}
function copyCapInfo(srcCapId,targetCapId) {
    var copySections = (arguments.length > 5 && arguments[5] ? arguments[5] : null);
    // For typically use null, by default valuation, documents & education are not copied.
    //copy data
    if (srcCapId == null) srcCapId = capId;
    if (copySections == null) copySections = ["Addresses", "ASI", "ASIT", "Cap Name", "Cap Short Notes", "Conditions", "Contacts", "GIS Objects", "LPs", "Owners", "Parcels"]; // Excludes Additional Info, Cap Detail, Conditions, Comments, Detailed Description, Documents, Education, ContEducation, Examination

    var srcCap = aa.cap.getCap(srcCapId).getOutput();
    var srcCapName = srcCap.getSpecialText();

    if (exists("Cap Detail", copySections)) { // Use with care!!
        aa.cap.copyCapDetailInfo(srcCapId, targetCapId);
    }
    if (exists("Cap Name", copySections) && srcCapName) {
        editAppName(srcCapName, targetCapId);
    }
    if (exists("Cap Short Notes", copySections)) { // Included in Cap Detail
        srcShortNotes = getShortNotes(srcCapId);
        updateShortNotes(srcShortNotes, targetCapId);
    }
    if (exists("Detailed Description", copySections)) {
        srcWorkDes = workDescGet(srcCapId);
        if (srcWorkDes != null && newWorkDes != "")
            updateWorkDesc(srcWorkDes, targetCapId);
    }
    if (exists("Addresses", copySections)) copyAddresses(srcCapId, targetCapId);
    if (exists("Parcels", copySections)) copyParcels(srcCapId, targetCapId);
    if (exists("Owners", copySections)) copyOwner(srcCapId, targetCapId);
    if (exists("GIS Objects", copySections)) { //Copy GIS Objects
        var holdId = capId;
        capId = targetCapId;
        copyParcelGisObjects();
        capId = holdId;
    }
    if (exists("ASI", copySections)) {
        // copyASIFields(srcCapId, targetCapId);       // Must be identical for this to work.
        if (srcCapId == capId && typeof (AInfo) != "undefined")  // Use AInfo info instead of database.
            copyAppSpecific(targetCapId);
        else {
            var srcASIResult = aa.appSpecificInfo.getByCapID(srcCapId)
            if (srcASIResult.getSuccess()) {
                var srcASI = srcASIResult.getOutput();
            } else {
                logDebug("**ERROR: getting source ASI: " + sourceASIResult.getErrorMessage());
                var srcASI = [];
            }
            for (var i in srcASI) {
                var itemName = (useAppSpecificGroupName ? srcASI[i].getCheckboxType() : "") + srcASI[i].getCheckboxDesc();
                var itemValue = srcASI[i].getChecklistComment();
                editAppSpecific(itemName, itemValue, newCap);
            }
        }
    }
    if (exists("ASIT", copySections)) copyASITables(srcCapId, targetCapId);
    // copyASITables(srcCapId, targetCapId);       // Must be identical for this to work.

    if (exists("Contacts", copySections)) copyContacts(srcCapId, targetCapId);
    if (exists("LPs", copySections)) copyLicensedProf(srcCapId, targetCapId);
    if (exists("Valuation Calc", copySections)) copyCalcVal(srcCapId, targetCapId);


    if (exists("Additional Info", copySections)) {
        if (typeof (copyAdditionalInfo) == "function") {
            copyAdditionalInfo(srcCapId, targetCapId);
        } else {
            logDebug("Missing function copyAdditionalInfo")
        }
    }

    if (exists("Conditions", copySections)) copyConditions(srcCapId, targetCapId);
    if (exists("Education", copySections)) {
        aa.education.copyEducationList(srcCapId, targetCapId);
        logDebug("copied Education");
    }
    if (exists("ContEducation", copySections)) {
        copyEducation(srcCapId, targetCapId);
        aa.continuingEducation.copyContEducationList(srcCapId, targetCapId);
        logDebug("copied Continuing Education");
    }
    if (exists("Examination", copySections)) {
        aa.examination.copyExaminationList(srcCapId, targetCapId);
        logDebug("copied Examination");
    }
    if (exists("Documents", copySections)) {
        if (typeof (copyDocuments) == "function") {
            copyDocuments(srcCapId, targetCapId);
        } else {
            logDebug("Missing function copyDocuments")
        }
    }
    if (exists("Comments", copySections)) {  // TO DO
        if (typeof (copyCapComments) == "function") {
            copyCapComments(srcCapId, targetCapId);
        } else {
            logDebug("Missing function copyCapComments")
        }
    }

    // Copy License Expiration Information
    if (exists("License", copySections)) {
        if (typeof (copyCapLicense) == "function") {
            copyCapLicense(srcCapId, targetCapId);
        } else {
            logDebug("Missing function copyCapLicense")
        }
    }
}

function copyCapLicense(srcCapId, targetCapId) {
    try { // Handle NullPointerException when no expiration record.
        var oldLic = new licenseObject(null, srcCapId);
        if (oldLic != null) {
            expStatus = oldLic.b1Status;
            expDate = oldLic.b1ExpDate;
            logDebug("oldLic: " + oldLic.b1Status + " " + oldLic.b1ExpDate);
            b1ExpResult = aa.expiration.getLicensesByCapID(targetCapId);
            if (b1ExpResult.getSuccess()) {
                var b1Exp = b1ExpResult.getOutput();
                    if (expStatus) b1Exp.setExpStatus(expStatus);
                    b1ExpDate = null;
                    if (expDate) {
                        var b1ExpDate = aa.date.parseDate(expDate);
                    }
                    b1Exp.setExpDate(b1ExpDate);
                    aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
                    var newLic = new licenseObject(null, targetCapId);
                    if (newLic != null)
                        logDebug("Expiration: " + newLic.b1Status + " " + newLic.b1ExpDate);
            }
        }
    } catch (err) {
        var b1Exp = null;
        logDebug("ERROR: copying Expiration: " + err.message);
    }
}

// S2 For each case number in the "related cases" of the Zoning Case Record Type, copy all active Conditions to t he current record.
// Find the related Planning/Landuse/Zoning Case/NA and copy all active (applied) conditions from zoning case to the given cap ID. 
// First check to make sure that the condition doesnt exist in the given capID (Matching condition type and the Name). DONT copy if already exists.
function copyConditionsfromZoningCase(capID){
	try{
		var copiedCnt=0;
		var recordType = "Planning/LandUse/ZoningCase/NA"; //Building/Permit/Sign/NA"; //"
		
		// get all the related caps
		var pCapID = allRelatedCapsofAType(capID, recordType);
		
		if(pCapID==null){
			aa.print("Method name: copyConditionsfromZoningCase. Error: Planning/LandUse/ZoningCase/NA is not found. capID:" + capID);
			return false;
		}
		
		//aa.print("2pCapID:" + pCapID); //aa.cap.getCapID(pCapID).getOutput());
		
		// get the conditions from zoning case cap	
		var condResult = aa.capCondition.getCapConditions(pCapID);
		if (condResult.getSuccess())
			var capConds = condResult.getOutput();
		else { 
			logDebug("**ERROR: getting cap conditions: " + condResult.getErrorMessage());
		}
		
		var cComment="Added via script";
		var cStatus;
		var cDesc;
		var cImpact;
		var condForEmail = "";
		for (cc in capConds) {
			var thisCond = capConds[cc];
			var cStatus = thisCond.getConditionStatus();
			var cDesc = thisCond.getConditionDescription();
			var cPubDisplayMessage = thisCond.getDispPublicDisplayMessage();
			var cImpact = thisCond.getImpactCode();
			var cType = thisCond.getConditionType();
			if (cStatus==null)
				cStatus = " ";
			if (cDesc==null)
				cDesc = " ";
			if (cImpact==null)
				cImpact = " ";
			
			if(cStatus.toUpperCase().equals("APPLIED")){
				//aa.print("BB:" + cStatus + "--" + cDesc + "--" + cImpact);
				
				// check to see if condition exist on the target cap
				if(!hasAppCondition(capID,cType,cStatus,cDesc,cImpact)){
					var addCapCondResult = aa.capCondition.addCapCondition(capID, cType, cDesc, cComment, sysDate, null, sysDate, null,null, 
																		   cImpact, systemUserObj, systemUserObj, cStatus, currentUserID, "A")
					if (addCapCondResult.getSuccess())
					{
						logDebug("Successfully added condition (" + cImpact + ") " + cDesc);
						//aa.print("Successfully added condition (" + cImpact + ") " + cDesc);
						copiedCnt++;
					}
					else
					{
						logDebug( "**ERROR: adding condition (" + cImpact + "): " + addCapCondResult.getErrorMessage());
					}
				}
				
			}

		}
			
		return copiedCnt;
	}catch(err){
		logDebug("Method name: copyConditionsfromZoningCase. Message: Error-" + err.message + ". CapID:" + capID);
		return -1;
	}
}

function copyContactAddressToLicProf(contactAddress, licProf) {
	if (contactAddress && licProf) {
		licProf.setAddress1(contactAddress.getAddressLine1());
		licProf.setAddress2(contactAddress.getAddressLine2());
		licProf.setAddress3(contactAddress.getAddressLine3());
		licProf.setCity(contactAddress.getCity());
		licProf.setState(contactAddress.getState());
		licProf.setZip(contactAddress.getZip());
		licProf.getLicenseModel().setCountryCode(contactAddress.getCountryCode());
	}
}

function copyContactsWithAddress(pFromCapId, pToCapId) {
	// Copies all contacts from pFromCapId to pToCapId and includes Contact Address objects
	//
	if (pToCapId == null)
		var vToCapId = capId;
	else
		var vToCapId = pToCapId;

	var capContactResult = aa.people.getCapContactByCapID(pFromCapId);
	var copied = 0;
	if (capContactResult.getSuccess()) {
		var Contacts = capContactResult.getOutput();
		for (yy in Contacts) {
			var newContact = Contacts[yy].getCapContactModel();

			var newPeople = newContact.getPeople();
			// aa.print("Seq " + newPeople.getContactSeqNumber());

			var addressList = aa.address.getContactAddressListByCapContact(newContact).getOutput();
			newContact.setCapID(vToCapId);
			aa.people.createCapContact(newContact);
			newerPeople = newContact.getPeople();
			// contact address copying
			if (addressList) {
				for (add in addressList) {
					var transactionAddress = false;
					contactAddressModel = addressList[add].getContactAddressModel();

					logDebug("contactAddressModel.getEntityType():" + contactAddressModel.getEntityType());

					if (contactAddressModel.getEntityType() == "CAP_CONTACT") {
						transactionAddress = true;
						contactAddressModel.setEntityID(parseInt(newerPeople.getContactSeqNumber()));
					}
					// Commit if transaction contact address
					if (transactionAddress) {
						var newPK = new com.accela.orm.model.address.ContactAddressPKModel();
						contactAddressModel.setContactAddressPK(newPK);
						aa.address.createCapContactAddress(vToCapId, contactAddressModel);
					}
					// Commit if reference contact address
					else {
						// build model
						var Xref = aa.address.createXRefContactAddressModel().getOutput();
						Xref.setContactAddressModel(contactAddressModel);
						Xref.setAddressID(addressList[add].getAddressID());
						Xref.setEntityID(parseInt(newerPeople.getContactSeqNumber()));
						Xref.setEntityType(contactAddressModel.getEntityType());
						Xref.setCapID(vToCapId);
						// commit address
						commitAddress = aa.address.createXRefContactAddress(Xref.getXRefContactAddressModel());
						if (commitAddress.getSuccess()) {
							commitAddress.getOutput();
							logDebug("Copied contact address");
						}
					}
				}
			}
			// end if
			copied++;
			logDebug("Copied contact from " + pFromCapId.getCustomID() + " to " + vToCapId.getCustomID());
		}
	} else {
		logMessage("**ERROR: Failed to get contacts: " + capContactResult.getErrorMessage());
		return false;
	}
	return copied;
}

function copyDetailedDescription(srcCapId, targetCapId) {
	newWorkDes = workDescGet(srcCapId);
	if (newWorkDes != null && newWorkDes != "")
		updateWorkDesc(newWorkDes, targetCapId);
}
function copyDocuments(pFromCapId, pToCapId) {
	//01-2021 db added code for this
    if (pToCapId == null)
        var vToCapId = capId;
    else
        var vToCapId = pToCapId;
	//Copies all attachments (documents) from srcCapId to targetCapId
	var docCategories = null;
	if (arguments.list > 2) docCategories = arguments[2];
	var docStatuses = null;
	if (arguments.list > 3) docStatuses = arguments[3];
	var preventDuplicate = true;
	if (arguments.list > 4 && arguments[4] != null) preventDuplicate = arguments[4];
	var newDocStatus = null;
	if (arguments.list > 5) newDocStatus = arguments[5];

//test coed from accela

	var vDocList = aa.document.getDocumentListByEntity(capId, "CAP").getOutput();
if (vDocList) {
    for (var vCounter = 0; vCounter < vDocList.size(); vCounter++) {
        var vDocModel = vDocList.get(vCounter);
        var vDocGroup = vDocModel.docGroup;
        var vDocCat = vDocModel.docCategory;
        for (l in vDocModel)
            if (typeof(vDocModel[l]) != "function") { {
                    aa.print("loop attributes: " + l + " : " + vDocModel[l]);
                }
            }
        for (m in vDocModel)
            if (typeof(vDocModel[m]) == "function") { {
                    aa.print("lmettods: " + m);
                }
            }

        vDocModel.setCapID(vToCapId);
        vDocModel.setEntityID(vToCapId.toString());

        //holdFile=downloadFile2Disk(vDocModel,"","","", true)
        //aa.print("new file: " +holdFile);

        //vDocModel.setFileKey(holdFile);
        //aa.document.updateDocument(vDocModel);
        aa.document.createDocument(vDocModel);
    }
}
	
// to here

	var capDocResult = aa.document.getDocumentListByEntity(pFromCapId, "CAP");
	if (capDocResult.getSuccess()) {
		if (capDocResult.getOutput().size() > 0) {
			for (docInx = 0; docInx < capDocResult.getOutput().size(); docInx++) {
				var documentObject = capDocResult.getOutput().get(docInx);
				if (docCategories && !exists(documentObject.getDocCategory(),docCategories)) continue;
				if (docStatuses && !exists(documentObject.getDocStatus(),docStatuses)) continue;

                // Check for Duplicate Document
                documentFound = false;
                if (!preventDuplicate) {
                    var capDocuments2 = aa.document.getDocumentListByEntity(vToCapId, "CAP");
                    if (capDocuments2.getSuccess()) {
                        var capDocumentList2 = capDocuments2.getOutput();
                        if (capDocumentList2.size() > 0) {
                            for (index = 0; index < capDocumentList2.size(); index++) {
                                capDocumentModel2 = capDocumentList2.get(index);
                                if (capDocumentModel.getDocName() == capDocumentModel2.getDocName() && capDocumentModel.getFileKey() == capDocumentModel2.getFileKey()) {
                                    logDebug("Skipping document1: " + capDocumentModel.getDocumentNo() + " " + capDocumentModel.getDocName() + " " + capDocumentModel.getFileKey() + " from " + pFromCapId.getCustomID() + " to " + vToCapId.getCustomID());
                                    documentFound = true;
                                }
                            }
                        }
                    }
                }
                if (documentFound) continue;
				
				// download the document content
				var useDefaultUserPassword = false;
				//If useDefaultUserPassword = true, there is no need to set user name & password, but if useDefaultUserPassword = false, we need define EDMS user name & password.
				var EMDSUsername = "laserfiche";
				var EMDSPassword = "pass123";
				for(l in documentObject) if(typeof(documentObject[l])!="function"){{aa.print("loop attributes: " + l + " : " +documentObject[l]);}}
				for(l in documentObject) if(typeof(documentObject[l])=="function"){{aa.print("loop methods: " + l);}}


				//var downloadResult = aa.document.downloadFile2Disk(documentObject, documentObject.getModuleName(), EMDSUsername, EMDSPassword, useDefaultUserPassword);
				//var downloadResult = aa.document.downloadFile2Disk(documentObject, "", EMDSUsername, EMDSPassword, useDefaultUserPassword);
				var downloadResult = aa.document.downloadFile2Disk(documentObject,"","","", true);
				if (downloadResult.getSuccess()) {
					var path = downloadResult.getOutput();
					logDebug("path=" + path);
				}

				var tmpEntId = vToCapId.getID1() + "-" + vToCapId.getID2() + "-" + vToCapId.getID3();
				documentObject.setDocumentNo(null);
				documentObject.setCapID(vToCapId);
				documentObject.setEntityID(tmpEntId);

				// Open and process file
				try {
					// put together the document content - use java.io.FileInputStream
					var newContentModel = aa.document.newDocumentContentModel().getOutput();
					inputstream = new java.io.FileInputStream(path);
					newContentModel.setDocInputStream(inputstream);
					documentObject.setDocumentContent(newContentModel);

					var newDocResult = aa.document.createDocument(documentObject);
					if (newDocResult.getSuccess()) {
					    var newDocObject = newDocResult.getOutput();
						if (newDocStatus) {
							newDocObject.setDocStatus(newDocStatus);
							aa.document.updateDocument(newDocObject);
						}
						newDocResult.getOutput();
						logDebug("Successfully copied document: " + documentObject.getFileName());
					} else {
						logDebug("Failed to copy document: " + documentObject.getFileName());
						logDebug(newDocResult.getErrorMessage());
					}
				} catch (err) {
					logDebug("Error copying document: " + err.message);
					return false;
				}

			}
		}
	}
}

function copyLicenseProfessional(srcCapId, targetCapId)
{
    //1. Get license professionals with source CAPID.
    var capLicenses = getLicenseProfessional(srcCapId);
    if (capLicenses == null || capLicenses.length == 0)
    {
      return;
    }
    //2. Get license professionals with target CAPID.
    var targetLicenses = getLicenseProfessional(targetCapId);
    //3. Check to see which licProf is matched in both source and target.
    for (loopk in capLicenses)
    {
      sourcelicProfModel = capLicenses[loopk];
      //3.1 Set target CAPID to source lic prof.
      sourcelicProfModel.setCapID(targetCapId);
      targetLicProfModel = null;
      //3.2 Check to see if sourceLicProf exist.
      if (targetLicenses != null && targetLicenses.length > 0)
      {
        for (loop2 in targetLicenses)
        {
          if (isMatchLicenseProfessional(sourcelicProfModel, targetLicenses[loop2]))
          {
            targetLicProfModel = targetLicenses[loop2];
            break;
          }
        }
      }
      //3.3 It is a matched licProf model.
      if (targetLicProfModel != null)
      {
        //3.3.1 Copy information from source to target.
        aa.licenseProfessional.copyLicenseProfessionalScriptModel(sourcelicProfModel, targetLicProfModel);
        //3.3.2 Edit licProf with source licProf information. 
        aa.licenseProfessional.editLicensedProfessional(targetLicProfModel);
      }
      //3.4 It is new licProf model.
      else
      {
        //3.4.1 Create new license professional.
        aa.licenseProfessional.createLicensedProfessional(sourcelicProfModel);
      }
    }
}

function createCap_TPS() {
    /*  Creates the new application and returns the capID object
    | Modified from INCLUDES_ACCELA_FUNCTIONS
    | newAppTypeString - new Application Type string. Default is Current Group/Type/SubType/"License"
    | newCapName - new Cap Name. Default is "". For new license typically use capName.
    | newCapIdString - new Cap ID. Default is null (Next Sequence #). For new License typically use capIDString.substr(0, (capIDString.length - 1)) + 'L';
    | newCapRelation - new Cap is Child, Parent or not related to source Cap. Default is none. For new license typically use "Parent".
    | srcCapId - source Cap Id. Default is capId. For new license typically use null (default).
    | copySections - Array of sections of data to copy from source Cap. Default is null. For new license typically use null (default). Use empty array [] if you do not want to copy data. By default not all sections are copied only most commonly used ones.
    | initStatus - initial new record status. Default is null (Configuration Default). For new license typically use "Active"
    | scheduledDate - record scheduled date. Default is null (not set). For new License use sysDateMMDDYYYY (today)
    | firstIssuedDate - First issue date. Default is null (not set). For new License use sysDateMMDDYYYY (today)
    
    ***** Uses copyCapInfo, editAppName, editScheduledDate, editFirstIssuedDate.
    */
    var newCap = null;
    var newCapId = null;
    try {
        var newAppTypeString = (arguments.length > 0 && arguments[0] ? arguments[0] : srcAppTypeArray[0] + "/" + srcAppTypeArray[1] + "/" + srcAppTypeArray[2] + "/" + "License");
        var newCapName = (arguments.length > 1 && arguments[1] ? arguments[1] : "");
        // Typically use capName
        var newCapIdString = (arguments.length > 2 && arguments[2] ? arguments[2] : null);
        // For new License typically use capIDString.substr(0, (capIDString.length - 1)) + 'L';
        var newCapRelation = (arguments.length > 3 && arguments[3] && exists(arguments[3], ["Child", "Parent"]) ? arguments[3] : null);
        var srcCapId = (arguments.length > 4 && arguments[4] ? arguments[4] : capId);
        var copySections = (arguments.length > 5 && arguments[5] ? arguments[5] : null);
        // For new License typically use null, by default education is not copied.
        var initStatus = (arguments.length > 6 && arguments[6] ? arguments[6] : null);
        // For new License typically use "Active"
        var scheduledDate = (arguments.length > 7 && arguments[7] ? arguments[7] : null);
        // For new License use sysDateMMDDYYYY
        var firstIssuedDate = (arguments.length > 8 && arguments[8] ? arguments[8] : null);
        // For new License use sysDateMMDDYYYY
        if (copySections == null) copySections = ["Addresses", "ASI", "ASIT", "Cap Name", "Cap Short Notes", "Conditions", "Contacts", "GIS Objects", "LPs", "Owners", "Parcels"]; // Excludes Additional Info, Cap Detail, Conditions, Comments, Detailed Description, Documents, Education, ContEducation, Examination

        var srcCapModel = null,
            srcCapName = null,
            srcAppTypeAlias = null,
            srcAppTypeString = null,
            srcAppTypeArray = null;
        var s_result = aa.cap.getCap(srcCapId);
        if (s_result.getSuccess()) {
            var srcCap = s_result.getOutput();
            var srcCapModel = s_result.getOutput().getCapModel()
            var srcCapName = srcCap.getSpecialText();
            var srcAppTypeResult = srcCap.getCapType();
            var srcAppTypeAlias = srcAppTypeResult.getAlias();
            var srcAppTypeString = srcAppTypeResult.toString();
            var srcAppTypeArray = srcAppTypeString.split("/");
        } else {
            logDebug("**WARNING: error getting cap : " + capResult.getErrorMessage());
        }


        // create new record
        var newAppTypeArray = newAppTypeString.split("/");
        if (newAppTypeArray.length != 4) {
            logDebug("**ERROR creating CAP.  Application Type String is incorrectly formatted: " + newAppTypeArray);
            return false;
        }
        var appCreateResult = aa.cap.createApp(newAppTypeArray[0], newAppTypeArray[1], newAppTypeArray[2], newAppTypeArray[3], newCapName);
        if (!appCreateResult.getSuccess()) {
            logDebug("**ERROR: creating " + newAppTypeString + " CAP: " + appCreateResult.getErrorMessage());
            return false;
        }

        var newCapId = appCreateResult.getOutput();
        logDebug("Successfully created " + newAppTypeString + " CAP " + newCapId.getCustomID() + " (" + newCapId + ")");
        var newCapObj = aa.cap.getCap(newCapId).getOutput();	//Cap object

        // create Detail Record
        newCapModel = aa.cap.newCapScriptModel().getOutput();
        newCapDetailModel = newCapModel.getCapModel().getCapDetailModel();
        newCapDetailModel.setCapID(newCapId);
        aa.cap.createCapDetail(newCapDetailModel);

        if (newCapIdString) {   // Update Record ID
            var s_capResult = aa.cap.updateCapAltID(newCapId, newCapIdString);
            if (!s_capResult.getSuccess() || !s_capResult.getOutput())
                logDebug("ERROR: updating Cap ID " + newCapId.getCustomID() + " to " + newCapIdString + ": " + s_capResult.getErrorMessage());
            // get newCapId object with updated capId.
            var s_capResult = aa.cap.getCapID(newCapId.getID1(), newCapId.getID2(), newCapId.getID3());
            if (!s_capResult.getSuccess() || !s_capResult.getOutput())
                logDebug("ERROR: getting Cap ID " + newCapIdString + " " + newCapId + ": " + s_capResult.getErrorMessage());
            else
                newCapId = s_capResult.getOutput();
            newCapIdString = newCapId.getCustomID();
        } else {
            newCapIdString = newCapId.getCustomID();
        }

        var statusComment = "";
        if (srcCapId) {
            if (newCapRelation) {   // Cap Relationship?
                if (newCapRelation == "Child") {
                    var result = aa.cap.createAppHierarchy(srcCapId, newCapId);
                } else {
                    var result = aa.cap.createAppHierarchy(newCapId, srcCapId);
                }
                if (result.getSuccess())
                    logDebug(newCapRelation + " CAP " + newAppTypeString + " successfully linked");
                else
                    logDebug("Could not link " + newCapRelation.toLowerCase() + " CAP " + newAppTypeString);
            }
            copyCapInfo(srcCapId, newCapId);  //copy data
            var statusComment = "Created from " + srcAppTypeArray[3] + ": " + srcCapId;
            var statusComment = "Created from " + srcAppTypeAlias + ": " + srcCapId;
        }
        if (newCapName && newCapName != "") {
            logDebug("newCapName: " + newCapName);
            editAppName(newCapName, newCapId);
        }

        if (initStatus)
            updateAppStatus(initStatus, statusComment, newCapId);

        //field repurposed to represent the current term effective date
        if (typeof (editScheduledDate) == "function" && scheduledDate) {
            editScheduledDate(scheduledDate, newCapId);
        }

        //field repurposed to represent the original effective date
        if (typeof (editFirstIssuedDate) == "function" && firstIssuedDate) {
            editFirstIssuedDate(firstIssuedDate, newCapId);
        }

        return newCapId;
    } catch (err) {
        logDebug("A JavaScript Error occurred: " + err.message + " Line " + err.lineNumber);
        return false;
    }
}

function createChildLic(grp, typ, stype, cat, desc)
// creates the new application and returns the capID object - updated 11/2020 for LP's
{
    try {
        var appCreateResult = aa.cap.createApp(grp, typ, stype, cat, desc);
        logDebug("creating cap " + grp + "/" + typ + "/" + stype + "/" + cat);
        if (appCreateResult.getSuccess()) {
            var newId = appCreateResult.getOutput();
            logDebug("cap " + grp + "/" + typ + "/" + stype + "/" + cat + " created successfully ");

            // create Detail Record
            capModel = aa.cap.newCapScriptModel().getOutput();
            capDetailModel = capModel.getCapModel().getCapDetailModel();
            capDetailModel.setCapID(newId);
            aa.cap.createCapDetail(capDetailModel);

            var newObj = aa.cap.getCap(newId).getOutput(); //Cap object
            var result = aa.cap.createAppHierarchy(capId, newId);
            if (result.getSuccess())
                logDebug("Child application successfully linked");
            else
                logDebug("Could not link applications");

            // Copy Parcels
            var capParcelResult = aa.parcel.getParcelandAttribute(capId, null);
            if (capParcelResult.getSuccess()) {
                var Parcels = capParcelResult.getOutput().toArray();
                for (zz in Parcels) {
                    logDebug("adding parcel #" + zz + " = " + Parcels[zz].getParcelNumber());
                    var newCapParcel = aa.parcel.getCapParcelModel().getOutput();
                    newCapParcel.setParcelModel(Parcels[zz]);
                    newCapParcel.setCapIDModel(newId);
                    newCapParcel.setL1ParcelNo(Parcels[zz].getParcelNumber());
                    newCapParcel.setParcelNo(Parcels[zz].getParcelNumber());
                    aa.parcel.createCapParcel(newCapParcel);
                }
            }

            // Copy Contacts
            capContactResult = aa.people.getCapContactByCapID(capId);
            if (capContactResult.getSuccess()) {
                Contacts = capContactResult.getOutput();
                for (yy in Contacts) {
                    var newContact = Contacts[yy].getCapContactModel();
                    newContact.setCapID(newId);
                    //aa.people.createCapContact(newContact);
                    //this line will also copy attributes
                    aa.people.createCapContactWithAttribute(newContact);
                    logDebug("added contact and attributes");
                }
            }

            // Copy Addresses
            capAddressResult = aa.address.getAddressByCapId(capId);
            if (capAddressResult.getSuccess()) {
                Address = capAddressResult.getOutput();
                for (yy in Address) {
                    newAddress = Address[yy];
                    newAddress.setCapID(newId);
                    aa.address.createAddress(newAddress);
                    logDebug("added address");
                }
            }

            // Copy Owners  THIS IS ADDED for Sacramento County
            capOwnerResult = aa.owner.getOwnerByCapId(capId);
            if (capOwnerResult.getSuccess()) {
                Owner = capOwnerResult.getOutput();
                for (yy in Owner) {
                    newOwner = Owner[yy];
                    newOwner.setCapID(newId);
                    aa.owner.createCapOwnerWithAPOAttribute(newOwner);
                    logDebug("added owner");
                }
            }
            // Copy Work Description - This is custom for Sac County
            copyDetailedDescription(capId, newId);
			
			// Copy License Prof - Added for Chesterfield 11/2020
            copyLicenseProfessional(capId, newId);

            //Copy GIS Objects This is ADDED fro SACRAMENTO COUNTY
            var holdId = capId;
            capId = newId;
            copyParcelGisObjects();
            capId = holdId;
            return newId;
        } else {
            logDebug("**ERROR: adding child App: " + appCreateResult.getErrorMessage());
        }
    } catch (err) {
        logDebug("A JavaScript Error occurred: " + err.message + " Line " + err.lineNumber);
    }
}

function createLP(rlpId, rlpType) {
	var itemCap = (arguments.length > 2 && arguments[2]? arguments[2]:capId);
	var lpBoard = (arguments.length > 3 && arguments[3]? arguments[3]:null);
	var lpExpirDate = (arguments.length > 4 && arguments[4]? arguments[4]:null);
	var lpFirstName = (arguments.length > 5 && arguments[5]? arguments[5]:null);
	var lpMiddleName = (arguments.length > 6 && arguments[6]? arguments[6]:null);
	var lpLastName = (arguments.length > 7 && arguments[7]? arguments[7]:null);
	var lpBusName = (arguments.length > 8 && arguments[8]? arguments[8]:null);
	var lpAddrLine1 = (arguments.length > 9 && arguments[9]? arguments[9]:null);
	var lpAddrLine2 = (arguments.length > 10 && arguments[10]? arguments[10]:null);
	var lpAddrLine3 = (arguments.length > 11 && arguments[11]? arguments[11]:null);
	var lpAddrCity = (arguments.length > 12 && arguments[12]? arguments[12]:null);
	var lpAddrState = (arguments.length > 13 && arguments[13]? arguments[12]:null);
	var lpAddrZip = (arguments.length > 14 && arguments[14]? arguments[14]:null);
	var lpPhone1 = (arguments.length > 15 && arguments[15]? arguments[15]:null);
	var lpPhone2 = (arguments.length > 16 && arguments[16]? arguments[16]:null);
	var lpEmail = (arguments.length > 17 && arguments[17]? arguments[17]:null);
	var lpFax = (arguments.length > 18 && arguments[18]? arguments[18]:null);
	
	// Get Ref LP Object
	var rlpObj = new licenseProfObject(rlpId,rlpType);
	// 
	if (rlpObj && !rlpObj.capLicProfScriptModel) {
		var useRefLP = rlpObj.copyToRecord(capId,false); // copy from reference LP
		if (itemCap){
			var capLicenseArr = null;
			var capLicenseResult = aa.licenseScript.getLicenseProf(itemCap);
			if (capLicenseResult.getSuccess())
				{ capLicenseArr = capLicenseResult.getOutput();  }
			else
				{ logDebug("**ERROR: getting lic prof: " + capLicenseResult.getErrorMessage()); return false; }


			if (!capLicenseArr || capLicenseArr.length == 0) {
				logDebug("WARNING: no license professional available on the application:");
			}

			var capLPModel = null;
			if (capLicenseArr && capLicenseArr.length > 0) {
				for (var capLic in capLicenseArr) {
					var lpsm = capLicenseArr[capLic];
					if (lpsm && lpsm.getLicenseNbr() + "" == rlpId && lpsm.getLicenseType() + "" == rlpType) {
						capLPModel = lpsm;
						rlpObj.capLicProfScriptModel = lpsm;
					}
				}
			}
		}
	}
	// if CAP LP exists?, Skip. otherwise create CAP from parameters.
	if (rlpObj && rlpObj.capLicProfScriptModel) {
		vPrimary = "Y";
		vPrimary = (vPrimary || vPrimary == "Y"? "Y" : "N");
		if (rlpObj.setPrimary) {
			rlpObj.setPrimary(itemCap,"Y");		// make primary
		} else {
			//Get the LP from the Record
			var capLicenseResult = aa.licenseProfessional.getLicenseProf(itemCap);
			var capLicenseArr = new Array();
			var existing = false;
			if (capLicenseResult.getSuccess()) {
				capLicenseArr = capLicenseResult.getOutput();
			}

			// Make primary LP for CAP
			if (capLicenseArr != null) {
				for (capLic in capLicenseArr) {
					var lpsm = capLicenseArr[capLic];
					if (lpsm.getLicenseNbr() + "" == rlpId && lpsm.getLicenseType() + "" == rlpType && lpsm.getPrintFlag() != vPrimary) {
							lpsm.setPrintFlag(vPrimary);
							aa.licenseProfessional.editLicensedProfessional(lpsm);
					}
				}
			}
		}
		logDebug("Using exising LP Type: " + rlpType + ",  Nbr: " + rlpId);
		return true;
	} else {
		var newLic = aa.licenseProfessional.getLicenseProfessionScriptModel().getOutput();
		newLic.setAgencyCode(aa.getServiceProviderCode());
		newLic.setAuditDate(sysDate);
		newLic.setAuditID(currentUserID);
		newLic.setAuditStatus("A");

		newLic.setLicenseType(rlpType);
		newLic.setLicenseNbr(rlpId);
		newLic.setCapID(itemCap); 
		if (lpBoard) 		newLic.setLicenseBoard(lpBoard); //default the state if none was provided
		if (lpExpirDate)	newLic.setLicenseExpirDate(lpExpirDate);
		newLic.setPrintFlag("Y"); 			// Set Primary
		newLic.setSerDes("Description");	// Required

		if (lpFirstName)	newLic.setContactFirstName(lpFirstName);
		if (lpMiddleName && newLic.setContactMiddleName)	newLic.setContactMiddleName(lpMiddleName); 	//method may not available
		if (lpLastName)		newLic.setContactLastName(lpLastName);
		if (lpBusName)		newLic.setBusinessName(lpBusName);
		if (lpAddrLine1)	newLic.setAddress1(lpAddrLine1);
		if (lpAddrLine2)	newLic.setAddress2(lpAddrLine2);
		if (lpAddrLine3)	newLic.setAddress3(lpAddrLine3);
		if (lpAddrCity)		newLic.setCity(lpAddrCity);
		if (lpAddrState)	newLic.setState(lpAddrState);
		if (lpAddrZip)		newLic.setZip(lpAddrZip);
		if (lpPhone1)		newLic.setPhone1(lpPhone1);
		if (lpPhone2)		newLic.setPhone2(lpPhone2);
		if (lpEmail)		newLic.setEMailAddress(lpEmail);
		if (lpFax)			newLic.setFax(lpFax);

		var s_Result = aa.licenseProfessional.createLicensedProfessional(newLic);
		// var s_Result = aa.licenseScript.createRefLicenseProf(newLic);
		if (s_Result.getSuccess()) {
			logDebug("Successfully added License Type: " + rlpType + ",  Nbr: " + rlpId);
			return true;
		} else {
			logDebug("**ERROR: can't added License Type: " + rlpType + ",  Nbr: " + rlpId + " Reason: " + s_Result.getErrorMessage());
			return false;
		}
	}
	return false;
}

function createRefContactsFromCapContactsAndLink(pCapId, contactTypeArray, ignoreAttributeArray, replaceCapContact, overwriteRefContact, refContactExists) {

	// contactTypeArray is either null (all), or an array or contact types to process
	//
	// ignoreAttributeArray is either null (none), or an array of attributes to ignore when creating a REF contact
	//
	// replaceCapContact not implemented yet
	//
	// overwriteRefContact -- if true, will refresh linked ref contact with CAP contact data
	//
	// refContactExists is a function for REF contact comparisons.
	//
	// Version 2.0 Update:   This function will now check for the presence of a standard choice "REF_CONTACT_CREATION_RULES". 
	// This setting will determine if the reference contact will be created, as well as the contact type that the reference contact will 
	// be created with.  If this setting is configured, the contactTypeArray parameter will be ignored.   The "Default" in this standard
	// choice determines the default action of all contact types.   Other types can be configured separately.   
	// Each contact type can be set to "I" (create ref as individual), "O" (create ref as organization), 
	// "F" (follow the indiv/org flag on the cap contact), "D" (Do not create a ref contact), and "U" (create ref using transaction contact type).

	var standardChoiceForBusinessRules = "REF_CONTACT_CREATION_RULES";


	var ingoreArray = new Array();
	if (arguments.length > 1) ignoreArray = arguments[1];

	var defaultContactFlag = lookup(standardChoiceForBusinessRules, "Default");

	var c = aa.people.getCapContactByCapID(pCapId).getOutput()
	var cCopy = aa.people.getCapContactByCapID(pCapId).getOutput() // must have two working datasets

	for (var i in c) {
		var ruleForRefContactType = "U"; // default behavior is create the ref contact using transaction contact type
		var con = c[i];

		var p = con.getPeople();

		var contactFlagForType = lookup(standardChoiceForBusinessRules, p.getContactType());

		if (!defaultContactFlag && !contactFlagForType) // standard choice not used for rules, check the array passed
		{
			if (contactTypeArray && !exists(p.getContactType(), contactTypeArray))
				continue; // not in the contact type list.  Move along.
		}

		if (!contactFlagForType && defaultContactFlag) // explicit contact type not used, use the default
		{
			ruleForRefContactType = defaultContactFlag;
		}

		if (contactFlagForType) // explicit contact type is indicated
		{
			ruleForRefContactType = contactFlagForType;
		}

		if (ruleForRefContactType.equals("D"))
			continue;

		var refContactType = "";

		switch (ruleForRefContactType) {
			case "U":
				refContactType = p.getContactType();
				break;
			case "I":
				refContactType = "Individual";
				break;
			case "O":
				refContactType = "Organization";
				break;
			case "F":
				if (p.getContactTypeFlag() && p.getContactTypeFlag().equals("organization"))
					refContactType = "Organization";
				else
					refContactType = "Individual";
				break;
		}

		var refContactNum = con.getCapContactModel().getRefContactNumber();

		if (refContactNum) // This is a reference contact.   Let's refresh or overwrite as requested in parms.
		{
			if (overwriteRefContact) {
				p.setContactSeqNumber(refContactNum); // set the ref seq# to refresh
				p.setContactType(refContactType);

				var a = p.getAttributes();

				if (a) {
					var ai = a.iterator();
					while (ai.hasNext()) {
						var xx = ai.next();
						xx.setContactNo(refContactNum);
					}
				}

				var r = aa.people.editPeopleWithAttribute(p, p.getAttributes());

				if (!r.getSuccess())
					logDebug("WARNING: couldn't refresh reference people : " + r.getErrorMessage());
				else
					logDebug("Successfully refreshed ref contact #" + refContactNum + " with CAP contact data");
			}

			if (replaceCapContact) {
				// To Be Implemented later.   Is there a use case?
			}

		} else // user entered the contact freehand.   Let's create or link to ref contact.
		{
			var ccmSeq = p.getContactSeqNumber();

			var existingContact = refContactExists(p); // Call the custom function to see if the REF contact exists

			var p = cCopy[i].getPeople(); // get a fresh version, had to mangle the first for the search

			if (existingContact) // we found a match with our custom function.  Use this one.
			{
				refPeopleId = existingContact;
			} else // did not find a match, let's create one
			{

				var a = p.getAttributes();

				if (a) {
					//
					// Clear unwanted attributes
					var ai = a.iterator();
					while (ai.hasNext()) {
						var xx = ai.next();
						if (ignoreAttributeArray && exists(xx.getAttributeName().toUpperCase(), ignoreAttributeArray))
							ai.remove();
					}
				}

				p.setContactType(refContactType);
				var r = aa.people.createPeopleWithAttribute(p, a);

				if (!r.getSuccess()) {
					logDebug("WARNING: couldn't create reference people : " + r.getErrorMessage());
					continue;
				}

				//
				// createPeople is nice and updates the sequence number to the ref seq
				//

				var p = cCopy[i].getPeople();
				var refPeopleId = p.getContactSeqNumber();

				logDebug("Successfully created reference contact #" + refPeopleId);

				// Need to link to an existing public user.

				var getUserResult = aa.publicUser.getPublicUserByEmail(con.getEmail())
				if (getUserResult.getSuccess() && getUserResult.getOutput()) {
					var userModel = getUserResult.getOutput();
					logDebug("createRefContactsFromCapContactsAndLink: Found an existing public user: " + userModel.getUserID());

					if (refPeopleId) {
						logDebug("createRefContactsFromCapContactsAndLink: Linking this public user with new reference contact : " + refPeopleId);
						aa.licenseScript.associateContactWithPublicUser(userModel.getUserSeqNum(), refPeopleId);
					}
				}
			}

			//
			// now that we have the reference Id, we can link back to reference
			//

			var ccm = aa.people.getCapContactByPK(pCapId, ccmSeq).getOutput().getCapContactModel();

			ccm.setRefContactNumber(refPeopleId);
			r = aa.people.editCapContact(ccm);

			if (!r.getSuccess()) {
				logDebug("WARNING: error updating cap contact model : " + r.getErrorMessage());
			} else {
				logDebug("Successfully linked ref contact " + refPeopleId + " to cap contact " + ccmSeq);
			}


		} // end if user hand entered contact 
	} // end for each CAP contact
} // end function

function createRefLicProf(rlpId, rlpType, pContactType) {
	//Creates/updates a reference licensed prof from a Contact
	//06SSP-00074, modified for 06SSP-00238
	var updating = false;
	var capContResult = aa.people.getCapContactByCapID(capId);
	if (capContResult.getSuccess()) {
		conArr = capContResult.getOutput();
	} else {
		logDebug("**ERROR: getting cap contact: " + capAddResult.getErrorMessage());
		return false;
	}

	if (!conArr.length) {
		logDebug("**WARNING: No contact available");
		return false;
	}


	var newLic = getRefLicenseProf(rlpId)

	if (newLic) {
		updating = true;
		logDebug("Updating existing Ref Lic Prof : " + rlpId);
	} else
		var newLic = aa.licenseScript.createLicenseScriptModel();

	//get contact record
	if (pContactType == null)
		var cont = conArr[0]; //if no contact type specified, use first contact
	else {
		var contFound = false;
		for (yy in conArr) {
			if (pContactType.equals(conArr[yy].getCapContactModel().getPeople().getContactType())) {
				cont = conArr[yy];
				contFound = true;
				break;
			}
		}
		if (!contFound) {
			logDebug("**WARNING: No Contact found of type: " + pContactType);
			return false;
		}
	}

	peop = cont.getPeople();
	addr = peop.getCompactAddress();

	newLic.setContactFirstName(cont.getFirstName());
	//newLic.setContactMiddleName(cont.getMiddleName());  //method not available
	newLic.setContactLastName(cont.getLastName());
	newLic.setBusinessName(peop.getBusinessName());
	newLic.setAddress1(addr.getAddressLine1());
	newLic.setAddress2(addr.getAddressLine2());
	newLic.setAddress3(addr.getAddressLine3());
	newLic.setCity(addr.getCity());
	newLic.setState(addr.getState());
	newLic.setZip(addr.getZip());
	newLic.setPhone1(peop.getPhone1());
	newLic.setPhone2(peop.getPhone2());
	newLic.setEMailAddress(peop.getEmail());
	newLic.setFax(peop.getFax());

	newLic.setAgencyCode(aa.getServiceProviderCode());
	newLic.setAuditDate(sysDate);
	newLic.setAuditID(currentUserID);
	newLic.setAuditStatus("A");

	if (AInfo["Insurance Co"]) newLic.setInsuranceCo(AInfo["Insurance Co"]);
	if (AInfo["Insurance Amount"]) newLic.setInsuranceAmount(parseFloat(AInfo["Insurance Amount"]));
	if (AInfo["Insurance Exp Date"]) newLic.setInsuranceExpDate(aa.date.parseDate(AInfo["Insurance Exp Date"]));
	if (AInfo["Policy #"]) newLic.setPolicy(AInfo["Policy #"]);

	if (AInfo["Business License #"]) newLic.setBusinessLicense(AInfo["Business License #"]);
	if (AInfo["Business License Exp Date"]) newLic.setBusinessLicExpDate(aa.date.parseDate(AInfo["Business License Exp Date"]));

	newLic.setLicenseType(rlpType);

	if (addr.getState() != null)
		newLic.setLicState(addr.getState());
	else
		newLic.setLicState("AK"); //default the state if none was provided

	newLic.setStateLicense(rlpId);

	if (updating)
		myResult = aa.licenseScript.editRefLicenseProf(newLic);
	else
		myResult = aa.licenseScript.createRefLicenseProf(newLic);

	if (myResult.getSuccess()) {
		logDebug("Successfully added/updated License No. " + rlpId + ", Type: " + rlpType);
		logMessage("Successfully added/updated License No. " + rlpId + ", Type: " + rlpType);
		return true;
	} else {
		logDebug("**ERROR: can't create ref lic prof: " + myResult.getErrorMessage());
		logMessage("**ERROR: can't create ref lic prof: " + myResult.getErrorMessage());
		return false;
	}
}

function createRefLicProfFromLicProfTRU()
{
   //
   // Get the lic prof from the app
   //
   capLicenseResult = aa.licenseScript.getLicenseProf(capId);
   if (capLicenseResult.getSuccess())
				  { capLicenseArr = capLicenseResult.getOutput();  }
   else
				  { logDebug("**ERROR: getting lic prof: " + capLicenseResult.getErrorMessage()); return false; }

   if (!capLicenseArr.length)
				  { logDebug("WARNING: no license professional available on the application:"); return false; }

   licProfScriptModel = capLicenseArr[0];
   rlpId = licProfScriptModel.getLicenseNbr();
   birthdate = jsDateToMMDDYYYY(convertDate(licProfScriptModel.getBirthDate()));
   //
   // Now see if a reference version exists
   //
   var updating = false;

   var newLic = getRefLicenseProf(rlpId)

   if (newLic)
	  {
	  updating = true;
	  logDebug("Updating existing Ref Lic Prof : " + rlpId);
	  }
   else
	var newLic = aa.licenseScript.createLicenseScriptModel();

   //
   // Now add / update the ref lic prof
   //
   newLic.setStateLicense(rlpId);
   newLic.setAddress1(licProfScriptModel.getAddress1());
   newLic.setAddress2(licProfScriptModel.getAddress2());
   newLic.setAddress3(licProfScriptModel.getAddress3());
   newLic.setAgencyCode(licProfScriptModel.getAgencyCode());
   newLic.setAuditDate(licProfScriptModel.getAuditDate());
   newLic.setAuditID(licProfScriptModel.getAuditID());
   newLic.setAuditStatus(licProfScriptModel.getAuditStatus());
   newLic.setBusinessLicense(licProfScriptModel.getBusinessLicense());
   newLic.setBusinessName(licProfScriptModel.getBusinessName());
   newLic.setBusinessName2(licProfScriptModel.getBusName2());
   newLic.setCity(licProfScriptModel.getCity());
   newLic.setCityCode(licProfScriptModel.getCityCode());
   newLic.setContactFirstName(licProfScriptModel.getContactFirstName());
   newLic.setContactLastName(licProfScriptModel.getContactLastName());
   newLic.setContactMiddleName(licProfScriptModel.getContactMiddleName());
   newLic.setContryCode(licProfScriptModel.getCountryCode());
   newLic.setCountry(licProfScriptModel.getCountry());
   newLic.setEinSs(licProfScriptModel.getEinSs());
   newLic.setEMailAddress(licProfScriptModel.getEmail());
   newLic.setFax(licProfScriptModel.getFax());
   newLic.setLicenseType(licProfScriptModel.getLicenseType());
   newLic.setLicOrigIssDate(licProfScriptModel.getLicesnseOrigIssueDate());
   newLic.setPhone1(licProfScriptModel.getPhone1());
   newLic.setPhone2(licProfScriptModel.getPhone2());
   newLic.setSelfIns(licProfScriptModel.getSelfIns());
   newLic.setState(licProfScriptModel.getState());
   newLic.setLicState(licProfScriptModel.getState());
   newLic.setSuffixName(licProfScriptModel.getSuffixName());
   newLic.setWcExempt(licProfScriptModel.getWorkCompExempt());
   newLic.setZip(licProfScriptModel.getZip());
   newLic.setComment(licProfScriptModel.getComment());
   newLic.setLicenseBoard(licProfScriptModel.getLicenseBoard());
   newLic.setFein(licProfScriptModel.getFein());


   if (updating)
	myResult = aa.licenseScript.editRefLicenseProf(newLic);
   else
	myResult = aa.licenseScript.createRefLicenseProf(newLic);

   if (myResult.getSuccess())
	{
	updatereflp(rlpId,licProfScriptModel.getSalutation(),birthdate,licProfScriptModel.getPostOfficeBox())
	logDebug("Successfully added/updated License ID : " + rlpId)
	return rlpId;
	}
   else
	{ logDebug("**ERROR: can't create ref lic prof: " + myResult.getErrorMessage()); }
}

/**
 * Format the input number into currency format ($9.99) for easy reading of dollar amounts.
 * @param  {float} num [Number to format]
 * @return {string} Dollar formatted string.
 */
function currencyFormat(num) {
    return "$" + num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
}
function deactivateTasks_TPS() { // optional process name
	// modified from INCLUDES_ACCELA_FUNCTIONS deactivateTask.
	var wfstr = (arguments.length > 0 && arguments[0]? arguments[0]:null);
    var processName = (arguments.length > 1 && arguments[1] && arguments[1] != ""? arguments[1]:null);
	var itemCap = (arguments.length > 2 && arguments[2]? arguments[2]:"");
	var taskArrayExcept = (arguments.length > 3 && arguments[3]? arguments[3]:"");	// tasks to exclude. Do not use if wfstr is not null.
	
    var workflowResult = aa.workflow.getTasks(itemCap);
	if (!workflowResult.getSuccess())
	{ logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }

	var wfObj = workflowResult.getOutput();
	for (i in wfObj) {
		var fTask = wfObj[i];
		if (wfstr && !fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase())) continue;
		if (processName && !fTask.getProcessCode().equals(processName)) continue;
        if (wfstr && taskArrayExcept && exists(fTask.getTaskDescription(), taskArrayExcept)) continue;
		if (!fTask.getActiveFlag().equals("Y")) continue;

		var stepnumber = fTask.getStepNumber();
		var processID = fTask.getProcessID();
		var completeFlag = fTask.getCompleteFlag();
		if (processName)
			aa.workflow.adjustTask(vCapId, stepnumber, processID, "N", completeFlag, null, null)
		else
			aa.workflow.adjustTask(vCapId, stepnumber, "N", completeFlag, null, null)

		logDebug("deactivating Workflow Task: " + (processName? processName+".":"") +fTask.getTaskDescription());
	}
}
['Issuance','Closure']
function doScriptActions() {
	// Modified from INCLUDES_ACCELA_FUNCTIONS
    include(prefix + ":" + "*/*/*/*");
    if (typeof(appTypeArray) == "object") {
        include(prefix + ":" + appTypeArray[0] + "/*/*/*");
        include(prefix + ":" + appTypeArray[0] + "/" + appTypeArray[1] + "/*/*");
        include(prefix + ":" + appTypeArray[0] + "/" + appTypeArray[1] + "/" + appTypeArray[2] + "/*");
        include(prefix + ":" + appTypeArray[0] + "/*/" + appTypeArray[2] + "/*");
        include(prefix + ":" + appTypeArray[0] + "/*/" + appTypeArray[2] + "/" + appTypeArray[3]);
        include(prefix + ":" + appTypeArray[0] + "/*/*/" + appTypeArray[3]);
        include(prefix + ":" + appTypeArray[0] + "/" + appTypeArray[1] + "/*/" + appTypeArray[3]);
        include(prefix + ":" + appTypeArray[0] + "/" + appTypeArray[1] + "/" + appTypeArray[2] + "/" + appTypeArray[3]);
    }
    if (typeof(sendDebugEmail) == "undefined") {
        sendDebugEmail = false;
        debugEmailAddress = "";
    }
    if (debug && sendDebugEmail && debugEmailAddress != "")
        aa.sendMail(sysFromEmail, debugEmailAddress, "", "DEBUG-PROD: " + prefix, debug);
}

function editInspectionComment(itemCap, inspectionId, inspcomment) {
               var inspResult = aa.inspection.getInspection(itemCap, inspectionId);
               if (!inspResult.getSuccess()) {
                              logDebug("**ERROR: getting inspection: #" + inspectionId + ". " + inspResult.getErrorMessage());
                              return null;
               }
               inspObj = inspResult.getOutput();
               var inspModel = inspObj.setInspectionComments(String(inspcomment));
               var result = aa.inspection.editInspection(inspObj);
               if (result.getSuccess()) {
                              logDebug("Updated inspection: #" + inspectionId + " " + inspObj.getInspectionType() + inspcomment);
                              return true;
               } else {
                              logDebug("ERROR: updating inspection: #" + inspectionId + " " + inspObj.getInspectionType() + " " + result.getErrorMessage());
                              return false;
               }
}

/**
 * Assess fees depending on the record type.
 * @return bool - false if an error occured.
 *
 * Updated By: DDJ - 2017.01.13
 * 
 */
function feeAssess() {
	var sucess = false;

	try {

        if (NumberOfFeeItems > 0) {
            var feeItemsArray = String(FeeItemsList).replace("[", "").replace("]", "").split("|");
            var qtyArray = String(FeeItemsQuantityList).replace("[", "").replace("]", "").split("|");
            var module = appTypeArray[0];
            logDebug("Assessing " + module + " fees.");


            // loop thru the added fee items
            for (var i in feeItemsArray) {
                var feeItem = feeItemsArray[i];
                var qty = new Number(qtyArray[i]);
 
                logDebug("Working with " + feeItem + " Qty:" + qty + ".");

                // Assess Building module fees
                if (module.equals("Building")) {
                    switch (feeItem) {
                        case "CC-BLD-001":
                        	calcFee_CC_BLD_COMM_CC_BLD_001();
                            break;
                        case "CC_BLD_04":
                        	calcFee_CC_BLD_COMM_CC_BLD_04();
                            break;
                        case "CC_BLD_06":
                        	calcFee_CC_BLD_COMM_CC_BLD_06();
                            break;
                        case "CC-BLDCAE-03":
                        	calcFee_CC_BLD_COMM_AE_CC_BLDCAE_03();
                            break;
                        case "CC-BLD-CAG01":
                        	calcFee_CC_BLD_COMM_AG_CC_BLD_CAG01();
                            break;
                        case "CC-BLD-CAB01":
                        	calcFee_CC_BLD_COMM_AUX_BOILER_CC_BLD_CAB01();
                            break;
                        case "CC-BLD-CAF01":
                        	calcFee_CC_BLD_COMM_AUX_FIRE_CC_BLD_CAF01();
                            break;
                        case "CC-BLD-CAM01":
                        	calcFee_CC_BLD_COMM_AUX_MECH_CC_BLD_CAM01();
                        	break;
                        case "CC-BLD-CAP01":
                        	calcFee_CC_BLD_COMM_AUX_PLUMBING_CC_BLD_CAP01();
                        	break;
                        case "CC-BLD-CV-02":
                        	calcFee_CC_BLD_CV_CC_BLD_CV_02();
                        	break;
                        case "CC-BLD-CV-03":
                        	calcFee_CC_BLD_CV_CC_BLD_CV_03();
                        	break;
                        // case "CC_BLDC002":
                        // 	calcFee_CC_BLD_MIXEDUSE_CC_BLDC002();
                        // 	break;
                        // case "CC_BLDC004":
                        // 	calcFee_CC_BLD_MIXEDUSE_CC_BLDC004();
                        // 	break;
                        case "CC_BLDR018":
                        	calcFee_CC_BLD_MIXEDUSE_CC_BLDR018();
                        	break;
                        case "CC_GEN_111":
                            calcFee_CC_BLD_MIXEDUSE_CC_GEN_111();
                            break;
                        case "CC_GEN_131":
                            calcFee_CC_BLD_MIXEDUSE_CC_GEN_131();
                            break;
                        case "CC_GEN_11":
                            calcFee_CC_BLD_RESIDENTIAL_CC_GEN_11();
                            break;
                        case "CC_GEN_13":
                            calcFee_CC_BLD_RESIDENTIAL_CC_GEN_13();
                            break;
                        case "CC_BLDGF015":
                        	calcFee_CC_BLD_MULTIUNIT_CC_BLDGF015();
                        	break;
                        case "CC_BLDGF017":
                        	calcFee_CC_BLD_MULTIUNIT_CC_BLDGF017();
                        	break;
                        case "CC_BLDMU003":
                        	calcFee_CC_BLD_MULTIUNIT_CC_BLDMU003();
                        	break;
                        default:
                            logDebug("Do nothing.");
                    }

                }

                // Assess Utilities module fees
                if (module.equals("Utilities")) {
                    switch (feeItem) {
                        case "":
                            break;
                        default:
                            logDebug("Do nothing.");
                    }
                }
            }

            sucess = true;
		}

	} catch(err) {
		logDebug("A JavaScript Error occured: " + err.message);
	}
	return sucess;
}

//Function to look for open duplicate permits that are less than 6 months old at the same address.
function findDuplicateOpenPermitsAtAddress(pCapArray, pPermitType) {
	try {
		var openPermitList = [];
		for (var i in pCapArray) {
			var splitArray = String(pCapArray[i]).split('-');
			var capId = aa.cap.getCapID(splitArray[0], splitArray[1], splitArray[2]).getOutput();
			var relcap = aa.cap.getCap(capId).getOutput();
			var dDateObj = relcap.getFileDate();
			var reltype = relcap.getCapType().toString();
			if (pPermitType == reltype) {
				var today = new Date();
				var permitDate = new Date(String(dDateObj.getYear()), String(dDateObj.getMonth()) - 1, String(dDateObj.getDayOfMonth()));
				var dateDiff = (today - permitDate) / (1000 * 60 * 60 * 24);
				if (dateDiff < 183) { //6 months
					//if(dateDiff < 1) {  //1 day test
					relStatus = aa.cap.getStatusHistoryByCap(relcap.getCapID(), "APPLICATION", null);
					var statusHistoryList = relStatus.getOutput();
					if (statusHistoryList.length > -1) {
						var statusHistory = statusHistoryList[0];
						if (statusHistory.getStatus().indexOf("Close") == -1 && statusHistory.getStatus().indexOf("Withdrawn") == -1 && statusHistory.getStatus().indexOf("Abandon") == -1 && statusHistory.getStatus().indexOf("Cancelled") == -1) {
							openPermitList.push(statusHistory);
							//if (openPermitList.length > 0) {  //This code in in the ASA:
								//return ("WARNING: There is a permit for " + pPermitType + " that has been opened within the last 6 months.");
								//return (openPermitList.length); }
						}
					}
				}
			}
		}
		return openPermitList.length;
	} catch (err) {
		logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
		return -1;
	}
}
function generateSignPostingNumber(fieldName) {
    var inActiveCapStatuses = ["Cancelled", "Closed", "Expired", "Withdrawn"];
    //var ASIValue = getNextSequence(fieldName);
    //if (ASIValue) ASIValue = ASIValue+"";

    for (var i = 100; i < 999; i++) {
        var ASIValue = i + "";
        var getCapResult = aa.cap.getCapIDsByAppSpecificInfoField(fieldName, ASIValue);
        if (!getCapResult.getSuccess()) { logDebug("**ERROR: getting caps by app type: " + getCapResult.getErrorMessage()); return null }
        var apsArray = getCapResult.getOutput();
        for (aps in apsArray) {
            var myCapId = apsArray[aps].getCapID();
            var myCap = aa.cap.getCap(myCapId).getOutput();
            var myCapStatus = myCap.getCapStatus();
            if (inActiveCapStatuses && exists(myCapStatus, inActiveCapStatuses)) continue; // skip inactive record.
            logDebug("Found " + fieldName + ": " + ASIValue + " " + myCap.getCapID().getCustomID() + " " + myCapStatus);
            ASIValue = null;
            break; // Active record found so get next number
        }
        if (ASIValue != null) break
    }
    //if (ASIValue == null)
    return ASIValue;
}

function generateCommunityCode(ComCodeName) {
    var inActiveCapStatuses = ["Cancelled", "Closed", "Expired", "Withdrawn"];

    for (var i = 35; i < 1000; i++) {
        var ASIValue1 = '0'+i;
        var getCapResult = aa.cap.getCapIDsByAppSpecificInfoField(ComCodeName, ASIValue1);
        if (!getCapResult.getSuccess()) { logDebug("**ERROR: getting caps by app type: " + getCapResult.getErrorMessage()); return null }
        var apsArray = getCapResult.getOutput();
        for (aps in apsArray) {
            var myCapId = apsArray[aps].getCapID();
            var myCap = aa.cap.getCap(myCapId).getOutput();
            var myCapStatus = myCap.getCapStatus();
            if (inActiveCapStatuses && exists(myCapStatus, inActiveCapStatuses)) continue; // skip inactive record.
            logDebug("Found " + ComCodeName + ": " + ASIValue1 + " " + myCap.getCapID().getCustomID() + " " + myCapStatus);
            ASIValue1 = null;
            break; // Active record found so get next number
        }
        if (ASIValue1 != null) break
    }
    return i;
}
function generateSubdivCode(SubCodeName) {
    var inActiveCapStatuses = ["Cancelled", "Closed", "Expired", "Withdrawn"];

    for (var i = 930; i < 100000; i++) {
        var ASIValue2 = '0'+i;
        var getCapResult = aa.cap.getCapIDsByAppSpecificInfoField(SubCodeName, parseInt(ASIValue2));
        if (!getCapResult.getSuccess()) { logDebug("**ERROR: getting caps by app type: " + getCapResult.getErrorMessage()); return null }
        var apsArray = getCapResult.getOutput();
        for (aps in apsArray) {
            var myCapId = apsArray[aps].getCapID();
            var myCap = aa.cap.getCap(myCapId).getOutput();
            var myCapStatus = myCap.getCapStatus();
            if (inActiveCapStatuses && exists(myCapStatus, inActiveCapStatuses)) continue; // skip inactive record.
            logDebug("Found " + SubCodeName + ": " + ASIValue2 + " " + myCap.getCapID().getCustomID() + " " + myCapStatus);
            ASIValue2 = null;
            break; // Active record found so get next number
        }
        if (ASIValue2 != null) break
    }
    return i;
}
function generateDevCode(DevCodeName) {
    var inActiveCapStatuses = ["Cancelled", "Closed", "Expired", "Withdrawn"];

    for (var i = 4480; i < 100000; i++) {
        var ASIValue3 = '000'+i;
        var getCapResult = aa.cap.getCapIDsByAppSpecificInfoField(DevCodeName, ASIValue3);
        if (!getCapResult.getSuccess()) { logDebug("**ERROR: getting caps by app type: " + getCapResult.getErrorMessage()); return null }
        var apsArray = getCapResult.getOutput();
        for (aps in apsArray) {
            var myCapId = apsArray[aps].getCapID();
            var myCap = aa.cap.getCap(myCapId).getOutput();
            var myCapStatus = myCap.getCapStatus();
            if (inActiveCapStatuses && exists(myCapStatus, inActiveCapStatuses)) continue; // skip inactive record.
            logDebug("Found " + DevCodeName + ": " + ASIValue3 + " " + myCap.getCapID().getCustomID() + " " + myCapStatus);
            ASIValue3 = null;
            break; // Active record found so get next number
        }
        if (ASIValue3 != null) break
    }
    return i;
}
function generateSecCode(SecCodeName) {
    var inActiveCapStatuses = ["Cancelled", "Closed", "Expired", "Withdrawn"];

    for (var i = 1; i < 100; i++) {
        var ASIValue4 = '0'+i;
        var getCapResult = aa.cap.getCapIDsByAppSpecificInfoField(SecCodeName, ASIValue4);
        if (!getCapResult.getSuccess()) { logDebug("**ERROR: getting caps by app type: " + getCapResult.getErrorMessage()); return null }
        var apsArray = getCapResult.getOutput();
        for (aps in apsArray) {
            var myCapId = apsArray[aps].getCapID();
            var myCap = aa.cap.getCap(myCapId).getOutput();
            var myCapStatus = myCap.getCapStatus();
            if (inActiveCapStatuses && exists(myCapStatus, inActiveCapStatuses)) continue; // skip inactive record.
            logDebug("Found " + SecCodeName + ": " + ASIValue4 + " " + myCap.getCapID().getCustomID() + " " + myCapStatus);
            ASIValue4 = null;
            break; // Active record found so get next number
        }
        if (ASIValue4 != null) break
    }
    return i;
}

// FA this method returns all the related caps for given cap, it excludes the given cap in the array
function getAllRelatedCaps(capID)
{
	try
	{
		var allCapsArray = new Array();
		var directParentsResult = aa.cap.getProjectByChildCapID(capID,'R',null);
		
		if (directParentsResult.getSuccess())
		{
			tmpdirectParents = directParentsResult.getOutput();
			for(ff in tmpdirectParents) {
				if (tmpdirectParents[ff]) {
					var tmpNode = getRootNode(tmpdirectParents[ff].getProjectID(), 1);
					var id1 = tmpNode.getID1();
					var id2 = tmpNode.getID2();
					var id3 = tmpNode.getID3();

					var pCapId = aa.cap.getCapID(id1,id2,id3).getOutput();
					//aa.print("CAPID:" + pCapId.getCustomID());
					
					//push parent cap into array
					allCapsArray.push(pCapId.getCustomID());
				}
			}
		}
		
		// if there is no parent then given cap is the parent
		if (pCapId==null){
			pCapId=capID;
		}
		
		//get all the child caps
		var getCapResult = aa.cap.getChildByMasterID(pCapId);
		if (getCapResult.getSuccess())
		{
			var childArray = getCapResult.getOutput();
			if (childArray.length)
			{
				var childCapId;
				for (xx in childArray)
				{
					childCapId = childArray[xx].getCapID();
					//aa.print("childCapId:" + childCapId.getCustomID());
					//push child cap into array, exclude given capID
					if(capID.getCustomID()!=childCapId.getCustomID()){
						allCapsArray.push(childCapId.getCustomID());
					}
				}
			}
		}
		return allCapsArray;
	}catch(err){
		logDebug("Method name: getAllRelatedCaps. Message: Error-" + err.message + ". CapID:" + capID);
		return null;
	}
}

function getAppSpecificFieldLabels() {
// returns an array of field labels (Alias | Label) for each field that matches.
    var itemCap = (arguments.length > 0 && arguments[0] != null ? arguments[0] : capId); // use cap ID specified in args
    var itemGroups = (arguments.length > 1 && arguments[1] != null ? arguments[1] : null);
    var itemNames = (arguments.length > 2 && arguments[2] != null ? arguments[2] : null);
    var itemValues = (arguments.length > 3 && arguments[3] != null ? arguments[3] : ['CHECKED', 'YES', 'Y', 'SELECTED', 'TRUE', 'ON']);
    var itemTypes = (arguments.length > 4 && arguments[4] != null ? arguments[3] : ['Y/N','Checkbox']);

    var fieldTypes = ["", "Text", "Date", "Y/N", "Number", "Dropdown List", "Text Area", "Time", "Money", "Checkbox", ""];

    var items = [];
    var appSpecInfoResult = aa.appSpecificInfo.getByCapID(itemCap);
    if (appSpecInfoResult.getSuccess()) {
        var appspecObj = appSpecInfoResult.getOutput();
        for (var i in appspecObj) {
            var fieldType = appspecObj[i].getCheckboxInd();
            if (appspecObj[i].getCheckboxInd() != null && appspecObj[i].getCheckboxInd() < fieldTypes.length) fieldType = fieldTypes[appspecObj[i].getCheckboxInd()]
            if (itemGroups && !exists(appspecObj[i].getCheckboxType(), itemGroups)) continue;
            if (itemNames && !exists(appspecObj[i].getCheckboxDesc(), itemNames)) continue;
            //if (i == 0) logDebug("appspecObj[i]: " + br + describe_TPS(appspecObj[i]));
            //logDebug("appspecObj["+i+"]: " + appspecObj[i].getCheckboxType() + "." + appspecObj[i].getCheckboxDesc() + ", Label " + appspecObj[i].getFieldLabel() + ", (Type:" + appspecObj[i].getCheckboxInd() +" "+ fieldType + "):  " + appspecObj[i].getChecklistComment());
            if (itemValues && !exists(appspecObj[i].getChecklistComment(), itemValues)) continue;
            if (appspecObj[i].getLabelAlias()) { // Use Alias.
                items.push(appspecObj[i].getLabelAlias());
            } else {
                items.push(appspecObj[i].getCheckboxDesc());
            }
        }
    }
    else { logDebug("**ERROR: getting app specific info for Cap : " + appSpecInfoResult.getErrorMessage()) }
	return items;
}

function getcapIdsbyfeecodedaterange() {
	var feeCode = (arguments.length > 0 && arguments[0]? arguments[0]: "CC_GEN_10");
	var DBServer = "MSSQL Azure"; // Values: ORACLE, MSSQL, MSSQL Azure
	var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext").getOutput();
	var ds = initialContext.lookup("java:/AA"); 	// Typical method
	if (DBServer == "MSSQL Azure") { // Accela MS Azure
		var ds = initialContext.lookup("java:/"+aa.getServiceProviderCode());		// var ds = initialContext.lookup("java:/CHESTERFIELD"); 
	}

	var conn = ds.getConnection(); 
	var result = new Array();
	var LIC_SEQ_NBR = "";
	if (DBServer.indexOf("MSSQL") >= 0) {
		var getSQL = "SELECT DISTINCT b.B1_ALT_ID FROM dbo.F4FEEITEM f inner join dbo.B1PERMIT b on f.SERV_PROV_CODE = b.SERV_PROV_CODE and f.B1_PER_ID1 = b.B1_PER_ID1 and f.B1_PER_ID2 = b.B1_PER_ID2 and f.B1_PER_ID3 = b.B1_PER_ID3 where f.SERV_PROV_CODE = '" + aa.getServiceProviderCode() + "' and GF_COD = '" + feeCode + "'"
	} else {	// Typical method (Oracle)
		 var getSQL = "SELECT DISTINCT b.B1_ALT_ID FROM F4FEEITEM f inner join B1PERMIT b on f.SERV_PROV_CODE = b.SERV_PROV_CODE and f.B1_PER_ID1 = b.B1_PER_ID1 and f.B1_PER_ID2 = b.B1_PER_ID2 and f.B1_PER_ID3 = b.B1_PER_ID3 where f.SERV_PROV_CODE = '" + aa.getServiceProviderCode() + "' and GF_COD = '" + feeCode + "'"
	}
	// var sSelect = conn.prepareStatement(getSQL);			// Old Method.
	var sSelect = aa.db.prepareStatement(conn, getSQL);
	var rs= sSelect.executeQuery(); 
	while (rs.next()) {
		LIC_SEQ_NBR = rs.getString("B1_ALT_ID");
		result.push(LIC_SEQ_NBR); 
	}
	rs.close();
	conn.close();
	return result ;
}

function getCapWorkDesModel(capId) {
    capWorkDesModel = null;
    var s_result = aa.cap.getCapWorkDesByPK(capId);
    if (s_result.getSuccess()) {
        capWorkDesModel = s_result.getOutput();
    }
    else {
        aa.print("ERROR: Failed to get CapWorkDesModel: " + s_result.getErrorMessage());
        capWorkDesModel = null;
    }
    return capWorkDesModel;
}

function getContactAddreeByID(contactID, vAddressType) {
	var conArr = new Array();
	var capContResult = aa.people.getCapContactByContactID(contactID);

	if (capContResult.getSuccess()) {
		conArr = capContResult.getOutput();
		for (contact in conArr) {
			cont = conArr[contact];

			return getContactAddressByContact(cont.getCapContactModel(), vAddressType);
		}
	}
}

function getContactAddressByContact(contactModel, vAddressType) {
	var xrefContactAddressBusiness = aa.proxyInvoker.newInstance("com.accela.aa.aamain.address.XRefContactAddressBusiness").getOutput();
	var contactAddressArray = xrefContactAddressBusiness.getContactAddressListByCapContact(contactModel);
	for (i = 0; i < contactAddressArray.size(); i++) {
		var contactAddress = contactAddressArray.get(i);
		if (vAddressType.equals(contactAddress.getAddressType())) {
			return contactAddress;
		}
	}
}

function getfeenotes(capid,feecode,startdate,endate) {
	var jsEndDate = new Date(endate);
    var jsStartDate = new Date(startdate);
	var notes = '';
	var test = aa.fee.getFeeItems(capid).getOutput();
	for (x in test){
		var appdate1 = String(test[x].getF4FeeItemModel().getApplyDate());
		var appdate2 = appdate1.slice(0,10);
		var appdate3 = appdate2.split("-");
		var appdate = new Date(appdate3[1] + "/" + appdate3[2] + "/" + appdate3[0]);
		if(test[x].getFeeCod() == feecode && (appdate >= jsStartDate && jsEndDate >= appdate)) {
			notes = test[x].getF4FeeItemModel().getFeeNotes();
		}
	}
	return notes
}

function getFirstInspector(insp2Check) { 
    // function getLastInspector: returns the inspector ID (string) of the first inspector to result the inspection.
    //
    var inspUserID = null;
    var inspResultObj = aa.inspection.getInspections(capId);
    if (inspResultObj.getSuccess()) {
        inspList = inspResultObj.getOutput();

        inspList.sort(compareInspResultDateDesc)
        for (xx in inspList)
            if (String(insp2Check).equals(inspList[xx].getInspectionType()) && !inspList[xx].getInspectionStatus().equals("Scheduled")) {
                // have to re-grab the user since the id won't show up in this object.
                inspUserObj = aa.person.getUser(inspList[xx].getInspector().getFirstName(), inspList[xx].getInspector().getMiddleName(), inspList[xx].getInspector().getLastName()).getOutput();
                inspUserID = inspUserObj.getUserID();
                logDebug((inspList[xx].getInspection().getActivity().getCompletionDate() ? new Date(inspList[xx].getInspection().getActivity().getCompletionDate().getTime()) : inspList[xx].getInspection().getActivity().getCompletionDate()) + " "
                    + (inspList[xx].getInspectionStatusDate() ? new Date(inspList[xx].getInspectionStatusDate().getEpochMilliseconds()) : inspList[xx].getInspectionStatusDate())
                    + " " + inspUserID);
            }
        return inspUserID;
    }
    return null;
}

function compareInspResultDateDesc(a, b) {
    if (a.getInspection().getActivity().getCompletionDate() == b.getInspection().getActivity().getCompletionDate()) {
        if (a.getInspectionStatusDate() == null && b.getInspectionStatusDate() == null) {
            return false;
        }
        if (a.getInspectionStatusDate() == null && b.getInspectionStatusDate() != null) {
            return true;
        }
        if (a.getInspectionStatusDate() != null && b.getInspectionStatusDate() == null) {
            return false;
        }
        return (a.getInspectionStatusDate().getEpochMilliseconds() < b.getInspectionStatusDate().getEpochMilliseconds());
    }
    if (a.getInspection().getActivity().getCompletionDate() == null && b.getInspection().getActivity().getCompletionDate() != null) {
        return true;
    }
    if (a.getInspection().getActivity().getCompletionDate() != null && b.getInspection().getActivity().getCompletionDate() == null) {
        return false;
    }
    return (a.getInspection().getActivity().getCompletionDate().getTime() < b.getInspection().getActivity().getCompletionDate().getTime());
} 

function getInspectionComment(itemCap, inspectionId) {
	           var comment = "No Comment";
               var inspResult = aa.inspection.getInspection(itemCap, inspectionId);
               if (inspResult.getSuccess()) {
                   inspObj = inspResult.getOutput();           
				   comment = inspObj.getInspectionComments();		  
							  
               }
               return comment;
}

function getInspectorObj(inspectorId) {
    // Get inspectorObj based on valid inspector (UserID or Department).
    var iName = inspectorId;
    var iInspector = null;
    if (iName) {
        var iNameResult = aa.person.getUser(iName);
        if (iNameResult.getOutput()) {
            iInspector = iNameResult.getOutput();
        } else { // Check for department name
            inspectorId = null;
            var dpt = aa.people.getDepartmentList(null).getOutput();
            for (var thisdpt in dpt) {
                var m = dpt[thisdpt]
                if (iName.equals(m.getDeptName())) {
                    iNameResult = aa.person.getUser(null, null, null, null, m.getAgencyCode(), m.getBureauCode(), m.getDivisionCode(), m.getSectionCode(), m.getGroupCode(), m.getOfficeCode());
                    if (!iNameResult.getSuccess()) {
                        logDebug("**WARNING retrieving department user model " + iName + " : " + iNameResult.getErrorMessage());
                        return false;
                    }
                    iInspector = iNameResult.getOutput();
                }
            }
        }
    }
    if (iInspector && iInspector.getGaUserID() == null) { // Set FullName to Dept Name
        iInspector.setFullName(iName);
    }
/*
    logDebug("iInspector: " + iInspector 
        + (iInspector && iInspector.getFullName() ? ", Name: " + iInspector.getFullName() : "")
        + (iInspector && iInspector.getGaUserID() ? ", UserID: " + iInspector.getGaUserID() : "")
        + (iInspector && iInspector.isInspector? ", (Inspector)":"")
        );
*/
    return iInspector;
}

//Used for Inspection Sequence tracking requirement
function getinsptypecount(capid, insptype) {
    var count = 0;
    var insp = aa.inspection.getInspections(capid).getOutput();
    for (x in insp) {

        if (insp[x].getInspectionType() == insptype && insp[x].getInspectionStatus() != "Cancelled") {
            count++
        }
    }
    return count;
}

function getLastInspectioncomment(insp2Check)
	// function getLastInspector: returns the inspector ID (string) of the last inspector to result the inspection.
	//
	{
	var	inspUserObj = "No Comments";
	var inspResultObj = aa.inspection.getInspections(capId);
	if (inspResultObj.getSuccess())
		{
		inspList = inspResultObj.getOutput();
		
		inspList.sort(compareInspDateDesc)
		for (xx in inspList)
			if (String(insp2Check).equals(inspList[xx].getInspectionType()) && !inspList[xx].getInspectionStatus().equals("Scheduled"))
				{
				// have to re-grab the user since the id won't show up in this object.
				inspUserObj = inspList[xx].getInspection().resultComment;
				}
		}
	return inspUserObj;
	}

function getLatestScheduledDate() {
	var inspResultObj = aa.inspection.getInspections(capId);
	if (inspResultObj.getSuccess()) {
		inspList = inspResultObj.getOutput();
		var array = new Array();
		var j = 0;
		for (i in inspList) {
			if (inspList[i].getInspectionStatus().equals("Scheduled")) {
				array[j++] = aa.util.parseDate(inspList[i].getInspection().getScheduledDate());
			}
		}

		var latestScheduledDate = array[0];
		for (k = 0; k < array.length; k++) {
			temp = array[k];
			logDebug("----------array.k---------->" + array[k]);
			if (temp.after(latestScheduledDate)) {
				latestScheduledDate = temp;
			}
		}
		return latestScheduledDate;
	}
	return false;
}

function getLicenseHolderByLicenseNumber(capIdStr) {
	var capContactResult = aa.people.getCapContactByCapID(capIdStr);
	if (capContactResult.getSuccess()) {
		var Contacts = capContactResult.getOutput();
		for (yy in Contacts) {
			var contact = Contacts[yy].getCapContactModel();
			var contactType = contact.getContactType();
			if (contactType.toUpperCase().equals("LICENSE HOLDER") && contact.getRefContactNumber()) {
				return contact;
			}
		}
	}
}

function getLicenseProf() {
	var licProfTypes = (arguments.length > 0 && arguments[0]? arguments[0]:null);
	var licProfIds = (arguments.length > 1 && arguments[1]? arguments[1]:null);
	var itemCap = (arguments.length > 2 && arguments[2]? arguments[2]:capId);

	var capLicenseResult = aa.licenseScript.getLicenseProf(itemCap);
	if (!capLicenseResult.getSuccess())
	{ logDebug("**ERROR: getting lic prof: " + capLicenseResult.getErrorMessage()); return false; }
	var capLicenseArr = capLicenseResult.getOutput();
	if (!capLicenseArr)
	{ logDebug("WARNING: no license professional available on the application:"); return false; }
	
	var capLicArr = [];
	for (capLic in capLicenseArr) {
		var lpsm = capLicenseArr[capLic];
		if (licProfTypes && !exists(lpsm.getLicenseType() + "",licProfTypes)) continue;
		if (licProfIds &&  !exists(lpsm.getLicenseNbr() + "",licProfIds)) continue;
		logDebug("Found License Professional with Type: " + lpsm.getLicenseType() + ", Nbr: " + lpsm.getLicenseNbr()
		+ (lpsm.getContactFirstName() || lpsm.getContactLastName()? ", Name:" + (lpsm.getContactFirstName()? " " + lpsm.getContactFirstName():"") + (lpsm.getContactLastName()? " " + lpsm.getContactLastName():""):"")
		+ (lpsm.getBusinessName()? ", BusName: " + lpsm.getBusinessName():""));
		capLicArr.push(lpsm); //Found Licensed Prof of specified type and/or #
	}

	if (capLicArr.length > 0) return capLicArr;
	return false;
}

/**
 * Get a License Professional by Business Name
 * 
 * @param {any} businessName 
 * @returns {array}
 */
function getLPByBusinessName(businessName) {
	var result = aa.licenseScript.getTradeNameList(businessName, null);

	if (result.getSuccess()) {
		var licenses = result.getOutput().toArray();
		for (l in licenses) {
			thisLicense = licenses[l];
			var stateLicense = thisLicense["stateLicense"];
			logDebug("License Professional found. " + stateLicense);
		}
		return licenses;
	} else {
		logDebug("License Professional not found." + businessName);
		return null;
	}
}

function getParentCapIDForReview(capid) {
	try {
		if (capid == null || aa.util.instanceOfString(capid)) {
			return null;
		}
		//1. Get parent license for review
		var result = aa.cap.getProjectByChildCapID(capid, "Renewal", "Incomplete"); //"Incomplete" was"Review"
		if (result.getSuccess()) {
			projectScriptModels = result.getOutput();
			if (projectScriptModels == null || projectScriptModels.length == 0) {
				logDebug("ERROR: Failed to get parent CAP with CAPID(" + capid + ") for review");
				return null;
			}
			//2. return parent CAPID.
			projectScriptModel = projectScriptModels[0];
			return projectScriptModel.getProjectID();
		} else {
			logDebug("ERROR: Failed to get parent CAP by child CAP(" + capid + ") for review: " + result.getErrorMessage());
			return null;
		}

	} catch (err) {

		logDebug("A JavaScript Error occurred: " + err.message + " Line " + err.lineNumber);
	}
}


function getParents_TPS(pAppType) {
	// returns the capId array of all parent caps
	//Dependency: appMatch function
	//
    var itemCap =(arguments.length > 1 && arguments[1]? arguments[1]:capId);

	var i = 1;
	while (true) {
		if (!(aa.cap.getProjectParents(itemCap, i).getSuccess()))
			break;

		i += 1;
	}
	i -= 1;

	getCapResult = aa.cap.getProjectParents(itemCap, i);
	myArray = new Array();

	if (getCapResult.getSuccess()) {
		parentArray = getCapResult.getOutput();

		if (parentArray.length) {
			for (x in parentArray) {
				if (pAppType != null) {
					//If parent type matches apType pattern passed in, add to return array
					if (appMatch(pAppType, parentArray[x].getCapID()))
						myArray.push(parentArray[x].getCapID());
				} else
					myArray.push(parentArray[x].getCapID());
			}

			return myArray;
		} else {
			logDebug("**WARNING: GetParent found no project parent for this application");
			return null;
		}
	} else {
		logDebug("**WARNING: getting project parents:  " + getCapResult.getErrorMessage());
		return null;
	}
} 

function getRefFee(fsched, fcode) {
	fdesc = (arguments.length > 2 && arguments[2]? arguments[2]:null);
	if (fdesc) fdesc = (""+fdesc).trim();
	fMsg = "Schedule: " + fsched
		 +(fcode? ", code: " + fcode:"")
		 +(fdesc? ", desc: " + fdesc:"");
		
	logDebug("Looking for Ref Fee " + fMsg);		 
    var arrFeesResult = aa.finance.getFeeItemList(null, fsched, null);
    if (!arrFeesResult.getSuccess()) {
        logDebug("Error getting fee schedule: " + fsched + " " + arrFeesResult.getErrorMessage());
        return null;
    }
	//var fdescPrefix = (fdesc && (fdesc+"").indexOf(")-") > 0? (fdesc+"").split(")-")[0]+")":null);
	var refFee = null;
	var arrFees = arrFeesResult.getOutput();
	for (var xx in arrFees) {
		feeSchedule = arrFees[xx].getFeeSchedule();
		feeCod = arrFees[xx].getFeeCod();
		feeDes = arrFees[xx].getFeeDes();
		feeCalProc  = arrFees[xx].getCalProc();
		feeFormula = arrFees[xx].getFormula();
//		logDebug("refFeeObj["+xx+"]: " + arrFees[xx] + br + describe_TPS(arrFees[xx]));
		if (fcode && fcode != arrFees[xx].getFeeCod()) continue; 
//		if (fdescPrefix && arrFees[xx].getFeeDes().toUpperCase().indexOf(fdescPrefix.toUpperCase()) < 0) continue;
		if (fdesc && fdesc != arrFees[xx].getFeeDes()) continue;
		logDebug(">> Found refFeeObj["+xx+"]: " + feeSchedule + "." + feeCod + " " + feeDes + " " + feeCalProc + " " + feeFormula);
		refFee = arrFees[xx];
		break;
	}
	return refFee;
}

// FA get the related parent by application type
function getRelatedParentCap(capID,pAppType) 
{
	// returns the capId array of all parent caps
	//Dependency: appMatch function
	parentArray = getRoots(capID);
	//aa.print("parentArray:" + parentArray);
	
	myArray = new Array();
	if (parentArray.length > 0)
	{
		if (parentArray.length)
		{
			for(x in parentArray)
			{
				if (pAppType != null)
				{
					//If parent type matches apType pattern passed in, add to return array
					if ( appMatch( pAppType, parentArray[x])){
						myArray.push(parentArray[x]);
						//aa.print("11:" + parentArray[x].getCustomID());
					}
				}
			}		
			return myArray;
		}
		else
		{
			logDebug( "**WARNING: function getRelatedParentCap. GetParent found no project parent for this application");
			return null;
		}
	}
	else
	{ 
		logDebug( "**WARNING: function getRelatedParentCap. Getting project parents:  " + getCapResult.getErrorMessage());
		return null;
	}
}

function getVendor(sourceValue, sourceName)
{
	var _sourceVal = "STANDARD";
	if(sourceValue != null && sourceValue != '')
	{
		logDebug("sourceValue was not null or empty string.");
		_sourceVal = sourceValue;
	}
	else if(sourceName != null && sourceName != '')
	{
		logDebug("sourceName was not null or empty string.");
		var bizDomScriptResult = aa.bizDomain.getBizDomainByValue("EDMS",sourceName.toUpperCase());

		if (bizDomScriptResult.getSuccess())
	   {
			logDebug("bizDomScriptResult is successful.");
			bizDomScriptObj = bizDomScriptResult.getOutput();
			var bizDescStr = bizDomScriptObj.getDescription();
			var startPos = bizDescStr.indexOf("EDMS_VENDOR=");
			var endPos = bizDescStr.indexOf(";",startPos);
			if(startPos > -1 && endPos >-1)
			{
				_sourceVal = bizDescStr.substring(startPos+12,endPos).trim();
				logDebug("_sourceVal set to " + _sourceVal);
			}
		}
		else
			logDebug("bizDomScriptResult.getSuccess() was false.  Will not attempt to search for Vendor.");
	}
	
	logDebug("Function getVendor returns a value of " + _sourceVal);
	
	return _sourceVal;
}

// FA check to see if given application condition exists
 function hasAppCondition(capID,pType,pStatus,pDesc,pImpact) {
	try
	{
		var condResult = aa.capCondition.getCapConditions(capID);
		
		if (condResult.getSuccess()){
			var capConds = condResult.getOutput();
		}else{ 
			logMessage("**ERROR: getting cap conditions: " + condResult.getErrorMessage());
			logDebug("**ERROR: getting cap conditions: " + condResult.getErrorMessage());
		}
		
		var cStatus;
		var cDesc;
		var cImpact;
		var condForEmail = "";
		for (cc in capConds) {
			var thisCond = capConds[cc];
			var cStatus = thisCond.getConditionStatus();
			var cDesc = thisCond.getConditionDescription();
			var cPubDisplayMessage = thisCond.getDispPublicDisplayMessage();
			var cImpact = thisCond.getImpactCode();
			var cType = thisCond.getConditionType();
			
			aa.print("cStatus:" + cStatus);
			aa.print("cDesc:" + cDesc);
			
			if (cType.toUpperCase().equals(pType.toUpperCase()) && cDesc.toUpperCase().equals(pDesc.toUpperCase()) && cStatus.toUpperCase().equals(pStatus.toUpperCase()) && cImpact.toUpperCase().equals(pImpact.toUpperCase())){
				return true;
			}
		}
		return false; 
	}catch(err){
		aa.print("Method name: hasAppCondition. Message: Error-" + err.message + ". CapID:" + capID);
		return false;
	}
}

function invoiceAllFees(capid) {
    var itemCap = capid;
    var targetFees = loadFees(itemCap);
    var feeSeqArray = new Array();
    var paymentPeriodArray = new Array();
    for (tFeeNum in targetFees) {
        targetFee = targetFees[tFeeNum];
        if (targetFee.status == "NEW") {
            feeSeqArray.push(targetFee.sequence);
            paymentPeriodArray.push(targetFee.period);

        }
    }
    var invoicingResult = aa.finance.createInvoice(itemCap, feeSeqArray, paymentPeriodArray);
    if (!invoicingResult.getSuccess()) {
        logDebug("**ERROR: Invoicing fee items not successful.  Reason: " + invoicingResult.getErrorMessage());
        return false;
    }
}

function isTaskComplete_TPS(wfstr) // optional process name
{	// 09/28/2018 RS: Modified from INCLUDES_ACCELA_FUNCTIONS v9.3.6 to include optional capID & how processName is handled.
	var useProcess = false;
	var processName = "";
	if (arguments.length > 1 && arguments[1] && arguments[1] != "") { // 10/17/2018 RS: Modified to ignore if null or blank.
		processName = arguments[1]; // subprocess
		useProcess = true;
	}
    var itemCap = (arguments.length > 2 && arguments[2]? arguments[2]:capId); // use cap ID specified in args

	var workflowResult = aa.workflow.getTaskItems(itemCap, wfstr, processName, "Y", null, null);
	if (!workflowResult.getSuccess()) {
		logDebug("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
		return null;
		// Task not found.
	}

	wfObj = workflowResult.getOutput();
	for (i in wfObj) {
		fTask = wfObj[i];
		if (useProcess && !fTask.getProcessCode().equals(processName)) continue;
		if (!fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase())) continue;
		if (fTask.getCompleteFlag().equals("Y"))
			return true;
		else
			return false;
	}
	return false;
}

function isTaskStatus_TPS(wfstr, wfstat) {// optional process name
// 05/20/2020 RS: Modified from INCLUDES_ACCELA_FUNCTIONS to optional capId and array of valid task statuses.
	var useProcess = false;
	var processName = "";
	if (arguments.length > 2) {
		processName = arguments[2]; // subprocess
		useProcess = true;
	}
	var itemCap = arguments.length > 3 && arguments[3]? arguments[3]:capId;
	var wfStatArray = (wfstat && typeof(wfstat) == "string"? [wfstat]:wfstat); // Convert to array

	var workflowResult = aa.workflow.getTaskItems(capId, wfstr, processName, null, wfstat, null);
	if (workflowResult.getSuccess())
		var wfObj = workflowResult.getOutput();
	else {
		logMessage("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
		return false;
	}

	for (i in wfObj) {
		fTask = wfObj[i];
		if (useProcess && !fTask.getProcessCode().equals(processName)) continue;
		if (wfstr && !fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase())) continue;
		if (fTask.getDisposition() == null) continue;
		if (wfStatArray && !exist(fTask.getDisposition(),wfStatArray)) continue;
		return true;
	}
	return false;
}

function linkRefContactWithRefLicProf(refContactSeq, refLicProfSeq, servProvCode, auditID) {

	if (refContactSeq && refLicProfSeq && servProvCode && auditID) {
		var xRefContactEntity = aa.people.getXRefContactEntityModel().getOutput();
		xRefContactEntity.setServiceProviderCode(servProvCode);
		xRefContactEntity.setContactSeqNumber(refContactSeq);
		xRefContactEntity.setEntityType("PROFESSIONAL");
		xRefContactEntity.setEntityID1(refLicProfSeq);
		var auditModel = xRefContactEntity.getAuditModel();
		auditModel.setAuditDate(new Date());
		auditModel.setAuditID(auditID);
		auditModel.setAuditStatus("A")
		xRefContactEntity.setAuditModel(auditModel);
		var xRefContactEntityBusiness = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.XRefContactEntityBusiness").getOutput();
		var existedModel = xRefContactEntityBusiness.getXRefContactEntityByUIX(xRefContactEntity);
		if (existedModel.getContactSeqNumber()) {
			//aa.print("The professional license have already linked to contact.");
			logMessage("License professional link to reference contact successfully.");
		} else {
			var XRefContactEntityCreatedResult = xRefContactEntityBusiness.createXRefContactEntity(xRefContactEntity);
			if (XRefContactEntityCreatedResult) {
				//aa.print("License professional link to reference contact successfully.");
				logMessage("License professional link to reference contact successfully.");
			} else {
				//aa.print("**ERROR:License professional failed to link to reference contact.  Reason: " +  XRefContactEntityCreatedResult.getErrorMessage());
				logMessage("**ERROR:License professional failed to link to reference contact.  Reason: " + XRefContactEntityCreatedResult.getErrorMessage());
			}
		}
	} else {
		//aa.print("**ERROR:Some Parameters are empty");
		logMessage("**ERROR:Some Parameters are empty");
	}

}

function loadCustomScript(scriptName) {

    try {
        scriptName = scriptName.toUpperCase();
        var emseBiz = aa.proxyInvoker.newInstance(
                "com.accela.aa.emse.emse.EMSEBusiness").getOutput();
        var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(),
                scriptName, "ADMIN");
        eval(emseScript.getScriptText() + "");

    } catch (error) {
        showDebug = true;
        logDebug("<font color='red'><b>WARNING: Could not load script </b></font>" + scriptName + ". Verify the script in <font color='blue'>Classic Admin>Admin Tools>Events>Scripts</font>");
    }
}

function loadXAPOParcelAttributesTPS(thisArr) {
	try {
		// Modified version of the loadParcelAttributesTPS()
		// Returns an associative array of Parcel Attributes and XAPO data
		// Optional second parameter, parcel number to load from
		// If no parcel is passed, function is using the ParcelValidatedNumber variable defined in the "BEGIN Event Specific Variables" list in ApplicationSubmitBefore

		var parcelNum = ParcelValidatedNumber;

		if (arguments.length == 2)
			parcelNum = arguments[1]; // use parcel number specified in args

		var fParcelObj = null;
		var parcelResult = aa.parcel.getParceListForAdmin(parcelNum, null, null, null, null, null, null, null, null, null);

		if (!parcelResult.getSuccess())
			logDebug("**ERROR: Failed to get Parcel object: " + parcelResult.getErrorType() + ":" + parcelResult.getErrorMessage());
		else
				var fParcelObj = parcelResult.getOutput()[0];
		var fParcelModel = fParcelObj.parcelModel;
		var parcelArea = 0;
		parcelArea += fParcelModel.getParcelArea();
		var parcelAttrObj = fParcelModel.getParcelAttribute().toArray();

		for (z in parcelAttrObj)
			thisArr["ParcelAttribute." + parcelAttrObj[z].getB1AttributeLabel()] = parcelAttrObj[z].getValue();

		// Explicitly load some standard values
		thisArr["ParcelAttribute.Block"] = fParcelModel.getBlock();
		thisArr["ParcelAttribute.Book"] = fParcelModel.getBook();
		thisArr["ParcelAttribute.CensusTract"] = fParcelModel.getCensusTract();
		thisArr["ParcelAttribute.CouncilDistrict"] = fParcelModel.getCouncilDistrict();
		thisArr["ParcelAttribute.ExemptValue"] = fParcelModel.getExemptValue();
		thisArr["ParcelAttribute.ImprovedValue"] = fParcelModel.getImprovedValue();
		thisArr["ParcelAttribute.InspectionDistrict"] = fParcelModel.getInspectionDistrict();
		thisArr["ParcelAttribute.LandValue"] = fParcelModel.getLandValue();
		thisArr["ParcelAttribute.LegalDesc"] = fParcelModel.getLegalDesc();
		thisArr["ParcelAttribute.Lot"] = fParcelModel.getLot();
		thisArr["ParcelAttribute.MapNo"] = fParcelModel.getMapNo();
		thisArr["ParcelAttribute.MapRef"] = fParcelModel.getMapRef();
		thisArr["ParcelAttribute.ParcelStatus"] = fParcelModel.getParcelStatus();
		thisArr["ParcelAttribute.SupervisorDistrict"] = fParcelModel.getSupervisorDistrict();
		thisArr["ParcelAttribute.Tract"] = fParcelModel.getTract();
		thisArr["ParcelAttribute.PlanArea"] = fParcelModel.getPlanArea();
	} catch (err) {
		logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
	}
}

function overallCodeSchema_CC() {
// 01-19-21 db added this as function and it is specific to Chesterfield County, so it is called in the WTUA and PRA - and they should not overwrite each other.	
try {
	var ComCodeName = "Community Code";
	if (AInfo[ComCodeName] > 1) {
		logDebug('Community Code Already Exists: ' + AInfo[ComCodeName]);
	} else {
		var seq1CodeName = null;
		if (appMatch('*/Subdivision/Preliminary/*') || appMatch('*/Subdivision/OverallConceptualPlan/*') || appMatch('*/SitePlan/Schematics/*') || appMatch('*/SitePlan/Major/*')) {
			seq1CodeName = "Community Code";
			if (seq1CodeName && typeof(AInfo[ComCodeName]) != "undefined") {
				AInfo[ComCodeName] = generateCommunityCode(ComCodeName);
				if (AInfo[ComCodeName] < 10) {
					AInfo[ComCodeName] = '00' + AInfo[ComCodeName];
				} else if (AInfo[ComCodeName] < 100) {
					AInfo[ComCodeName] = '0' + AInfo[ComCodeName];
				} else if (AInfo[ComCodeName] < 1000) {
					AInfo[ComCodeName] = AInfo[ComCodeName];
				} else if (AInfo[ComCodeName] < 1000) {
					AInfo[ComCodeName] = 'Incorrect Code Value';
				}
				logDebug(ComCodeName + ": " + AInfo[ComCodeName]);
				editAppSpecific(ComCodeName, AInfo[ComCodeName]);
			}
		}
	}

	var SubCodeName = "Subdivision Code";
	if (AInfo[SubCodeName] > 1) {
		logDebug('Subdivision Code Already Exists: ' + AInfo[SubCodeName]);
	} else {
		var seq2CodeName = null;
		if (appMatch('*/Subdivision/ConstructionPlan/*') || appMatch('*/Subdivision/Preliminary/*') || (appMatch('*/SitePlan/Major/*') && AInfo['Mixed Use'] == "Yes" && (AInfo['Multi-Family (MF)'] == 'CHECKED'
					 || AInfo['Residential Construction Plan (CP)'] == 'CHECKED'))) {
			seq2CodeName = "Subdivision Code";
			if (seq2CodeName && typeof(AInfo[SubCodeName]) != "undefined") {
				AInfo[SubCodeName] = generateSubdivCode(SubCodeName);
				if (AInfo[SubCodeName] < 100) {
					AInfo[SubCodeName] = '000' + AInfo[SubCodeName];
				} else if (AInfo[SubCodeName] < 1000) {
					AInfo[SubCodeName] = '00' + AInfo[SubCodeName];
				} else if (AInfo[SubCodeName] < 10000) {
					AInfo[SubCodeName] = '0' + AInfo[SubCodeName];
				} else if (AInfo[SubCodeName] < 100000) {
					AInfo[SubCodeName] = AInfo[SubCodeName];
				} else if (AInfo[SubCodeName] > 100000) {
					AInfo[SubCodeName] = 'Incorrect Code Value';
				}
				logDebug(SubCodeName + ": " + AInfo[SubCodeName]);
				editAppSpecific(SubCodeName, AInfo[SubCodeName]);
			}
		}
	}

	var DevCodeName = "Development Code";
	if (AInfo[DevCodeName] > 1) {
		logDebug('Development Code Already Exists: ' + AInfo[DevCodeName]);
	} else {
		var seq3CodeName = null;
		if (appMatch('*/SitePlan/Minor/*') || appMatch('*/SitePlan/Major/*')) {
			seq3CodeName = "Development Code";
			if (seq3CodeName && typeof(AInfo[DevCodeName]) != "undefined") {
				AInfo[DevCodeName] = generateDevCode(DevCodeName);
				if (AInfo[DevCodeName] < 100) {
					AInfo[DevCodeName] = '000' + AInfo[DevCodeName];
				} else if (AInfo[DevCodeName] < 1000) {
					AInfo[DevCodeName] = '00' + AInfo[DevCodeName];
				} else if (AInfo[DevCodeName] < 10000) {
					AInfo[DevCodeName] = '0' + AInfo[DevCodeName];
				} else if (AInfo[DevCodeName] < 100000) {
					AInfo[DevCodeName] = AInfo[DevCodeName];
				} else if (AInfo[DevCodeName] > 100000) {
					AInfo[DevCodeName] = 'Incorrect Code Value';
				}
				logDebug(DevCodeName + ": " + AInfo[DevCodeName]);
				editAppSpecific(DevCodeName, AInfo[DevCodeName]);
			}
		}
	}

	var SecCodeName = "Section Code";
	if (AInfo[SecCodeName] > 1) {
		logDebug('Section Code Already Exists: ' + AInfo[SecCodeName]);
	} else {
		var seq4CodeName = null;
		if (appMatch('*/Subdivision/ConstructionPlan/*')) {
			seq4CodeName = "Section Code";
			if (seq4CodeName && typeof(AInfo[SecCodeName]) != "undefined") {
				AInfo[SecCodeName] = generateSecCode(SecCodeName);
				if (AInfo[SecCodeName] < 100) {
					AInfo[SecCodeName] = '00' + AInfo[SecCodeName];
				} else if (AInfo[SecCodeName] < 1000) {
					AInfo[SecCodeName] = '0' + AInfo[SecCodeName];
				} else if (AInfo[SecCodeName] < 10000) {
					AInfo[SecCodeName] = AInfo[SecCodeName];
				} else if (AInfo[SecCodeName] > 10000) {
					AInfo[SecCodeName] = 'Incorrect Code Vaule';
				}
				logDebug(SecCodeName + ": " + AInfo[SecCodeName]);
				editAppSpecific(SecCodeName, AInfo[SecCodeName]);
			}
		}
	}

	var SubIDName = "Subdivision ID";
	if (AInfo[SubIDName] > 1) {
		logDebug('Subdivision ID Already Exists: ' + AInfo[SubIDName]);
	} else {
		var seq5CodeName = null;
		if (appMatch('*/Subdivision/Final Plat/*')) {
			seq5CodeName = "Subdividion ID";
			if (seq5CodeName && typeof(AInfo[SubIDName]) != "undefined") {
				AInfo[SubIDName] = AInfo[ComCodeName] + '-' + AInfo[SubCodeName] + '-' + AInfo[SecCodeName];
				logDebug(SubIDName + ": " + AInfo[SubIDName]);
				editAppSpecific(SubIDName, AInfo[SubIDName]);
			} else { {
					AInfo[SubIDName] = 'Incorrect Code Vaule';
				}
			}
		}
	}
} catch (err) {
	logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}
}

function ownerExistsOnCap() {
        // Optional parameter, cap ID to load from
        var itemCap = (arguments.length> 0 && arguments[0]? arguments[0]:capId); // use cap ID if specified in args
        var primaryFlag = (arguments.length> 1 && arguments[1] == true? true:null); // Check if primary owner
 
        var capOwnerResult = aa.owner.getOwnerByCapId(itemCap);
        if (!capOwnerResult.getSuccess())
        { logDebug("**ERROR: Failed to get Owner object: " + capOwnerResult.getErrorMessage()); return false; }
        var owner = capOwnerResult.getOutput();
        for (o in owner) {
                       thisOwner = owner[o];
                       if (owner[o] == null) continue;
                       if (primaryFlag && owner[o].getPrimaryOwner() == "Y") {
                                      return true;
                       } else if (primaryFlag == null) {
                                      return true;
                       }
        }
 
        return false;
 
}

function parcelHasConditiontrue_TPS(pType,pStatus)
// for the Parcel Conditions, checks all parcels, and if any have an Applied Conditions with the record name in it, returns true
{
	var capParcelResult = aa.parcel.getParcelandAttribute(capId,null);
	if (!capParcelResult.getSuccess())
		{ logDebug("**WARNING: error getting cap parcels : " + capParcelResult.getErrorMessage()) ; return false }

	var Parcels = capParcelResult.getOutput().toArray();
	for (zz in Parcels)
		{
		pcResult = aa.parcelCondition.getParcelConditions(Parcels[zz].getParcelNumber());
		if (!pcResult.getSuccess())
			{ logDebug("**WARNING: error getting parcel conditions : " + pcResult.getErrorMessage()) ; return false }
		pcs = pcResult.getOutput();
		for (pc1 in pcs)
			if (pcs[pc1].getConditionDescription().indexOf(pType) && pcs[pc1].getConditionStatus().equals(pStatus)) 
				return true;
		}
}
// S11A Certain record type will have the ID of the parent in the ASI or ASIT. Relate the record to its parent. 
// Sample calls (capId.getCustomID(),parentCapID.getCustomID())- ("20161214-00001","BLD16-00019")
function relatebyCapID(childCapID,parentCapID){
	try{
		// get parent capID
		var getCapResult = aa.cap.getCapID(parentCapID);
		if (getCapResult.getSuccess()) {
			var prntCapId = getCapResult.getOutput();
		}else{
			logDebug("Method name: relatebyCapID. Message: Error: Can't get the parent cap." + parentCapID);
			return false;
		}
					
		// get child capID
		var cgetCapResult = aa.cap.getCapID(childCapID);
		if (cgetCapResult.getSuccess()) {
			var chldCapId = cgetCapResult.getOutput();
		}else{
			logDebug("Method name: relatebyCapID. Message: Error: Can't get the child cap." + childCapID);
			return false;
		}

		// relate caps	
		var result = aa.cap.createAppHierarchy(prntCapId,chldCapId); 
		if (result.getSuccess()){
			logDebug("relatebyCapID: Child application successfully linked. ParentID:" + prntCapId.getCustomID() + " . Child" );
		}else{
			logDebug("relatebyCapID: Could not link applications");
			return false;
		}
		
		return true;
	}catch(err){
		logDebug("Method name: relatebyCapID. Message: Error-" + err.message + ". childCapID:" + childCapID);
		return false;
	}
}

function removeInspection(inspectionModel) {
// Modified from INCLUDES_RECORD.
	var removeResult = null;
	var gsiBiz = aa.proxyInvoker.newInstance("com.accela.aa.inspection.inspection.InspectionBusiness").getOutput();
	if (gsiBiz) {
		try {
			removeResult = gsiBiz.removeInspection(inspectionModel);
		} catch (err) {
            logDebug("**WARNING** error removing inspection failed " + err.message);
		}
    }
    return removeResult;
}

function reversePayment() {
	logDebug("hello")
}

function runReportTest(aaReportName) {
	x = "test param"
	currentUserID = "ADMIN";
	setCode = "X";
	var bReport = false;
	var reportName = aaReportName;
	report = aa.reportManager.getReportModelByName(reportName);
	report = report.getOutput();
	var permit = aa.reportManager.hasPermission(reportName, currentUserID);
	if (permit.getOutput().booleanValue()) {
		var parameters = aa.util.newHashMap();
		parameters.put("BatchNumber", setCode);
		//report.setReportParameters(parameters);
		var msg = aa.reportManager.runReport(parameters, report);
		aa.env.setValue("ScriptReturnCode", "0");
		aa.env.setValue("ScriptReturnMessage", msg.getOutput());
	}
}

function scheduleInspection_TPS(inspType) {
    // optional inspector ID.  This function requires dateAdd function
    // DQ - Added Optional 4th parameter inspTime Valid format is HH12:MIAM or AM (SR5110) 
    // DQ - Added Optional 5th parameter inspComm ex. to call without specifying other options params scheduleInspection("Type",5,null,null,"Schedule Comment");
    // 07/10/2020 RS: Modified from INCLUDES_ACCELA_FUNCTION to also identify inspector
    // RS - added Optional 6th parameter itemCap, cap to schedule inspection for
    // RS - added Optional 7th parameter useWorking, make sure it is on a working day
    // RS - added return scheduled Inspection ID.
    var DaysAhead = (arguments.length > 1 && arguments[1] != null ? arguments[1] : 1);
    var inspectorId = (arguments.length > 2 && arguments[2] ? arguments[2] : null);
    var inspTime = (arguments.length > 3 && arguments[3] ? arguments[3] : null);
    var inspComm = (arguments.length > 4 && arguments[4] ? arguments[4] : "Scheduled via Script");
    var itemCap = (arguments.length > 5 && arguments[5] ? arguments[5] : capId);
    var useWorking = (arguments.length > 6 && arguments[6] == true ? true : false);

    // Determine inspectorId & get inspectorObj.
    var iInspector = null;
    if (inspectorId) {
        var iInspector = getInspectorObj(inspectorId);
    }

    if (useWorking) {
        inspDate = dateAdd(null, DaysAhead, true);
        logDebug("inspDate: " + inspDate);
        //scheduleInspectDate(inspType, inspDate, inspectorId, inspTime, inspComm);
        var schedRes = aa.inspection.scheduleInspection(itemCap, iInspector, aa.date.parseDate(inspDate), inspTime, inspType, inspComm);
    } else {
        inspDate = dateAdd(null, DaysAhead);
        //scheduleInspection(inspType, DaysAhead, inspectorId, inspTime, inspComm);
        var schedRes = aa.inspection.scheduleInspection(itemCap, iInspector, aa.date.parseDate(dateAdd(null, DaysAhead)), inspTime, inspType, inspComm);
    }

    var inspId = null;
    if (schedRes.getSuccess()) {
        inspId = schedRes.getOutput();
        logDebug("Successfully scheduled inspection: " + inspType
            + " in " + DaysAhead + " days" + " on " + inspDate
            + (useWorking ? " (working)" : "")
            + (iInspector && iInspector.getGaUserID() ? " to inspector: " : (inspectorId ? " to department: " : ""))
            + (iInspector && iInspector.getFullName() ? iInspector.getFullName() : "")
            + (iInspector && iInspector.getGaUserID() ? ", UserID: " + iInspector.getGaUserID() : "")
            + (inspTime ? ", time: " + inspTime : "")
            + (inspComm ? ", comment: " + inspComm : "")
            + (schedRes ? ", output: " + schedRes.getOutput() : "")
        );
    } else {
        logDebug("**ERROR: scheduling inspection: " + inspType
            + " in " + DaysAhead + " days" + " on " + inspDate
            + (useWorking ? " (working)" : "")
            + (iInspector && iInspector.getGaUserID() ? " to inspector: " : (inspectorId ? " to department: " : ""))
            + (iInspector && iInspector.getFullName() ? iInspector.getFullName() : "")
            + (iInspector && iInspector.getGaUserID() ? ", UserID: " + iInspector.getGaUserID() : "")
            + (inspTime ? ", time: " + inspTime : "")
            + (inspComm ? ", comment: " + inspComm : "")
            + ": " + schedRes.getErrorMessage());
    }
    return inspId;
}

//scheduleMeeting(capId,"PLANNING COMMISSION HEARING",'01/01/2017','02/01/2017');
function scheduleMeeting(capID, meetingType,dtFrom,dtTo)
{
	try
	{
		var hearingBody = null;
		var duration = 60;
		var calendarName = null;
		var dateFrom = aa.date.parseDate(dtFrom); 
		var dateTo = aa.date.parseDate(dtTo);
		var dayOfWeek = null;// 0~6
		var location = null;
		var comments = null;
		var reason = null;
		var result = aa.calendar.getAvailableHearingItem(hearingBody, duration,
		calendarName, dateFrom, dateTo, dayOfWeek, location)
		if(result.getSuccess())
		{
		  var hearingItems = result.getOutput();
		  //aa.print("Items length:" + hearingItems.length);
		  for(var i =0 ; i < hearingItems.length; i++)
		  {
			var hearingItem = hearingItems[i];

			//aa.print("capID:" + capID.getCustomID() + "****\n");
			if(hearingItem.getMeetingType().toUpperCase().equals(meetingType)){
				addAgenda(capID, hearingItem.getMeetingGroupIdString(),hearingItem.getMeetingIdString(),duration,null,"Added via script");
			}
		  }
		}
		else
		{
		  logDebug("Get available hearing failed");
		}
	}catch(err){
		logDebug("Method name: scheduleMeeting. Message: Error-" + err.message + ". CapID:" + capID);
		return false;
	}	
}

function taskCloseAllAdjustBranchtaskExcept(e, t) {
	var n = new Array;
	var r = false;
	if (arguments.length > 2) {
		for (var i = 2; i < arguments.length; i++)
			n.push(arguments[i])
	} else
		r = true;
	var s = aa.workflow.getTasks(capId);
	if (s.getSuccess())
		var o = s.getOutput();
	else {
		logMessage("**ERROR: Failed to get workflow object: " + s.getErrorMessage());
		return false
	}
	var u;
	var a;
	var f;
	var l = aa.date.getCurrentDate();
	var c = " ";
	var h;
	for (i in o) {
		u = o[i];
		h = u.getTaskDescription();
		a = u.getStepNumber();
		if (r) {
			aa.workflow.handleDisposition(capId, a, e, l, c, t, systemUserObj, "B");
			logMessage("Closing Workflow Task " + h + " with status " + e);
			logDebug("Closing Workflow Task " + h + " with status " + e)
		} else {
			if (!exists(h, n)) {
				aa.workflow.handleDisposition(capId, a, e, l, c, t, systemUserObj, "B");
				logMessage("Closing Workflow Task " + h + " with status " + e);
				logDebug("Closing Workflow Task " + h + " with status " + e)
			}
		}
	}
}

function taskCloseAllExcept(pStatus, pComment) {
	// Closes all tasks in CAP with specified status and comment
	// Optional task names to exclude
	// 06SSP-00152
	//
	var taskArray = new Array();
	var closeAll = false;
	if (arguments.length > 2) //Check for task names to exclude
	{
		for (var i = 2; i < arguments.length; i++)
			taskArray.push(arguments[i]);
	} else
		closeAll = true;

	var workflowResult = aa.workflow.getTasks(capId);
	if (workflowResult.getSuccess())
		var wfObj = workflowResult.getOutput();
	else {
		logMessage("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
		return false;
	}

	var fTask;
	var stepnumber;
	var processID;
	var dispositionDate = aa.date.getCurrentDate();
	var wfnote = " ";
	var wftask;

	for (i in wfObj) {
		fTask = wfObj[i];
		wftask = fTask.getTaskDescription();
		stepnumber = fTask.getStepNumber();
		//processID = fTask.getProcessID();
		if (closeAll) {
			aa.workflow.handleDisposition(capId, stepnumber, pStatus, dispositionDate, wfnote, pComment, systemUserObj, "Y");
			logMessage("Closing Workflow Task " + wftask + " with status " + pStatus);
			logDebug("Closing Workflow Task " + wftask + " with status " + pStatus);
		} else {
			if (!exists(wftask, taskArray)) {
				aa.workflow.handleDisposition(capId, stepnumber, pStatus, dispositionDate, wfnote, pComment, systemUserObj, "Y");
				logMessage("Closing Workflow Task " + wftask + " with status " + pStatus);
				logDebug("Closing Workflow Task " + wftask + " with status " + pStatus);
			}
		}
	}
}

// S13 - Given record type workflow task and selected status verify if other statueses in other workflow task in the current record or in another related record are set or not.
function taskHasStatus(capID,wfTask,wfStatus){
	try{
		// get the wF history
		var wfHistoryObj = aa.workflow.getWorkflowHistory(capID, null) ;
		if ( wfHistoryObj.getSuccess()){
			var wfHistory = wfHistoryObj.getOutput() ;
		}
		
		// loop thru workflow and see if given wftask and wfStatus exist
		for ( var i in wfHistory )
		{
			//if match found return true
			if(wfHistory[i].taskDescription.equals(wfTask) &&				
				wfHistory[i].disposition.equals(wfStatus)){
				return true;
			} 
		}
		return false;
	}catch(err){
		logDebug("Method name: taskHasStatus. Message: Error-" + err.message + ". CapID:" + capID);
		return false;
	}
}

function updateASITable_TPS(tableName, keyColNames, targetCapId) {
    // Used to update existing table in targetCapId record based on keyCol column in targetCapId.
    // Will not remove any rows not found in srcCapId record
    // Will add rows found in srcCapId record but not found in targetCapId record
    var srcCapId = (arguments.length > 3 && arguments[3] ? arguments[3] : capId);
    logDebug("Updating ASI " + tableName + " table rows using " + keyColNames.join(",")
        + " for " + (targetCapId ? targetCapId.getCustomID() : targetCapId)
        + " from " + (srcCapId ? srcCapId.getCustomID() : srcCapId));
    var sRows = loadASITable(tableName, srcCapId);
    if (typeof (sRows) != "object") srcRows = null;
    if (sRows && sRows.length > 0) {
        var rowsUpdated = 0;
        var newRows = [];
        var tableUpdated = false;
        var tRows = loadASITable(tableName, targetCapId);
        if (typeof (tRows) != "object") srcRows = null;
        if (tRows && tRows.length > 0) {
            logDebug("Updating " + tableName + " table for " + (targetCapId ? targetCapId.getCustomID() : targetCapId));
            var updatedRows = [];
            for (var tEachRow in tRows) {
                var tRow = tRows[tEachRow];
                for (var sEachRow in sRows) {
                    var sRow = sRows[sEachRow];
                    var keysMatch = true;
                    var keys = [];
                    for (var sColName in keyColNames) {
                        var keyColName = keyColNames[sColName];
                        sColValue = null;
                        if (typeof (sRow[keyColName]) != "undefined") sColValue = sRow[keyColName].toString();
                        tColValue = null;
                        if (typeof (tRow[keyColName]) != "undefined") tColValue = tRow[keyColName].toString();
                        if (tColValue != sColValue) {
                            keysMatch = false;
                            keys.push(keyColName + ":" + tColValue)
                        }
                    }
                    if (keysMatch) {
                        logDebug("Updating Row: " + keys.join(","));
                        for (var i in sRow) {
                            if (typeof (tRow[i]) != "undefined")
                                tRow[i] = sRow[i];
                        }
                        updatedRows.push(sEachRow) //
                        tableUpdated = true;
                    }
                }
            }
            // Add new rows
            for (sEachRow in sRows) {
                tableUpdated = true;
                var sRow = sRows[sEachRow];
                if (exists(sEachRow, updatedRows)) continue; // Ignore updated rows.
                var keys = [];
                for (var sColName in keyColNames) {
                    var keyColName = keyColNames[sColName];
                    sColValue = null;
                    if (typeof (sRow[keyColName]) != "undefined") sColValue = sRow[keyColName].toString();
                    tColValue = null;
                    if (typeof (tRow[keyColName]) != "undefined") tColValue = tRow[keyColName].toString();
                    if (tColValue != sColValue) {
                        keysMatch = false;
                        keys.push(keyColName + ":" + tColValue)
                    }
                }
                logDebug("Adding row: " + keys.join(","));
                tRows.push(sRow);
            }
        } else {
            logDebug("Replacing " + tableName + " table for " + (targetCapId ? targetCapId.getCustomID() : targetCapId));
            tRows = sRows;
            tableUpdated = true;

        }
        if (tableUpdated) {
            removeASITable(tableName, targetCapId);
            addASITable(tableName, tRows, targetCapId);
        }
    } else {
        logDebug(tableName + " table is missing for " + (srcCapId ? srcCapId.getCustomID() : srcCapId));
    }
}

function updateChildAltID(pcapId, ccapId, suffix) {
    /*---------------------------------------------------------------------------------------------------------/
    | Function Intent: 
    | This function is designed to update the AltId (b1permit.b1_alt_id) of an child record (ccapId).
    | The new AltId will be created using the AltId of its parent record (pcapId) plus the suffix variable
    | provided. Finally the end of the new id will be the number of child records of that record type.
    |
    | Example:
    | Parent AltId: 499-12-67872
    | Child AltId: 499-12-67872-ELEC-01
    |   499-12-67872-ELEC-02
    |   499-12-67872-ELEC-03
    |
    | Returns:
    | Outcome  Description   Return Type
    | Success: New AltID of Childrecord AltID String
    | Failure: Error    null null
    |
    | Call Example:
    | updateChildAltID(pcapId, ccapId, "-ELEC-"); 
    |
    | 05/15/2012 - Ewylam
    | Version 1 Created
    |
    | Required paramaters in order:
    | pcapId - capId model of the parent record
    | ccapId - capId model of the child record
    | suffix - string that will be appended to the end of the parent AltId (ie. "-ELEC-")
    |
    /----------------------------------------------------------------------------------------------------------*/
    var p_AltId = pcapId.getCustomID();
    //For Omega record masks we need to remove the existing suffix from the parent AltId
    //p_AltId = p_AltId.substring(0,13);
    var c_AltId = ccapId.getCustomID();
    var c_cap = aa.cap.getCap(ccapId).getOutput();
    var c_appTypeResult = c_cap.getCapType();
    var c_appTypeString = c_appTypeResult.toString();
    var c_appTypeArray = c_appTypeString.split("/");
    var childAppTypeString = (arguments.length > 3 && arguments[3] ? arguments[3] : c_appTypeArray[0] + "/*/" + c_appTypeArray[2] + "/*")

    //Get the number of child records by type provided
    var totChildren = getChildren(childAppTypeString, pcapId);
    if (totChildren === null || totChildren.length === 0) { logDebug("**ERROR: getChildren function found no children"); return null; }
    //Set the numeric suffic of the new AltId number to the actual number of child records that exists for the type.
    var totalFound = totChildren.length;
    var i = 0;

    //When using the clone feature multiple records can be created at the same time. When this happens the AltIds of the
    //children records are not set. To correctly set the AltIds we need to start with the last number and work backwards.
    //This ensures all the new child records recieves a unique AltId.
    for (i = 0; i <= totChildren.length; i++) {
        //Add leading 0 if single digit
        if (totalFound < 10) { totalFound = '0' + totalFound; }

        var newAltId = p_AltId + suffix + totalFound + "";
        var updateResult = aa.cap.updateCapAltID(ccapId, newAltId);
        if (updateResult.getSuccess()) {
            logDebug("Updated child record AltId to " + newAltId + ".");
            break;
        } else {
            if (i == totalFound) {
                logDebug("** ERROR: Failed to update the AltID for " + c_AltId + ". " + updateResult.getErrorType() + " : " + updateResult.getErrorMessage());
                return null;
            }
            //Might be duplicate because of multiple clones, try the next lower number
            totalFound = totChildren.length - (1 + i);
            //Check for negitive. 
            if (totalFound < 0) {
                logDebug("**ERROR: Number used for AltID would be less than 0. Failed to update the AltID for " + c_AltId + ". ");
                return null;
            }
            logDebug("** Attempting the next number: " + totalFound + ".");
        }
    }
    return newAltId;
}

//S17 - In ACA or in AA the parent parent id could be added as ASI field so that the record can be related to its parent.
// validateRecordIDandType("16PA0001","Planning/LandUse/ZoningCase/NA")
function validateRecordIDandType(capID,recordType){
	try{
		// get the capID
		var getCapResult = aa.cap.getCapID(capID);
		if (getCapResult.getSuccess()) {
			var pCapId = getCapResult.getOutput();
		}else{
			return false;
		}
		
		// get the cap object
		var pCap = aa.cap.getCap(pCapId).getOutput(); // Cap object
		var appTypeResult = pCap.getCapType();
		var appTypeString = appTypeResult.toString();
		
		//aa.print("appTypeString:" + appTypeString);
		//aa.print("recordType:" + recordType);
		//check to see if types are equal		
		if(!recordType.toUpperCase().equals(appTypeString.toUpperCase())){
			return false;
		}
		return true;
	}catch(err){
		logDebug("Method name: validateRecordIDandType. Message: Error-" + err.message + ". CapID:" + capID);
		return false;
	}
}

// This function checks if balance is zero, if not checks if there is any payment has been made
function verifyPMTZeroBalance(capID) {
	try{
		var amtFee = 0;
		var amtPaid = 0;
		var blnInvoiced=false;
		
		// get the fee items for given capid
		var feeResult = aa.fee.getFeeItems(capID);
		if (feeResult.getSuccess())
		{ 
			var feeObjArr = feeResult.getOutput(); 
		}
		else
		{ 
			return false;
		}
	
		// loop thru fees			
		for (ff in feeObjArr)
		{
			// check to see if fee item is invoiced. If none of them invoiced return false.
			// if not invoiced skip that record
			
			aa.print("STATUS: " + feeObjArr[ff].getFeeitemStatus());
			if(feeObjArr[ff].getFeeitemStatus().toUpperCase().equals("INVOICED")){
				blnInvoiced=true;
				// sum fee amounts
				amtFee += feeObjArr[ff].getFee();
				
				var pfResult = aa.finance.getPaymentFeeItems(capID, null);
				if (pfResult.getSuccess()) {
					var pfObj = pfResult.getOutput();
					// loop thru all the payments made
					for (ij in pfObj)
						if (feeObjArr[ff].getFeeSeqNbr() == pfObj[ij].getFeeSeqNbr())
							// sum amounts paid
							amtPaid += pfObj[ij].getFeeAllocation()
				}
			}
		}
		
		// If none of the fee items invoiced return false.
		if(!blnInvoiced){
			return false;
		}
		
		// check if balance is zero
		if(amtFee - amtPaid != 0){
			// if balance is not zero check if there is any payment has been made
			if(amtPaid==0){
				return false;
			}
		}
	
		return true;
	}catch(err){
		logDebug("Method name: verifyPMTZeroBalance. Message: Error-" + err.message + ". CapID:" + capID);
		return false;
	}
}

function wasCapStatus() {
	var capStatusArray = arguments.length > 0 && arguments[0]? arguments[0]:capId;
	var itemCap = arguments.length > 1 && arguments[1]? arguments[1]:capId;

	var lastCapStatus = null;
	var capStatuses = [];
	
	var capStatusResult = aa.cap.getStatusHistoryByCap(itemCap, "APPLICATION", null);
	if(!capStatusResult.getSuccess()) { 
		logDebug("ERROR: Failed to get cap status history for CAPID(" + itemCap + "). " + getCapStatus.getErrorMessage());
		return false;
	}

	var capStatuses= capStatusResult.getOutput();
	for (i in capStatuses) {
		var capStatus = capStatuses[i].getStatus();
		var capStatusDate = capStatuses[i].getStatusDate();
		logDebug("Checking " + capStatus + " " + convertDate(capStatusDate) + (capStatusArray? " for " + capStatusArray.join(","):""));
		if (capStatusArray && !exists(capStatus, capStatusArray)) continue;
		logDebug("Found " + capStatus + " " + convertDate(capStatusDate));
		return true;
	}
	
	return false;
}

function wasTaskStatus_TPS(wfstr, wfstat) {
	var useProcess = arguments.length > 2 && arguments[2]? true:false;
	var itemCap = arguments.length > 3 && arguments[3]? arguments[3]:capId;
	var processName = useProcess? arguments[2]:"";
	var wfStatArray = (wfStat && typeof(wfStat) == "string"? [wfStat]:wfStat); // Convert to array
 
	
	var workflowResult = aa.workflow.getHistory(itemCap).getOutput();
	if (!workflowResult.getSuccess()) {
		logDebug("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
		return false;
	}

	var wfObj = workflowResult.getOutput();
	for (var x = 0; x < wfObj.length; x++) {
		if (useProcess && !fTask.getProcessCode().equals(processName)) continue;
		if (wfstr && wfstr != wfObj[x].getTaskDescription()) continue;
		if (wfStatArray && !exists(wfTask,wfObj[x].getTaskDescription(),wfStatArray)) continue;
		return true;
	}
	return false;
}

/*--------START DIGEPLAN EDR CUSTOM FUNCTIONS---------*/
function getAssignedToStaff() // option CapId
{
	var itemCap = capId
	if (arguments.length > 1) itemCap = arguments[1]; // use cap ID specified in args

	var cdScriptObjResult = aa.cap.getCapDetail(itemCap);
	if (!cdScriptObjResult.getSuccess())
		{ 	logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage());
			return false;
		}
	
	var cdScriptObj = cdScriptObjResult.getOutput();

	if (!cdScriptObj)
		{ 	logDebug("**ERROR: No cap detail script object") ;
			return false;
		}
		
	cd = cdScriptObj.getCapDetailModel();
	
	//cd.setCompleteDept(iName.getDeptOfUser());
	var returnValue = cd.getAsgnStaff();
	//cdScriptObj.setCompleteDate(sysDate);
	
	//logDebug("Returning Assigned To Staff value: " + returnValue);
	
	return returnValue; 
}

function edrPlansExist(docGroupArray,docCategoryArray) {
	var edrPlans = false;
	
	var docArray = aa.document.getCapDocumentList(capId,currentUserID).getOutput();
	if(docArray != null && docArray.length > 0) {
		for (d in docArray) if(exists(docArray[d]["docGroup"],docGroupArray) && exists(docArray[d]["docCategory"],docCategoryArray)) edrPlans = true;
	}
	
	return edrPlans;
}

function emailReviewCompleteNotification(ResubmitStatus, ApprovedStatus, docGroupArrayModule) {
    showMessageDefault = showMessage;
    //populate email notification parameters
    var emailSendFrom = "";
    var emailSendTo = "";
    var emailCC = "";
    var emailParameters = aa.util.newHashtable();
    var fileNames = [];

    getRecordParams4Notification(emailParameters);
    getAPOParams4Notification(emailParameters);
    var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
    acaSite = acaSite.substr(0, acaSite.toUpperCase().indexOf("/ADMIN"));
    //getACARecordParam4Notification(emailParameters,acaSite);
    addParameter(emailParameters, "$$acaRecordUrl$$", getACARecordURL(acaSite));
    addParameter(emailParameters, "$$wfComment$$", wfComment);
    addParameter(emailParameters, "$$wfStatus$$", wfStatus);
    addParameter(emailParameters, "$$ShortNotes$$", getShortNotes());

    var applicantEmail = "";
    var assignedTo = getAssignedToStaff();
    var assignedToEmail = "";
    var assignedToFullName = "";
    var contObj = {};
    contObj = getContactArray(capId);
    if (typeof(contObj) == "object") {
        for (co in contObj) {
            if (contObj[co]["contactType"] == "Applicant" && contObj[co]["email"] != null)
                applicantEmail += contObj[co]["email"] + ";";
        }
    }

    addParameter(emailParameters, "$$applicantEmail$$", applicantEmail);

    if (assignedTo != null) {
        assignedToFullName = aa.person.getUser(assignedTo).getOutput().getFirstName() + " " + aa.person.getUser(assignedTo).getOutput().getLastName();
        if (!matches(aa.person.getUser(assignedTo).getOutput().getEmail(), undefined, "", null)) {
            assignedToEmail = aa.person.getUser(assignedTo).getOutput().getEmail();
        }
    }
    addParameter(emailParameters, "$$assignedToFullName$$", assignedToFullName);
    addParameter(emailParameters, "$$assignedToEmail$$", assignedToEmail);

    if (applicantEmail != "") {
        if (exists(wfStatus, ResubmitStatus)) {
			//if (appMatch("eReview/*/*/*"))
			var emailTemplate = "WTUA_CONTACT NOTIFICATION_RESUBMIT";

            var fileNameArray = [];
            var fileNameString = "";
            docArray = aa.document.getCapDocumentList(capId, currentUserID).getOutput();
            if (docArray != null && docArray.length > 0) {
                for (d in docArray) {
                    601
                    if (docArray[d]["fileUpLoadBy"] == digEplanAPIUser && docArray[d]["allowActions"] != null && docArray[d]["allowActions"].indexOf("RESUBMIT") >= 0) { // docArray[d]["docStatus"] == reviewCompleteDocStatus
                        //fileNameArray.push(docArray[d]["fileName"]);
                        getResubmitFileName(docArray[d], fileNameArray);
                    }
                }
            }
            if (fileNameArray.length > 0)
                fileNameString = "Document(s) requiring correction: " + fileNameArray;
				addParameter(emailParameters, "$$correctionFileNames$$", fileNameString);
        }
        if (exists(wfStatus, ApprovedStatus)) {
			//if (appMatch("eReview/*/*/*"))
			var emailTemplate = "WTUA_CONTACT NOTIFICATION_APPROVED";
        }
        sendNotification(emailSendFrom, emailSendTo, emailCC, emailTemplate, emailParameters, fileNames);
    } else {
		if (!appMatch("Building/*/*/*")) {
			if (applicantEmail == "" && assignedToEmail != "") {
				var emailTemplate = "WTUA_INTERNAL NOTIFICATION_REVIEWCOMPLETE";
				sendNotification(emailSendFrom, emailSendTo, emailCC, emailTemplate, emailParameters, fileNames);
				showMessage = true;
				comment("There is no applicant email associated to this permit. Permit Coordinator has been notified via email to contact this applicant directly.");
				showMessage = showMessageDefault;
			}
		}
    }
}

function getResubmitFileName(documentModel,fileNameArray) {
	logDebug(documentModel["fileName"]);
	var parentFileName = "";
	var parentDocSeq = documentModel.getParentSeqNbr();
	var parentDocModel = aa.document.getDocumentByPK(parentDocSeq);
	if(parentDocModel != null && parentDocModel.getOutput() != null) {
		//Get parent document fileName
		parentFileName = parentDocModel.getOutput().getFileName();
		logDebug("<font color='blue'>The original document file name is " + parentFileName + "</font>");
	}
	if (parentFileName != "") fileNameArray.push(parentFileName);
	return fileNameArray;
}

function emailCorrectionsRequiredNotification(wfTask,wfStatus,wfComment) {
		//populate email notification parameters
		var emailSendFrom = "";
		var emailSendTo = "";
		var emailCC = "";
		var emailParameters = aa.util.newHashtable();
		var fileNames = [];		
		
		getRecordParams4Notification(emailParameters);
		getAPOParams4Notification(emailParameters);
		var acaSite = lookup("ACA_CONFIGS","ACA_SITE");
		acaSite = acaSite.substr(0,acaSite.toUpperCase().indexOf("/ADMIN"));
		//getACARecordParam4Notification(emailParameters, acaSite);
		addParameter(emailParameters, "$$acaRecordUrl$$", getACARecordURL(acaSite));
		addParameter(emailParameters, "$$wfComment$$", wfComment);
		addParameter(emailParameters, "$$wfStatus$$", wfStatus);
		addParameter(emailParameters, "$$ShortNotes$$", getShortNotes());

		var applicantEmail = "";
		var assignedTo = currentUserID;
		var assignedToEmail = "";
		var assignedToFullName = "";
		var contObj = {};
		contObj = getContactArray(capId);
		if(typeof(contObj) == "object") {
			for (co in contObj) {
				if(contObj[co]["contactType"] == "Applicant" && contObj[co]["email"] != null) applicantEmail += contObj[co]["email"] + ";";
			}
		}
		
		addParameter(emailParameters,"$$applicantEmail$$",applicantEmail);

		if(assignedTo != null) {
				assignedToFullName = aa.person.getUser(assignedTo).getOutput().getFirstName() + " " + aa.person.getUser(assignedTo).getOutput().getLastName();
				if(!matches(aa.person.getUser(assignedTo).getOutput().getEmail(),undefined,"",null)) {
					assignedToEmail =  aa.person.getUser(assignedTo).getOutput().getEmail();
				}
		}
		addParameter(emailParameters,"$$assignedToFullName$$",assignedToFullName);
		addParameter(emailParameters,"$$assignedToEmail$$",assignedToEmail);

		if(applicantEmail != "") {
			if(appMatch("eReview/*/*/*")) var emailTemplate = "WTUA_CONTACT NOTIFICATION_INTERIM";
			sendNotification(emailSendFrom,emailSendTo,emailCC,emailTemplate,emailParameters,fileNames);
		}
		else {
			if(applicantEmail == "" && assignedToEmail != "") {
			var emailTemplate = "WTUA_INTERNAL NOTIFICATION_INTERIM";
			sendNotification(emailSendFrom,emailSendTo,emailCC,emailTemplate,emailParameters,fileNames);
			showMessage = true;
			comment("There is no applicant email associated to this permit. A notification regarding this workflow task status update has not been sent via email. Please contact this applicant directly.");
			}
		}
}
//05-2020 not using this - be careful of what gets passed into this function - see emailReviewCompleteNotification
function emailReviewConsolidationNotification(wfStatus,revisionStatus,approvedStatus,completeStatus,docGroupArray) {
		showMessageDefault = showMessage;
		//populate email notification parameters
		var emailSendFrom = "";
		var emailSendTo = "";
		var emailCC = "";
		var emailParameters = aa.util.newHashtable();
		var fileNames = [];		
		
		getRecordParams4Notification(emailParameters);
		getAPOParams4Notification(emailParameters);

		var assignedTo = getAssignedToStaff();
		var assignedToEmail = "";
		var assignedToFullName = "";

		if(assignedTo != null) {
				assignedToFullName = aa.person.getUser(assignedTo).getOutput().getFirstName() + " " + aa.person.getUser(assignedTo).getOutput().getLastName();
				if(!matches(aa.person.getUser(assignedTo).getOutput().getEmail(),undefined,"",null)) {
					assignedToEmail =  aa.person.getUser(assignedTo).getOutput().getEmail();
				}
		}
		addParameter(emailParameters,"$$assignedToFullName$$",assignedToFullName);
		addParameter(emailParameters,"$$assignedToEmail$$",assignedToEmail);

		if(assignedToEmail != "") {
		var emailTemplate = "WTUA_INTERNAL NOTIFICATION_REVIEWCONSOLIDATION";
		sendNotification(emailSendFrom,emailSendTo,emailCC,emailTemplate,emailParameters,fileNames);			
		}
}
//05-2020 added for Pending Applicant - for wfComment to work, do not pass it into the function.
function emailPendingApplicantNotification(wfTask, wfStatus) {
    //populate email notification parameters
    var emailSendFrom = "";
    var emailSendTo = "";
    var emailCC = "";
    var emailParameters = aa.util.newHashtable();
    var fileNames = [];

    getRecordParams4Notification(emailParameters);
    getAPOParams4Notification(emailParameters);
    var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
    acaSite = acaSite.substr(0, acaSite.toUpperCase().indexOf("/ADMIN"));
    //getACARecordParam4Notification(emailParameters, acaSite);
    addParameter(emailParameters, "$$acaRecordUrl$$", getACARecordURL(acaSite));
    addParameter(emailParameters, "$$wfComment$$", wfComment);
    addParameter(emailParameters, "$$wfStatus$$", wfStatus);
    addParameter(emailParameters, "$$ShortNotes$$", getShortNotes());

    var applicantEmail = "";
    var assignedTo = currentUserID;
    var assignedToEmail = "";
    var assignedToFullName = "";
    var contObj = {};
    contObj = getContactArray(capId);
    if (typeof(contObj) == "object") {
        for (co in contObj) {
            if (contObj[co]["contactType"] == "Applicant" && contObj[co]["email"] != null)
                applicantEmail += contObj[co]["email"] + ";";
        }
    }

    addParameter(emailParameters, "$$applicantEmail$$", applicantEmail);

    if (assignedTo != null) {
        assignedToFullName = aa.person.getUser(assignedTo).getOutput().getFirstName() + " " + aa.person.getUser(assignedTo).getOutput().getLastName();
        if (!matches(aa.person.getUser(assignedTo).getOutput().getEmail(), undefined, "", null)) {
            assignedToEmail = aa.person.getUser(assignedTo).getOutput().getEmail();
        }
    }
    addParameter(emailParameters, "$$assignedToFullName$$", assignedToFullName);
    addParameter(emailParameters, "$$assignedToEmail$$", assignedToEmail);

    if (applicantEmail != "") {
        //if (appMatch("eReview/*/*/*"))
            var emailTemplate = "WTUA_CONTACT NOTIFICATION_PEND APPL";
        sendNotification(emailSendFrom, emailSendTo, emailCC, emailTemplate, emailParameters, fileNames);
    } else {
        if (applicantEmail == "" && assignedToEmail != "") {
            var emailTemplate = "WTUA_INTERNAL NOTIFICATION_INTERIM";
            sendNotification(emailSendFrom, emailSendTo, emailCC, emailTemplate, emailParameters, fileNames);
            showMessage = true;
            comment("There is no applicant email associated to this permit. A notification regarding this workflow task status update has not been sent via email. Please contact this applicant directly.");
        }
    }
}
function doResubmitActions(documentModel,docGroups,docCategories,routingTask,routingResubmittalStatus,originalDocStatusOnResubmit,parentDocStatusOnResubmit,resubmitDocStatusOnResubmit) {
	afterResubmitParentDocument(originalDocStatusOnResubmit,parentDocStatusOnResubmit,resubmitDocStatusOnResubmit);
	disableToBeResubmit(documentModel["documentNo"]);
        //5-2020 per business updated to not send emails internally, and added Record Status update for ease of Record filtering - db   
        //emailDocResubmitNotification(docGroups,docCategories);
        //updateTask(routingTask,routingResubmittalStatus,"","");
        //updateAppStatus("Revisions Received","Update by Document Upload");
}

function afterResubmitParentDocument(originalDocStatusOnResubmit,parentDocStatusOnResubmit,resubmitDocStatusOnResubmit)
{
	var docModelList = aa.env.getValue("DocumentModelList");
	//var originalDocStatusOnResubmit = "Resubmitted";
	//var parentDocStatusOnResubmit = "Resubmitted";
	//var resubmitDocStatusOnResubmit = "Uploaded";
	var it = docModelList.iterator();
	while(it.hasNext())
	{
		var docModel = it.next();
		if(docModel == null)
		{
			aa.print("docModel is null");
			break;
		}
		//Set resubmit document status as "Uploaded"
		docModel.setDocStatus(resubmitDocStatusOnResubmit);
		var affectResubmitDocNum = aa.document.updateDocument(docModel);
		if(affectResubmitDocNum != null && affectResubmitDocNum.getOutput() != null && affectResubmitDocNum.getOutput() > 0)
		{
			aa.print("The resubmit document status has been set to " + resubmitDocStatusOnResubmit);
		}
/*		//Get all original document associations by resubmit document model.
		var originalDocModel = aa.document.getOriginalDoc(docModel);
		if(originalDocModel != null && originalDocModel.getOutput() != null)
		{
		    //Set original document status as "Resubmitted"
			originalDocModel.getOutput().setDocStatus(originalDocStatusOnResubmit)
			var affectOriginalDocNum = aa.document.updateDocument(originalDocModel.getOutput());
			if(affectOriginalDocNum != null && affectOriginalDocNum.getOutput() != null && affectOriginalDocNum.getOutput() > 0)
			{
				aa.print("The original document status has been set to " + originalDocStatusOnResubmit);
			}
		}
*/		
		//Get parent document associations by resubmit document model.
		var parentDocSeq = docModel.getParentSeqNbr();
		var parentDocModel = aa.document.getDocumentByPK(parentDocSeq);
		if(parentDocModel != null && parentDocModel.getOutput() != null)
		{
		    //Set parent document status as "Resubmitted"
			parentDocModel.getOutput().setDocStatus(parentDocStatusOnResubmit)
			var affectParentDocNum = aa.document.updateDocument(parentDocModel.getOutput());
			if(affectParentDocNum != null && affectParentDocNum.getOutput() != null && affectParentDocNum.getOutput() > 0)
			{
				aa.print("The parent document status has been set to " + parentDocStatusOnResubmit);
			}
		}
	}
}

function disableToBeResubmit(documentID)
{
	//get current document model by documentID
	var adsDocumentModel = aa.document.getDocumentByPK(documentID).getOutput();
	
	if ("RESUBMIT".equals(adsDocumentModel.getCategoryByAction()))
	{
		//get parent seq number
		var checkInDocumentId = adsDocumentModel.getParentSeqNbr();
		if(checkInDocumentId != null || !"".equals(checkInDocumentId))
		{
			//get check-in document by documentID
			var checkInDocument = aa.document.getDocumentByPK(checkInDocumentId).getOutput();
			
			//set original check-in document model's resubmit is false
			checkInDocument.setResubmit(false);
			
			//update original check-in document model
			aa.document.updateDocument(checkInDocument);
		}
	}
}

function emailDocUploadNotification(docGroups,docCategories) {
	var docInfoList = [];
	var docInfoListString = "";
	var newDocModelArr = [];

	newDocModelArr = documentModelArray.toArray();
	
	for (dl in newDocModelArr) {
		if(exists(newDocModelArr[dl]["docGroup"],docGroups) && exists(newDocModelArr[dl]["docCategory"],docCategories) && matches(newDocModelArr[dl]["categoryByAction"],null)) {
			docInfoList.push(" " + newDocModelArr[dl]["docCategory"] + ": " + newDocModelArr[dl]["fileName"]);
		}
	}
	
	if (docInfoList.length >0) {
		//populate email notification parameters
		var emailSendFrom = "";
		var emailSendTo = "";
		var emailCC = "";
		var emailTemplate = "";
		var emailParameters = aa.util.newHashtable();
		var fileNames = [];		
		
		getRecordParams4Notification(emailParameters);
		getAPOParams4Notification(emailParameters);
		var assignedToFullName = "";
		var assignedToEmail = "";
		var assignedTo = getAssignedToStaff();
		if(assignedTo != null) {
				assignedToFullName = aa.person.getUser(assignedTo).getOutput().getFirstName() + " " + aa.person.getUser(assignedTo).getOutput().getLastName();
				if(!matches(aa.person.getUser(assignedTo).getOutput().getEmail(),undefined,"",null)) {
					assignedToEmail =  aa.person.getUser(assignedTo).getOutput().getEmail();
				}	
		}
		addParameter(emailParameters,"$$assignedToFullName$$",assignedToFullName);
		addParameter(emailParameters,"$$assignedToEmail$$",assignedToEmail);
		docInfoListString = docInfoList.toString();
		addParameter(emailParameters,"$$docInfoList$$",docInfoListString);

        //build paramters for DigEplan URL
		var digEplanUrl = lookup("EXTERNAL_DOC_REVIEW","WEB_SERVICE_URL");
		getDigEplanRecordUrl(digEplanUrl);
		getDigEplanRecordUrlParam4Notification(emailParameters,digEplanUrl);


		if(appMatch("eReview/*/*/*")) var emailTemplate = "DUA_INTERNAL NOTIFICATION_UPLOAD";

		sendNotification(emailSendFrom,emailSendTo,emailCC,emailTemplate,emailParameters,fileNames);
	}
}

function emailDocResubmitNotification(docGroups,docCategories) {
	var docInfoList = [];
	var docInfoListString = "";
	var newDocModelArr = [];

	newDocModelArr = documentModelArray.toArray();
	
	for (dl in newDocModelArr) {
		if(exists(newDocModelArr[dl]["docGroup"],docGroups) && exists(newDocModelArr[dl]["docCategory"],docCategories) && matches(newDocModelArr[dl]["categoryByAction"],"RESUBMIT")) {
			docInfoList.push(" " + newDocModelArr[dl]["docCategory"] + ": " + newDocModelArr[dl]["fileName"]);
		}
	}
	
	if (docInfoList.length >0) {
		//populate email notification parameters
		var emailSendFrom = "";
		var emailSendTo = "";
		var emailCC = "";
		var emailTemplate = "";
		var emailParameters = aa.util.newHashtable();
		var fileNames = [];		
		
		getRecordParams4Notification(emailParameters);
		getAPOParams4Notification(emailParameters);
		var assignedToFullName = "";
		var assignedToEmail = "";
		var assignedTo = getAssignedToStaff();
		if(assignedTo != null) {
				assignedToFullName = aa.person.getUser(assignedTo).getOutput().getFirstName() + " " + aa.person.getUser(assignedTo).getOutput().getLastName();
				if(!matches(aa.person.getUser(assignedTo).getOutput().getEmail(),undefined,"",null)) {
					assignedToEmail =  aa.person.getUser(assignedTo).getOutput().getEmail();
				}	
		}
		addParameter(emailParameters,"$$assignedToFullName$$",assignedToFullName);
		addParameter(emailParameters,"$$assignedToEmail$$",assignedToEmail);
		docInfoListString = docInfoList.toString();
		addParameter(emailParameters,"$$docInfoList$$",docInfoListString);
		//build paramters for DigEplan URL
		var digEplanUrl = lookup("EXTERNAL_DOC_REVIEW","WEB_SERVICE_URL");
		getDigEplanRecordUrl(digEplanUrl);
		getDigEplanRecordUrlParam4Notification(emailParameters,digEplanUrl);
		
		if(appMatch("eReview/*/*/*")) emailTemplate = "DUA_INTERNAL NOTIFICATION_RESUBMIT";

		sendNotification(emailSendFrom,emailSendTo,emailCC,emailTemplate,emailParameters,fileNames);
	}
}

function getDigEplanRecordUrl(digEplanUrl) {
	
	var digEplanRecordUrl = "";

   	digEplanRecordUrl = digEplanUrl;   
	digEplanRecordUrl += "" + capId.getCustomID();
	
   	return digEplanRecordUrl;
}

function getDigEplanRecordUrlParam4Notification(params,digEplanUrl) {
	// pass in a hashtable and it will add the additional parameters to the table

	addParameter(params, "$$digEplanRecordUrl$$", getDigEplanRecordUrl(digEplanUrl));
	
	return params;	
}

function synchronizeDocFileNames() {
	docArray = aa.document.getCapDocumentList(capId,currentUserID).getOutput();
	if(docArray != null && docArray.length > 0) {
		for (d in docArray) {
			//logDebug("*Document Name: " + docArray[d].getDocName());
			//logDebug("*File Name: " + docArray[d].getFileName());
			if(docArray[d].getDocName() != docArray[d].getFileName()) {
				var docNameExt = null;
				//logDebug("*-------------*");
				//logDebug("* Document Name: " + docArray[d].getDocName());
				//logDebug("* File Name: " + docArray[d].getFileName());
				
				var fileTypeIndex = docArray[d].getFileName().lastIndexOf(".");
				if(fileTypeIndex>1) var fileExt = docArray[d].getFileName().substring(docArray[d].getFileName().lastIndexOf("."));
				//logDebug("fileExt: " + fileExt);				
				
				var docTypeIndex = docArray[d].getDocName().lastIndexOf(".");
				if(docTypeIndex>1) {
					var docExt = docArray[d].getDocName().substring(docArray[d].getDocName().lastIndexOf("."));
					if(docExt != fileExt) {
						docNameExt = docArray[d].getDocName() + fileExt;
						docArray[d].setDocName(docArray[d].getDocName() + fileExt);
						//logDebug("---UPDATE DOCNAME TO : " + docNameExt);
					} else {
						docNameExt = docArray[d].getDocName();
						//logDebug("----DOCNAME DOESN'T CHANGE : " + docNameExt);
						}
				}
				if(docTypeIndex == -1) {
					docNameExt = docArray[d].getDocName() + fileExt;
					docArray[d].setDocName(docArray[d].getDocName() + fileExt);
					//logDebug(" ---UPDATE DOCNAME TO : " + docNameExt);
				}			

				if(docNameExt != docArray[d].getFileName()){
					logDebug("<font color='blue'>---UPDATE FILE NAME TO: " + docNameExt + "</font>" );
					docArray[d].setFileName(docNameExt);
				}
				docArray[d].setRecStatus("A");
				docArray[d].setSource(getVendor(docArray[d].getSource(), docArray[d].getSourceName()));
				updateDocResult = aa.document.updateDocument(docArray[d]);
			}	
			
		}
	}
}

function updateCheckInDocStatus(documentModel,revisionStatus,approvedStatus,approvedPendingStatus) {
	var docAutoStatus = documentModel["docStatus"]; //logDebug("Original Doc Status: " + docAutoStatus);
	//var docDescription = String(documentModel["docDescription"]); //logDebug("docDescription: " + docDescription);
	var docAutoStatus = getParentDocStatus(documentModel); //logDebug("Parent Doc Status: " + docAutoStatus);
	if(docAutoStatus == revisionStatus) docAutoStatus = revisionStatus;
	if(docAutoStatus == approvedStatus) docAutoStatus = approvedPendingStatus;
    if(docAutoStatus == approvedPendingStatus) docAutoStatus = approvedPendingStatus;
	//logDebug("docAutoStatus: " + docAutoStatus);
	
	if(docAutoStatus != documentModel["docStatus"]) {
		documentModel.setDocStatus(docAutoStatus);
		documentModel.setRecStatus("A");
		documentModel.setSource(getVendor(documentModel.getSource(), documentModel.getSourceName()));
		updateDocResult = aa.document.updateDocument(documentModel);
		logDebug("<font color='blue'>Document Status updated to " + docAutoStatus + "</font>");
	} else {
		logDebug("Document Status not updated.");
	}
	
}

function updateDocPermissionsbyCategory(documentModel,updateCategory) {
	if (documentModel["docCategory"] != updateCategory) {
		documentModel.setDocCategory(updateCategory);
		aa.document.updateDocument(documentModel);
		logDebug("<font color='blue'>Document Category updated to " + updateCategory + "</font>");
	} else {
		logDebug("Document Category not updated.");
	}

}


function getParentDocCategory(documentModel) {
	var parentDocCategory = null;
	var parentDocSeq = documentModel.getParentSeqNbr();
	//logDebug(documentModel.getDocumentNo() + ": " + documentModel.getDocName() + " parent seq # is " + parentDocSeq);
	var parentDocModel = aa.document.getDocumentByPK(parentDocSeq);
	if(parentDocModel != null && parentDocModel.getOutput() != null)
	{
		//Get parent document category
		parentDocCategory = parentDocModel.getOutput().getDocCategory();
		//logDebug(documentModel.getDocumentNo() + ": " + documentModel.getDocName() + " parent category is " + parentDocCategory);
		//logDebug(documentModel.getDocumentNo() + ": " + documentModel.getDocName() + " parent name is " + parentDocModel.getOutput().getDocName());
	}
	return parentDocCategory;
}

function getParentDocStatus(documentModel) {
	var parentDocStatus = null;
	var parentDocSeq = documentModel.getParentSeqNbr();
	//logDebug(documentModel.getDocumentNo() + ": " + documentModel.getDocName() + " parent seq # is " + parentDocSeq);
	var parentDocModel = aa.document.getDocumentByPK(parentDocSeq);
	if(parentDocModel != null && parentDocModel.getOutput() != null)
	{
		//Get parent document status
		parentDocStatus = parentDocModel.getOutput().getDocStatus();
		//logDebug(documentModel.getDocumentNo() + ": " + documentModel.getDocName() + " parent status is " + parentDocStatus);
		//logDebug(documentModel.getDocumentNo() + ": " + documentModel.getDocName() + " parent name is " + parentDocModel.getOutput().getDocName());
	}
	return parentDocStatus;
}

function updateParentDocStatus(documentModel,updateDocStatus) {
	var parentDocModel = null;
	var parentDocSeq = documentModel.getParentSeqNbr();
	//logDebug(documentModel.getDocumentNo() + ": " + documentModel.getDocName() + " parent seq # is " + parentDocSeq);
	var parentDocModel = aa.document.getDocumentByPK(parentDocSeq);
	if(parentDocModel != null && parentDocModel.getOutput() != null)
	{
		logDebug("<font color='blue'>Set Parent Document Status</font>");
		//Set parent document status
		parentDocStatus = parentDocModel.getOutput().setDocStatus(updateDocStatus);
		aa.document.updateDocument(parentDocModel);

	}
}

function checkForPendingReviews(reviewTasksArray,reviewTaskStatusPendingArray) //function checks for all review tasks resulted and/or completed
	{
	var tasksPending = false;
	var workflowResult = aa.workflow.getTasks(capId);
 	if (workflowResult.getSuccess())
  	 	var wfObj = workflowResult.getOutput();
  	else
  	  	{ logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }
	
	for (i in wfObj)
		{
		var fTask = wfObj[i];
 		if (exists(fTask.getTaskDescription().toUpperCase(),reviewTasksArray))
			{
			//logDebug("Workflow Task: " + fTask.getTaskDescription().toUpperCase() + " Active: " + fTask.getActiveFlag() + " Status: " + fTask.getDisposition())
			if(fTask.getActiveFlag() == "Y" && exists(fTask.getDisposition(),reviewTaskStatusPendingArray)) tasksPending = true;
			}		
		}
		return tasksPending;
}

function updatePlanReviewTasks4Resubmittal(reviewTasksArray,taskStatusArray,reviewTaskResubmittalReceivedStatus) {
	var workflowResult = aa.workflow.getTasks(capId);
 	if (workflowResult.getSuccess())
  	 	var wfObj = workflowResult.getOutput();
  	else
  	  	{ logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }
	
	for (i in wfObj) {
		var fTask = wfObj[i];
		if (exists(fTask.getTaskDescription().toUpperCase(),reviewTasksArray) && fTask.getDisposition() != null && exists(fTask.getDisposition().toUpperCase(),taskStatusArray)) {
			if(!isTaskActive(fTask.getTaskDescription())) {activateTask(fTask.getTaskDescription());}
			if(!isTaskStatus(fTask.getTaskDescription(),reviewTaskResubmittalReceivedStatus)) updateTask(fTask.getTaskDescription(),reviewTaskResubmittalReceivedStatus,"Documents Resubmitted","Documents Resubmitted");
		}		
	}
}

function digEplanPreCache(client,capId)
{
	var soapresp = "DigEplan precache did not work";
   
	if(getEnvironment() == "NON-PROD") {
		soapresp = aa.util.httpPost('https://api.pre-prod.digeplan.com/api/precache/folders?product=app&client=' + client + '&originalFolderId=' + capId,'').getOutput();
		logDebug("<font color='green'>Calling PRE-PROD V5 API </font>");
	}
	else {
		soapresp = aa.util.httpPost('https://api.usw.digeplan.com/api/precache/folders?product=app&client=' + client + '&originalFolderId=' + capId,'').getOutput();
		logDebug("<font color='green'>Calling PROD V5 API </font>");
	}
	return soapresp;
}

function getEnvironment() {
                var environment = "";
                var acaSite = lookup("ACA_CONFIGS","ACA_SITE").toUpperCase();
                if(acaSite.indexOf("HTTPS://ACA-PROD.ACCELA.COM/CHESTERFIELD/") == 0) {environment = "PROD";}
					else {environment = "NON-PROD";}

                return environment;
}

function enableToBeResubmit(documentID,docStatusArray)
{
	//get current document model by documentID
	var adsDocumentModel = aa.document.getDocumentByPK(documentID).getOutput();
	
	if (exists(adsDocumentModel.getDocStatus(),docStatusArray))
	{
		//set this doc resubmit
		adsDocumentModel.setResubmit(true);
		adsDocumentModel.setCategoryByAction("CHECK-IN");
		adsDocumentModel.setAllowActions("RESBUMIT;ACA_RESUBMIT");
		adsDocumentModel.setDocStatus("Review Complete-Comments");
			
		//update this document model
		aa.document.updateDocument(adsDocumentModel);
	}
}

function disableResubmit(documentID,docStatusArray)
{
     //get current document model by documentID
     var adsDocumentModel = aa.document.getDocumentByPK(documentID).getOutput();
    
     if (exists(adsDocumentModel.getDocStatus(),docStatusArray))
     {
           //set this doc resubmit
           adsDocumentModel.setResubmit(false);
           //adsDocumentModel.setCategoryByAction("CHECK-IN");
           //adsDocumentModel.setAllowActions("RESBUMIT;ACA_RESUBMIT");
           //adsDocumentModel.setDocStatus("Pending Resubmittal");
               
           //update this document model
        aa.document.updateDocument(adsDocumentModel);
        logDebug("<font color='blue'>Doc RESUBMIT disabled: " + adsDocumentModel["docName"] + "</font>");
     }
}
/*--------END DIGEPLAN EDR CUSTOM FUNCTIONS---------*/
/*--------START NOTIFICATION TEMPLATE FUNCTIONS--------*/
function generateReportSavetoEDMS(reportName,parameters,rModule) 
{
	// Specific to MIS
	var itemCap = capId;
	var capIdStr = String(itemCap.getID1() + "-" + itemCap.getID2() + "-" + itemCap.getID3());
	// var capIdStr = "";
      
    report = aa.reportManager.getReportInfoModelByName(reportName);
    report = report.getOutput();
  
    report.setModule(rModule);
    report.setCapId(capIdStr);

	  // specific to MIS
      report.setReportParameters(parameters);
      var ed1 = report.getEDMSEntityIdModel();
      ed1.setCapId(capIdStr);
      // Needed to determine which record the document is attached
      ed1.setAltId(itemCap.getCustomID());
      // Needed to determine which record the document is attached
      report.setEDMSEntityIdModel(ed1);	

    var permit = aa.reportManager.hasPermission(reportName,currentUserID);

    if(permit.getOutput().booleanValue()) {
       var reportResult = aa.reportManager.getReportResult(report);
     
       if(reportResult) {
	       reportResult = reportResult.getOutput();
	       var reportFile = aa.reportManager.storeReportToDisk(reportResult);
			logMessage("Report Result: "+ reportResult);
	       reportFile = reportFile.getOutput();
	       return reportFile
       } else {
       		logMessage("Unable to run report: "+ reportName + " for Admin" + systemUserObj);
       		return false;
       }
    } else {
         logMessage("No permission to report: "+ reportName + " for Admin" + systemUserObj);
         return false;
    }
}

function getAARecordParam4Notification(params,avUrl) {
	// pass in a hashtable and it will add the additional parameters to the table

	addParameter(params, "$$aaRecordUrl$$", getAARecordUrl(avUrl));
	
	return params;	
}
//db Removed 05-2020 as these did not work - see getACARecordURL 
/*function getACADeepLinkParam4Notification(params,acaUrl,pAppType,pAppTypeAlias,module) {
	// pass in a hashtable and it will add the additional parameters to the table
	addParameter(params, "$$acaDeepLinkUrl$$", getDeepLinkUrl(acaUrl, pAppType, module));
	addParameter(params, "$$acaDeepLinkAppTypeAlias$$", pAppTypeAlias);
	return params;
}
function getDeepLinkUrl(acaUrl, appType, module) {
	var acaDeepLinkUrl = "";
	
	acaDeepLinkUrl = acaUrl + "/Cap/CapApplyDisclaimer.aspx?CAPType=";
	acaDeepLinkUrl += appType;
	acaDeepLinkUrl += "&Module=" + module;
	
	return acaDeepLinkUrl;
}*/
//The one in the INCLUDES_ACCELA_FUNCTIONS and directly above does not work as a deeplink - db 5-2020
function getACARecordURL(acaSite) {
		var acaRecordUrl = "";
		var id1 = capId.ID1;
		var id2 = capId.ID2;
		var id3 = capId.ID3;
		acaRecordUrl = acaSite + "/Cap/CapDetail.aspx?";   
		acaRecordUrl += "Module=" + cap.getCapModel().getModuleName() + "&TabName=" + cap.getCapModel().getModuleName();
		acaRecordUrl += "&capID1=" + id1 + "&capID2=" + id2 + "&capID3=" + id3;
		acaRecordUrl += "&agencyCode=" + aa.getServiceProviderCode();
   	return acaRecordUrl; 
}

function getAPOParams4Notification(params) {
	// pass in a hashtable and it will add the additional parameters to the table
	//Get Address Line Param
    var addressLine = "";
	adResult = aa.address.getPrimaryAddressByCapID(capId,"Y");
	if (adResult.getSuccess()) {
		ad = adResult.getOutput().getAddressModel();
		addressLine = ad.getDisplayAddress();
		}
	addParameter(params, "$$addressLine$$", addressLine);
	//Get Parcel Number Param
	var parcelNumber = "";
	paResult = aa.parcel.getParcelandAttribute(capId,null);
	if (paResult.getSuccess()) {
		Parcels = paResult.getOutput().toArray();
		for (zz in Parcels) {
			if(Parcels[zz].getPrimaryParcelFlag() == "Y") {
				parcelNumber = Parcels[zz].getParcelNumber();
			}			
		}
	}
	addParameter(params,"$$parcelNumber$$",parcelNumber);
	//Get Owner Param
	capOwnerResult = aa.owner.getOwnerByCapId(capId);
	if (capOwnerResult.getSuccess()) {
		owner = capOwnerResult.getOutput();
		for (o in owner) {
			thisOwner = owner[o];
			if (thisOwner.getPrimaryOwner() == "Y") {
				addParameter(params, "$$ownerFullName$$", thisOwner.getOwnerFullName());
				addParameter(params, "$$ownerPhone$$", thisOwner.getPhone());
				break;	
			}
		}
	}
	return params;
}

function getAARecordUrl(avUrl) {	
	var aaRecordUrl = "";
	var id1 = capId.ID1;
 	var id2 = capId.ID2;
 	var id3 = capId.ID3;

   	aaRecordUrl = avUrl + "/portlets/cap/capsummary/CapTabSummary.do?mode=tabSummary";
	aaRecordUrl += "&serviceProviderCodee=" + aa.getServiceProviderCode();	
	aaRecordUrl += "&ID1=" + id1 + "&ID2=" + id2 + "&ID3=" + id3;
	aaRecordUrl += "&requireNotice=YES";
	aaRecordUrl += "&clearForm=clearForm";
	aaRecordUrl += "&module=" + cap.getCapModel().getModuleName();

   	return aaRecordUrl;
}

function addParameter(parameters, key, value)
{
	if(key != null)
	{
		if(value == null)
		{
			value = "";
		}
		parameters.put(key, value);
        aa.print(key + " = " + value);
	}
}

/*--------END NOTIFICATION TEMPLATE FUNCTIONS--------*/



function performCISLookup() {
    itemCap = capId;
    if (arguments.length > 0) itemCap = arguments[0];

    dataServiceURL = lookup("CIS Lookup Service", "dataServiceURL");
    if (dataServiceURL && dataServiceURL != "") {
        var capAddrResult = aa.address.getAddressByCapId(itemCap);
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
            }
        }
        if (addressToUse != null) {
            var stName = addressToUse.getStreetName();
            var stType = addressToUse.getStreetSuffix();
            var stNbr = addressToUse.getHouseNumberStart();
            stName = String(stName).replace(/ /g, "%20");
	        stName = String(stName).replace(/,/g, "%2C");
	        var qString = stName+"|"+stType+"|"+stNbr;
            var postresp = aa.util.httpPost( dataServiceURL.replace("$$DATA$$",qString), "PARAMETERSINURL");
            if (postresp.getSuccess()) {
               var tmpResp = postresp.getOutput();
               logDebug("Response: " + tmpResp);    
               respObj = JSON.parse(tmpResp);
               for (var rIndex in respObj) {
                   thisObj = respObj[rIndex];
                   newRow = fillRow(thisObj);
                   addToASITable("CC-UT-UC", newRow);     
               }
            }
            else {
                logDebug("Error : " + postresp.getErrorMessage());
            }
        }
    }
}

function fillRow(o) {
    r = new Array();
    if (o.CustomerNumber && o.CustomerNumber != "")
        r["Customer Number"] = new asiTableValObj("Customer Number", o.CustomerNumber, "N");
    else
        r["Customer Number"] = new asiTableValObj("Customer Number", "", "N");
    if (o.AccountNumber && o.AccountNumber != "")
        r["Account Number"] = new asiTableValObj("Account Number", o.AccountNumber, "N");
    else
        r["Account Number"] = new asiTableValObj("Account Number", "", "N");
    if (o.Address && o.Address != "")
        r["Address"] = new asiTableValObj("Address", o.Address, "N");
    else
        r["Address"] = new asiTableValObj("Address", "", "N");  
    if (o.Cycle && o.Cycle != "")
        r["Cycle"] = new asiTableValObj("Cycle", o.Cycle, "N");
    else
        r["Cycle"] = new asiTableValObj("Cycle", "", "N");
    if (o.Route && o.Route != "")
        r["Route"] = new asiTableValObj("Route", o.Route, "N");
    else
        r["Route"] = new asiTableValObj("Route", "", "N");    
    if (o.Water && o.Water != "")
        r["Water"] = new asiTableValObj("Water", o.Water, "N");
    else
        r["Water"] = new asiTableValObj("Water", "", "N");    
    if (o.Sewer && o.Sewer != "")
        r["Sewer"] = new asiTableValObj("Sewer", o.Sewer, "N");
    else
        r["Sewer"] = new asiTableValObj("Sewer", "", "N");    
    if (o.Irrigation && o.Irrigation != "")
        r["Irrigation"] = new asiTableValObj("Irrigation", o.Irrigation, "N");
    else
        r["Irrigation"] = new asiTableValObj("Irrigation", "", "N");  
    if (o.Classification && o.Classification != "")
        r["Classification"] = new asiTableValObj("Classification", o.Classification, "N");
    else
        r["Classification"] = new asiTableValObj("Classification", "", "N"); 
    if (o.TenantName && o.TenantName != "")
        r["Tenant Name"] = new asiTableValObj("Tenant Name", o.TenantName, "N");
    else
        r["Tenant Name"] = new asiTableValObj("Tenant Name", "", "N");      
    if (o.TenantMailing && o.TenantMailing != "")
        r["Tenant Mailing"] = new asiTableValObj("Tenant Mailing", o.TenantMailing, "N");
    else
        r["Tenant Mailing"] = new asiTableValObj("Tenant Mailing", "", "N"); 
    if (o.OwnerAddress && o.OwnerAddress != "")
        r["Owner  ddress"] = new asiTableValObj("Owner Address", o.OwnerAddress, "N");
    else
        r["Owner Address"] = new asiTableValObj("Owner Address", "", "N");      
    if (o.WaterService && o.WaterService != "")
        r["Water Service"] = new asiTableValObj("Water Service", o.WaterService, "N");
    else
        r["Water Service"] = new asiTableValObj("Water Service", "", "N");  
    return r;                    

}
function soapRespObj(){
    this.isErr = false; //true if soap Error
    this.respObj = null; //response object
    this.errorMessage = ""; //should be popualted if true;
};

function rowObj(rObj) {
    this.accountNumber = rObj.a::AccountNumber.toString();
    this.address = rObj.a::Address.toString();
    this.classification = rObj.a::Classification.toString();
    this.customerNumber = rObj.a::CustomerNumber.toString();
    this.cycle = rObj.a::Cycle.toString();
    this.irrigation =  rObj.a::Irrigation.toString();
    this.route =  rObj.a::Route.toString();
    this.sewer =  rObj.a::Sewer.toString();
    this.water =  rObj.a::Water.toString();
}

function schedulePendingInspection(iType,DateToSched)
{
	var itmResult = aa.inspection.getInspections(capId)
	var itmArray = itmResult.getOutput();
	
	for (thisItm in itmArray)
		{
			var it = itmArray[thisItm];
			if(it.getInspectionType() == iType && it.getInspectionStatus() == "Pending" && it.getScheduledDate() == null)
			{
			it.setScheduledDate(aa.date.parseDate(DateToSched))
			aa.inspection.editInspection(it);
			}
		}
}

function checkinspectionstatus(iType,status)
{
	var check = "false";
	
	var itmResult = aa.inspection.getInspections(capId)
	var itmArray = itmResult.getOutput();
	
	for (thisItm in itmArray)
		{
			var it = itmArray[thisItm];
			if(it.getInspectionType() == iType && it.getInspectionStatus() == status)
			{
			check = "true";
            return check
			}
		}
	
	return check
}

function updatereflp(licenseNbr,Salutation,BirthDate,PostOfficeBox)
{
   if(Salutation != null && Salutation != ""){var SAL = Salutation;} else {var SAL = "";}
   if(BirthDate != null && BirthDate != ""){var BD = BirthDate;} else {var BD = "";}
   if(PostOfficeBox != null && PostOfficeBox != ""){var PO = PostOfficeBox;} else {var PO = "";}

   var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext").getOutput();
   var ds = initialContext.lookup("java:/CHESTERFIELD"); 
   var conn = ds.getConnection(); 
   var getSQL = "UPDATE RSTATE_LIC SET L1_SALUTATION = ?, L1_BIRTH_DATE = ?, L1_POST_OFFICE_BOX = ? WHERE SERV_PROV_CODE = 'CHESTERFIELD' AND LIC_NBR = ?";
   var sSelect = conn.prepareStatement(getSQL);
	sSelect.setString(1, SAL);
	sSelect.setString(2, BD);
	sSelect.setString(3, PO);
	sSelect.setString(4, licenseNbr);

   var result = sSelect.executeUpdate();
	logDebug( "**Update Result: " + result );      
	conn.close();
   return result;
}
function invokeDPOR(licNbr,token,serviceURL){
   var respObj = new soapRespObj();
   
   //Set Namespaces and SOAP Envelope
   var soapenv = new Namespace("http://schemas.xmlsoap.org/soap/envelope/");
   var urn = new Namespace("urn:VadporLicLkpService");
   var licSearch = <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:VadporLicLkpService"><soapenv:Header/><soapenv:Body><urn:searchLicense><clientIp>10.111.18.13</clientIp><licNbr/><name/><addr/><board/><clntCde/><token/></urn:searchLicense></soapenv:Body></soapenv:Envelope>;
   
   licSearch.soapenv::Body.urn::searchLicense.licNbr = licNbr;
   licSearch.soapenv::Body.urn::searchLicense.token = token;
   
   //make the Web Service Call returns a success or throws http500 if no license found
   var httpReq = aa.util.httpPostToSoapWebService(serviceURL, licSearch.toString(), "", "", "");
   if(httpReq.getSuccess()){
				  var tmpResp = httpReq.getOutput();
				  tmpResp = tmpResp.replace('<?xml version="1.0" encoding="UTF-8"?>',"");
				  tmpResp = tmpResp.replace("&","&");
				  
				  eval("var httpResp = " + tmpResp.toString() + ";"); //Eval it as XML
				  
				  if(httpResp.soapenv::Body.soapenv::Fault.toString() != ""){
								 //Web Service SOAP Error
								 respObj.isErr = true;
								 respObj.errorMessage = httpResp.soapenv::Body.soapenv::Fault.detail.fault.errorMessage.toString();
				  }
				  else if (httpResp.soapenv::Body.urn::searchLicenseResponse.searchLicenseReturn.toString() == ""){
								 respObj.isErr = true;
								 respObj.errorMessage = "License Not Found";
				  }
				  else{
								 //Web Service OK populated DPOR Object                                          
								 var tmpObj = httpResp.soapenv::Body.urn::searchLicenseResponse.searchLicenseReturn.item;
								 var licObj = new dporObj(tmpObj);
								 respObj.respObj = licObj;
				  }
   }
   else{
				  respObj.isErr = true;
				  respObj.errorMessage = "License Not Found";
   }
   
   return respObj;
};
 
/**
* Creates SOAPResponsObject that is returned by DPOR Interface
*/
function soapRespObj(){
   this.isErr = false; //true if soap Error
   this.respObj = null; //response object
   this.errorMessage = ""; //should be popualted if true;
};
 
/**
* Reads the SOAP response from DPOR
* @param {XMLDocument} lpObj
* @return {dporObject}
*/
function dporObj(lpObj){
               
   this.licNbr = lpObj.licNbr.toString();
   this.fName = lpObj.addr.firstNme.toString();
   //this.fName = lpObj.addr.firstNme.toString();
   this.mName = lpObj.addr.middleNme.toString();
   this.lName = lpObj.addr.lastNme.toString();
   this.entTypCde=lpObj.entTypCde.toString();
   this.boardNme=lpObj.boardNme.toString();
   this.busName = lpObj.addr.keyNme.toString();
   this.DBATradeName=lpObj.addr.dba.toString();
   var amp = new RegExp("&", "g");
   this.busName = this.busName.replace(amp,"&");
   this.address1 = (lpObj.addr.strAddrNbr.toString() + " " + lpObj.addr.addrLine1.toString()).trim();
   this.address2 = lpObj.addr.addrLine2.toString();
   this.city = lpObj.addr.addrCty.toString();
   this.state = lpObj.addr.stCde.toString();
   this.zip = lpObj.addr.addrZip.toString().replace("-","");
   if(this.zip.length > 5){
				  this.zip = this.zip.substring(0,5);
   }
   this.issueDate = getFormatedDate(lpObj.origDte.toString());
   this.expireDate = getFormatedDate(lpObj.exprDte.toString());
   this.licStatus = lpObj.licStaDesc.toString();
   this.rankDesc=lpObj.rankDesc.toString();
   this.rank =  lpObj.rankCde.toString();
   this.clntNme = lpObj.clntNme.toString();
   this.codes = new Array();
   //Build comments for display purposes
   this.comments = "";
   for (x in lpObj.mdfs.item){
				  this.comments += "\n" + lpObj.mdfs.item[x].modLngDesc.toString();
				  this.codes.push(lpObj.mdfs.item[x].modCde.toString());
   }
   
   return this;
};
 
function getFormatedDate(date) {
   if(date==null && date=="")
				  return "";
   var today = new Date(date);
   var dd = today.getDate();
   var mm = today.getMonth() + 1;
   var yy = today.getFullYear();
   var formatedDate = mm + '/' + dd + '/' + yy;
   return formatedDate;
}