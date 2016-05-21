/**
 * Created by André Timermann on 18/05/16.
 *
 * <File Reference Aqui: date>
 */
'use strict';

const MaskedInput = require('./1_maskedInput');
//const DataTemplate = require('../templates/fields/date.html');
const _ = require('lodash');

class DataInputField extends MaskedInput {


    match() {

        return (this.info.type == 'date');

    }

    getField() {

        let self = this;

        let field = super.getField();

        // Altera o Tipo de Filtro
        self.info.filter = "date";

        field.templateOptions.mask = "39/19/9999";

        return field;


    }

    static getFormlyField() {

        return {
            name: 'dateInput',
            extends: 'maskedInput'

        };

    }

}

module.exports = DataInputField;

