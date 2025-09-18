
import React, { useState, useCallback, useEffect } from 'react';
import { ActionType, View } from './types';
import Header from './components/Header';
import MainView from './components/MainView';
import ResultsView from './components/ResultsView';
import HelpModal from './components/HelpModal';
import { actionConfig } from './constants';

// No API setup needed for ApiFreeLLM

function getPromptForAction(action: ActionType, context: string): string {
    // Prompt avançado instruindo a IA a usar um processo de raciocínio estruturado.
    const basePrompt = `Você é um "Tutor Inteligente", uma IA assistente de estudos. Sua tarefa é analisar o texto fornecido e executar a tarefa solicitada com a máxima precisão e clareza.

Para garantir a mais alta qualidade em sua resposta, você DEVE seguir este processo de raciocínio interno antes de fornecer a resposta final:
1.  **Cadeia de Pensamento (Chain of Thought - CoT):** Primeiro, analise a solicitação do usuário e o texto. Pense passo a passo sobre o que está sendo pedido e quais são as informações-chave no texto. Identifique os conceitos centrais, argumentos e evidências.
2.  **Auto-Reflexão e Árvore de Pensamentos (Tree of Thoughts - ToT):** Gere 2-3 abordagens iniciais ou rascunhos de resposta. Critique cada rascunho. Pergunte a si mesmo: Isso é preciso? Está completo? Responde diretamente à solicitação do usuário? É fácil de entender? Selecione a melhor abordagem ou sintetize as melhores partes de cada rascunho para construir uma resposta superior.
3.  **Resposta Final Polida:** Com base em sua análise interna, formule a resposta final, limpa e bem estruturada para o usuário. Use marcações simples como **negrito** para destacar termos importantes.

**IMPORTANTE:** Sua saída final deve ser APENAS a resposta polida. NÃO inclua seu pensamento passo a passo, seus rascunhos ou suas autocríticas na resposta final. O usuário deve receber apenas o resultado do seu processo de raciocínio.

--- INÍCIO DO TEXTO ---
${context}
--- FIM DO TEXTO ---

`;

    switch (action) {
        case 'SUMMARIZE':
            return basePrompt + "Tarefa: Crie um resumo conciso e claro dos pontos principais do texto acima. Use bullet points (iniciando cada um com um hífen '-') para facilitar a leitura.";
        case 'KEYWORDS':
            return basePrompt + "Tarefa: Identifique e liste os 5 a 7 termos ou conceitos mais importantes do texto. Para cada termo, forneça uma breve definição (1-2 frases) baseada no contexto do texto. Formate como: **Termo:** Definição.";
        case 'REFLECT':
            return basePrompt + "Tarefa: Elabore de 3 a 5 perguntas abertas e instigantes que incentivem a reflexão sobre o conteúdo do texto. As perguntas devem estimular o pensamento crítico. Numere as perguntas.";
        case 'TEST':
            return basePrompt + "Tarefa: Crie um pequeno quiz com 4 perguntas de múltipla escolha para testar o conhecimento sobre o texto. Siga ESTRITAMENTE este formato:\n1. Pergunta...\na) Opção A\nb) Opção B\nc) Opção C\nd) Opção D\n\n2. Pergunta...\n...\n\nNo final, adicione a chave de respostas usando a tag **Gabarito:** seguido das respostas (ex: 1-c, 2-a...).";
        case 'SIMPLIFY':
            return basePrompt + "Tarefa: Reescreva os conceitos mais complexos do texto em uma linguagem simples e fácil de entender, como se estivesse explicando para um estudante do ensino médio. Use parágrafos curtos.";
        case 'MINDMAP':
            return basePrompt + "Tarefa: Gere uma estrutura de mapa mental em formato de texto (usando recuo e marcadores como -, +, *) que organize as ideias principais e secundárias do texto. Comece com a ideia central e ramifique os subtópicos.";
        case 'ANALOGY':
            return basePrompt + "Tarefa: Explique o conceito central do texto usando uma analogia simples e fácil de entender. A analogia deve relacionar o tópico a algo do cotidiano para facilitar a compreensão.";
        case 'STEP_BY_STEP':
            return basePrompt + "Tarefa: Se o texto descreve um processo, evento histórico ou uma sequência de passos, detalhe-o em um formato 'passo a passo' claro e numerado. Se não houver um processo claro, explique a estrutura lógica do texto de forma sequencial.";
        case 'CONNECTIONS':
            return basePrompt + "Tarefa: Descreva como os principais conceitos do texto se conectam com o mundo real ou outras áreas do conhecimento (como história, ciência, arte, tecnologia, etc.). Forneça 2 a 3 exemplos práticos e claros, usando bullet points (iniciando com um hífen '-').";
        case 'SOCRATIC_OPPONENT':
            return basePrompt + "Tarefa: Atue como um 'Oponente Socrático'. Seu objetivo é desafiar as premissas e a lógica do texto fornecido. Formule 3 a 5 perguntas críticas e profundas que questionem os argumentos centrais, identifiquem possíveis falácias ou explorem perspectivas alternativas. Suas perguntas não devem ser para testar o conhecimento, mas para estimular um pensamento mais profundo e um debate rigoroso. Numere as perguntas.";
        case 'LESSON_PLAN':
            return basePrompt + "Tarefa: Com base no texto fornecido, esboce um plano de aula detalhado. O plano de aula deve incluir os seguintes componentes: **Objetivos de Aprendizagem**, **Materiais Necessários**, **Atividade Introdutória (Gancho)**, **Atividades Principais (Instrução e Prática Guiada)**, **Avaliação Formativa** e **Atividade de Encerramento**. Use bullet points para organizar o conteúdo dentro de cada seção.";
        case 'RUBRIC':
            return basePrompt + "Tarefa: Crie uma rubrica de avaliação analítica com base no conteúdo principal do texto. Se o texto já for uma rubrica, converta-a para um formato de tabela claro. A rubrica deve ter pelo menos 3 critérios de avaliação e 3 níveis de desempenho (ex: 'Iniciante', 'Proficiente', 'Exemplar').";
        case 'DIFFERENTIATION':
            return basePrompt + "Tarefa: Gere uma lista de 3 a 5 estratégias de diferenciação instrucional com base no tópico do texto. Para cada estratégia, descreva como ela pode ser aplicada para apoiar: 1) alunos com dificuldades, 2) alunos na média e 3) alunos avançados. Use bullet points.";
        case 'DOK_QUESTIONS':
            return basePrompt + "Tarefa: Elabore uma série de perguntas sobre o texto, organizadas pelos quatro níveis da Profundidade de Conhecimento (DOK) de Webb. Forneça 2 perguntas para cada nível:\n**DOK 1 (Recordar):**\n**DOK 2 (Habilidades e Conceitos):**\n**DOK 3 (Pensamento Estratégico):**\n**DOK 4 (Pensamento Estendido):**";
        case 'WORKSHEETS':
            return basePrompt + "Tarefa: Crie uma planilha de atividades ('worksheet') envolvente baseada no texto. Inclua uma mistura de 3 a 4 tipos de atividades diferentes, como preencher espaços em branco, perguntas de resposta curta, um pequeno caça-palavras com termos-chave ou uma questão para desenhar um diagrama. Seja criativo e foque no engajamento do aluno.";
        case 'PROJECT_IDEAS':
            return basePrompt + "Tarefa: Faça um brainstorm e liste 4 a 6 ideias de projetos criativos e práticos que os alunos poderiam realizar com base no conteúdo do texto. Para cada ideia, forneça uma breve descrição do projeto e o formato do produto final (ex: apresentação de slides, podcast, maquete, etc.). Use bullet points.";
        case 'EXEMPLARS':
            return basePrompt + "Tarefa: Com base em uma tarefa central do texto (como responder a uma pergunta ou criar um argumento), crie dois exemplos de resposta do aluno: um **Exemplar (Exemplo Forte)** e um **Não-Exemplar (Exemplo com Pontos a Melhorar)**. Para cada um, explique em 1-2 frases por que ele é classificado dessa forma, destacando as qualidades do exemplar e as áreas de melhoria do não-exemplar.";
        case 'CHOICE_BOARD':
            return basePrompt + "Tarefa: Crie um 'Quadro de Escolhas' no formato de uma tabela 3x3 (jogo da velha) com nove atividades curtas e variadas baseadas no texto. As atividades devem apelar para diferentes estilos de aprendizagem (ex: escrever, desenhar, pesquisar, construir, debater). Formate a resposta como uma lista de 9 itens, cada um representando uma célula do quadro.";
        case 'MISCONCEPTIONS':
            return basePrompt + "Tarefa: Identifique 2 a 3 equívocos ou interpretações errôneas comuns que os alunos possam ter sobre o tópico do texto. Para cada equívoco, primeiro declare o **Equívoco Comum** e, em seguida, forneça uma **Explicação Clara** para corrigi-lo, usando analogias ou exemplos simples.";
        case 'DISCUSSION_PROMPTS':
            return basePrompt + "Tarefa: Elabore 5 perguntas para discussão abertas e envolventes que incentivem o debate em sala de aula sobre as ideias, temas ou controvérsias do texto. As perguntas devem ir além da simples recordação de fatos e promover o pensamento crítico e a troca de perspectivas. Numere as perguntas.";
        case 'INFORMATIONAL_TEXT':
            return basePrompt + "Tarefa: Reescreva ou sintetize o conteúdo principal do texto em um novo texto informativo curto e coeso (cerca de 3-4 parágrafos). O novo texto deve ser escrito para um público que não tem conhecimento prévio sobre o assunto, definindo termos-chave e apresentando as informações de forma lógica e clara.";
        case 'REAL_WORLD_EXAMPLES':
            return basePrompt + "Tarefa: Liste de 4 a 6 exemplos concretos do mundo real que ilustrem os conceitos ou teorias principais apresentados no texto. Para cada exemplo, explique brevemente (1-2 frases) como ele se conecta ao tópico. Use bullet points.";
        default:
            const unhandledAction = action.toString().replace(/_/g, ' ').toLowerCase();
            return basePrompt + `Tarefa: Execute a seguinte ação no texto: ${unhandledAction}.`;
    }
}


