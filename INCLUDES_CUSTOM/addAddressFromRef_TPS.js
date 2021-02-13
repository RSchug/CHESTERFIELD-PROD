function addAddressFromRef_TPS(fulladdress) {
	var s_id1 = aa.env.getValue("PermitId1");
	var s_id2 = aa.env.getValue("PermitId2");
	var s_id3 = aa.env.getValue("PermitId3");
	var targetCapID =  aa.cap.getCapID(s_id1, s_id2, s_id3).getOutput();
	var serviceProviderCode = aa.getServiceProviderCode();
	var currentUserID = aa.getAuditID();
	/** Adding addresses(look up refAddress) to a record. **/
	var searchRefAddressModel = aa.proxyInvoker.newInstance("com.accela.aa.aamain.address.RefAddressModel").getOutput();
	searchRefAddressModel.setFullAddress(fulladdress);

	//Look up the refAddressModel.
	var searchResult = aa.address.getRefAddressByServiceProviderRefAddressModel(searchRefAddressModel);
	if (searchResult.getSuccess())
	{
		var refAddressModelArray = searchResult.getOutput();
		for (yy in refAddressModelArray)
		{
			var refAddressModel = refAddressModelArray[yy];

			//Set the new addressModel attributes.
			var newAddressModel = refAddressModel.toAddressModel();
			newAddressModel.setCapID(targetCapID);
			newAddressModel.setServiceProviderCode(serviceProviderCode);
			newAddressModel.setAuditID(currentUserID);
			newAddressModel.setPrimaryFlag("Y");
			
			//Create new address for cap.
			aa.address.createAddress(newAddressModel);
			//createAddresses(targetCapID, newAddressModel);
		}
	}
}