// This function checks if balance is zero, if not checks if there is any payment has been made
function verifyPMTZeroBalance(capID) {
	try{
		var amtFee = 0;
		var amtPaid = 0;
		var blnInvoiced=false;
		
		// get the fee items for given capid
		var feeResult = aa.fee.getFeeItems(capID);
		if (feeResult.getSuccess())
		{ 
			var feeObjArr = feeResult.getOutput(); 
		}
		else
		{ 
			return false;
		}
	
		// loop thru fees			
		for (ff in feeObjArr)
		{
			// check to see if fee item is invoiced. If none of them invoiced return false.
			// if not invoiced skip that record
			
			aa.print("STATUS: " + feeObjArr[ff].getFeeitemStatus());
			if(feeObjArr[ff].getFeeitemStatus().toUpperCase().equals("INVOICED")){
				blnInvoiced=true;
				// sum fee amounts
				amtFee += feeObjArr[ff].getFee();
				
				var pfResult = aa.finance.getPaymentFeeItems(capID, null);
				if (pfResult.getSuccess()) {
					var pfObj = pfResult.getOutput();
					// loop thru all the payments made
					for (ij in pfObj)
						if (feeObjArr[ff].getFeeSeqNbr() == pfObj[ij].getFeeSeqNbr())
							// sum amounts paid
							amtPaid += pfObj[ij].getFeeAllocation()
				}
			}
		}
		
		// If none of the fee items invoiced return false.
		if(!blnInvoiced){
			return false;
		}
		
		// check if balance is zero
		if(amtFee - amtPaid != 0){
			// if balance is not zero check if there is any payment has been made
			if(amtPaid==0){
				return false;
			}
		}
	
		return true;
	}catch(err){
		logDebug("Method name: verifyPMTZeroBalance. Message: Error-" + err.message + ". CapID:" + capID);
		return false;
	}
}
