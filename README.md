# sindri-form

Este módulo disponibiliza uma diretiva que permiter automatizar a criação de formulários apartir
de um modelo no formato sindri.

Tem como base a biblitoeca angular-formly e utiliza uma versão modificada do forly LumX

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

| Propriedade  	| Descrição                                                                                                                   	|
|--------------	|-----------------------------------------------------------------------------------------------------------------------------	|
| api          	| Url da API com acesso ao Sindri Model, para geração do formulário automaticamente                                           	|
| model        	| Caso deseje um formulário personalizado, possível definir modelo aqui                                                       	|
| customFields 	| Definição de campo diretamente pelo Formly sem acessar o sindriModel, neste caso não será salvo automaticamente no servidor 	|