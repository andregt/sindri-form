/**
 * **Created on 31/05/2016**
 *
 * sindri-form/fields/chosen.js
 *
 * @author André Timermann
 * @module SindriForm/Fields
 * @ignore
 */
'use strict';

const FieldType = require('../lib/fieldType');
const ChosenTemplate = require('../templates/fields/chosen.html');
const _ = require('lodash');

/**
 * Campo do tipo select. Widget desenvolvido com a AngularChosen
 *
 * Atributos:
 *
 * | Parâmetro          | Tipo   | Padrão                   | Obrigatório | Descrição                                                            |
 * |--------------------|--------|--------------------------|-------------|----------------------------------------------------------------------|
 * | placeholder        | string | Selecione uma opção      | Não         | Mensagem exibida no select quanto nenhuma opção estiver selecionada. |
 * | noResultsText      | string | Nenhuma opção disponível | Não         | Mensagem exibida quando não houver nenhuma opção para selecionar     |
 * | format             | string | `${id}`                  | Não         | Texto Exibido na listagem de opções.                                 |
 * | url                | string | undefined                | Não         | Carregamento assíncrono, url de onde as opções serão carregadas      |
 * | options            | array  | []                       | Não         | Lista de opções do Select                                            |
 * | nullOptionsLabel   | string | -- Nenhuma seleção --    | Não         | Label para o opção Null na base                                      |
 *
 * Nota: Atributos são definidos no schema
 *
 * @see [Chosen](https://github.com/leocaseiro/angular-chosen)
 * @extends {module:SindriForm/Fields~FieldType}
 */
class ChosenField extends FieldType {


    match() {

        let self = this;

        return (self.info.type === 'ManyToOne');

    }

    getField() {


        let self = this;

        return {
            key: self.fieldName,
            type: "chosen",
            className: self.formConfig.className,
            templateOptions: {
                label: self.createLabel(),
                required: _.indexOf(self.info.validation, 'required') !== -1,
                options: self.formConfig.options !== undefined ? self.formConfig.options : [],
                placeholder: self.formConfig.placeholder || "Selecione uma opção",
                noResultsText: self.formConfig.noResultsText || "Sem Resultados",
                nullOption: self.formConfig.nullOption || "-- Nenhuma Seleção --"
            },
            controller: function ($scope, notify) {

                if (self.info.url) {
                    self._loadOptions(self.info.url)

                        .then(function (result) {

                            _.forIn(result.data, function (row) {

                                let tpl;

                                if (self.formConfig.format) {
                                    // Converte uma string simples nem Template String
                                    tpl = eval('`' + self.formConfig.format.replace(/`/g, '\\`') + '`');
                                } else {
                                    tpl = `#${row.id}`;
                                }


                                $scope.to.options.push({

                                    key: row.id,
                                    label: tpl

                                });

                            });

                        })
                        .catch(function (err) {

                            if (err.status === -1) {
                                notify("Falha ao conectar no Servidor", "danger");
                                swal("Erro", "Falha ao conectar no Servidor!", "error");
                            }


                        });
                }

            }

        };


    }

    _loadOptions(url) {

        let self = this;


        return self.form

            .http({
                method: 'GET',
                url: url
            })

            .then(function successCallback(response) {

                if (response.data.error === false) {

                    return response.data;

                } else {

                    throw new Error(response.data.msg)

                }


            })


    }

    static getFormlyField() {


        return {
            name: 'chosen',
            template: ChosenTemplate
        };

    }


}

module.exports = ChosenField;

