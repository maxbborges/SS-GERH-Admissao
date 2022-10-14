// ESTRUTURA DO ASSINANTES
//assinantes.push({
//	nome: new String(assinante[0].nome),
//	email: new String(assinante[0].email),
//	cpf: new String(assinante[0].cpf),
//	tipo: new String(assinante[0].tipoAssinatura),
//	status: "Pendente"
//})

// ESTRUTURA ENVIAR PARA ASSINATURA
//var nrPasta = $('[name="nrPasta"]').val() // Definir para onde o arquivo será enviado
//var nmArquivo = $('[name="nmArquivo"]').val() //Nome do arquivo para buscar o ID
//var idDocumento = $('[name="txt_01_idDocumento"]').val() //ID do documento a ser enviado
//var solicitacao = $('[name="nrSolicitacao"]').val() // Numero da solicitação
//var listaDeAtividades=[] // Atividades a serem recuperados os assinantes
//var atividadeResponsaval='0' // Atividade do responsável pelo envio
//var tabela = $("input[name^='column3_1___']") // Tabela que contém os assinantes
//var userIds=[] // IDs dos assinantes (Buscar assinantes por ID)
//var emails=[] // Email dos assinantes (Buscar assinantes por Email)

// ESTRUTURA HEADER
// [
// 	{
// 		'title': 'cpf',
// 		'size': 'col-xs-3'
// 	},
// 	{
// 		'title': 'nome',
// 		'size': 'col-xs-9',
// 		'dataorder': 'nome',
// 		'standard': true
// 	}
// ]
//=========================================================== EXIBIR DIVS HIDDEN ===========================================================
function exibirDivsHidden(){
	setTimeout(function(){
		dados=$("input[type='hidden']")
		for(i=0;i<dados.length;i++){
			dados[i].type='text'
		}
	}, 300);
}

//=========================================================== ATTACHMENTS ===========================================================
function anexarArquivo(param, nrProcesso, retornoNomeArquivo) {
	var data = new Date();
	var dataparemeter = ('_' + nrProcesso + "___" + data.getTime());
	JSInterface.showCamera(param + dataparemeter);

	$(retornoNomeArquivo).val(param + dataparemeter)

	setTimeout(function(){
		window.parent.$('#workflow-detail-card').removeClass()
		window.parent.$('#workflowview-header .active').removeClass('active').removeClass('out')
	}, 500);
}

function visualizarArquivo(targetDescription) {
	$.each(parent.ECM.attachmentTable.getData(), function (i, attachment) {
		let description = attachment.description;
		let attachmentId = attachment.id;
		let attachmentName = attachment.name;
		if (description == targetDescription) {
			parent.WKFViewAttachment.openAttachmentView('admin', attachment.documentId, 1000);
		}
	});
}

function baixarArquivo(targetDescription) {
	$.each(parent.ECM.attachmentTable.getData(), function (i, attachment) {
		let description = attachment.description;
		let attachmentId = attachment.id;
		let attachmentName = attachment.name;
		if (description == targetDescription) {
			parent.WKFViewAttachment.downloadAttach([i]);
		}
	});
}

function obterIdArquivo(fieldDestino, nmArquivo) {
	$.each(parent.ECM.attachmentTable.getData(), function (i, attachment) {
		let description = attachment.description;
		if (description == nmArquivo) {
			let idAnexo = attachment.documentId
			$(fieldDestino).val(idAnexo);
		}
	})
}

//=========================================================== FILTROS ===========================================================
function createFilterZoom(dataset, params, paramsNot, columns, displayKey, multiSelect, placeholder, header, renderContent, elementoZoom) {
	var settings = {
		source: customDataset(dataset, params, paramsNot, columns),
		displayKey: displayKey,
		multiSelect: multiSelect,
		placeholder: placeholder,
		style: {
			autocompleteTagClass: 'tag-gray',
			tableSelectedLineClass: 'info'
		},
		table: {
			header: header,
			renderContent: renderContent
		}
	};
	return FLUIGC.filter(elementoZoom, settings);

	// FILTROS
	filter.on('fluig.filter.item.added', function (data) {
		var assinante = wdkAddChild("tbl_assinantes_15");
		$("[name='column1_1___" + assinante + "']").val(data.item.cpf)

		FLUIGC.toast({
			title: 'Item selected: ',
			message: data.item.nome,
			type: 'success'
		});

		filter.removeAll()
	});
}

