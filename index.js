/**
 * Created by André Timermann on 08/04/16.
 *
 *
 */
'use strict';

const angular = require('angular');


module.exports = angular.module("sindriForm", [require('angular-formly')])


    // PERSONALIZAÇÃO DO FORMULÁRIO FORMLY, Inicialização dos campos
    .run(require('./lib/run'))

    // CONFIGURAÇÃO DA DIRETIVA
    .directive('sindriForm', require('./lib/directive'))


    .name;
