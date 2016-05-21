/**
 * Created by André Timermann on 24/04/16.
 *
 *
 */
'use strict';

const FieldBase = require('../lib/fieldBase');
const InputTemplate = require('../templates/fields/input.html');
const _ = require('lodash');

class InputField extends FieldBase {


    match() {


        return (this.info.type === 'string' && !this.info.mask);

    }

    getField() {

        let self = this;

        let subType = 'text';

        ///////////////////////////////////////////////////////////////
        // Verifica Campo do tipo E-mail
        ///////////////////////////////////////////////////////////////

        if (_.indexOf(self.info.validation, 'email') !== -1) {
            subType = 'email';
        }


        return {
            key: self.fieldName,
            type: "input",
            className: self.info.className,
            templateOptions: {
                type: subType,
                label: self.createLabel(),
                maxlength: self.info.size,
                required: _.indexOf(self.info.validation, 'required') !== -1
                //serverErrorMessage: ["Mensagem de erro do servidor personalizado"]
            }


            // validators: {
            //     notBob: function (viewValue, modelValue, scope) {
            //         var value = modelValue || viewValue;
            //
            //         return value === 'Bob';
            //
            //     }
            // },

            // validation: {
            //     messages: {
            //
            //         notBob: function () {
            //             return "Você não é Bob"
            //         }
            //     }
            // }
        };


    }

    static getFormlyField() {

        return {
            name: 'input',
            template: InputTemplate
        };

    }

}

module.exports = InputField;

