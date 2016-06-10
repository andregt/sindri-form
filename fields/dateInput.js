/**
 * Created by André Timermann on 18/05/16.
 *
 * @module SindriForm/Fields
 * @ignore
 */
'use strict';

const MaskedInputField = require('./1_maskedInput');
//const DataTemplate = require('../templates/fields/date.html');
const _ = require('lodash');

/**
 * Máscara para Datas
 *
 * @extends {module:SindriForm/Fields~MaskedInputField}
 */
class DataInputField extends MaskedInputField {


    match() {

        let self = this;

        return (self.info.type == 'date' || self.info.type == 'datetime');

    }

    getField() {

        let self = this;

        let field = super.getField();

        // Altera o valor padrão para false
        // A leitura de dados é feito antes de carregar Field
        // if (!self.info['default']) {
        //     self.info['default'] = '';
        // }

        if (self.info.type == 'date') {
            // Altera o Tipo de Filtro
            self.info.filter = "date";
            field.templateOptions.mask = "39/19/9999";

        }else{

            self.info.filter = "datetime";
            field.templateOptions.mask = "39/19/9999 29:59";

        }

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

