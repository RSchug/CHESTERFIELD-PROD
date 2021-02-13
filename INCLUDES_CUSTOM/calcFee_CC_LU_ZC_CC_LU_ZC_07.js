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