//=========================================================== CRIAR PDF ===========================================================
function createPdfByForm(listDivsHide, listDivsShow, nrPasta, nrSolicitacao, nmArquivo, retornoIdArquivo,retornoNomeArquivo) {
	for (var i = 0; i < listDivsHide.length; i++) {
		$(listDivsHide[i]).hide(); // div que não será gerada no pdf
	}

	var nm_arquivo = nmArquivo + '__' + nrSolicitacao + ".pdf";
	var pdf = new jsPDF('p', 'pt', 'a4');
	$(window).scrollTop(0);
	pdf.internal.scaleFactor = 2;
	var options = {
		pagesplit: true,
		'background': '#fff'
	};

	pdf.addHTML($('#form_content'), options, function () {
		var out = pdf.output('blob');
		var reader = new FileReader();
		reader.readAsDataURL(out);
		reader.onloadend = function () {
			base64data = reader.result;
			base64 = base64data;
			base64 = base64.split("data:application/pdf;base64,")[1];

			var constraintsDocument = new Array();
			constraintsDocument.push(DatasetFactory.createConstraint("nm_arquivo", nm_arquivo, nm_arquivo, ConstraintType.MUST));
			constraintsDocument.push(DatasetFactory.createConstraint("nr_pasta", nrPasta, nrPasta, ConstraintType.MUST));
			constraintsDocument.push(DatasetFactory.createConstraint("base64", base64, base64, ConstraintType.MUST));
			let dsDocument = DatasetFactory.getDataset('ds_grava_documento', null, constraintsDocument, null)

			if (dsDocument != null && dsDocument != undefined) {
				if (dsDocument.values.length > 0) {
					documentId = dsDocument.values[0]["documentId"];
					$(retornoIdArquivo).val(documentId)
					$(retornoNomeArquivo).val(nm_arquivo)
					loading.hide();
					FLUIGC.toast({
						message: 'Formulário do Processo gerado com sucesso.',
						type: 'success'
					});
				}
			}
		}
	});

	for (var i = 0; i < listDivsHide.length; i++) {
		$(listDivsHide[i]).show(); // apresentar novamente a div
	}
}

//=========================================================== OUTROS ===========================================================
function hideBlockDivs(divVisivel) {
	hideDivs=false
	for (i = 0; i < DIVS.length; i++) {
		// if (DIVS[i] == divVisivel || i == divVisivel) {
		if($.inArray(DIVS[i], divVisivel)>= 0) {
			hideDivs=true
			if (FORM_MODE!='VIEW'){
				$('#' + DIVS[i] + ' .collapse').collapse('show')	
				continue;
			}
		}
		$('#' + DIVS[i] + ' button').hide();
		$('#' + DIVS[i] + ' textarea').prop('readonly', 'true');
		$('#' + DIVS[i] + ' input').prop('readonly', 'true');
		$('#' + DIVS[i] + ' input:radio:not(:checked)').prop('disabled', 'true');
		$('#' + DIVS[i] + ' input:checkbox:not(:checked)').prop('disabled', 'true');
		$('#' + DIVS[i] + ' button').hide();

		if (hideDivs) {
			$('#' + DIVS[i]).hide();
		}
	}
}

function validaCamposRequired(elementoDiv) {
	var divSelecionada = $('#' + elementoDiv + ' label.required').next()
	for (i = 0; i < divSelecionada.length; i++) {
		elemento = divSelecionada[i]
		if ($(elemento).attr('class') == 'radio-options' || $(elemento).attr('class') == 'check-options') {
			if ($(elemento).find('input:checked').val() == undefined) {
				elementoName = $(elemento).find('input').attr("name")
				$('[name="'+elementoName+'"]').focus()
				msgValidade( elementoName+ ' obrigatório!');
				break;
			}
		} else {
			if ($(elemento).val() == '' || $(elemento).val() == null) {
				elementoName = $(elemento).attr("name")
				$('[name="'+elementoName+'"]').focus()
				msgValidade( elementoName+ ' obrigatório!'); 
				break;
			}
		}
	}
}

