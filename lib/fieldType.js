/**
 * **Created on 14/05/16**
 *
 * 
 *
 * @author André Timermann
 * @module SindriForm/Fields
 *
 */
'use strict';

const _ = require('lodash');

/**
 *
 * Classe Base para Implementação de um novo campo (FieldType)
 *
 * NOTA IMPORTANTE: FieldType pode ser usado em vários momentos na aplicação, por exemplo:
 *  getFormlyField é usado apenas ao carregar a estrutura do Form
 *  getField é carregada várias vezes para cada campo
 *
 *  A Idéia é no futoro criar outros métodos para outros comportamentos
 * @abstract
 */
class FieldType {

    /**
     * Construtor
     *
     * @param {string}                  fieldName   Nome do Campo
     * @param {object}                  info        Descreve todos os atributos do campo
     * @param {object}                  http        Requisição HTTP
     * @param {SindriFormController}    form        Formulário
     */
    constructor(fieldName, info, form) {

        this.fieldName = fieldName;
        this.info = info;
        this.formConfig = this.info.form || {};
        this.form = form;

    }

    /**
     * SindriForm deve automaticamente detectar o tipo de campo de acordo com parâmetros do schema enviado pelo servidor
     *
     * Esta funcão deve retornar true caso este field deva ser usado para os dados enviados pelo schema
     *
     * @abstract
     *
     * @returns {boolean}
     */
    match() {

        throw new Error("Não Implementado ainda");

    }

    /**
     * Retorna configuração do campo para ser usado no formulário
     *
     * @abstract
     */
    getField() {

        throw new Error("Não Implementado ainda");

    }


    /**
     * Gera Label para o Campo
     *
     * @returns {String}
     */
    createLabel() {

        let self = this;

        let requiredLabel = _.indexOf(self.info.validation, 'required') !== -1 ? " *" : "";

        if (self.info.label) {
            return self.info.label + requiredLabel;
        } else {
            return _.upperFirst(self.fieldName) + requiredLabel;
        }

    }

    /**
     * Retorna Estrutura/Arquitetura do campo para ser carregado na inicialização pelo Angular - Formly
     * http://docs.angular-formly.com/docs/formlyconfig
     * @abstract
     *
     */
    static getFormlyField() {

        throw new Error("Não Implementado ainda");

    }


}


module.exports = FieldType;