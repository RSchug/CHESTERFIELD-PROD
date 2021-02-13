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
