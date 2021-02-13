try {
	if (!publicUser) {
	//create parent relationships - any and all - firstParentName is 1st pageflow, secondParentName is in ASI
		if (AInfo["Inquiry Case Number"] != null) {
			var firstParentName = AInfo["Inquiry Case Number"];
			addParent(firstParentName);
		}
		else if (AInfo["Zoning Opinion Number"] != null) {
			var firstParentName = AInfo["Zoning Opinion Number"];
			addParent(firstParentName);
		}
		if (AInfo["Case Number"] != null) {
			var secondParentName = AInfo["Case Number"]
			addParent(secondParentName);
		}
		else if (AInfo["Historic Case Number"] != null) {
			var secondParentName = AInfo["Historic Case Number"]
			addParent(secondParentName);
		}
		else if (AInfo["Previous Case Number (if applicable)"] != null) {
			var secondParentName = AInfo["Previous Case Number (if applicable)"]
			addParent(secondParentName);
		}
		else if (AInfo["Previous case number"] != null) {
			var secondParentName = AInfo["Previous case number"]
			addParent(secondParentName);
		}
		else if (AInfo["Related case number"] != null) {
			var secondParentName = AInfo["Related case number"]
			addParent(secondParentName);
		}
		else if (AInfo["Related Case Number"] != null) {
			var secondParentName = AInfo["Related Case Number"]
			addParent(secondParentName);
		}
	}
// Use Agency Sign Posting Number sequence to keep track of Sign Postings for Selectron.
// 10P Custom Field Sign Posting Number should be auto populated with a number of 100 - 999.  The number must not be a duplicate number for another active record.
// The sign post number is a number is related to the IVR prompt that will be recorded so that callers may get case information from calling the number.
	var fieldName = "Sign Posting Number";
	if ((AInfo[fieldName]) != "undefined") {
		//AInfo[fieldName] = getNextSequence(seqName);
		AInfo[fieldName] = generateSignPostingNumber(fieldName);
		logDebug(fieldName + ": " + AInfo[fieldName]);
		editAppSpecific(fieldName, AInfo[fieldName]);
	}
	
	//07-2020 Boucher 40p
	if (AInfo['Submittal Count'] == null) {
		editAppSpecific('Submittal Count',1);
	}
	
	//10-2020 Boucher 105aca - 11/2020 added record type filters
	var addrArray = [];
	loadAddressAttributes(addrArray);
	var TechRev = addrArray["AddressAttribute.County"];
	
	if (TechRev != null) {
		if (appMatch('*/SitePlan/*/*') || appMatch('*/*/ZoningCase/*')) {
			addStdCondition('Economic Development','Eligible for Technology Zone Incentive Program');
			email('techzone@chesterfieldbusiness.com','noreply@chesterfield.gov','Record: ' + capId.getCustomID() + ' submitted in the Tech Zone','Date: ' + fileDate + ' For Record Type: ' + appTypeAlias);
		}
	}
} catch (err) {
		logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}

//Add Planning/LandUse/ManufacturedHomes/NA Fee-Removed on 1/7/2021 and added to WTUA Application Submittal - Ready for Payment
//	if (appMatch("Planning/LandUse/ManufacturedHomes/NA")){
//		addFee("MANUFACTURED","CC-PLANNING","FINAL",1,"Y");
//	}
//Add Planning/LandUse/AdminVariance/NA Fee-Removed on 1/7/2021 and added to WTUA Application Submittal - Ready for Payment
//	if (appMatch("Planning/LandUse/AdminVariance/NA")){
//		addFee("VARIANCEADM","CC-PLANNING","FINAL",1,"Y");
//	}
//Add Planning/LandUse/Variance/NA Fee-Removed on 1/7/2021 and added to WTUA Application Submittal - Ready for Payment
//	if (appMatch("Planning/LandUse/Variance/NA")){
//		addFee("VARIANCEBZA","CC-PLANNING","FINAL",1,"Y");
//	}
//Add Planning/LandUse/Appeal/NA Fee-Removed on 1/7/2021 and added to WTUA Application Submittal - Ready for Paymen
//	if (appMatch("Planning/LandUse/Appeal/NA")){
//		addFee("APPEAL","CC-PLANNING","FINAL",1,"Y");
//	}
//Add Planning/LandUse/WrittenDetermination/NA Fee-Removed on 1/7/2021 and added to WTUA Application Submittal - Ready for Payment
//	if (appMatch("Planning/LandUse/WrittenDetermination/NA")){
//		addFee("WRITTEN","CC-PLANNING","FINAL",1,"Y");
//	}	
//Add Planning/LandUse/RPAException/NA Fee-Removed on 1/7/2021 and added to WTUA Application Submittal - Ready for Payment
//	if (!publicUser && appMatch("Planning/LandUse/RPAException/NA")){
//		addFee("RPAEXCEPTION","CC-PLANNING","FINAL",1,"N");
//		addFee("RPAEXCEPTOTH","CC-PLANNING","FINAL",1,"N");
//	}

// Alternative scripting for the Sign Posting:  Initiating Record Types:
//  Planning/LandUse/ManufacturedHomes/NA or Planning/LandUse/RPAException/NA or Planning/LandUse/Variance/*/* or Planning/LandUse/AdminVariance/* or */LandUse/SpecialExceptions/* or 
//  Planning/Subdivision/ExceptiontoPreliminary/NA or Planning/Subdivision/Preliminary/NA or Planning/SitePlan/Schematics/NA or Planning/SitePlan/Major/NA or Planning/LandUse/HistoricPreservation/NA or
//  Planning/LandUse/SubstantialAccord/NA or Planning/LandUse/Utilities Waiver/NA or Planning/LandUse/ZoningCase/NA
//var seqName = null;
//if (appMatch("Planning/*/*/*") || appMatch("Planning/LandUse/RPAException/NA") || appMatch("Planning/LandUse/Appeal/NA")) {
//	seqName = "Sign Posting Number";
//} else if (appMatch("Planning/LandUse/*/*") 
//	&& exists(appTypeArray[2], ["Variance", "AdminVariance", "SpecialException", "HistoricPreservation","SubstantialAccord","Utilities Waiver","ZoningCase"])) {
//	seqName = "Sign Posting Number";
//} else if (appMatch("Planning/Subdivision/ExceptiontoPreliminary/NA") || appMatch("Planning/Subdivision/Preliminary/NA") || appMatch("Planning/Subdivision/OverallConceptualPlan/NA")
//			|| appMatch("Planning/Subdivision/ConstructionPlan/NA")) {
//	seqName = "Sign Posting Number";
//} else if (appMatch("Planning/SitePlan/Schematics/NA") || appMatch("Planning/SitePlan/Major/NA")) {
//	seqName = "Sign Posting Number";
//}