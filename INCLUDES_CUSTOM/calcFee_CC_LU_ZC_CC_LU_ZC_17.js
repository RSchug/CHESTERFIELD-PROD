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
