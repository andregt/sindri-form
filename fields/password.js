/**
 * **Created on 07/06/16**
 *
 * sindri-form/fields/password.js
 *
 * @author André Timermann <andre@andregustvo.org>
 * @module SindriForm/Fields
 * @ignore
 *
 */
'use strict';

const FieldType = require('../lib/fieldType');
const _ = require('lodash');
const PasswordTemplate = require('../templates/fields/password.html');

const owasp = require('../vendors/owasp');

/**
 * FieldType para criação e alteração de senha *
 *
 * Atributos:
 *
 * | Parâmetro     | Tipo   | Padrão                   | Obrigatório | Descrição                                                            |
 * |---------------|--------|--------------------------|-------------|----------------------------------------------------------------------|
 *
 *
 * @extends {module:SindriForm/Fields~FieldType}
 */
class PasswordField extends FieldType {


    match() {

        return false;

    }

    getField() {

        let self = this;
        let fields = [];

        ////////////////////////////
        // Campo de Senha
        ////////////////////////////
        let field = self._createField();

        fields.push(field);

        ////////////////////////////
        // Confirmação do Campo de Senha
        ////////////////////////////
        let field2 = self._createField();
        field2.key = self.fieldName + "__confirm";
        field2.templateOptions.label = "Confirmar Senha";
        field2.templateOptions.confirmField = true;


        fields.push(field2);

        return fields;


//         return {
//             key: self.fieldName,
//             type: "password",
//             className: self.info.className,
//             validators: {
//                 confirmPassword: {
//                     expression: function (viewValue, modelValue, scope) {
//
//                         // console.log(scope.confirmValue)
//                         // console.log(scope.confirmValue + '===' + viewValue)
// //                        return (scope.confirmValue === viewValue);
//                         // return truea
//                         alert(modelValue + '||' + viewValue);
//                         return false;
//
//                     },
//                     message: 'Senhas devem ser idênticas'
//                 }
//             },
//             templateOptions: {
//                 label: self.createLabel(),
//                 confirmLabel: "Confirmar Senha",
//                 required: _.indexOf(self.info.validation, 'required') !== -1
//             }
//
//         };


    }

