function parcelHasCondition_TPS(pType, pStatus) {
	// for the Parcel Conditions, checks all parcels, and if any have an Applied Conditions with the record name in it, returns true
	var hasCond = false;
	var capParcelResult = aa.parcel.getParcelandAttribute(capId, null);
	if (!capParcelResult.getSuccess()) { logDebug("**WARNING: error getting cap parcels : " + capParcelResult.getErrorMessage()); return false }

	var Parcels = capParcelResult.getOutput().toArray();
	for (var zz in Parcels) {
		var pcResult = aa.parcelCondition.getParcelConditions(Parcels[zz].getParcelNumber());
		if (!pcResult.getSuccess()) { logDebug("**WARNING: error getting parcel conditions : " + pcResult.getErrorMessage()); return false }
		pcs = pcResult.getOutput();
		for (pc1 in pcs) {
			if (pcs[pc1].getConditionDescription().indexOf(pType) >= 0 && pcs[pc1].getConditionStatus().equals(pStatus)) {
				logDebug("On parcel: " + Parcels[zz].getParcelNumber()
					+ " found condition Description: " + pcs[pc1].getConditionDescription()
					+ (pcs[pc1].getConditionComment() ? ", Comment: " + pcs[pc1].getConditionComment() : "")
					+ (pcs[pc1].getConditionStatus() ? ", Status: " + pcs[pc1].getConditionStatus() : "")
				);
				var hasCond = true;
			}

		}
	}
	return hasCond;
}
