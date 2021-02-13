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
