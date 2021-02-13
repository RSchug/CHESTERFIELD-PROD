/*------------------------------------------------------------------------------------------------------/
| SVN $Id:  EB_Check_For_Parcel.js
| Program : EB_Check_For_Parcel.js
| Usage   : Expression Builder Script that will validate a Tax ID to the map service
| Client  : Chesterfield County, VA
| Notes   : Expression builder script to be used on ASIT portlet.  Execute on the ASIT field
/------------------------------------------------------------------------------------------------------*/

var msg = "";
var aa = expression.getScriptRoot();
var licCap = null;
var licObj = expression.getValue("ASIT::CC-LU-TPA::Tax ID");
var thisForm = expression.getValue("ASIT::CC-LU-TPA::FORM");
var theAddress = expression.getValue("ASIT::CC-LU-TPA::Base Address");
var theAcres = expression.getValue("ASIT::CC-LU-TPA::Parcel Acreage");

var servProvCode=expression.getValue("$$servProvCode$$").value;
var perid1=expression.getValue("$$capID1$$").value;
var perid2=expression.getValue("$$capID2$$").value;
var perid3=expression.getValue("$$capID3$$").value;

var capId = aa.cap.getCap(perid1,perid2,perid3).getOutput().getCapID();
var totalRowCount = expression.getTotalRowCount();

for(var rowIndex=0; rowIndex<totalRowCount; rowIndex++){
	licObj=expression.getValue(rowIndex, "ASIT::CC-LU-TPA::Tax ID");
	theAddress = expression.getValue(rowIndex, "ASIT::CC-LU-TPA::Base Address");
	theAcres = expression.getValue(rowIndex, "ASIT::CC-LU-TPA::Parcel Acreage");
	var ParcNum = licObj.value;
	var parcelResult = aa.parcel.getParceListForAdmin(ParcNum, null, null, null, null, null, null, null, null, null);
	if (!parcelResult.getSuccess()) { 
		licObj.message="Not a valid Parcel number";
		expression.setReturn(rowIndex,licObj);
		expression.setReturn(rowIndex,theAddress);
		expression.setReturn(rowIndex,theAcres);
	} else {
		var parcels = parcelResult.getOutput();
		for (pp in parcels) {
			fParcelObj  = parcels[pp];
			break;
		}
		var fParcelModel = fParcelObj.parcelModel;
		var parcelArea = 0;
		parcelArea += fParcelModel.getParcelArea();
		var parcelAttrObj = fParcelModel.getParcelAttribute().toArray();

		for (z in parcelAttrObj) {
			theAddress.value = fParcelModel.getSubdivision();
			theAcres.value = Number(fParcelModel.getParcelArea());
		}
		expression.setReturn(rowIndex,theAddress);
		expression.setReturn(rowIndex,theAcres);
	}
}