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
