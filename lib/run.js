/**
 * Created by André Timermann on 08/04/16.
 *
 *
 */
'use strict';

const _ = require('lodash');

/**
 * Função usada para carregar todos os módulos de um diretório com webpack
 * ref: https://webpack.github.io/docs/context.html#context-module-api
 *
 * @param requireContext
 * @returns {*}
 */
function requireAll(requireContext) {
    return requireContext.keys().map(requireContext);
}

module.exports = function (formlyConfig, formlyValidationMessages) {

    //////////////////////////////////////////////////////////////////
    // INPUT TEXT    
    // http://docs.angular-formly.com/docs/formlyconfig#settype
    //////////////////////////////////////////////////////////////////

    var modules = requireAll(require.context("../fields", false, /^\.\/.*\.js$/));

    _.forIn(modules, function (module) {
        formlyConfig.setType(module.getFormlyField());
    });


    //////////////////////////////////////////////////////////////////////////
    // WRAPPER
    // http://docs.angular-formly.com/docs/formlyconfig#setwrapper
    //////////////////////////////////////////////////////////////////////////
    formlyConfig.setWrapper({
        // name: 'inputWrapper', // optional. Defaults to name || types.join(' ') || 'default'
        template: require('../templates/defaultWrapper.html') // must have this OR templateUrl
        //templateUrl: 'path/to/template.html', // the resulting template MUST have <formly-transclude></formly-transclude> in it and must have templateUrl OR template (not both)
        // types: 'input' // this can be a string or an array of strings that map to types specified by setTe


    });

    //////////////////////////////////////////////////////////////////////////
    // Carrega Mensagens Padrão de erro
    //////////////////////////////////////////////////////////////////////////
    // formlyValidationMessages.addStringMessage('required', 'This field is required');

    // TODO: Colocar nos fields, não deve ficar aqui
    formlyConfig.extras.ngModelAttrsManipulatorPreferBound = true;
    formlyValidationMessages.addStringMessage('required', 'Campo Obrigatório');
    formlyValidationMessages.addStringMessage('maxlength', 'Tamanho máximo excedido');
    formlyValidationMessages.addStringMessage('email', 'E-mail Inválido');


};