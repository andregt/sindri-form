/**
 * Created by André Timermann on 19/05/16.
 *
 * <File Reference Aqui: check>
 */
'use strict';

const FieldBase = require('../lib/fieldBase');
const CheckTemplate = require('../templates/fields/check.html');
const _ = require('lodash');

class CheckField extends FieldBase {


    match() {

        return (this.info.type === 'bool');

    }

    getField() {

        let self = this;

        // // Altera o valor padrão para false
        // // A leitura de dados é feito antes de carregar Field
        // if (self.info['default'] === undefined) {
        //     self.info['default'] = false;
        // }


        return {
            key: self.fieldName,
            type: "check",
            className: self.info.className,
            defaultValue: false,
            templateOptions: {
                label: self.createLabel(),
                required: _.indexOf(self.info.validation, 'required') !== -1
            }

        };


    }

    static getFormlyField() {

        return {
            name: 'check',
            template: CheckTemplate
        };

    }

}

module.exports = CheckField;

