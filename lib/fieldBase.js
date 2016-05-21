/**
 * Created by André Timermann on 14/05/16.
 *
 * Classe Base para Implementação de um novo campo
 *
 */
'use strict';

const _ = require('lodash');

class FieldBase {

    constructor(fieldName, info){

        this.fieldName = fieldName;
        this.info = info;

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
    match(){

        throw new Error("Não Implementado ainda");

    }

    /**
     * Retorna configuração do campo para ser usado no formulário
     *
     * @abstract
     */
    getField(){

        throw new Error("Não Implementado ainda");

    }


    /**
     * Gera Label para o Campo
     *
     * @returns {String}
     */
    createLabel() {

        let self = this;

        if (self.info.label) {
            return self.info.label;
        } else {
            return _.upperFirst(self.fieldName);
        }

    }

    /**
     * Retorna Estrutura/Arquitetura do campo para ser carregado na inicialização pelo Angular - Formly
     * @abstract
     *
     */
    static getFormlyField(){

        throw new Error("Não Implementado ainda");

    }


}


module.exports = FieldBase;