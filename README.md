# 25_2-Refatoracao-arquitetural-da-plataforma-Micelio-para-ganhos-de-escalabilidade-e-manutenibilidade
**Título do TCC:**  Refatoração arquitetural da plataforma Micélio para ganhos de escalabilidade e manutenibilidade 
**Alunos:**  Emmanuel Dickson Teye 
**Semestre de Defesa:** 2025-2 
[PDF do TCC](https://www.overleaf.com/read/xymvjhpykdmw#313594)

# TL;DR

Para executar rapidamente o sistema:

### 1. Clonar o repositório
```bash
git clone https://github.com/EIC-BCC/25_2-Refatoracao-arquitetural-da-plataforma-Micelio-para-ganhos-de-escalabilidade-e-manutenibilidade.git
cd 25_2-Refatoracao-arquitetural-da-plataforma-Micelio-para-ganhos-de-escalabilidade-e-manutenibilidade

### Backend
```bash
cd MicelioAPI
npm install
npm run dev
### Frontend
cd MicelioDashboardNext
npm run dev
``` 
# Descrição Geral

Este projeto consiste na refatoração arquitetural da plataforma Micélio utilizando o framework Next.js, com foco em aprimorar desempenho, escalabilidade, manutenção e organização estrutural. O trabalho envolveu a modernização de componentes, correção de funcionalidades existentes, adoção de Server-Side Rendering, reorganização de módulos e implementação de técnicas como Edge Functions e connection pooling para otimização de acesso ao banco de dados.

# Funcionalidades

* Migração completa para Next.js
   * Reestruturação de componentes
   * Uso de SSR 
   * Modularização
* Implementação de Edge Function
   * Dados em tempo real com baixa latência
   * Redução de carga no servidor principal
* Connection Pooling no banco de dados
   * Reutilização de conexões
   * Menor latência
   * Proteção contra excesso de conexões
* Novos cards informativos no painel
   * Métricas de sessões, jogos, grupos e usuários online
* Correção de problemas herdados
   * Carregamento de sessões
   * Configurações de visualizações
   * Renderização de componentes

# Arquitetura

A arquitetura refatorada da plataforma Micélio foi reorganizada para separar responsabilidades, otimizar fluxo de dados e melhorar manutenção. O sistema é composto por:

* Frontend em Next.js (SSR + SPA híbrido)
* Edge Function para processamento rápido
* API interna para consultas
* Banco de dados com connection pooling

```mermaid
graph TD;
    User-->NextJS;
    NextJS-->EdgeFunction;
    NextJS-->API;
    API-->Database[(MySQL<br/>Connection Pooling)];
    EdgeFunction-->Database;
```
# Dependências

* Node.js
* Next.js
* Edge Functions (Vercel)
* MySQL(Banco de dados relacional)
* Connection Pooling
* React

# Execução

### 1. Clonar o repositório
```bash
git clone https://github.com/EIC-BCC/25_2-Refatoracao-arquitetural-da-plataforma-Micelio-para-ganhos-de-escalabilidade-e-manutenibilidade.git
cd 25_2-Refatoracao-arquitetural-da-plataforma-Micelio-para-ganhos-de-escalabilidade-e-manutenibilidade

 2. Backend
cd MicelioAPI
npm install
npm run dev

 3. Frontend
cd MicelioDashboardNext
npm install
npm run dev
```
# Micélio - Plataforma de Proveniencia para Avaliação do Aprendizado em Jogos Educacionais

A plataforma Micélio tem por objetivo coletar dados de proveniência de jogos didáticosvisando auxiliar os desenvolvedores de tais jogos a avaliar o quanto um jogo desenvolvido mobiliza os conceitos pretendidos. Na plataforma Micélio, isso é feito observando as ações realizadas pelo jogador. A plataforma provê ainda a visualização dos dados obtidos por meio de diferentes modelos de visualização permitindo uma análise visual dos dados. A plataforma Micélio, proposta desse trabalho, é dividida em três módulos, conforme apresentado abaixo:

<div style="text-align:center">
 <img alt="Arquitetura" src="./Documentation/Diagramas/conexao.png"/>
 <br/>
 Comunicação do Micélio entre os componentes
 <br/>
 <br/>
</div>

O primeiro módulo, chamado Micélio Unity, é um módulo criado para ser utilizado em conjunto com a plataforma [Unity](https://unity.com) de desenvolvimento de jogos. Esse módulo é integrado ao jogo sendo desenvolvido e provê métodos para recolher os dados dos jogos de forma transparente para o desenvolvedor. 

Os dados recolhidos são armazenados em um banco de dados por meio de outro módulo, chamado Micélio API, esse é um serviço construído para receber os dados dos jogos cadastrados na plataforma. Esse módulo do sistema é responsável por receber os dados, seguindo o modelo de proveniência construído no projeto, trata-los e armazená-los no banco de dados. O tratamento desses dados é feito para verificar se as informações recebidas tratam-se de novos dados, ou atualização de dados já existentes. 

É importante ressaltar que o Micélio foi projetado com o objetivo de ser uma via de mão única com os jogos. Isto significa que o módulo Micélio API recebe os dados dos jogos, mas não devolve nenhum dado. Isso foi pensado para que o jogo não dependa de uma resposta da API para seguir na sua história, tornando ele completamente independente desse módulo. 

Por fim, os dados armazenados são visualizados por meio do módulo Micélio Dashboard. Esse módulo cria uma interface gráfica de visualização e análise dos dados cadastrados. Nele o usuário (desenvolvedor ou professor) pode cadastrar os jogos, criar grupos de análise, convidar outras pessoas para colaborar em um projeto e recuperar as credenciais de integração dos sistemas. 


## Modelo de Dados

O Micélio é uma plataforma de proveniência criada com o objetivo de recolher, armazenar e analisar dados de proveniência de qualquer tipo de jogo. Por ter como objetivo abranger qualquer tipos de jogo, tornou-se necessário criar um modelo de dados geral que pudesse armazenar informações de forma genérica. Tendo isso em mente, utilizamos o PROV como base paramontar nosso próprio modelo de proveniência, com foco em dados de jogos. As principais entidades do PROV: entidades, agentes e atividades, foram mantidas. Afim de facilitar o entendimento, chamaremos as entidades do PROV de objetos de proveniência. Além dos objetos de proveniência, para cada um deles, criamos generalizações que nos ajudama identificar quando esses objetos possuem uma posição física no jogo ou não. Com essas informações, podemos definir se aquele objeto é um conceito abstrato ou algo físico dentro do jogo. A figura abaixo representa o diagrama de classes do modelo de dados utilizado pelo Micélio. 

<div style="text-align:center">
 <img alt="Modelo de Dados" src="./Documentation/Diagramas/modelo-de-dados.png"/>
 <br/>
 Diagrama de Classes utilizado pelo Micélio para armazenamento dos dados. 
 <br/>
 <br/>
</div>


O modelo de dados foi definido com três tipos de entidades: objetos do jogo, objetos deproveniência e objetos do sistema. Objetos do jogo são objetos derivados de objetos de proveniência, ou informações relacionadas as associações entre eles, em geral esses objetos não possuem informações obrigatórias, mas ajudam a detalhar as informações específicas de cada jogo. Os objetos de proveniência são os objetos que guardam as informações essenciais para proveniência. Já os objetos do sistema são objetos que nos ajudam a gerenciar as informaçõesdo sistema, como por exemplo a que jogo pertence aqueles dados, ou quem tem permissão paraacessá-los. 

### Objetos do Jogo e de Proveniencia

A proveniência do nosso modelo está relacionada a cada sessão inciada dentro de um jogo. Em cada sessão acontecem diversas atividades, e diferente do modelo base (PROV), cada atividade pode ser iniciada tanto por um agente, por uma entidade ou até mesmo por outra atividade.

Um jogo pode possuir diversos eventos diferentes acontecendo dentro dele, por conta disso, foi necessário incluir o atributo name dentro das atividades, dessa forma podemos identificar eventos semelhantes. Além desse, o atributo time, foi incluído para que seja possível definir a ordem dos acontecimentos, e o atributo properties, foi incluído para definir propriedades específicas de cada atividade, em cada jogo. Considere que em um jogo exista uma atividade de limpar determinada área. Um bom exemplo de utilização das propriedades de uma atividade seria indicar o tempo gasto para realizar essa atividade, e esse tempo pode mudar a cada vez que a atividade for executada. Por outro lado, uma atividade de venda não precisaria desse atributo, logo, as propriedades nos auxiliam com as especificidades de cada jogo que não podem ser generalizadas. As propriedades no modelo são guardadas em formato texto, seguindo o padrão JSON. 

Além de seus atributos, uma atividade guarda todos os agentes e entidades que fizeram parte daquele evento, seja iniciando aquela atividade, sofrendo alguma alteração ou surgindo a partir daquela atividade. Para definir como cada agente ou entidade participou de uma atividade, cada vez que eles são associados, é necessário definir o papel de cada um deles utilizando o atributo role. Além do papel, a posição e as propriedades de um agente ou entidade, podem mudar em uma atividade, e para manter esse histórico foram incluídos os atributos Position e properties nas associações. 

Um agente, assim como no modelo base, é um objeto com responsabilidades. Um jogo pode possuir diferentes tipos de agentes, e para classificá-los foi incluído o atributo name. Contudo, só o nome, pode não ser suficiente para definir um agente, pois um mesmo tipo de agente pode ser controlado pelo jogador e outro pelo sistema do jogo. Para resolver isso, foi incluído o atributo type, que define o tipo de um agente. Em geral, definimos os tipos dos agentes como Player ou CPU, mas isso depende de como o desenvolvedor quer diferenciar seus objetos, então não existe uma regra para atribuir esses valores. Assim como as atividades, para cada jogo, os agentes podem possuir atributos específicos, que são definidos no atributo properties. 

Para cada instância de um agente dentro de uma sessão, deve ser incluído um identificador único que permitirá o sistema saber quando os dados enviados do agente tratam-se de uma atualização ou inclusão dentro daquela sessão. Esse processo se torna transparente quando utilizadoo módulo Micélio Unity. Uma entidade, no modelo criado, é muito parecida com a do modelo base, com a diferença que nesse modelo as entidades podem ser o gatilho para determinado evento, sem a necessidadede estarem associadas a um agente. As entidades são objetos sem responsabilidades, e para defini-las é necessário apenas um nome através do atributo name. Assim como os outros objetos de proveniência, cada entidade, em cada jogo, pode possuir atributos específicos por meio do atributo properties. Para cada entidade, seguindo a mesma lógica utilizada nos agentes, é preciso saber se os dados recebidos tratam-se de uma atualização, ou de uma inclusão. Para resolver esse problema,cada entidade, dentro de uma sessão, precisa possuir um identificador único. Esse processo também se torna transparente quando utilizado o módulo Micélio Unity. 

### Objetos do Sistema

Os objetos do sistema são objetos que complementam o modelo com informações sobre ouso do jogo. As principais classes são: Device,Game e Session. A classe Session representa o agrupamento de várias atividades. Em outras palavras, é cada partida individual ou evento independente de um jogo. Cada sessão é realizada em um jogo, que é representado pela classe Game. Essa classe, além de representar o jogo, guarda as informações de comunicação daquele jogo com a API do Micélio. 

A classe Device tem por objetivo identificar quem está jogando aquela partida e, dessa forma, conseguir empilhar sessões. Além dessas classes, outros objetos de sistema foram criados para garantir a privacidade dos dados. As classes User e HasPermission garantem que apenas o dono do jogo tenha acesso total aos dados gerados pelo seu jogo. 

Ainda assim, a plataforma permite o compartilhamento de jogos com outros usuários. Quando um usuário compartilha um jogo com outro usuário,esse outro ainda assim não tem acesso aos dados do jogo, ele apenas tem o direito de criar um grupo de sessões, e para criação desses grupos foi gerada a classe SessionGroup. Essa classe disponibiliza um código de grupo, e somente quando uma sessão é atrelada a esse grupo, o segundo usuário tem acesso aos dados. Um grupo de sessão, além de permitir que outro usuário tenha acesso parcial a dados de um jogo, pode ser encerrado a qualquer momento pela pessoa que o criou. Tal funcionalidade foi pensada para que nenhuma sessão seja enviada para aquele grupo após o fim do experimento. A ideia é que os grupos de sessão sejam utilizados para análises individuais, por exemplo, se um professor quiser avaliar o aprendizado de uma turma utilizando um determinado jogo. Após o experimento, não é uma boa ideia que outras pessoas continuem enviando seções, pois essas enviadas após o momento determinado podem acabar alterando os resultados obtidos.


## Módulos

Para mais informações sobre cada um dos módulos e exmplos de implementação, acesse a página de cada um deles através dos links abaixo:

- MicelioAPI:

  [Saiba mais](https://github.com/GPMM/micelio/tree/main/MicelioAPI).

- MicelioUnity:

  [Saiba mais](https://github.com/GPMM/micelio/tree/main/MicelioUnity).

- MicélioDashboard:

  [Saiba mais](https://github.com/GPMM/micelio/tree/main/MicelioDashboard).