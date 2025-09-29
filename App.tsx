import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ActionType, View, HistoryItem, ResultPayload } from './types';
import Header from './components/Header';
import MainView from './components/MainView';
import ResultsView from './components/ResultsView';
import HelpModal from './components/HelpModal';
import RefineModal from './components/RefineModal';
import ExplanationModal from './components/ExplanationModal';
import { actionConfig } from './constants';
import OnboardingModal from './components/OnboardingModal';

// Setup Gemini API using environment variable
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const YOUTUBE_URL_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;


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
            return basePrompt + "Tarefa: Gere uma lista de 3 a 5 estratégias de diferenciação instrucional com base no tópico do texto. Para cada estrategia, descreva como ela pode ser aplicada para apoiar: 1) alunos com dificuldades, 2) alunos na média e 3) alunos avançados. Use bullet points.";
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

**Instruções: Crie uma missão de projeto. Inclua um **Título Cativante**, **Missão (o desafio)**, **Recursos (o que eles usam)**, **Etapas (o que eles fazem)** e **Avaliação (como são avaliados)**. Aponte 2-3 **Habilidades da BNCC** relevantes.`;
        case 'POSSIBILITIES_ENGINE':
            return basePrompt + "Tarefa: Atue como um 'Motor de Possibilidades'. Gere 3 a 5 formas alternativas de explicar o conceito central do texto. Cada alternativa deve usar uma abordagem diferente (ex: uma metáfora visual, uma explicação passo a passo, uma conexão histórica, etc.).";
        case 'CO_DESIGNER':
            return basePrompt + "Tarefa: Atue como um 'Co-Designer' de aprendizado. Com base no texto, ajude o usuário a planejar uma atividade de aprendizado personalizada. Faça 3 perguntas-chave para entender os objetivos e interesses do aluno, e então sugira 2 atividades de projeto que se alinhem a essas respostas.";
        case 'COLLABORATION_COACH':
            return basePrompt + "Tarefa: Atue como um 'Coach de Colaboração'. Imagine que um grupo de alunos precisa trabalhar em um projeto sobre este texto. Sugira 3 funções específicas para os membros do grupo (ex: 'Líder de Pesquisa', 'Gerente de Apresentação') e liste 2 ideias de pesquisa iniciais para o grupo começar a investigar.";
        case 'EXPLORATORIUM':
            return basePrompt + "Tarefa: Atue como um 'Exploratorium'. Facilite a exploração de dados ou informações no texto. Identifique um conjunto de dados ou um ponto de informação chave no texto e gere 3 perguntas que incentivem o aluno a investigar mais a fundo, promovendo a curiosidade e a análise de dados.";
        case 'IDENTIFY_PERSPECTIVE':
            return basePrompt + "Tarefa: Analise o texto para identificar a perspectiva ou o ponto de vista do autor. Responda: 1) Qual é o principal argumento ou tese do autor? 2) Que evidências o autor usa para apoiar seu ponto de vista? 3) Há algum viés potencial ou perspectiva alternativa que não foi considerada no texto? Justifique suas respostas.";
        case 'FEEDBACK_GENERATOR':
            return basePrompt + "Tarefa: Atue como um 'Gerador de Feedback'. Imagine que um aluno escreveu um pequeno parágrafo em resposta ao texto. Crie 2 exemplos de feedback: um que seja um elogio ('glow') destacando um ponto forte, e outro que seja uma sugestão de melhoria ('grow') construtiva. O feedback deve ser específico, gentil e acionável.";
        case 'PARETO_PRINCIPLE':
            return basePrompt + "Tarefa: Aplique o Princípio de Pareto (80/20) ao texto. Identifique os 20% do conteúdo (os conceitos, ideias ou parágrafos mais críticos) que fornecem 80% do valor ou da compreensão do tópico. Liste esses pontos-chave em formato de bullet points.";
        case 'FEYNMAN_TECHNIQUE':
            return basePrompt + "Tarefa: Aplique a Técnica de Feynman. Explique o conceito principal do texto da forma mais simples possível, como se estivesse ensinando a uma criança de 12 anos. Use analogias simples, evite jargões e foque na ideia central para garantir que seja fácil de entender.";
        default:
            return context;
    }
}


const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>(View.MAIN);
    const [inputText, setInputText] = useState('');
    const [result, setResult] = useState<ResultPayload | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentAction, setCurrentAction] = useState<ActionType | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>(() => {
        try {
            const savedHistory = localStorage.getItem('studyHistory');
            return savedHistory ? JSON.parse(savedHistory) : [];
        } catch (e) {
            console.error("Failed to parse history from localStorage", e);
            return [];
        }
    });

    const [isHelpVisible, setIsHelpVisible] = useState(false);
    const [isRefineVisible, setIsRefineVisible] = useState(false);
    const [isExplanationVisible, setIsExplanationVisible] = useState(false);
    const [explanationTopic, setExplanationTopic] = useState('');
    const [explanationResult, setExplanationResult] = useState('');
    const [isExplanationLoading, setIsExplanationLoading] = useState(false);
    const [isOcrLoading, setIsOcrLoading] = useState(false);
    const [isYoutubeUrl, setIsYoutubeUrl] = useState(false);
    
    // Onboarding
    const [isOnboardingVisible, setIsOnboardingVisible] = useState(false);

    const prevInputTextRef = useRef<string>();

    useEffect(() => {
        try {
            localStorage.setItem('studyHistory', JSON.stringify(history));
        } catch (e) {
            console.error("Failed to save history to localStorage", e);
        }
    }, [history]);
    
    useEffect(() => {
        const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
        if (!hasSeenOnboarding) {
            setIsOnboardingVisible(true);
            localStorage.setItem('hasSeenOnboarding', 'true');
        }
    }, []);

    useEffect(() => {
        setIsYoutubeUrl(YOUTUBE_URL_REGEX.test(inputText.trim()));
    }, [inputText]);

    const handleAction = useCallback(async (action: ActionType) => {
        if (!inputText.trim()) return;

        prevInputTextRef.current = inputText;
        setCurrentView(View.RESULTS);
        setIsLoading(true);
        setResult(null);
        setError('');
        setCurrentAction(action);

        try {
            const prompt = getPromptForAction(action, inputText);
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            
            const newResult: ResultPayload = { text: response.text };
            setResult(newResult);

            const newItem: HistoryItem = {
                id: Date.now(),
                actionType: action,
                inputTextSnippet: inputText.substring(0, 100) + (inputText.length > 100 ? '...' : ''),
                fullInputText: inputText,
                fullResult: newResult,
                timestamp: new Date().toISOString(),
            };
            setHistory(prev => [newItem, ...prev]);

        } catch (e) {
            console.error(e);
            setError("Ocorreu um erro ao se comunicar com a API. Por favor, tente novamente.");
        } finally {
            setIsLoading(false);
        }
    }, [inputText]);

    const handleSummarizeVideo = useCallback(async () => {
        if (!inputText.trim() || !isYoutubeUrl) return;

        setCurrentView(View.RESULTS);
        setIsLoading(true);
        setResult(null);
        setError('');
        setCurrentAction(ActionType.SUMMARIZE);

        try {
            const prompt = `Por favor, resuma o conteúdo do vídeo do YouTube neste link. Forneça um resumo estruturado com os pontos principais. Link: ${inputText}`;
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    tools: [{ googleSearch: {} }],
                },
            });

            const newResult: ResultPayload = {
                text: response.text,
                sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks,
            };

            setResult(newResult);

            const videoId = inputText.split('v=')[1]?.split('&')[0] || inputText.split('/').pop();
            const newItem: HistoryItem = {
                id: Date.now(),
                actionType: ActionType.SUMMARIZE,
                inputTextSnippet: `Vídeo: ${videoId}`,
                fullInputText: inputText,
                fullResult: newResult,
                timestamp: new Date().toISOString(),
                customTitle: 'Resumo de Vídeo do YouTube'
            };
            setHistory(prev => [newItem, ...prev]);

        } catch (e) {
            console.error(e);
            setError("Ocorreu um erro ao se comunicar com a API. Por favor, tente novamente.");
        } finally {
            setIsLoading(false);
        }
    }, [inputText, isYoutubeUrl]);


    const handleHistoryItemClick = (item: HistoryItem) => {
        setInputText(item.fullInputText);
        setResult(item.fullResult);
        setCurrentAction(item.actionType);
        setCurrentView(View.RESULTS);
    };
    
    const handleRefine = useCallback(async (instruction: string) => {
        setIsRefineVisible(false);
        if (!result) return;

        const context = `
