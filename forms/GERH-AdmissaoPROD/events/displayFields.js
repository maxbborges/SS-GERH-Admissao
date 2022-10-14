function displayFields(form, customHTML) {
	log.info("PROCESSO Reenquadramento >>>>")
	customHTML.append("<script> var ATIVIDADE = " + getValue("WKNumState") + ";</script>");
	customHTML.append("<script> var FORM_MODE = '" + form.getFormMode() + "';</script>");
	customHTML.append("<script> var nProcesso = '" + getValue("WKNumProces") + "';</script>");
}