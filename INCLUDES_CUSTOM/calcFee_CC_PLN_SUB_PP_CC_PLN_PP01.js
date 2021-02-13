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
