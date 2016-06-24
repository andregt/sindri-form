/**
 * Created by André Timermann on 08/04/16.
 *
 * TODO: Na atualização Enviar apenas oq foi alterado
 * TODO: Não é possível validar quando é criado mais de um input num widget, pois o Formly se perde e não carrega a viewValue
 * TODO: Opções: validar por fora usando um watcher para validação online, ou implementar acesso a validação do formly manualmente (parece inviavel)
 *       View Value pode ser acessado na expression, descobrir como acessar de outra forma
 *       Fazer varios testes,
 *
 *
 *       formly_1_input_nome_4: NgModelController
 *       formly_1_input_usuario_1: NgModelController
 *       formly_1_password_senha_2:NgModelController
 *       values[]:NgModelController
 *
 *       Observe que no ultimo caso o formly se perde, em vez de criar um formly_1 bla bla, ele cria um array com os inputs
 *
 *
 * sindri-form/lib/controller.js
 */
'use strict';

const _ = require('lodash');
const AngularDirectiveController = require('sindri-client/angularDirectiveController');

require('../css/main.css');

/**
 * Carrega Tipos de Fields (tb é carregado no run, porém lá é usado paenas pelo formly, aqui para o sindriForm
 * Deve ficar separado da classe, pois é uma construção do WebPack, ou seja, executado em tempo de compilação
 *
 * @param requireContext
 * @returns {Array.FieldType}
 */
function requireAll(requireContext) {
    return requireContext.keys().map(requireContext);
}
/**
 * Lista de FieldType carregados através de RequireAll
 *
 * @type {Array.FieldType}
 */
let fields = requireAll(require.context("../fields", false, /^\.\/.*\.js$/));

/**
 * Require de Campo Dinamico (WebPack, deve ficar fora da classe)
 *
 * @param type
 * @returns {FieldType}
 */
function requireFieldDynamic(type) {
    return require('../fields/' + type);
}

/**
 * Require de Filtro Dinamico (WebPack, deve ficar fora da classe)
 *
 * @param type
 * @returns {Filter}
 */
