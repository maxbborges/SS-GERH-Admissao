$(document).ready(function () {
    if(FORM_MODE=='VIEW'){
        $('button').hide();
    }
    loadMasks();
    loadClicks();
//    exibirDivsHidden()

    $('.labelHidden').hide()

    $('#btn_enviaAssinatura').hide()
    if(ATIVIDADE==1 || ATIVIDADE==0){
        hideBlockDivs(0)
    }
    if(ATIVIDADE==34){
        hideBlockDivs(1)
        $('[name="nrSolicitacao"]').val(nProcesso)
        $('[name="nrPasta"]').val('11286')
    }

    header = [
        {'title': 'cpf','size': 'col-xs-3'},
        {'title': 'nome','size': 'col-xs-9','dataorder': 'nome','standard': true}
    ]
    var filter = createFilterZoom('ds_busca_assinante', [], [], [], 'nome', false, 'Escolha um assinante', header, ['cpf', 'nome'], '#zf_01_assinantes')

    filter.on('fluig.filter.item.added', function (data) {
        var assinante = wdkAddChild("tbl_assinantes_15");
        $("[name='column1_1___"+assinante+"']").val(data.item.cpf)
        $("[name='column2_1___"+assinante+"']").val(data.item.nome)
        $("[name='column3_1___"+assinante+"']").val(data.item.email)
        
        msgsToast('Usuário selecionado: ',data.item.nome, 'success')

        filter.removeAll()
    });
});

function loadClicks(){
    $('#btn_enviaAssinatura').on('click',function(){
        var elementosTabela=$("input[name^='column3_1___']")
        var tabela = []
        if(elementosTabela.length==0){ msgsToast('ATENÇÃO: ','Necessário selecionar usuários para assinatura', 'danger')}
        for (var i=0;i<elementosTabela.length;i++){
            tabela.push($(elementosTabela[i]).val())
        }
        customAssinatura($('[name="nrPasta"]').val(), $('[name="txt_01_nomeDocumento"]').val(), 
            $('[name="txt_01_idDocumento"]').val(), nProcesso, [], '34', tabela, [], [], '[name="txt_01_validaVertsign"]')
    });

    $('#btn_criaPDF').on('click',function(){
        var nrPasta=$('[name="nrPasta"]').val()
        var	nmArquivo='GERH-'+$('[name="txt_00_nomeColaborador"]').val()
        createPdfByForm(['#div_01'], [], nrPasta, nProcesso, nmArquivo, "[name='txt_01_idDocumento']",'[name="txt_01_nomeDocumento"]')
        $('#btn_enviaAssinatura').show()
    })
}

var beforeSendValidate = function (numState, nextState) {
    if (ATIVIDADE==1 || ATIVIDADE==0){
        validaCamposRequired('div_00')
        // validaVertsign("#txt_26_validaEncaminhamento")
    }
    if (ATIVIDADE==34){
        validaCamposRequired('div_01')
        // validaVertsign("#txt_26_validaEncaminhamento")
    }
}