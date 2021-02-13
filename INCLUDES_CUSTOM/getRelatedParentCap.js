// FA get the related parent by application type
function getRelatedParentCap(capID,pAppType) 
{
	// returns the capId array of all parent caps
	//Dependency: appMatch function
	parentArray = getRoots(capID);
	//aa.print("parentArray:" + parentArray);
	
	myArray = new Array();
	if (parentArray.length > 0)
	{
		if (parentArray.length)
		{
			for(x in parentArray)
			{
				if (pAppType != null)
				{
					//If parent type matches apType pattern passed in, add to return array
					if ( appMatch( pAppType, parentArray[x])){
						myArray.push(parentArray[x]);
						//aa.print("11:" + parentArray[x].getCustomID());
					}
				}
			}		
			return myArray;
		}
		else
		{
			logDebug( "**WARNING: function getRelatedParentCap. GetParent found no project parent for this application");
			return null;
		}
	}
	else
	{ 
		logDebug( "**WARNING: function getRelatedParentCap. Getting project parents:  " + getCapResult.getErrorMessage());
		return null;
	}
}
