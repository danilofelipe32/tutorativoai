import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ActionType, View, HistoryItem } from './types';
import Header from './components/Header';
import MainView from './components/MainView';
import ResultsView from './components/ResultsView';
import HelpModal from './components/HelpModal';
import RefineModal from './components/RefineModal';
import ExplanationModal from './components/ExplanationModal';
import { actionConfig } from './constants';

// Setup Gemini API with the provided key
const ai = new GoogleGenAI({ apiKey: "AIzaSyC66emimXFo6BVctXpbYlheIueYSgP3ExE" });


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
        case 'DEEPER_QUESTIONS':
            return basePrompt + "Tarefa: Gere de 3 a 5 perguntas de aprofundamento que vão além da compreensão superficial do texto. As perguntas devem incentivar o pensamento crítico, desafiar premissas, explorar as implicações das ideias e conectar o conteúdo a conceitos mais amplos. Evite perguntas que possam ser respondidas diretamente com uma simples citação do texto. Numere as perguntas.";
        case 'SOCRATIC_OPPONENT':
            return basePrompt + "Tarefa: Atue como um 'Oponente Socrático'. Seu objetivo é desafiar as premissas e a lógica do texto fornecido. Formule 3 a 5 perguntas críticas e profundas que questionem os argumentos centrais, identifiquem possíveis falácias ou explorem perspectivas alternativas. Suas perguntas não devem ser para testar o conhecimento, mas para estimular um pensamento mais profundo e um debate rigoroso. Numere as perguntas.";
        case 'LESSON_PLAN':
            return basePrompt + "Tarefa: Com base no texto fornecido, esboce um plano de aula detalhado. O plano de aula deve incluir os seguintes componentes: **Objetivos de Aprendizagem**, **Materiais Necessários**, **Atividade Introdutória (Gancho)**, **Atividades Principais (Instrução e Prática Guiada)**, **Avaliação Formativa** e **Atividade de Encerramento**. Use bullet points para organizar o conteúdo dentro de cada seção.";
        case 'RUBRIC':
            return basePrompt + "Tarefa: Crie uma rubrica de avaliação analítica com base no conteúdo principal do texto. A rubrica deve ter pelo menos 3 critérios de avaliação e 3 níveis de desempenho (ex: 'Iniciante', 'Proficiente', 'Exemplar'). Formate a rubrica final ESTRITAMENTE como uma tabela Markdown.";
        case 'DIFFERENTIATION':
            return basePrompt + "Tarefa: Gere uma lista de 3 a 5 estratégias de diferenciação instrucional com base no tópico do texto. Para cada estratégia, descreva como ela pode ser aplicada para apoiar: 1) alunos com dificuldades, 2) alunos na média e 3) alunos avançados. Use bullet points.";
        case 'DOK_QUESTIONS':
            return basePrompt + "Tarefa: Elabore uma série de perguntas sobre o texto, organizadas pelos quatro níveis da Profundidade de Conhecimento (DOK) de Webb. Forneça 2 perguntas para cada nível:\n**DOK 1 (Recordar):**\n**DOK 2 (Habilidades e Conceitos):**\n**DOK 3 (Pensamento Estratégico):**\n**DOK 4 (Pensamento Estendido):**";
        case 'WORKSHEETS':
            return basePrompt + "Tarefa: Crie uma planilha de atividades ('worksheet') envolvente baseada no texto. Inclua uma mistura de 3 a 4 tipos de atividades diferentes, como preencher espaços em branco, perguntas de resposta curta, ou uma questão para desenhar um diagrama. Use tabelas Markdown para estruturar atividades como preencher lacunas ou correspondência para uma apresentação clara e organizada.";
        case 'PROJECT_IDEAS':
            return basePrompt + "Tarefa: Faça um brainstorm e liste 4 a 6 ideias de projetos criativos e práticos que os alunos poderiam realizar com base no conteúdo do texto. Para cada ideia, forneça uma breve descrição do projeto e o formato do produto final (ex: apresentação de slides, podcast, maquete, etc.). Use bullet points.";
        case 'EXEMPLARS':
            return basePrompt + "Tarefa: Com base em uma tarefa central do texto (como responder a uma pergunta ou criar um argumento), crie dois exemplos de resposta do aluno: um **Exemplar (Exemplo Forte)** e um **Não-Exemplar (Exemplo com Pontos a Melhorar)**. Para cada um, explique em 1-2 frases por que ele é classificado dessa forma, destacando as qualidades do exemplar e as áreas de melhoria do não-exemplar.";
        case 'CHOICE_BOARD':
            return basePrompt + "Tarefa: Crie um 'Quadro de Escolhas' com nove atividades curtas e variadas baseadas no texto. As atividades devem apelar para diferentes estilos de aprendizagem (ex: escrever, desenhar, pesquisar, construir, debater). Formate a resposta ESTRITAMENTE como uma tabela Markdown 3x3.";
        case 'MISCONCEPTIONS':
            return basePrompt + "Tarefa: Identifique 2 a 3 equívocos ou interpretações errôneas comuns que os alunos possam ter sobre o tópico do texto. Para cada equívoco, primeiro declare o **Equívoco Comum** e, em seguida, forneça uma **Explicação Clara** para corrigi-lo, usando analogias ou exemplos simples.";
        case 'DISCUSSION_PROMPTS':
            return basePrompt + "Tarefa: Elabore 5 perguntas para discussão abertas e envolventes que incentivem o debate em sala de aula sobre as ideias, temas ou controvérsias do texto. As perguntas devem ir além da simples recordação de fatos e promover o pensamento crítico e a troca de perspectivas. Numere as perguntas.";
        case 'INFORMATIONAL_TEXT':
            return basePrompt + "Tarefa: Reescreva ou sintetize o conteúdo principal do texto em um novo texto informativo curto e coeso (cerca de 3-4 parágrafos). O novo texto deve ser escrito para um público que não tem conhecimento prévio sobre o assunto, definindo termos-chave e apresentando as informações de forma lógica e clara.";
        case 'REAL_WORLD_EXAMPLES':
            return basePrompt + "Tarefa: Liste de 4 a 6 exemplos concretos do mundo real que ilustrem os conceitos ou teorias principais apresentados no texto. Para cada exemplo, explique brevemente (1-2 frases) como ele se conecta ao tópico. Use bullet points.";
        case 'STORYTELLER':
            return basePrompt + "Tarefa: Atue como um 'Contador de Histórias Mestre'. Sua tarefa é transformar o conteúdo informativo do texto em uma pequena história, narrativa ou conto envolvente. Use personagens, um cenário e um enredo simples (início, meio, fim) para ilustrar os conceitos principais. O objetivo é tornar o material mais memorável e interessante. A história deve ser curta, direta ao ponto e adequada para o público-alvo do texto original.";
        case 'FACT_CHECKER':
            return basePrompt + "Tarefa: Atue como um 'Verificador de Fatos' cético e rigoroso. Sua missão é analisar o texto e identificar as 3 a 5 alegações ou 'fatos' mais significativos. Para cada alegação, formule uma pergunta investigativa que um pesquisador usaria para verificar sua veracidade. As perguntas devem ser específicas e apontar para a necessidade de fontes externas, dados ou evidências. Formate ESTRITAMENTE a saída da seguinte forma:\n**Alegação 1:** [Citação ou paráfrase da alegação do texto].\n**Pergunta de Verificação:** [Sua pergunta investigativa].\n\n**Alegação 2:** ...";
        case 'AI_QUEST_EDU':
            // Este prompt foi simplificado para ser mais direto e reduzir a chance de erros de API.
            return `Você é o **Gerador de Missões AI QUEST EDU (BNCC)**, um Game Master pedagógico. Sua tarefa é transformar o texto do usuário em uma missão gamificada para alunos.

**Contexto Fornecido pelo Usuário:**
"""
${context}
"""

**Instruções:**
1.  **Analise o Contexto:** Extraia o tema principal. Identifique também o ano escolar, tempo e ferramentas, se mencionados. Se não, assuma "Ensino Médio" e "4 aulas".
2.  **Gere a Missão:** Siga ESTRITAMENTE o formato de saída abaixo.

---
**FORMATO DE SAÍDA OBRIGATÓRIO (em português):**

**1. Título da Missão:** (curto e envolvente) + faixa etária.

**2. Introdução Narrativa:** (1-2 parágrafos) Crie um cenário e defina o papel do aluno.

**3. Mapa Rápido:** (tempo, aulas, materiais).

**4. Três Desafios (Níveis Progressivos):**
Para cada desafio (Exploração → Análise → Solução Criativa):
*   **Objetivo:** O que o aluno deve alcançar.
*   **BNCC:** Uma Competência Geral e uma Área do Conhecimento.
*   **Ferramentas:** Ex: Google Forms, Planilhas, Scratch, etc.
*   **Passo a Passo DETALHADO para o Aluno:** Instruções numeradas e claras. Inclua ações em interfaces (ex: "Abra o Google Forms..."), prompts prontos para IA (ex: "Peça à IA: '...'"), exemplos de dados, e como validar os resultados.
*   **Entrega:** O que o aluno deve produzir.
*   **Critério de Sucesso:** Como o professor avalia.

**5. Conclusão da Missão:** Resumo do aprendizado + 2 perguntas de reflexão (ligadas à BNCC).

**6. Notas para o Professor:** Sugestões de adaptação, inclusão, privacidade (LGPD) e uma proposta de rubrica.

**7. Prompt para o Professor:** Crie 1 prompt pronto para uma IA gerar material de apoio (ex: roteiro de aula).

**8. Guia Rápido do Aluno:** Uma lista de passos simplificada para o aluno seguir de forma autônoma.

**9. Guia Técnico (se aplicável):** Explicação de comandos ou configurações de ferramentas mais complexas.

**Regras Adicionais:**
*   Use linguagem adequada ao ano escolar.
*   Use emojis e um tom motivador.
*   Inclua avisos sobre segurança de dados (LGPD) quando houver coleta de informações.`;
        case 'POSSIBILITIES_ENGINE':
            return basePrompt + "Tarefa: Atue como um 'Motor de Possibilidades'. Com base no conceito central do texto, gere 3 a 5 explicações ou metáforas alternativas e criativas. Cada explicação deve abordar o mesmo conceito de uma perspectiva diferente para atender a diversos estilos de aprendizagem. Numere cada possibilidade.";
        case 'CO_DESIGNER':
            return basePrompt + "Tarefa: Atue como um 'Co-Designer de Aprendizagem'. Com base no texto, ajude a planejar uma atividade de aprendizado personalizada. Sugira 3 opções de atividades (ex: criar um vídeo, escrever um post de blog, montar um debate) que se alinhem com o conteúdo. Para cada opção, descreva o objetivo, os passos principais e como ela pode ser adaptada para diferentes níveis de habilidade. Use bullet points.";
        case 'COLLABORATION_COACH':
            return basePrompt + "Tarefa: Atue como um 'Coach de Colaboração'. Imagine que um grupo de alunos está trabalhando em um projeto sobre o tema do texto. Sua tarefa é ajudá-los a encontrar informações. Formule 5 perguntas-chave que o grupo deveria pesquisar para aprofundar seu projeto. Além disso, sugira 3 a 5 termos de busca eficazes para usar em mecanismos de pesquisa como o Google. Formate como: **Perguntas de Pesquisa:** e **Termos de Busca:**.";
        case 'EXPLORATORIUM':
            return basePrompt + "Tarefa: Atue como um 'Exploratorium' de dados. Analise o texto e identifique os principais dados, estatísticas ou fatos apresentados. Em seguida, crie 3 a 5 'desafios de exploração' em forma de perguntas que incentivem a investigação e a visualização desses dados. Por exemplo: 'Como você criaria um gráfico para mostrar a tendência mencionada no texto?' ou 'Que outra fonte de dados poderia confirmar ou refutar a estatística X?'. Numere os desafios.";
        case 'IDENTIFY_PERSPECTIVE':
            return basePrompt + "Tarefa: Atue como um analista crítico. Analise o texto para identificar o ponto de vista do autor, o tom geral (ex: informativo, persuasivo, crítico) e quaisquer possíveis vieses ou suposições implícitas. Estruture sua resposta em três seções: **Ponto de Vista**, **Tom** e **Análise de Vieses**.";
        case 'FEEDBACK_GENERATOR':
            return basePrompt + "Tarefa: Atue como um professor experiente. Com base no conteúdo do texto, crie 3 exemplos de feedback construtivo que poderiam ser dados a um aluno que escreveu uma resposta sobre este tópico. Inclua um 'Elogio Específico' (o que o aluno fez bem) e uma 'Sugestão para Melhoria' (um próximo passo claro) para cada exemplo. Numere os exemplos.";
        default:
            const unhandledAction = action.toString().replace(/_/g, ' ').toLowerCase();
            return basePrompt + `Tarefa: Execute a seguinte ação no texto: ${unhandledAction}.`;
    }
}

