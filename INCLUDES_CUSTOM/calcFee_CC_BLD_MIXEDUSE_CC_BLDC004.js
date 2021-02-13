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
