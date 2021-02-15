{
	"Building/*/*/*": {
		 "ApplicationSubmitAfter":[{
			   "preScript": "",
			   "identifyType": "Both",
			   "identifyStatus": "Completed",
			   "conditionRecordTypes": "Planning/LandUse/ZoningCase/NA",
			   "copyGroups": "",
			   "copyTypes":  "",
			   "copyConditions": false,
			   "postScript": ""		   
		 }],
		 "WorkflowTaskUpdateAfter/Application Submittal/Accepted":[{
			   "preScript": "",	 
			   "identifyType": "Both",
			   "identifyStatus": "Completed",
			   "conditionRecordTypes": "Planning/LandUse/ZoningCase/NA",
			   "copyGroups": "Proffer Assessment|Conditional",
			   "copyTypes":  "",
			   "copyConditions": true,
			   "postScript": ""	
		 }],
		 "WorkflowTaskUpdateAfter/Application Submittal/Accepted - Plan Review Required":[{
			   "preScript": "",
			   "identifyType": "Both",
			   "identifyStatus": "Completed",
			   "conditionRecordTypes": "Planning/LandUse/ZoningCase/NA",
			   "copyGroups": "Proffer Assessment|Conditional",
			   "copyTypes":  "",
			   "copyConditions": true,
			   "postScript": ""	
		 }],
		 "WorkflowTaskUpdateAfter/Application Submittal/Accepted - Plan Review Not Required":[{
			   "preScript": "",
			   "identifyType": "Both",
			   "identifyStatus": "Completed",
			   "conditionRecordTypes": "Planning/LandUse/ZoningCase/NA",
			   "copyGroups": "Proffer Assessment|Conditional",
			   "copyTypes":  "",
			   "copyConditions": true,
			   "postScript": ""	
		 }],
		 "WorkflowTaskUpdateAfter/Application Submittal/Note":[{
			   "preScript": "",
			   "identifyType": "Both",
			   "identifyStatus": "Completed",
			   "conditionRecordTypes": "Planning/LandUse/ZoningCase/NA",
			   "copyGroups": "Proffer Assessment|Conditional",
			   "copyTypes":  "",
			   "copyConditions": true,
			   "postScript": ""	
		 }]	 
	}
}