function getPromptForRefinement(originalText: string, previousResult: string, instruction: string): string {
    return `Você é um "Tutor Inteligente", uma IA assistente de estudos. Você gerou uma resposta anteriormente, e agora o usuário quer que você a refine.

Sua tarefa é usar o texto original, a resposta anterior e a nova instrução do usuário para gerar uma resposta nova e aprimorada. Mantenha o mais alto padrão de qualidade, seguindo seu processo de raciocínio interno (Cadeia de Pensamento, Auto-Reflexão), mas apresente APENAS a resposta final polida para o usuário.

--- INÍCIO DO TEXTO ORIGINAL ---
${originalText}
--- FIM DO TEXTO ORIGINAL ---

--- INÍCIO DA RESPOSTA ANTERIOR ---
${previousResult}
--- FIM DA RESPOSTA ANTERIOR ---

--- INSTRUÇÃO DE REFINAMENTO DO USUÁRIO ---
${instruction}
--- FIM DA INSTRUÇÃO DE REFINAMENTO DO USUÁRIO ---

Agora, gere a nova resposta refinada com base na instrução.`;
}

function getPromptForExplanation(context: string, topic: string): string {
    return `Você é um "Tutor Inteligente", uma IA assistente de estudos. Sua tarefa é explicar um tópico específico que foi extraído de um texto maior.

Siga seu processo de raciocínio interno (Cadeia de Pensamento, Auto-Reflexão), mas apresente APENAS a resposta final polida. Não inclua títulos como "Explicação". Comece a resposta diretamente.

--- INÍCIO DO TEXTO ORIGINAL COMPLETO ---
${context}
--- FIM DO TEXTO ORIGINAL COMPLETO ---

--- TÓPICO PARA EXPLICAR ---
${topic}
--- FIM DO TÓPICO PARA EXPLICAR ---

Tarefa: Forneça uma explicação clara e concisa sobre o tópico "${topic}" com base no contexto do texto original. A explicação deve ser fácil de entender para alguém que está estudando o assunto. Use parágrafos curtos e formate termos importantes com **negrito**.`;
}


