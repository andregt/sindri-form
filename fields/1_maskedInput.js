/**
 * Created by André Timermann on 14/05/16.
 *
 * Refêrencia:
 * - http://angular-formly.com/#/example/very-advanced/ng-mask
 * - http://candreoliveira.github.io/bower_components/angular-mask/examples/index.html#/
 *
 */
'use strict';

const inputField = require('./0_input');

class MaskedInputField extends inputField {


    match() {


        return (this.info.type === 'string' && this.info.mask);

    }

    getField() {

        let self = this;

        let field = super.getField();

        let maskPattern;


        // Carrega padrões da Máscara
        // http://candreoliveira.github.io/bower_components/angular-mask/examples/index.html#/
        switch (self.info.mask) {

            case 'cpf':
                maskPattern = '999.999.999-99';
                break;
            case 'cep':
                maskPattern = '99999-999';
                break;

            case 'phonebr':
                maskPattern = '(99) 9?9999-9999';
                break;

            case 'phoneint':
                maskPattern = '+99 99 9?9999-9999';
                break;

            default:
                maskPattern = self.info.mask;

        }

        field.type = "maskedInput";
        field.templateOptions.mask = maskPattern;

        return field;

    }

    static getFormlyField() {

        return {
            name: 'maskedInput',
            extends: 'input',
            defaultOptions: {
                ngModelAttrs: { // this is part of the magic... It's a little complex, but super powerful

                    mask: { // the key "ngMask" must match templateOptions.ngMask
                        attribute: 'mask' // this the name of the attribute to be applied to the ng-model in the template
                    },

                    // applies the 'clean' attribute with the value of "true"
                    'true': {
                        value: 'clean'
                    },

                    'reject': {
                        value: 'restrict'
                    }
                },
                // this is how you hook into formly's messages API
                // however angular-formly doesn't ship with ng-messages.
                // You have to display these messages yourself.
                validation: {
                    messages: {
                        mask: '"Formato Inválido"'
                    }
                }
            }

        };

    }
}

module.exports = MaskedInputField;
