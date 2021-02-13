function updatereflp(licenseNbr,Salutation,BirthDate,PostOfficeBox)
{
   if(Salutation != null && Salutation != ""){var SAL = Salutation;} else {var SAL = "";}
   if(BirthDate != null && BirthDate != ""){var BD = BirthDate;} else {var BD = "";}
   if(PostOfficeBox != null && PostOfficeBox != ""){var PO = PostOfficeBox;} else {var PO = "";}

   var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext").getOutput();
   var ds = initialContext.lookup("java:/CHESTERFIELD"); 
   var conn = ds.getConnection(); 
   var getSQL = "UPDATE RSTATE_LIC SET L1_SALUTATION = ?, L1_BIRTH_DATE = ?, L1_POST_OFFICE_BOX = ? WHERE SERV_PROV_CODE = 'CHESTERFIELD' AND LIC_NBR = ?";
   var sSelect = conn.prepareStatement(getSQL);
	sSelect.setString(1, SAL);
	sSelect.setString(2, BD);
	sSelect.setString(3, PO);
	sSelect.setString(4, licenseNbr);

   var result = sSelect.executeUpdate();
	logDebug( "**Update Result: " + result );      
	conn.close();
   return result;
}