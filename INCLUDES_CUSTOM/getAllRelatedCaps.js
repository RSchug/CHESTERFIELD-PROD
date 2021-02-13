// FA this method returns all the related caps for given cap, it excludes the given cap in the array
function getAllRelatedCaps(capID)
{
	try
	{
		var allCapsArray = new Array();
		var directParentsResult = aa.cap.getProjectByChildCapID(capID,'R',null);
		
		if (directParentsResult.getSuccess())
		{
			tmpdirectParents = directParentsResult.getOutput();
			for(ff in tmpdirectParents) {
				if (tmpdirectParents[ff]) {
					var tmpNode = getRootNode(tmpdirectParents[ff].getProjectID(), 1);
					var id1 = tmpNode.getID1();
					var id2 = tmpNode.getID2();
					var id3 = tmpNode.getID3();

					var pCapId = aa.cap.getCapID(id1,id2,id3).getOutput();
					//aa.print("CAPID:" + pCapId.getCustomID());
					
					//push parent cap into array
					allCapsArray.push(pCapId.getCustomID());
				}
			}
		}
		
		// if there is no parent then given cap is the parent
		if (pCapId==null){
			pCapId=capID;
		}
		
		//get all the child caps
		var getCapResult = aa.cap.getChildByMasterID(pCapId);
		if (getCapResult.getSuccess())
		{
			var childArray = getCapResult.getOutput();
			if (childArray.length)
			{
				var childCapId;
				for (xx in childArray)
				{
					childCapId = childArray[xx].getCapID();
					//aa.print("childCapId:" + childCapId.getCustomID());
					//push child cap into array, exclude given capID
					if(capID.getCustomID()!=childCapId.getCustomID()){
						allCapsArray.push(childCapId.getCustomID());
					}
				}
			}
		}
		return allCapsArray;
	}catch(err){
		logDebug("Method name: getAllRelatedCaps. Message: Error-" + err.message + ". CapID:" + capID);
		return null;
	}
}
