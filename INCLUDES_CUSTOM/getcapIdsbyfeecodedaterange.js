function getcapIdsbyfeecodedaterange() {
	var feeCode = (arguments.length > 0 && arguments[0]? arguments[0]: "CC_GEN_10");
	var DBServer = "MSSQL Azure"; // Values: ORACLE, MSSQL, MSSQL Azure
	var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext").getOutput();
	var ds = initialContext.lookup("java:/AA"); 	// Typical method
	if (DBServer == "MSSQL Azure") { // Accela MS Azure
		var ds = initialContext.lookup("java:/"+aa.getServiceProviderCode());		// var ds = initialContext.lookup("java:/CHESTERFIELD"); 
	}

	var conn = ds.getConnection(); 
	var result = new Array();
	var LIC_SEQ_NBR = "";
	if (DBServer.indexOf("MSSQL") >= 0) {
		var getSQL = "SELECT DISTINCT b.B1_ALT_ID FROM dbo.F4FEEITEM f inner join dbo.B1PERMIT b on f.SERV_PROV_CODE = b.SERV_PROV_CODE and f.B1_PER_ID1 = b.B1_PER_ID1 and f.B1_PER_ID2 = b.B1_PER_ID2 and f.B1_PER_ID3 = b.B1_PER_ID3 where f.SERV_PROV_CODE = '" + aa.getServiceProviderCode() + "' and GF_COD = '" + feeCode + "'"
	} else {	// Typical method (Oracle)
		 var getSQL = "SELECT DISTINCT b.B1_ALT_ID FROM F4FEEITEM f inner join B1PERMIT b on f.SERV_PROV_CODE = b.SERV_PROV_CODE and f.B1_PER_ID1 = b.B1_PER_ID1 and f.B1_PER_ID2 = b.B1_PER_ID2 and f.B1_PER_ID3 = b.B1_PER_ID3 where f.SERV_PROV_CODE = '" + aa.getServiceProviderCode() + "' and GF_COD = '" + feeCode + "'"
	}
	// var sSelect = conn.prepareStatement(getSQL);			// Old Method.
	var sSelect = aa.db.prepareStatement(conn, getSQL);
	var rs= sSelect.executeQuery(); 
	while (rs.next()) {
		LIC_SEQ_NBR = rs.getString("B1_ALT_ID");
		result.push(LIC_SEQ_NBR); 
	}
	rs.close();
	conn.close();
	return result ;
}
