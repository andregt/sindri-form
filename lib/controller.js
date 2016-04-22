/**
 * Created by André Timermann on 08/04/16.
 *
 *
 */
'use strict';

const _ = require('lodash');

class controller {

    /**
     * Inicialização
     *
     * @param $scope    Injeção das váriaveis no template
     * @param $http     Injeção do objeto de requisição $http
     */
    constructor($scope, $http) {

        let self = this;

        this.$scope = $scope;

        // Captura função definida por httpRequest
        // TODO: Validar se é função
        this.http = $scope.httpRequest();


        // Se não estiver definido usa padrão
        if (!this.http) {
            this.http = $http;
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Carrega Descrição do Formulário
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Criar interceptador
        this
            .http({
                method: 'GET',
                url: $scope.api + '/info' // TODO: Parametrizar e documentar
            })
            .then(function successCallback(response) {

                if (response.data.error == false) {


                    $scope.sindriForm = {};

                    $scope.sindriFormFields = self.createForm(response.data.data)

                }


            })

            .catch(function errorCallback(response) {
                // TODO: Retornar mensagem de erro
                console.log('TODO: ERRO AO CARREGAR DEFINIÇÃO DE MODELO')

            });


    }


    /**
     * Gera descritivo do Formulário
     *
     * @param definition
     */
    createForm(definition) {

        let self = this;

        let result = [];

        _.forIn(definition, function (info, fieldName) {

            if (info.insert) {

                result.push(self.createField(fieldName, info))
            }
        });

        return result;
    }

    /**
     *
     * @param fieldName
     * @param info
     * @returns {{key: *, type: string, templateOptions: {type: string, label: *, required: boolean}}}
     */
    createField(fieldName, info) {


        return {
            key: fieldName,
            type: 'input',
            templateOptions: {
                type: 'text',
                label: this.createLabel(fieldName, info),
                required: info.validation === 'required'
            }
        }
    }

    /**
     * Gera Label para o Campo
     *
     * @param fieldName
     * @param info
     * @returns {*}
     */
    createLabel(fieldName, info) {


        if (info.label) {

            return info.label;

        } else {
            return _.upperFirst(fieldName);
        }

    }


    save() {


        console.log(this.$scope)

        // this
        //     .http({
        //         method: 'POST',
        //         url: $scope.api
        //     })
        //     .then(function successCallback(response) {
        //
        //         if (response.data.error == false) {
        //
        //
        //             $scope.sindriForm = {};
        //
        //             $scope.sindriFormFields = self.createForm(response.data.data)
        //
        //         }
        //
        //
        //     })
        //
        //     .catch(function errorCallback(response) {
        //         // TODO: Retornar mensagem de erro
        //         console.log('TODO: ERRO AO CARREGAR DEFINIÇÃO DE MODELO')
        //
        //     });


    }


}


module.exports = controller;