const App: React.FC = () => {
    const [view, setView] = useState<View>(View.MAIN);
    const [inputText, setInputText] = useState<string>('');
    const [result, setResult] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [isHelpVisible, setIsHelpVisible] = useState<boolean>(false);
    const [lastAction, setLastAction] = useState<ActionType | null>(null);

    useEffect(() => {
        const savedText = localStorage.getItem('inputText');
        if (savedText) {
            setInputText(savedText);
        }
    }, []);

    const handleTextChange = (text: string) => {
        setInputText(text);
        localStorage.setItem('inputText', text);
    };

    const callGenerativeAI = useCallback(async (action: ActionType, text: string) => {
        setView(View.RESULTS);
        setIsLoading(true);
        setResult('');
        setError('');
        setLastAction(action);

        try {
            const prompt = getPromptForAction(action, text);
            
            const apiResponse = await fetch('https://apifreellm.com/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: prompt }),
            });

            if (!apiResponse.ok) {
                throw new Error(`Erro de rede: ${apiResponse.status} ${apiResponse.statusText}`);
            }

            const data = await apiResponse.json();

            if (data.status === 'success') {
                setResult(data.response);
            } else {
                let userErrorMessage = data.error || 'Ocorreu um erro desconhecido na API.';
                if (data.status === 'rate_limited' && data.retry_after) {
                    userErrorMessage = `Limite de solicitações atingido. Por favor, aguarde ${data.retry_after} segundos antes de tentar novamente.`;
                }
                setError(`Falha ao gerar resposta da IA: ${userErrorMessage}`);
            }

        } catch (e: any) {
            console.error(e);
            const errorMessage = e.message || 'Ocorreu um erro desconhecido.';
            setError(`Falha ao se comunicar com a API. ${errorMessage} Verifique sua conexão com a internet.`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleActionSelect = (action: ActionType) => {
        if (!inputText.trim()) return;
        callGenerativeAI(action, inputText);
    };

    const handleBack = () => {
        setView(View.MAIN);
        setError('');
    };

    const handleRefresh = () => {
        if (lastAction && inputText) {
            callGenerativeAI(lastAction, inputText);
        }
    };

    const headerTitle = view === View.MAIN ? 'Tutor Ativo AI' : (lastAction ? actionConfig[lastAction].title : 'Resultado');
    
    return (
        <div className="flex flex-col h-screen bg-slate-800 text-slate-100 font-sans">
            <Header
                title={headerTitle}
                showBackButton={view === View.RESULTS}
                onBack={handleBack}
                onHelp={() => setIsHelpVisible(true)}
                onRefresh={handleRefresh}
                isRefreshable={view === View.RESULTS && !!lastAction && !isLoading}
            />

            <main className="flex-grow p-4 overflow-y-auto" style={{ scrollbarGutter: 'stable' }}>
                {view === View.MAIN ? (
                    <MainView
                        onActionSelect={handleActionSelect}
                        inputText={inputText}
                        onTextChange={handleTextChange}
                    />
                ) : (
                    <ResultsView
                        isLoading={isLoading}
                        result={result}
                        error={error}
                        actionType={lastAction}
                    />
                )}
            </main>

            <footer className="flex-shrink-0 text-center p-3 border-t border-slate-700/50 text-xs text-slate-500">
                Produzido por <a href="mailto:danilofelip862@educar.rn.gov.br" className="text-sky-400 hover:underline">Danilo Arruda</a>.
            </footer>

            <HelpModal isVisible={isHelpVisible} onClose={() => setIsHelpVisible(false)} />
        </div>
    );
};

export default App;