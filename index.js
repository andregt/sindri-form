/**
 * **Created on 08/04/16**
 *
 * Módulo AngularJs que disponibiliza uma diretiva que gera formulário completo, baseado no Angular-Formly.
 *
 * Formulário é contruido através de um schema, que pode ser obtido direto do servidor ou configurado diretamente no
 * controller.
 *
 * ## Opções da Diretiva
 *
 * | Parâmetro | Tipo   | Bind | Padrão    | Obrigatório | Descrição                                                                                                                                                                                                 |
 * |-----------|--------|------|-----------|-------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
 * | options   | object | =    | {}        | Não         | Objeto de configuração do SindriForm                                                                                                                                                                      |
 * | api       | string | @    | undefined | Não         | URL da api do servidor, é usado para carregar schema, salvar dados ou carregar dados                                                                                                                      |
 * | template  | string | @    | undefined | Não         | Define template, não implementado                                                                                                                                                                         |
 * | id        | *      | =    | undefined | Não         | Define o ID ou key, que representa os dados no servidor. Caso seja null, o formulário entra no modo criação, caso contrário, entra no modo de atualização carregando dados do formulário na inicialização |
 *
 *
 * Exemplo:
 * ```html
 * <sindri-form options="sindriCrudCtrl.formOptions"></sindri-form>
 * ```
 *
 * ## Options
 * O nome options está errado pois ele funciona mais como uma API de comunicação do sindriForm que um objeto de
 * configuração unidirecional.
 * 
 * Ele está vinculado pela diretiva através de um two-way databind, portanto podemos usa-lo tanto para definir atributos
 * quanto para obter alguma resposta ou ainda ler eventos.
 * 
 * Veja refêrencia abaixo:
 *
 * | Parâmetro    | Tipo     | Padrão | Obrigatório | Descrição                                                                                                                                                                                                 |
 * |--------------|----------|--------|-------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
 * | schema       | array    | []     | Sim         | Array de Configuração dos campos. Pode ser obtido tanto diretamente ou através de uma requisição ao servidor usando o atributo api.                                                                       |
 * | autoload     | boolean  | false  | Sim         | Ativa o carregamento automático do formulário. Por padrão ele é carregado em branco sem nenhum campo.                                                                                                     |
 * | api          | string   | null   | Sim         | URL da api do servidor, é usado para carregar schema, salvar dados ou carregar dados.                                                                                                                     |
 * | id           | *        | null   | Não         | Define o ID ou key, que representa os dados no servidor. Caso seja null, o formulário entra no modo criação, caso contrário, entra no modo de atualização carregando dados do formulário na inicialização |
 * | fieldOptions | object   | {}     | Não         | Configuração personalizada para o campo.  É atribuído diretamente no Formly, nas configurações de cada campo.REF: http://docs.angular-formly.com/docs/field-configuration-object                          |
 * | loadForm     | function |        |             | Carrega formulário quando executado. Interface Externa                                                                                                                                                    |
 * | onSave       | callback | null   | Não         | Função callback que será executado quando formulário finalizar persistência dos dados. Primeiro argumento é o status da requisição True sucesso, false falha                                              |
 *
 * ## Schema
 * Schema contém dois tipos de atributos: globais e especificos, atributos globais serão definido aqui, atributos
 * especificos estão documentado nos seus respecfivos [FieldsType]{@link module:SindriForm/Fields}
 *
 * * Atributos globais estão em sincronia com definição do schema no Servidor (SindriModel)
 * * TODO: Documentar aqui ou criar um link para sindriModel
 * 
 *
 * ## FieldType
 * FieldType são implementações de cada tipo de campo com Widgets especificos. Consulte mais detalhes no link abaixo:
 *
 * * [Fields Type]{@link module:SindriForm/Fields}
 *
 * @todo Mudar Nome de Options para API, observando que esta funcionalidade está implementada na classe pai (sindri-client)
 *
 * TODO: Criar opção para personalizar template do formulário (Criar um layout de form mais complexo), lembrando q podemos criar varias tags formly
 * 
 * @example
 *   <sindri-form options="sindriCrudCtrl.formOptions"></sindri-form>
 *
 *
 * @author André Timermann <andre@andregustavo.org>
 * @module SindriForm
 */

'use strict';

const angular = require('angular');
const AngularFormly = require('angular-formly');

require('angular-messages');

// Versão do NPM desatualizado
require('./vendors/ngMask/ngMask');

module.exports = angular.module("sindriForm", [AngularFormly, "ngMessages", "ngMask"])
    
// PERSONALIZAÇÃO DO FORMULÁRIO FORMLY, Inicialização dos campos
    .run(require('./lib/run'))

    // CONFIGURAÇÃO DA DIRETIVA
    .directive('sindriForm', require('./lib/directive'))


    .name;

