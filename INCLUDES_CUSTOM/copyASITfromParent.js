// S11C Find the related parent of the given record type and copy the given ASIT rows from the parent to the given ASIT rows in the current cap.
function copyASITfromParent(childCapID,parentRecordType,childASITSubGrpfldNm,parentASITSubGrpfldNm){
	try{
		// get related parent
		pCapID = getRelatedParentCap(childCapID, parentRecordType);
		
		if(pCapID==null){
			logDebug("Method name: copyASITfromParent. Error: Parent capID is missing. childCapID:" + childCapID);
			return false;
		}
		
		//aa.print("pCapID:" + pCapID);
		// split it by '-'
		capArr=pCapID.toString().split("-");
		
		// get parent capID
		var getCapResult = aa.cap.getCapID(capArr[0],capArr[1],capArr[2]);
		if (getCapResult.getSuccess()) {
			var prntCapId = getCapResult.getOutput();
		}else{
			logDebug("Method name: copyASITfromParent. Message: Error: Can't get the parent cap." + pCapID);
			return false;
		}
		
		// get asit
		var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(prntCapId).getOutput();
		var ta = gm.getTablesArray()
		var tai = ta.iterator();

		// loop thru tables
		while (tai.hasNext())
		{
			var tsm = tai.next();

			var tempObject = new Array();
			var tempArray = new Array();
			var tn = tsm.getTableName();
			var tblName=tn;
			//logDebug("Table Name+" + tn);
			var numrows = 0;
			//tn = String(tn).replace(/[^a-zA-Z0-9]+/g,'');

			//if (!isNaN(tn.substring(0,1))) tn = "TBL" + tn  // prepend with TBL if it starts with a number

			if (!tsm.rowIndex.isEmpty())
			{
		  
				var tsmfldi = tsm.getTableField().iterator();
				var tsmcoli = tsm.getColumns().iterator();
				var readOnlyi = tsm.getAppSpecificTableModel().getReadonlyField().iterator(); // get Readonly filed
				var numrows = 1;

				while (tsmfldi.hasNext())  // cycle through fields
				{
					if (!tsmcoli.hasNext())  // cycle through columns
					{
						var tsmcoli = tsm.getColumns().iterator();
						tempArray.push(tempObject);  // end of record
						var tempObject = new Array();  // clear the temp obj
						numrows++;
					}
					var tcol = tsmcoli.next();
					var tval = tsmfldi.next();
					var readOnly = 'N';
					if (readOnlyi.hasNext()) {
						readOnly = readOnlyi.next();
					}
					var fieldInfo = new asiTableValObj(tcol.getColumnName(), tval, readOnly);
					tempObject[tcol.getColumnName()] = fieldInfo;
					//tempObject[tcol.getColumnName()] = tval;
				}
				tempArray.push(tempObject);  // end of record
			}

			//var copyStr = "" + tn + " = tempArray";
			//logDebug("ASI Table Array : " + tn + " (" + numrows + " Rows)");
			if (numrows>0){
				addASITable(tblName,tempArray,childCapID);
			}
			//eval(copyStr);  // move to table name
		}
		return true;
	}catch(err){
		logDebug("Method name: copyASITfromParent. Message: Error-" + err.message + ". CapID:" + childCapID);
		return false;
	}
}
