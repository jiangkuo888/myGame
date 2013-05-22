/**
 * Copyright eLearning Brothers LLC 2012 All Rights Reserved
 */

function SCOPreInitialize() {
//called by game files but overridden by jca scorm code
}

function SCOInitialize() {
//called by game files but overridden by jca scorm code
}

function SCOSetValue(valueKey, value) {
//-----------------------------------------------------
// New SCORM Code by JCA Solutions
//----------------------------------------------------- 
switch(valueKey)
{
	case "time":
	 parent.scorm.objSCORM.setTime(value);
	break; 
	case "score":
	parent.scorm.objSCORM.setScore(value)
	break;
	case "completed":
	parent.scorm.objSCORM.setStatus("completed")
	break;
}
//-----------------------------------------------------
// End Code
//-----------------------------------------------------
}

function SCOCommit() {
parent.scorm.objSCORM.commit();
}