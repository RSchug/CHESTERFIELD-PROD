#PageFlow

ACA PageFlow Job scripting

Recommended filename convention is:

	ACA_n_p_eeeeee_x

where:

	n		= PageFlow Name (e.g., Amendment, Renewal) [Optional]
	p		= PageFlow Page (e.g., APO, Doc) [Optional]
	eeeeee 	= Event (e.g., ONLOAD, BEFORE, AFTER, HIDE, GOTO)
	x		= Optional Identifier
	
examples:

	ACA_REQUIREDOCS_ONLOAD
	ACA_APO_BEFORE
	ACA_AMENDMENT_ONLOAD
	ACA_RENEWAL_ONLOAD
	ACA_CONTACTS_ONLOAD
	ACA_SIGN_CONTACTS_ONLOAD