function loadMasks() {
    // $(".money").maskMoney();
    $('.date').mask('00/00/0000');
    $('.money').mask('000.000.000.000.000,00', { reverse: true });
    $('.cpf').mask('000.000.000-00', { reverse: true });
    $('.percent').mask('##0,00%', { reverse: true });
}

function msgValidade(mensagem) {
	throw "<div class='alert alert-warning' role='alert'>" +
	"<strong>Atenção:</strong> " + mensagem +
	"</div><i class='fluigicon fluigicon-tag icon-sm'></i> <font style='font-weight: bold'>Dúvidas?</font> Entre em contato com o departamento de TI.";
}

function msgsToast(titulo,msg, tipo) {
	FLUIGC.toast({
		title: titulo,
		message: msg,
		type: tipo
	});
	if (tipo == 'danger') {
		throw "Erro! " + msg
	}
}

//=========================================================== ASSINATURA ===========================================================
function customAssinatura(nrPasta, nmArquivo, idDocumento, solicitacao, listaDeAtividades, atividadeResponsaval, tabela, userIds, UserEmails, divValidacao) {
	var loading = FLUIGC.loading(window);
	loading.show();
	var data = new Date().toLocaleDateString('pt-BR')
	var hora = new Date().toLocaleTimeString('pt-BR')
	var emails = []
	var assinantes = [] // Dicionário com os assinantes

	// RECUPERAR O RESPONSÁVEL POR ENVIAR PARA A VERTSING - INICIO
	var params = [{ name: "processInstanceId", value: solicitacao }, { name: "choosedSequence", value: atividadeResponsaval }]
	var paramsNot = [{ name: "choosedColleagueId", value: 'System:Auto' }]
	var columns = ["choosedColleagueId", "colleagueName"]
	var processTask = customDataset("processTask", params, paramsNot, columns) //Consulta todas as atividades do processo
	if (processTask.length == 0) { throw "ERRO!" }

	var params = [{ name: "colleaguePK.colleagueId", value: processTask[processTask.length - 1]['choosedColleagueId'] }]
	var columns = ["colleagueId", "colleagueName"]
	var colleague = customDataset("colleague", params, [], columns) // Recupera o usuário da atividade designada
	if (colleague.length == 0) { throw "ERRO!" } // verifica se encontrou algum usuário

	var responsavelId = colleague[colleague.length - 1]["colleagueId"] // Recupera o id do responsável pelo envio
	var responsavelNome = colleague[colleague.length - 1]["colleagueName"] // Recupera o nome do responsável pelo envio
	// RECUPERAR O RESPONSÁVEL POR ENVIAR PARA A VERTSING - FIM

	for (var i = 0; i < listaDeAtividades.length; i++) { // Busca IDs por atividade
		var params = [{ name: "processInstanceId", value: solicitacao }, { name: "choosedSequence", value: listaDeAtividades[i] }]
		var processTask = customDataset("processTask", params, paramsNot, ["choosedColleagueId"])
		if (processTask.length == 0) { throw "ERRO!" }
		userIds.push(processTask[processTask.length - 1]['choosedColleagueId'])
	}

	for (var i = 0; i < userIds.length; i++) { // busca emails dos usuários por ID
		var params = [{ name: "colleagueId", value: userIds[i] }]
		var colleague = customDataset("colleague", params, [], ["mail"])
		if (colleague.length == 0) { throw "ERRO!" }
		var userMail = colleague[0].mail
		if (emails.indexOf(userMail) == -1) { emails.push(userMail) }
	}

	for (var i = 0; i < tabela.length; i++){if (emails.indexOf(tabela[i]) == -1) { emails.push(tabela[i]) }}
	for (var i = 0; i < UserEmails.length; i++){if (emails.indexOf(UserEmails[i]) == -1) { emails.push(UserEmails[i]) }}

	if (emails.length == 0) { throw "ERRO!" }
	for (var i = 0; i < emails.length; i++) {
		params = [{ name: "email", value: emails[i] }]
		var dsBusca = customDataset("ds_busca_assinante", params, [], null)
		if (dsBusca.length == 0) { throw "ERRO!" }
		assinantes.push({
			nome: new String(dsBusca[0].nome),
			email: new String(dsBusca[0].email),
			cpf: new String(dsBusca[0].cpf),
			tipo: new String(dsBusca[0].tipoAssinatura),
			status: "Pendente"
		})
	}

	if (assinantes.length == 0) { msgsToast("Erro ao carregar assinantes", "danger") }
	var params = [
		{ name: "nmArquivo", value: nmArquivo },
		{ name: "codArquivo", value: idDocumento },
		{ name: "vrArquivo", value: "1000" },
		{ name: "codPasta", value: nrPasta },
		{ name: "codRemetente", value: responsavelId },
		{ name: "nmRemetente", value: responsavelNome },
		{ name: "formDescription", value: nmArquivo },
		{ name: "status", value: "Enviando para assinatura" },
		{ name: "metodo", value: "create" },
		{ name: "dataEnvio", value: data },
		{ name: "jsonSigners", value: JSON.stringify(assinantes) },
		{ name: "horaEnvio", value: hora },
		{ name: "numSolic", value: solicitacao },
		{ name: "choosedState", value: "45" }
	]
	setTimeout(function () {
		dsAux = customDataset("ds_auxiliar_vertsign", params, [], null) // Cria o formulário vertsign
		if (dsAux == null || dsAux.length == 0) { throw "ERRO!" } // Verifica se houve erro na criação do form

		setTimeout(function () {
			// var dsUpload=customDataset("ds_upload_vertsign",params) // Faz envio do arquivo para a vertsign
			// if (dsUpload.length == 0) {throw "ERRO!"} // Verifica se foi enviado

			var params = [{ name: "numSolic", value: solicitacao }]
			var dsFormAux = customDataset("ds_form_aux_vertsign", params, [], null) // Recupera os formulários enviados da solicitação
			if (dsFormAux.length == 0) { throw "ERRO!" } // Verifica se existem formulários enviados

			var params = [{ name: "codArquivo", value: dsFormAux[dsFormAux.length - 1].codArquivo }] // Recupera o codigo do arquivo vertsign
			customDataset("ds_upload_vertsign_manual", params, [], null) // Faz envio do arquivo para a vertsign

			setTimeout(function () {
				var params = [{ name: "numSolic", value: solicitacao }]
				var dsFormAux = customDataset("ds_form_aux_vertsign", params, [], null) // Recupera os formulários enviados da solicitação
				if (dsFormAux.length == 0) { throw "ERRO!" } // Verifica se existem formulários enviados

				statusAssinatura = dsFormAux[dsFormAux.length - 1].statusAssinatura // Recupera o ultimo fomulário enviado
				if (statusAssinatura == "Enviando para assinatura") { throw "ERRO!" } // Verifica se continua pendente
				
				$(divValidacao).val('ok')
				loading.hide();
				msgsToast("Encaminhado, enviar o processo!", "success")
				return true
			}, 1000);
		}, 1000);
	}, 1000);
}

function customDataset(dataset, params, paramsNot, columns) {
	constraints = []
	params.forEach(function (param) {
		constraints.push(DatasetFactory.createConstraint(param.name, param.value, param.value, ConstraintType.MUST));
	});

	paramsNot.forEach(function (param) {
		constraints.push(DatasetFactory.createConstraint(param.name, param.value, param.value, ConstraintType.MUST_NOT));
	});

	try {
		var result = (DatasetFactory.getDataset(dataset, columns, constraints, null)).values;
		return result
	} catch (error) { throw "ERRO!" }
}