    /**
     * Cria o campo com atributos básicos
     * @returns {object}
     * @private
     */
    _createField() {

        let self = this;

        /**
         * Aqui implementamos a comunicação entre a instancia de dois widgets (fields)
         *  Quando o botão "Alterar Senha" for clicado, deve exibir o campo Confirmar Senha
         *
         *  Ou seja, Se for um update, o botão deve ser exibido e o focmulário confirmar senha deve continuar oculto
         *
         *  Isso normalmente é feito com a HideExpression do formly, que é uma função que verifica quando alguma alteração
         *  ocorre em outro campo qualquer.
         *
         *  O Formly tem um watcher interno que fica ouvindo quando o valor de outro campo é alterado
         *  Infelizmente o Formly só disponibiliza Watcher para alteração de valores (OQ NÃO É NOSSO CASO)
         *
         *  No nosso caso o botão é apenas uma váriavel no templateOptions
         *
         *  OU seja, precisamos criar nosso próprio Watch, isso é feito com a função $scope.$watch(<nome da variavel>...
         *  e em seguida executar o hideExpression para cada field
         *
         *  PORÉM TEMOS OUTRO PROBLEMA AQUI, só é possível fazer esse trigger manual com o runExpression, hideExpression
         *  não funciona, tentei de tudo
         *
         *  Logo em vez de usar hideExpression, vamos criar uma nova váriavel no template chamado "disabled"
         *  e criar uma função runExpression (Expression Properties) que altere o valor de disablad
         *
         *
         *
         */
        return {
            type: "password",
            key: self.fieldName,
            className: self.info.className,
            defaultValue: "",
            templateOptions: {
                label: self.createLabel(),
                // Se é o primeiro campo de senha o de confirmar senha
                confirmField: false,
                stateChangeButton: false,
                disabled: false
            },
            validators: {
                passwordStrength: {
                    expression: function (viewValue, modelValue, scope) {

                        if (viewValue) {
                            return owasp.test(viewValue).strong;
                        } else {
                            return true;
                        }

                    },
                    message: function (viewValue) {

                        return owasp.test(viewValue).errors[0];

                    }
                },
                passwordIdentical: {
                    expression: function (viewValue, modelValue, scope) {

                        // Verifica se o botão está ativo
                        let stateChangeButton = self.form.fields[self.fieldName].templateOptions.stateChangeButton;

                        // Valida apenas se o botão de edição não estiver ativo
                        if (!stateChangeButton) {

                            // Se for o Campo de Confirmação de senha
                            if (scope.to.confirmField === true) {

                                // Acesso ao Campo de Senha Principal
                                let passwordField = self.form.fields[self.fieldName];


                                // Se já estiver disponível
                                if (passwordField.formControl) {


                                    ////////////////////////////////////////////////////////////////
                                    // Aqui precisamos forçar validação do outro campo
                                    // Porém precisamos ter um controle para evitar Loop Infinito
                                    // pois um valida o outro q valida este
                                    // INfelizmente não consiguimos passar parametros pelo $validate, por isso vamos usar
                                    // uma váriavel em data
                                    // Vamos Usar Data (na documentação do formly diz q tá disponível para usarmos
                                    ////////////////////////////////////////////////////////////////

                                    ////////////////////////////////////////////////////////////////
                                    // Algoritmo:
                                    // - Quando Valido A, mando "Validar B" e adiciono uma flag em b:
                                    //   B.manualValidate = true (passwordField.data.manualValidate)
                                    // - A validou B, então em B: Valido B e verifico a flag B.Manualvalidate
                                    //   (scope.options.data.manualValidate) se for true  não mando validar A
                                    ////////////////////////////////////////////////////////////////
                                    if (!scope.options.data.manualValidate) {
                                        passwordField.data.manualValidate = true;
                                        passwordField.formControl.$validate();
                                    } else {
                                        passwordField.data.manualValidate = false;
                                        scope.options.data.manualValidate = false;
                                    }

                                    return passwordField.formControl.$viewValue === (viewValue || modelValue);
                                }

                            }
                            // Se for o Campo de Senha Principal
                            else {

                                // Acesso ao Campo de Confirmar Senha
                                let confirmPasswordField = self.form.fields[self.fieldName + '__1'];

                                // Se já estiver disponível
                                if (confirmPasswordField.formControl) {

                                    // Explicação acima
                                    if (!scope.options.data.manualValidate) {
                                        confirmPasswordField.data.manualValidate = true;
                                        confirmPasswordField.formControl.$validate();
                                    } else {
                                        confirmPasswordField.data.manualValidate = false;
                                        scope.options.data.manualValidate = false;
                                    }

                                    return confirmPasswordField.formControl.$viewValue === (viewValue || modelValue);
                                }
                            }


                            return false;

                        }else{

                            return true;
                        }

                    },
                    message: '"Senhas devem ser idênticas"'
                }
            },
            controller: function ($scope) {


                // Só exibe botão se for no Primeiro campo de senha
                $scope.to.stateChangeButton = !self.form.isNew() && !$scope.to.confirmField;

                // O Formly não atualiza status automaticamente, precisamos criar manualmente
                $scope.$watch('to.stateChangeButton', function (a, b, scope) {

                    _.each(scope.fields, function (field) {
                        field.runExpressions && field.runExpressions();
                    });

                }, true);


            },
            expressionProperties: {
                'templateOptions.disabled': function ($viewValue, $modelValue, scope) {

                    if (scope.to.confirmField === true) {
                        return self.form.fields[self.fieldName].templateOptions.stateChangeButton;
                    }

                    return false;

                }
            }


        };


    }

    static getFormlyField() {

        return {
            name: 'password',
            template: PasswordTemplate

        };

    }

}

module.exports = PasswordField;

