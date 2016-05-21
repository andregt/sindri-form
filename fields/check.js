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


        return {
            key: self.fieldName,
            type: "check",
            className: self.info.className,
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

