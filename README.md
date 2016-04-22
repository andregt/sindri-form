# sindri-form

Este módulo disponibiliza uma diretiva que permiter automatizar a criação de formulários apartir
de um modelo no formato sindri.

Tem como base a biblitoeca angular-formly e ~~utiliza uma versão modificada do formly LumX~~

É utilizado pelo sindri-crud para gerar um crud completo de modelo definidos, sendo usado em conjunto
com o sindri-grid

Quando usado em conjunto com sindri-crud, funciona apenas como uma dependencia.

O Objeto é facilitar criação de formulários comuns que simplesmente persistem dados no modelo

**Módulos Relacionados**
* sindri-crud
* sindri-grid
* sindri-model (atualmente incorporado ao sindri-framework)
* sindri-framework


## TODO: Documentar. IMPORTANTE!!!!!!!

* Como funciona o formly
* Como definir campos e wrapper
* Como vincular ao sindrimodel


## Configuração

| Propriedade  	| Status      | Descrição                                                                                                                   	        |
|--------------	| ----------- |-----------------------------------------------------------------------------------------------------------------------------	        |
| api          	|             | Url da API com acesso ao Sindri Model, para geração do formulário automaticamente                                           	        |
| model        	|             | Caso deseje um formulário personalizado, possível definir modelo aqui TODO                                                      	    |
| customFields 	|             | Definição de campo diretamente pelo Formly sem acessar o sindriModel, neste caso não será salvo automaticamente no servidor (TODO) 	    |
| httpRequest 	|             | Função que será usada para enviar e receber dados do servidor, DEVE ter a mesma interface do angular $http.(OPCIONAL). Quando           |
|               |             | definido, é usado para interceptar a comunicação com servidor e verificar se ocorreu alguma problema, como problema de autenticação,    |
|               |             | dessa forma pode ser tomada medidas para resolver o problema sem que o destinatiario, saiba, assim q o problema estiver resolido os     |
|               |             | dados são retornados normalmente como se nada tivesse acontecido     	                                                                |

# TODO:
* Configuração de botão Submit
    * Salvar
    * Salvar e Adicionar Outro
    * Cancelar
    * Voltar Proximo

* Adicionar ng-model (Com o atributo api, o formulário consegue fazer toda comunicação com servidor desde a geração de formulário até persistencia)
Porém pode haver casos em que precisamos de um formulário simples ou diferente, cuja comunicação com servidor precisa ser personalizada

* Documentar os métodos padrões acessado pela api
    * /info
    * Se model for especificado, não é obrigatório /info (explicar pq)