function requireFilterDynamic(filter) {
    return require('../filters/' + filter);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Representa o controller da diretiva sindri-form
 */
class SindriFormController extends AngularDirectiveController {


    /**
     * Inicialização
     *
     * @param $scope    Escopo do template
     * @param $http     Objeto de Requisição HTTP
     * @param notify    Serviço de Notificação
     * @param $timeout  Serviço de Timeou
     */
    constructor($scope, $http, notify, $timeout) {




        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Váriaveis e Métodos
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////

        super($scope, $http);

        let self = this;

        self.$notify = notify;
        self.$timeout = $timeout;
        self.$scope = $scope;


        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Configurações Diversas
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////

        // Lista de ponteiros para objeto que representa os campos no angular formly (atalho para acesso e modificação)
        // Nota: os campos não foram criados através deste objeto, e sim pelo formlyFields, aqui é são só ponteiros
        // para self.formlyFields, foi criado para fácil acesso, já que no formlyFields não é indexado de forma prática
        // (array simples)
        self.fields = {};

        // Schema - Configurações dos campos
        self.schema = {};


        // Formulário usado no modelo
        self.sindriForm = {};

        // Coleção de Campos para ser usado pelo formly (Estrutura)
        self.formlyFields = {};

        // Dados dos formulários
        self.model = {};


        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Configuração padrão
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        self.options = _.defaults(self.options, {

            // Id do formulário no modo Update
            id: undefined,

            // Configurações personalizada do formulário pra ser enviado diretamente para o Formly
            fieldOptions: {},

            // Schema com configuração dos campos
            schema: {},

            // Carrega Schema do servidor
            loadSchemaFromServer: false,

            // Inicializa Formulário automaticamente
            autoLoad: false,

            // URL de comunicação com servidor
            url: undefined,

            // Callback que será executado quando um formulário salvar (TODO: Colocar na API)
            onSave: undefined
        });

        // Interface Externa para Carregar form manualmente
        // IMPORTANTE: Está Método não pode ser definido usando _.defaults, pois ocorre problema com referencia TODO: Descobrir o motivo
        self.options.loadForm = function () {
            return self.loadForm();
        };

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Execução
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////

        if (self.options.autoLoad) {
            self.loadForm();
        }

    }


    /**
     * Carrega Formulário
     */
    loadForm() {


        let self = this;

        // Nova Estrutura
        self.sindriForm = {};

        return Promise.resolve()

        /////////////////////////////////////////
        // 1) Requisita Schema
        /////////////////////////////////////////
            .then(function () {

                // Carrega Schema do Servidor
                if (self.options.loadSchemaFromServer) {
                    return self.loadSchema(self.options.url).then(function (response) {

                        return _.defaultsDeep(self.options.schema || {}, response.data);

                    });

                }

                // Carrega Schema enviado por options
                else {

                    return self.options.schema;

                }

            })
            /////////////////////////////////////////
            // 2) Cria Form
            /////////////////////////////////////////
            .then(function (schema) {

                self.schema = schema;
                self.createForm();


            })
            /////////////////////////////////////////
            // 3) Carrega dados
            /////////////////////////////////////////
            .then(function () {

                // Deve ser carregado depois de inicializar o Form, pois alguns atributos são modificados lá
                return self.loadData();

            })


        // .catch(function errorCallback(response) {
        //     // TODO: Retornar mensagem de erro
        //     // console.log(response);
        //     // alert('TODO: ERRO AO CARREGAR DEFINIÇÃO DE MODELO');
        // });
        //

    }

    /**
     * Gera Descrição do Formulário compativel com o Formly, ou seja, faz uma conversão do formato definido no sindri
     * Model para o formato do Formly.
     *
     * TODO: Validar parâmetros, ignorar outros, por enquanto apenas faz o parser sem verificação alguma
     *
     */
    createForm() {

        let self = this;

        let listParsedFields = {};


        ///////////////////////////////////////////////////////////////////////////
        // Ordena Campos
        ///////////////////////////////////////////////////////////////////////////
        // Como Objeto não pode ser ordenado, converte para array

        let schema = _.transform(self.schema, function (result, fieldInfo, fieldName) {
            result.push({
                fieldName: fieldName,
                // Note que as referencias foram mantidas, em vez de copiar de self.schema (economiza memoria e permite
                // salvar dados no objeto original)
                fieldInfo: self.schema[fieldName]
            });
        }, []);

        schema = _.sortBy(schema, "fieldInfo.ord")

        ///////////////////////////////////////////////////////////////////////////
        // Agrupa Campos por abas e nome do grupo
        ///////////////////////////////////////////////////////////////////////////


        _.forIn(schema, function (schemaItem) {

            let fieldName = schemaItem.fieldName;
            let fieldInfo = schemaItem.fieldInfo;

            let formConfig = fieldInfo.form || {};

            // Não exibe carrega Field caso removeFieldWhenIdEqual estiver definido e id for igual ao valor passado
            if (fieldInfo.removeFieldWhenIdEqual !== undefined && fieldInfo.removeFieldWhenIdEqual == self.options.id) {
                return;
            }

            // Não carrega Field caso removeFieldWhenIdDiff estiver definido e id for diferente do valor passdo
            if (fieldInfo.removeFieldWhenIdDiff !== undefined && fieldInfo.removeFieldWhenIdDiff != self.options.id) {
                return;
            }


            if ((self.isNew() && fieldInfo.insert) || (!self.isNew() && fieldInfo.update)) {


                let tabName = formConfig.tab || '';
                let groupName = formConfig.group || '';

                // createField pode retornar um unico compo ou vários
                let fields = self.createField(fieldName, fieldInfo);
                fields = _.isArray(fields) ? fields : [fields];


                let i = 0;
                // Este loop existe pois o Widget (TypeField) pode retornar mais de um Field. Ex: Password (tem dois input: senha e confirmar senha)
                // Para melhor entendimento, assuma q este loop é execudato apenas 1x
                _.each(fields, function (field) {

                    if (i === 0) {
                        ///////////////////////////////////////////////////////////////
                        // Configurações Personalizadas do Novo Campo
                        ///////////////////////////////////////////////////////////////

                        if (self.options.fieldOptions && self.options.fieldOptions[fieldName]) {
                            field = _.defaults(self.options.fieldOptions[fieldName], field);
                        }

                        self.fields[fieldName] = field;

                    } else {

                        self.fields[fieldName + '__' + i] = field;
                    }

                    // Armazena campo para fácil acesso no futuro
                    if (!listParsedFields[tabName]) {
                        listParsedFields[tabName] = {};
                    }

                    if (!listParsedFields[tabName][groupName]) {
                        listParsedFields[tabName][groupName] = [];
                    }

                    listParsedFields[tabName][groupName].push(field);
                    i++;

                });

            }


        });


        ///////////////////////////////////////////////////////////////////////////
        // gera schema no formato exigido pelo formly
        ///////////////////////////////////////////////////////////////////////////
        let formlyFields = {};

        _.each(listParsedFields, function (tab, tabName) {

            formlyFields[tabName] = {
                fields: []
            };

            _.each(tab, function (fieldGroup) {

                formlyFields[tabName].fields.push({
                    className: 'row row-margin',
                    fieldGroup: fieldGroup
                });

            });

        });


        // FIX: Necessário aguardar um o eveent loop do javascript para atualizar váriavel no template (Não relacionado com formly)
        // mas não estava atualizando variavel no template (mesmo senddo two-way bind)
        return self.$timeout().then(function () {
            self.formlyFields = formlyFields;
        });

    }

    /**
     *
     * @param fieldName
     * @param fieldInfo
     * @returns {Array|Object}
     */
    createField(fieldName, fieldInfo) {

        let self = this;

        let newField;

        ///////////////////////////////////////////////////////////////
        // Cria novo Field
        ///////////////////////////////////////////////////////////////
        if (fieldInfo.forceType) {

            let Field = requireFieldDynamic(fieldInfo.forceType)

            let field = new Field(fieldName, fieldInfo, self);

            newField = field.getField();

            // Armazena informação da aba do campo para acesso posterior (na validação é necessario trocar a aba)
            if (newField.templateOptions) {
                newField.templateOptions.tab = fieldInfo && fieldInfo.form ? fieldInfo.form.tab : '';
            }


        } else {

            let result;

            // Percorre todos os tipos de campo verificado se algum deles combina com o schema recebido
            _.forIn(fields, function (Field) {

                let field = new Field(fieldName, fieldInfo, self);


                if (field.match()) {

                    newField = field.getField();

                    // Armazena informação da aba do campo para acesso posterior (na validação é necessario trocar a aba)
                    newField.templateOptions.tab = fieldInfo && fieldInfo.form ? fieldInfo.form.tab : '';

                    if (!newField) {
                        throw new Error("newField deve retornar um Field");
                    }

                    // sai do loop
                    return false;

                }
            });

            if (!newField) {
                throw  new Error("Não foi possível detectar o tipo de campo para '" + fieldName + "'");
            }

        }

        return newField;


    }

    /**
     * Carrega dados no Modo Update
     *
     * @param schema
     * @returns {Promise}
     */
    loadData(schema) {

        let self = this;

        let promise;

        //////////////////////////////////////////////////////////////////////
        // Carrega Dados do Servidor
        //////////////////////////////////////////////////////////////////////


        // Se insert não faz nada
        if (self.isNew()) {
            promise = Promise.resolve();

        }

        // Se update Carrega os dados
        else {

            promise = self.getData(self.options.id).then(function (result) {
                return result.data;
            })

        }

        //////////////////////////////////////////////////////////////////////
        // Preenche formulário com vaores padrão ou valores da base de dados
        //////////////////////////////////////////////////////////////////////
        return promise.then(function (formData) {

            _.forIn(self.schema, function (fieldInfo, fieldName) {

                let value;

                // Não exibe carrega Field caso removeFieldWhenIdEqual estiver definido e id for igual ao valor passado
                if (fieldInfo.removeFieldWhenIdEqual !== undefined && fieldInfo.removeFieldWhenIdEqual == self.options.id) {
                    return;
                }

                // Não carrega Field caso removeFieldWhenIdDiff estiver definido e id for diferente do valor passdo
                if (fieldInfo.removeFieldWhenIdDiff !== undefined && fieldInfo.removeFieldWhenIdDiff != self.options.id) {
                    return;
                }

                // TODO: Verificar se precisar mesmo remover nesses casos, pode ser qua algum outro campo utilize
                if ((self.isNew() && fieldInfo.insert) || (!self.isNew() && fieldInfo.update)) {

                    // Carrega Dado
                    if (self.options.id) {

                        value = formData[fieldName];

                    } else if (fieldInfo['default'] !== undefined) {

                        value = fieldInfo['default'];

                    }

                    // Preenche no Modelo, aplicando filtro
                    // NOTA: Aceita Apenas UM FILTRO,
                    // TODO: Criar uma função para processar vários filtros em caso de array ou objeto(com parâmetros)
                    // TODO: Promise?? se aparecer um filtro assincrono, será necessário adicionar suporte a promise aqui
                    if (fieldInfo.filter) {

                        let Filter = requireFilterDynamic(fieldInfo.filter);
                        self.model[fieldName] = Filter.fromServer(value);

                    } else {
                        self.model[fieldName] = value;
                    }

                }


            });

        })

    }

    /**
     * Presiste Dados no servidor
     */
    save() {

        let self = this;


        if (self.form.$valid) {

            let data = self.model;

            let sendData = {};

            _.forIn(self.schema, function (fieldInfo, fieldName) {


                if ((self.isNew() && fieldInfo.insert) || (!self.isNew() && fieldInfo.update)) {

                    // Aplicação de Filtro
                    // Aceita Apenas UM FILTRO,
                    // TODO: Criar uma função para processar vários filtros em caso de array ou objeto(com parâmetros)
                    // TODO: Promise?? se aparecer um filtro assincrono, será necessário adicionar suporte a promise aqui
                    if (fieldInfo.filter) {

                        let Filter = requireFilterDynamic(fieldInfo.filter);

                        if (data[fieldName] !== undefined) {
                            sendData[fieldName] = Filter.toServer(data[fieldName]);
                        }

                    } else {

                        if (data[fieldName] !== undefined) {
                            sendData[fieldName] = data[fieldName];
                        }

                    }
                }

            });


            let request;

            // Modo Update
            if (!self.isNew()) {

                request = self.http({
                    method: 'PUT',
                    url: self.options.url + '/' + self.options.id,
                    data: sendData
                })

            }
            // Modo Insert
            else {

                request = self.http({
                    method: 'POST',
                    url: self.options.url,
                    data: sendData
                })

            }


            request
                .then(function () {


                    // Limpa Mensagem de erro do servidor
                    self.clearServerError();

                    // Limpa Erro Global
                    self.globalErrorMessage = [];

                    // Alerta
                    self.$notify('Dados Salvos com sucesso!', 'success');

                    // Evento
                    if (_.isFunction(self.options.onSave)) {
                        // TODO: Talvez enviar dados salvos
                        self.options.onSave(true);
                    }


                })

                .catch(function (response) {

                    // Não processa em caso de erro diferente de 400
                    if (response.status != 400) {
                        throw(response);
                    }

                    self.clearServerError();


                    // Limpa Erro Global
                    self.globalErrorMessage = [];


                    //TODO: Usar dataSync
                    // Preenche novos valores
                    if (response.data && response.data.error) {


                        _.each(response.data.errors, function (error) {

                            //////////////////////////////////////////////////////////////////////////////////////////
                            // Erro de um Campo especifico
                            //////////////////////////////////////////////////////////////////////////////////////////
                            if (error.id) {
                                let fieldObj = self.fields[error.id];
                                fieldObj.templateOptions.serverErrorMessage.push(error.message);
                                fieldObj.templateOptions.serverError = true;

                            }

                            //////////////////////////////////////////////////////////////////////////////////////////
                            // Erro Global
                            //////////////////////////////////////////////////////////////////////////////////////////
                            else {

                                // Alerta
                                self.$notify(error.message, 'danger');


                                //self.globalErrorMessage.push(error.message);
                                // Reseta mensagens ocultas
                                self.hide = {};

                            }
                        });


                    }

                    // Evento
                    if (_.isFunction(self.options.onSave)) {

                        // TODO: Talvez enviar erros
                        self.options.onSave(false);
                    }
                    ;

                });

        } else {

            // Id da Aba que será trocada (Quando ocorrer um erro, identificar a aba do campo e fazer a troca)
            let changeTab;

            // Exibe todos os Erros
            _.each(self.fields, function (field, fieldName) {

                let tabList = _.invert(Object.keys(self.formlyFields));


                if (field.formControl) {


                    // Muda para Aba do primeiro campo com erro
                    if (changeTab === undefined && !field.formControl.$valid && field.templateOptions.tab !== undefined) {
                        changeTab = tabList[field.templateOptions.tab];
                    }


                    // Marca Campos com "tocados" (força exibição de erros)
                    if (_.isArray(field.formControl)) {

                        _.each(field.formControl, function (fieldItem) {
                            fieldItem.$setTouched();
                        })

                    } else {
                        field.formControl.$setTouched();
                    }
                }

            });


            if (changeTab !== undefined) {
                self.activeTab = parseInt(changeTab);
            }


        }
    }


    /**
     * Se este formulário irá cadastrar um novo registro ou atualizar um
     *
     * @returns {boolean}
     */
    isNew() {

        let self = this;

        return !self.options.id;

    }


    /**
     * Carrega Dados para edição
     *
     * @param url
     */
    getData(id) {

        let self = this;

        if (!id) {
            throw  new Error("Id não pode ser nulo");
        }

        return this
            .http({
                method: 'GET',
                url: self.options.url + '/' + id
            })
            .then(function successCallback(response) {

                // TODO: Usar datasync (rever pq só funciona no servidor)
                if (response.data.error == false) {

                    return response.data;

                } else {

                    return new Error(response.data.msg)

                }


            })


    }

    /**
     * Limpa Mensgens de erro de servidor
     *  https://github.com/formly-js/angular-formly/issues/212
     *
     */
    clearServerError() {

        let self = this;

        _.each(this.fields, function (fieldObj) {
            fieldObj.templateOptions.serverErrorMessage = [];
            fieldObj.templateOptions.serverError = false;
        });


    }


}


module.exports = SindriFormController;