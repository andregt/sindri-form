/**
 * **Created on 18/06/16**
 *
 * sindri-form/fields/tableMultiSelect.js
 * @author André Timermann <andre@andregustvo.org>
 * @module SindriForm/Fields
 * @ignore
 *
 */
'use strict';

const FieldBase = require('../lib/fieldType');
const TableMultiSelectTemplate = require('../templates/fields/tableMultiSelect.html');
const _ = require('lodash');

/**
 * Widget para Seleção Multipla
 *
 * Nota, Como neste widgets temos que manipular o modelo diretamente, validação interna do formly não funciona
 *
 * Atributos:
 *
 * | Parâmetro     | Tipo   | Padrão                   | Obrigatório | Descrição                                                                                                                                                                                                |
 * |---------------|--------|--------------------------|-------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
 * | url           | string |                          | Sim         | Url onde o Widget vai carregar lista de opções para usuário.                                                                                                                                             |
 * | tableColumns  | Object | {}                       | Não         | Objeto descrevendo as colunas da tabela que será apresentado para usuário selecionar o elemento de relacionado na tabela remota, onde a chave é o nome do atributo remoto e valor é o título da coluna.  |
 * | noResultsText | string | Nenhuma Opção Disponível | Não         | Texto que será exibido quando servidor não carregar nenhuma opção
 * | groupBy       | string |                          | Não         | As opções serão agrupadas por esta coluna
 * |---------------|--------|--------------------------|-------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
 *
 * @extends {module:SindriForm/Fields~FieldType}
 */
class TableMultiSelectField extends FieldBase {

    match() {

        let self = this;

        return (self.info.type === 'ManyToMany');

    }

    getField() {

        let self = this;


        self.info.filter = "manyRelation";


        return {
            key: self.fieldName,
            type: "tableMultiSelect",
            className: self.info.className,
            templateOptions: {
                label: self.createLabel(),
                noResultsText: self.info.form.noResultsText
            },
            controller: function ($scope, notify, $filter) {

                let screenHeight = (Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - 400);

                if (screenHeight < 300) {
                    screenHeight = 300;
                }

                $scope.screenHeight = screenHeight + 'px';

                $scope.tableHeader = [];
                $scope.tableOptions = [];

                $scope.searchOptions = '';

                let dataSorted = {};

                if (self.info.url) {

                    // Carrega Lista de Opções do servidor via ajax
                    self._loadOptions(self.info.url)

                        .then(function (result) {


                            let model = $scope.model[$scope.options.key];

                            /////////////////////////////////////////////
                            // Carrega Header da Tabela
                            /////////////////////////////////////////////

                            _.forIn(self.info.form.tableColumns || {}, function (columnName) {
                                $scope.tableHeader.push(columnName);
                            });

                            /////////////////////////////////////////////
                            // Percorre todos os registros vindo do servidor
                            // para montar a tabela de opções
                            /////////////////////////////////////////////
                            _.forIn(result.data, function (row) {


                                let elem = {
                                    id: row.id,
                                    selected: _.indexOf(model, row.id) !== -1
                                };

                                _.forIn(self.info.form.tableColumns || {}, function (columnName, columnKey) {
                                    elem[columnKey] = row[columnKey];
                                });

                                //////////////////////////////////////////////
                                // Agrupa
                                //////////////////////////////////////////////

                                let groupName = self.formConfig.groupBy ? row[self.formConfig.groupBy] : "";

                                if (!dataSorted[groupName]) {
                                    dataSorted[groupName] = [];
                                }

                                dataSorted[groupName].push(elem);


                            });

                            //////////////////////////////////////////////
                            // Cria Estrura para envar para o template, onde o field, __groupName indica q é inicio de um grupo
                            //////////////////////////////////////////////
                            _.forIn(dataSorted, function (options, groupName) {

                                if (self.formConfig.groupBy) {
                                    $scope.tableOptions.push({
                                        __groupName: groupName,
                                        __groupLength: options.length
                                    });
                                }

                                _.each(options, function (option) {
                                    $scope.tableOptions.push(option);
                                });

                            });

                        })

                        .catch(function (err) {

                            if (err.status === -1) {
                                notify("Falha ao conectar no Servidor", "danger");
                                swal("Erro", "Falha ao conectar no Servidor!", "error");
                            }


                        });

                } else {
                    throw new Error("Atributo 'url' obrigatório no Widget TableMultiSelect");
                }


                $scope.$watch('tableOptions|filter:{selected:true}', function (nv) {

                    $scope.model[$scope.options.key] = _.map(nv, 'id');

                }, true);


                /**
                 * Função para busca de opções
                 *
                 * @returns {boolean}
                 * @param searchOption
                 */
                $scope.filterOptions = function (searchOption) {

                    searchOption = searchOption.toLowerCase();

                    return function (values) {


                        // Se for um titulo de grupo, sempre retorna
                        if (values.__groupName) {
                            return true;
                        }

                        // Busca apenas pelos campos exibidos
                        values = _.pick(values, Object.keys(self.formConfig.tableColumns));


                        // Pelo menos um deve retornar
                        return _.some(_.values(values), function (s) {
                            return (String(s).toLowerCase().indexOf(searchOption) !== -1);
                        });


                    };


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
            name: 'tableMultiSelect',
            template: TableMultiSelectTemplate
        };

    }

}

module.exports = TableMultiSelectField;

