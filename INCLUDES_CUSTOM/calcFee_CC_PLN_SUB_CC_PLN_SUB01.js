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
