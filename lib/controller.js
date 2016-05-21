/**
 * Created by André Timermann on 08/04/16.
 *
 *
 */
'use strict';

const _ = require('lodash');
const AngularDirectiveController = require('sindri-client/angularDirectiveController');

require('../css/main.css');

const notify = require('bootstrap-notify');


////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Carrega Tipos de Fields (tb é carregado no run, porém lá é usado paenas pelo formly, aqui para o sindriForm
// Deve ficar separado da classe, pois é uma construção do WebPack, ou seja, executado em tempo de compilação
////////////////////////////////////////////////////////////////////////////////////////////////////////////
function requireAll(requireContext) {
    return requireContext.keys().map(requireContext);
}
let fields = requireAll(require.context("../fields", false, /^\.\/.*\.js$/));

/**
 * Require de Campo Dinamico (WebPack, deve ficar fora da classe)
 * @param type
 * @returns {*}
 */
function requireFieldDynamic(type) {
    return require('../fields/' + type);
}

/**
 * Require de Filtro Dinamico (WebPack, deve ficar fora da classe)
 * @param type
 * @returns {*}
 */
function requireFilterDynamic(filter) {
    return require('../filters/' + filter);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////


class Controller extends AngularDirectiveController {

    /**
     * Inicialização
     *
     * @param $scope    Injeção das váriaveis no template
     * @param $http     Injeção do objeto de requisição $http
     * @param growlService
     */
    constructor($scope, $http, notify) {



        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Váriaveis e Métodos
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////

        super($scope, $http);

        let self = this;

        self.notify = notify;

        // Lista de ponteiros para objeto que representa os campos no angular formly (atalho para acesso e modificação)
        // Nota: os campos não foram criados através deste objeto, e sim pelo formlyFields, aqui é são só ponteiros
        // para self.formlyFields, foi criado para fácil acesso, já que no formlyFields não é indexado de forma prática
        // (array simples)
        self.fields = {};

        // Schema Vindo Do servidor
        self.schema = [];

        // Interface Externa para Carregar form manualmente
        self.options.loadForm = function () {
            self.loadForm();
        };

        // Formulário usado no modelo
        self.sindriForm = {};

        // Coleção de Campos para ser usado pelo formly (Estrutura)
        self.formlyFields = [];

        // Dados dos formulários
        self.models = [];

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

        Promise.resolve()

        /////////////////////////////////////////
        // 1) Requisita Schema
        /////////////////////////////////////////
            .then(function () {

                if (self.options.schema) {
                    return self.options.schema;
                } else {
                    return self.loadSchema(self.options.api);
                }

            })
            /////////////////////////////////////////
            // 2) Inicia Form
            /////////////////////////////////////////
            .then(function (response) {

                self.schema = response.data;

                self.createForm();


            })

        // .catch(function errorCallback(response) {
        //     // TODO: Retornar mensagem de erro
        //     console.log(response);
        //     alert('TODO: ERRO AO CARREGAR DEFINIÇÃO DE MODELO');
        //
        // });


    }


    /**
     * Presiste Dados no servidor
     */
    save() {


        let self = this;


        if (self.form.$valid) {

            let data = self.model;

            let sendData = {};

            _.forIn(self.schema, function (info, fieldName) {

                // Aplicação de Filtro
                // Aceita Apenas UM FILTRO, TODO: Criar uma função para processar vários filtros em caso de array ou objeto(com parâmetros)
                if (info.filter) {

                    let Filter = requireFilterDynamic(info.filter);
                    sendData[fieldName] = Filter.to(data[fieldName]);

                } else {

                    sendData[fieldName] = data[fieldName];

                }


            });


            self.http({
                method: 'POST',
                url: self.options.api,
                data: sendData
            })

                .then(function () {


                    // Limpa Mensagem de erro do servidor
                    self.clearServerError();

                    // Limpa Erro Global
                    self.globalErrorMessage = [];

                    // TODO: Dispara Evento de Salvo com sucesso

                    // Alerta
                    self.notify('Dados Salvos com sucesso!', 'success');

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

                        console.log(response.data);

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
                                self.notify(error.message, 'danger');


                                //self.globalErrorMessage.push(error.message);
                                // Reseta mensagens ocultas
                                self.hide = {};

                            }
                        });


                    }

                });

        } else {


            // Exibe todos os Erros
            _.each(self.fields, function (field) {


                if (_.isArray(field.formControl)) {

                    _.each(field.formControl, function (fieldItem) {
                        fieldItem.$setTouched();
                    })

                } else {
                    field.formControl.$setTouched();
                }

            });


        }
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

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Métodos Estáticos
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
        // Agrupa Campos por nome do grupo
        ///////////////////////////////////////////////////////////////////////////

        _.forIn(self.schema, function (info, fieldName) {

            if (info.insert) {

                let groupName = info.group || '';
                if (!listParsedFields[groupName]) {
                    listParsedFields[groupName] = [];
                }

                // Cria Field
                let field = self.createField(fieldName, info);

                // Armazena na estrutura do Formly
                listParsedFields[groupName].push(field);


                // Armazena campo para fácil acesso no futuro
                self.fields[fieldName] = field;

            }

        });

        ///////////////////////////////////////////////////////////////////////////
        // gera schema no formato exigido pelo formly
        ///////////////////////////////////////////////////////////////////////////

        self.formlyFields = [];

        _.each(listParsedFields, function (fieldGroup) {

            self.formlyFields.push({
                className: 'row row-margin',
                fieldGroup: fieldGroup
            });

        });


    }


    /**
     *
     * @param fieldName
     * @param fieldInfo
     * @returns {{key: *, type: string, templateOptions: {type: string, label: *, required: boolean}}}
     */
    createField(fieldName, fieldInfo) {

        let self = this;

        let newField;

        ///////////////////////////////////////////////////////////////
        // Cria novo Field
        ///////////////////////////////////////////////////////////////
        if (fieldInfo.forceType) {

            let Field = requireFieldDynamic(fieldInfo.forceType)

            console.log(fields);

            let field = new Field(fieldName, fieldInfo);

            newField = field.getField();


        } else {

            let result;

            // Percorre todos os tipos de campo verificado se algum deles combina com o schema recebido
            _.forIn(fields, function (Field) {

                let field = new Field(fieldName, fieldInfo);


                if (field.match()) {

                    newField = field.getField();

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

        ///////////////////////////////////////////////////////////////
        // Configurações Personalizadas do Novo Campo
        ///////////////////////////////////////////////////////////////

        if (self.options.fieldOptions[fieldName]) {
            return _.defaults(self.options.fieldOptions[fieldName], newField);
        } else {
            return newField;
        }


    }


}


module.exports = Controller;