--- TEXTO ORIGINAL ---
${currentAction === ActionType.SUMMARIZE && isYoutubeUrl ? prevInputTextRef.current : inputText}

--- RESULTADO ANTERIOR ---
${result.text}
`;
        const prompt = `Você é um "Tutor Inteligente". O usuário forneceu o resultado anterior e uma instrução para refiná-lo.
Siga a instrução para gerar uma nova versão.

Instrução do usuário: "${instruction}"

Sua nova resposta deve ser apenas o resultado refinado.
`;

        setIsLoading(true);
        setError('');
        const prevResult = result;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            const newResultText = response.text;
            
            setResult(prev => prev ? { ...prev, text: newResultText } : { text: newResultText });

            // Update history item
            const latestHistoryItem = history[0];
            if (latestHistoryItem) {
                 const updatedItem = {
                    ...latestHistoryItem,
                    fullResult: prevResult ? { ...prevResult, text: newResultText } : { text: newResultText },
                    customTitle: latestHistoryItem.customTitle ? `${latestHistoryItem.customTitle} (Refinado)` : `${actionConfig[latestHistoryItem.actionType].title} (Refinado)`,
                };
                setHistory(prev => [updatedItem, ...prev.slice(1)]);
            }

        } catch (e) {
            console.error(e);
            setError("Ocorreu um erro ao refinar o resultado. Por favor, tente novamente.");
            setResult(prevResult); // Restore previous result on error
        } finally {
            setIsLoading(false);
        }
    }, [result, inputText, currentAction, history, isYoutubeUrl]);

    const handleExplainTopic = useCallback(async (topic: string) => {
        setExplanationTopic(topic);
        setIsExplanationVisible(true);
        setIsExplanationLoading(true);

        const prompt = `Você é um "Tutor Inteligente". Por favor, explique o seguinte tópico de forma clara e concisa, como se estivesse ensinando a um estudante. O tópico foi retirado de um contexto maior, então foque em explicá-lo isoladamente.
        
