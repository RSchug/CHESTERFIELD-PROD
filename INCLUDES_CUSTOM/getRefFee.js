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
