# sindri-form

Este módulo disponibiliza uma diretiva que permiter automatizar a criação de formulários apartir
de um modelo no formato sindri.

Tem como base a biblitoeca angular-formly e ~~utiliza uma versão modificada do formly LumX~~

É utilizado pelo sindri-crud para gerar um crud completo de modelo definidos, sendo usado em conjunto
com o sindri-grid

Quando usado em conjunto com sindri-crud, funciona apenas como uma dependencia.

O Objetivo é facilitar criação de formulários comuns que simplesmente persistem dados no modelo

**Módulos Relacionados**
* sindri-crud
* sindri-grid
* sindri-model (atualmente incorporado ao sindri-framework)
* sindri-framework


## TODO: Documentar. IMPORTANTE!!!!!!!

* Funcionamento geral do sindriFOrmly (talvez com diagrama, é complexo)
* Como funciona o formly
* Como definir campos e wrapper
* Como vincular ao sindrimodel
* Documentar os métodos padrões acessado pela api
    * /schema
    * Se model for especificado, não é obrigatório /schema (explicar pq)
    * Documentação parcial no Zim (PASSO A PASSO fo formly criar a partir de lá)
* Como criar validação personalizada
* Documentar como definir atributos personalizado do formulário aqui, Expressions propertyes

## Configuração

| Propriedade  	| Status      | Descrição                                                                                                                   	        |
|--------------	| ----------- |-----------------------------------------------------------------------------------------------------------------------------	        |
| api          	|             | Url da API com acesso ao Sindri Model, para geração do formulário automaticamente                                           	        |
| template      |             | É possível carregar templates diferente do mesmo schema, definição é feita no servidor                                                  |
| id            |             | Id do registro, se definido é uma atualização, carrega dados do servidor, caso contrário novo registro                                  |
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

* Separar o Grow do Sindri Admin, deixar generico, pois é usado no sindri-form



* Por enquanto cada campo tem dois modo: sucesso e erro, mas tb podemos usar o aviso (que tem no materialDesign), exemplo de uso: Senha Fraca
* Na verdade podemos ter um status personalizado pra sucesso tb, com um icone de ok no final (ver no template do material design)