Tópico: "${topic}"

Use parágrafos curtos, exemplos ou analogias se ajudar.`;
        
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            setExplanationResult(response.text);
        } catch (e) {
            console.error(e);
            setExplanationResult("Ocorreu um erro ao gerar a explicação.");
        } finally {
            setIsExplanationLoading(false);
        }
    }, []);

    const handleImageUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione um arquivo de imagem.');
            return;
        }

        setIsOcrLoading(true);
        setInputText('');
        
        const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
        });

        try {
            const base64Data = await toBase64(file);
            const imagePart = {
                inlineData: {
                    mimeType: file.type,
                    data: base64Data,
                },
            };
            const textPart = {
                text: 'Extraia todo o texto desta imagem. Responda apenas com o texto extraído, sem nenhuma formatação ou comentário adicional.',
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, textPart] },
            });
            
            setInputText(response.text);

        } catch (error) {
            console.error("Error processing image:", error);
            setError("Não foi possível processar a imagem. Tente novamente.");
        } finally {
            setIsOcrLoading(false);
        }
    };

    const handleBack = () => {
        setCurrentView(View.MAIN);
        setResult(null);
        setError('');
        setCurrentAction(null);
    };

    const handleRefresh = () => {
        if(currentAction) {
            handleAction(currentAction);
        }
    };

    const clearText = () => setInputText('');
    const deleteHistoryItem = (id: number) => setHistory(history.filter(item => item.id !== id));
    const renameHistoryItem = (id: number, newTitle: string) => {
        setHistory(history.map(item => item.id === id ? { ...item, customTitle: newTitle } : item));
    };

    const renderView = () => {
        switch(currentView) {
            case View.RESULTS:
                return (
                    <ResultsView
                        isLoading={isLoading}
                        result={result}
                        error={error}
                        actionType={currentAction}
                        onOpenRefineModal={() => setIsRefineVisible(true)}
                        onExplainTopic={handleExplainTopic}
                    />
                );
            case View.MAIN:
            default:
                return (
                    <MainView
                        onActionSelect={handleAction}
                        inputText={inputText}
                        onTextChange={setInputText}
                        onClearText={clearText}
                        history={history}
                        onHistoryItemClick={handleHistoryItemClick}
                        onDeleteItem={deleteHistoryItem}
                        onRenameItem={renameHistoryItem}
                        onImageUpload={handleImageUpload}
                        isOcrLoading={isOcrLoading}
                        isYoutubeUrl={isYoutubeUrl}
                        onSummarizeVideo={handleSummarizeVideo}
                    />
                );
        }
    };
    
    return (
        <div className="flex flex-col h-screen">
            <Header
                title={currentView === View.RESULTS && currentAction ? actionConfig[currentAction].title : "Tutor Ativo AI"}
                showBackButton={currentView === View.RESULTS}
                onBack={handleBack}
                onHelp={() => setIsHelpVisible(true)}
                onRefresh={handleRefresh}
                isRefreshable={currentView === View.RESULTS && !isLoading && currentAction !== null}
            />
            <main className="flex-grow overflow-y-auto p-4 md:p-6 w-full max-w-5xl mx-auto">
                {renderView()}
            </main>
            <HelpModal isVisible={isHelpVisible} onClose={() => setIsHelpVisible(false)} />
            <RefineModal isVisible={isRefineVisible} onClose={() => setIsRefineVisible(false)} onSubmit={handleRefine} />
            <ExplanationModal 
                isVisible={isExplanationVisible} 
                onClose={() => setIsExplanationVisible(false)} 
                topic={explanationTopic}
                explanation={explanationResult}
                isLoading={isExplanationLoading}
            />
            <OnboardingModal isVisible={isOnboardingVisible} onClose={() => setIsOnboardingVisible(false)} />
        </div>
    );
};

export default App;
