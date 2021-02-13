function loadXAPOParcelAttributesTPS(thisArr) {
	try {
		// Modified version of the loadParcelAttributesTPS()
		// Returns an associative array of Parcel Attributes and XAPO data
		// Optional second parameter, parcel number to load from
		// If no parcel is passed, function is using the ParcelValidatedNumber variable defined in the "BEGIN Event Specific Variables" list in ApplicationSubmitBefore

		var parcelNum = ParcelValidatedNumber;

		if (arguments.length == 2)
			parcelNum = arguments[1]; // use parcel number specified in args

		var fParcelObj = null;
		var parcelResult = aa.parcel.getParceListForAdmin(parcelNum, null, null, null, null, null, null, null, null, null);

		if (!parcelResult.getSuccess())
			logDebug("**ERROR: Failed to get Parcel object: " + parcelResult.getErrorType() + ":" + parcelResult.getErrorMessage());
		else
				var fParcelObj = parcelResult.getOutput()[0];
		var fParcelModel = fParcelObj.parcelModel;
		var parcelArea = 0;
		parcelArea += fParcelModel.getParcelArea();
		var parcelAttrObj = fParcelModel.getParcelAttribute().toArray();

		for (z in parcelAttrObj)
			thisArr["ParcelAttribute." + parcelAttrObj[z].getB1AttributeLabel()] = parcelAttrObj[z].getValue();

		// Explicitly load some standard values
		thisArr["ParcelAttribute.Block"] = fParcelModel.getBlock();
		thisArr["ParcelAttribute.Book"] = fParcelModel.getBook();
		thisArr["ParcelAttribute.CensusTract"] = fParcelModel.getCensusTract();
		thisArr["ParcelAttribute.CouncilDistrict"] = fParcelModel.getCouncilDistrict();
		thisArr["ParcelAttribute.ExemptValue"] = fParcelModel.getExemptValue();
		thisArr["ParcelAttribute.ImprovedValue"] = fParcelModel.getImprovedValue();
		thisArr["ParcelAttribute.InspectionDistrict"] = fParcelModel.getInspectionDistrict();
		thisArr["ParcelAttribute.LandValue"] = fParcelModel.getLandValue();
		thisArr["ParcelAttribute.LegalDesc"] = fParcelModel.getLegalDesc();
		thisArr["ParcelAttribute.Lot"] = fParcelModel.getLot();
		thisArr["ParcelAttribute.MapNo"] = fParcelModel.getMapNo();
		thisArr["ParcelAttribute.MapRef"] = fParcelModel.getMapRef();
		thisArr["ParcelAttribute.ParcelStatus"] = fParcelModel.getParcelStatus();
		thisArr["ParcelAttribute.SupervisorDistrict"] = fParcelModel.getSupervisorDistrict();
		thisArr["ParcelAttribute.Tract"] = fParcelModel.getTract();
		thisArr["ParcelAttribute.PlanArea"] = fParcelModel.getPlanArea();
	} catch (err) {
		logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
	}
}