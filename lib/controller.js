/**
 * Created by André Timermann on 08/04/16.
 *
 * TODO: Na atualização ENviar apenas oq foi alterado
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

        // Lista de ponteiros para objeto que representa os campos no angular formly (atalho para acesso e modificação)
        // Nota: os campos não foram criados através deste objeto, e sim pelo formlyFields, aqui é são só ponteiros
        // para self.formlyFields, foi criado para fácil acesso, já que no formlyFields não é indexado de forma prática
        // (array simples)
        self.fields = {};

        // Schema - Configurações dos campos
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
        self.model = {};

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
            // 2) Cria Form
            /////////////////////////////////////////
            .then(function (response) {

                self.schema = response.data;


                self.createForm();


            })
            /////////////////////////////////////////
            // 3) Carrega dados
            /////////////////////////////////////////
            .then(function () {

                // Deve ser carregado depois de inicializar o Form, pois alguns atributos são modificados lá
                return self.loadData();

            });

        // .catch(function errorCallback(response) {
        //     // TODO: Retornar mensagem de erro
        //     console.log(response);
        //     alert('TODO: ERRO AO CARREGAR DEFINIÇÃO DE MODELO');
        //
        // });


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


        // Se update Carrega os dados
        if (self.isNew()) {

            promise = Promise.resolve();

        }
        // Se insert não faz nada
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

            });


            let request;

            // Modo Update
            if (self.options.id) {

                request = self.http({
                    method: 'PUT',
                    url: self.options.api + '/' + self.options.id,
                    data: sendData
                })

            }
            // Modo Insert
            else {

                request = self.http({
                    method: 'POST',
                    url: self.options.api,
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


            // Exibe todos os Erros
            _.each(self.fields, function (field) {

                if (field.formControl) {
                    if (_.isArray(field.formControl)) {

                        _.each(field.formControl, function (fieldItem) {
                            fieldItem.$setTouched();
                        })

                    } else {
                        field.formControl.$setTouched();
                    }
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
                url: self.options.api + '/' + id
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
        // Agrupa Campos por nome do grupo
        ///////////////////////////////////////////////////////////////////////////
        _.forIn(schema, function (schemaItem) {

            let fieldName = schemaItem.fieldName;
            let fieldInfo = schemaItem.fieldInfo;
            let formConfig = fieldInfo.form || {};

            // TODO: Implementar diferenças entre insert e update
            if (fieldInfo.insert) {


                let groupName = formConfig.group || '';
                if (!listParsedFields[groupName]) {
                    listParsedFields[groupName] = [];
                }

                // createField pode retornar um unico compo ou vários
                let fields = self.createField(fieldName, fieldInfo);
                fields = _.isArray(fields) ? fields : [fields];


                let i = 0;
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
                    listParsedFields[groupName].push(field);
                    i++;

                });

            }

        });


        ///////////////////////////////////////////////////////////////////////////
        // gera schema no formato exigido pelo formly
        ///////////////////////////////////////////////////////////////////////////

        let formlyFields = [];

        _.each(listParsedFields, function (fieldGroup) {

            formlyFields.push({
                className: 'row row-margin',
                fieldGroup: fieldGroup
            });

        });

        // FIX: Necessário aguardar um o eveent loop do javascript para atualizar váriavel no template (Não relacionado com formly
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


        } else {

            let result;

            // Percorre todos os tipos de campo verificado se algum deles combina com o schema recebido
            _.forIn(fields, function (Field) {

                let field = new Field(fieldName, fieldInfo, self);


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

        return newField;


    }


}


module.exports = SindriFormController;