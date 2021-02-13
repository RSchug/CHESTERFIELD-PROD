/**
 * Calculates the fee CC-BLD-CV.CC-BLD-CV-03
 * The actual construction permit cost for Esc and Elev are covered through the 
 * Bldg and Mech auxiliary permits. This is the annual certificate for operation 
 * after construction. Add up the floors in the ASIT (list of equipments) 
 * only for escalator equipment type
 * $48 per floor travelled $48.00 ****
 * 
 * @return null
 */
function calcFee_CC_BLD_CV_CC_BLD_CV_03() {

	//fee variables
	var fcode = "CC-BLD-CV-03";
	var fsched = "CC-BLD-CV";
	var fperiod = "FINAL";
	var fqty = 48.00;
	var finvoice = "N";

    try {
        // get the ASI field needed for the fee calculation.
        var tblName = "CC-BLD-CV-EL";
        var totalFloorsTraveled = 0;

        var equipmentArray = loadASITable(tblName);

        if (!equipmentArray) {
            logDebug("Can't find ASI Table: " + tblName);
            return null;
        }

        for (e in equipmentArray) {
            var equipment = equipmentArray[e];

            if (equipment.Type.fieldValue.toUpperCase().equals("ESCALATOR")) {
                var count = parseInt(equipment["Floors Travelled"].fieldValue);
                totalFloorsTraveled += count;
            }
        }

        // calculation code here.
        if (totalFloorsTraveled == 0) {
            logDebug("No escalators with floors travelled found. Can't assess fee " + fsched + "." + fcode);
            return null;
        } else {
            fqty = fqty * totalFloorsTraveled;
            logDebug("Total floors travelled found: " + totalFloorsTraveled);
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
