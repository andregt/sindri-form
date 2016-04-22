/**
 * Created by André Timermann on 08/04/16.
 *
 *
 */
'use strict';


module.exports = function (formlyConfig) {

    //////////////////////////////////////////////////////////////////
    // INPUT TEXT
    // TODO: Automatizar (usar compile), colocar em diretrio fields
    // http://docs.angular-formly.com/docs/formlyconfig#settype
    //////////////////////////////////////////////////////////////////
    formlyConfig.setType({
        name: 'input',
        template: require('../templates/fields/input.html')
    });

    //////////////////////////////////////////////////////////////////////////
    // WRAPPER
    // http://docs.angular-formly.com/docs/formlyconfig#setwrapper
    //////////////////////////////////////////////////////////////////////////
    formlyConfig.setWrapper({
        // name: 'inputWrapper', // optional. Defaults to name || types.join(' ') || 'default'
        template: require('../templates/defaultWrapper.html'), // must have this OR templateUrl
        //templateUrl: 'path/to/template.html', // the resulting template MUST have <formly-transclude></formly-transclude> in it and must have templateUrl OR template (not both)
        // types: 'input' // this can be a string or an array of strings that map to types specified by setTe


    })

};