const App: React.FC = () => {
    const [view, setView] = useState<View>(View.MAIN);
    const [inputText, setInputText] = useState<string>('');
    const [result, setResult] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [isHelpVisible, setIsHelpVisible] = useState<boolean>(false);
    const [isRefineModalVisible, setIsRefineModalVisible] = useState<boolean>(false);
    const [lastAction, setLastAction] = useState<ActionType | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isExplanationModalVisible, setIsExplanationModalVisible] = useState<boolean>(false);
    const [explanationTopic, setExplanationTopic] = useState<string>('');
    const [explanationResult, setExplanationResult] = useState<string>('');
    const [isExplanationLoading, setIsExplanationLoading] = useState<boolean>(false);
    const cache = useRef<Map<string, string>>(new Map());

    useEffect(() => {
        // Garante que a aplicação inicie com um estado limpo, removendo qualquer texto salvo anteriormente.
        localStorage.removeItem('inputText');
        // Load history from localStorage
        try {
            const storedHistory = localStorage.getItem('actionHistory');
            if (storedHistory) {
                setHistory(JSON.parse(storedHistory));
            }
        } catch (error) {
            console.error("Failed to load history from localStorage", error);
            setHistory([]);
        }
    }, []);

    const handleTextChange = (text: string) => {
        setInputText(text);
        localStorage.setItem('inputText', text);
    };

    const handleClearText = () => {
        setInputText('');
        localStorage.removeItem('inputText');
    };

    const callGenerativeAI = useCallback(async (
        action: ActionType,
        text: string,
        refinement?: { previousResult: string; instruction: string }
    ) => {
        setView(View.RESULTS);
        setIsLoading(true);
        setResult('');
        setError('');
        setLastAction(action);

        const cacheKey = refinement
            ? `${action}:${text}:${refinement.instruction}`
            : `${action}:${text}`;

        if (cache.current.has(cacheKey)) {
            const cachedResult = cache.current.get(cacheKey)!;
            setResult(cachedResult);
            
            const newHistoryItem: HistoryItem = {
                id: Date.now(),
                actionType: action,
                fullInputText: text,
                inputTextSnippet: text.substring(0, 80) + (text.length > 80 ? '...' : ''),
                fullResult: cachedResult,
                timestamp: new Date().toISOString(),
            };

            setHistory(prevHistory => {
                const updatedHistory = [newHistoryItem, ...prevHistory].slice(0, 50);
                try {
                    localStorage.setItem('actionHistory', JSON.stringify(updatedHistory));
                } catch (error) {
                    console.error("Failed to save history from cached result", error);
                }
                return updatedHistory;
            });

            setIsLoading(false);
            return;
        }

        try {
             const prompt = refinement
                ? getPromptForRefinement(text, refinement.previousResult, refinement.instruction)
                : getPromptForAction(action, text);
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            const generatedText = response.text;
            
            if (!generatedText) {
                throw new Error("A API não retornou uma resposta de texto.");
            }

            cache.current.set(cacheKey, generatedText);
            setResult(generatedText);

            const newHistoryItem: HistoryItem = {
                id: Date.now(),
                actionType: action,
                fullInputText: text,
                inputTextSnippet: text.substring(0, 80) + (text.length > 80 ? '...' : ''),
                fullResult: generatedText,
                timestamp: new Date().toISOString(),
            };

            setHistory(prevHistory => {
                const updatedHistory = [newHistoryItem, ...prevHistory].slice(0, 50); // Keep max 50 items
                try {
                    localStorage.setItem('actionHistory', JSON.stringify(updatedHistory));
                } catch (error) {
                    console.error("Failed to save history to localStorage", error);
                }
                return updatedHistory;
            });

        } catch (e: any) {
            console.error(e);
            const errorMessage = e.message || 'Ocorreu um erro desconhecido.';
            setError(`Falha ao se comunicar com a API do Gemini. ${errorMessage} Verifique sua chave de API e conexão com a internet.`);
        } finally {
            setIsLoading(false);
        }
    }, [result]);

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
    
    const handleHistoryItemClick = (item: HistoryItem) => {
        setInputText(item.fullInputText);
        setResult(item.fullResult);
        setLastAction(item.actionType);
        setView(View.RESULTS);
        setError('');
    };

    const handleOpenRefineModal = () => setIsRefineModalVisible(true);
    const handleCloseRefineModal = () => setIsRefineModalVisible(false);

    const handleRefineSubmit = (instruction: string) => {
        handleCloseRefineModal();
        if (lastAction && inputText && result) {
            callGenerativeAI(lastAction, inputText, { previousResult: result, instruction });
        }
    };

    const handleExplainTopic = useCallback(async (topic: string) => {
        if (!inputText) return;

        setIsExplanationModalVisible(true);
        setExplanationTopic(topic);
        setExplanationResult('');
        setIsExplanationLoading(true);

        const cacheKey = `explain:${topic}:${inputText}`;
        if (cache.current.has(cacheKey)) {
            setExplanationResult(cache.current.get(cacheKey)!);
            setIsExplanationLoading(false);
            return;
        }

        try {
            const prompt = getPromptForExplanation(inputText, topic);
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            const generatedText = response.text;
            
            if (!generatedText) {
                 throw new Error("A API não retornou uma resposta de texto.");
            }

            cache.current.set(cacheKey, generatedText);
            setExplanationResult(generatedText);
        } catch (e: any) {
            console.error(e);
            const errorMessage = e.message || 'Ocorreu um erro desconhecido.';
            setExplanationResult(`Falha ao se comunicar com a API do Gemini. ${errorMessage}`);
        } finally {
            setIsExplanationLoading(false);
        }
    }, [inputText]);


    const handleDeleteItem = (itemId: number) => {
        const newHistory = history.filter(item => item.id !== itemId);
        setHistory(newHistory);
        localStorage.setItem('actionHistory', JSON.stringify(newHistory));
    };

    const handleRenameItem = (itemId: number, newTitle: string) => {
        const newHistory = history.map(item =>
            item.id === itemId ? { ...item, customTitle: newTitle.trim() } : item
        );
        setHistory(newHistory);
        localStorage.setItem('actionHistory', JSON.stringify(newHistory));
    };

    const headerTitle = view === View.MAIN ? 'Tutor Ativo AI' : (lastAction ? actionConfig[lastAction].title : 'Resultado');
    
    return (
        <div className="flex flex-col h-screen bg-transparent">
            <Header
                title={headerTitle}
                showBackButton={view === View.RESULTS}
                onBack={handleBack}
                onHelp={() => setIsHelpVisible(true)}
                onRefresh={handleRefresh}
                isRefreshable={view === View.RESULTS && !!lastAction && !isLoading}
            />

            <main className="flex-grow p-4 overflow-y-auto w-full max-w-5xl mx-auto" style={{ scrollbarGutter: 'stable' }}>
                {view === View.MAIN ? (
                    <MainView
                        onActionSelect={handleActionSelect}
                        inputText={inputText}
                        onTextChange={handleTextChange}
                        onClearText={handleClearText}
                        history={history}
                        onHistoryItemClick={handleHistoryItemClick}
                        onDeleteItem={handleDeleteItem}
                        onRenameItem={handleRenameItem}
                    />
                ) : (
                    <ResultsView
                        isLoading={isLoading}
                        result={result}
                        error={error}
                        actionType={lastAction}
                        onOpenRefineModal={handleOpenRefineModal}
                        onExplainTopic={handleExplainTopic}
                    />
                )}
            </main>

            <footer className="flex-shrink-0 text-center p-3 bg-black/20 backdrop-blur-lg border-t border-white/10 text-xs text-slate-400">
                Produzido por <a href="mailto:danilofelip862@educar.rn.gov.br" className="text-sky-400 hover:underline">Danilo Arruda</a>.
            </footer>

            <HelpModal isVisible={isHelpVisible} onClose={() => setIsHelpVisible(false)} />
            <RefineModal
                isVisible={isRefineModalVisible}
                onClose={handleCloseRefineModal}
                onSubmit={handleRefineSubmit}
            />
            <ExplanationModal
                isVisible={isExplanationModalVisible}
                onClose={() => setIsExplanationModalVisible(false)}
                topic={explanationTopic}
                explanation={explanationResult}
                isLoading={isExplanationLoading}
            />
        </div>
    );
};

export default App;