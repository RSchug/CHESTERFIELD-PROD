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
