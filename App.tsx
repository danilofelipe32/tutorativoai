

import React, { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ActionType, View, HistoryItem, ResultPayload, AISettings, GroundingChunk } from './types';
import Header from './components/Header';
import { actionConfig } from './constants';
import { PlusIcon, LoadingIcon } from './components/icons';

// Carregamento assíncrono dos componentes principais e modais
const MainView = lazy(() => import('./components/MainView'));
const ResultsView = lazy(() => import('./components/ResultsView'));
const HelpModal = lazy(() => import('./components/HelpModal'));
const RefineModal = lazy(() => import('./components/RefineModal'));
const ExplanationModal = lazy(() => import('./components/ExplanationModal'));
const OnboardingModal = lazy(() => import('./components/OnboardingModal'));
const SettingsModal = lazy(() => import('./components/SettingsModal'));
const QuizDifficultyModal = lazy(() => import('./components/QuizDifficultyModal'));


// Declara a biblioteca pdf.js como uma variável global para o TypeScript
declare const pdfjsLib: any;

// A chave de API foi inserida diretamente no código.
const ai = new GoogleGenAI({ apiKey: "AIzaSyA3e-4Do8arZ4NkqE_qC5eUBWkpt1kYKJs" });


function getPromptForAction(action: ActionType, context: string, difficulty: string = 'Médio'): string {
    // Para a pesquisa na web, o "contexto" é a própria pergunta do usuário.
    if (action === ActionType.WEB_SEARCH) {
        return `Como um assistente de pesquisa IA, use as informações mais recentes da web para fornecer uma resposta abrangente e atualizada para a seguinte pergunta ou tópico: "${context}"`;
    }

    // Prompt avançado instruindo a IA a usar um processo de raciocínio estruturado para as outras ações.
    const basePrompt = `Você é um "Tutor Inteligente" de elite, uma IA assistente de estudos com especialização em pedagogia e clareza. Sua tarefa é analisar o texto fornecido e executar a tarefa solicitada com excelência.

**Processo de Raciocínio Interno OBRIGATÓRIO (NÃO exibir na resposta final):**

Antes de gerar a resposta, você DEVE seguir estas três etapas internamente:

1.  **Etapa 1: Raciocínio Estruturado (Chain-of-Thought)**
    *   **Objetivo:** Qual é a intenção exata do usuário com esta tarefa?
    *   **Análise do Texto:** Quais são os 3-5 conceitos ou argumentos mais críticos no texto fornecido?
    *   **Plano de Resposta:** Qual é a estrutura lógica ideal para a resposta? (ex: introdução, pontos principais em bullet points, conclusão).
    *   **Cadeia de Pensamento:** Formule um plano passo a passo para construir a resposta a partir da análise.

2.  **Etapa 2: Autocrítica e Melhoria Contínua**
    *   **Rascunho Inicial:** Gere uma primeira versão completa da resposta com base no plano.
    *   **Avaliação Crítica:** Revise o rascunho. A resposta está 100% alinhada com o objetivo? É clara, concisa e precisa? Poderia ser mal interpretada? Existem jargões que precisam ser simplificados? A formatação está otimizada para a leitura?
    *   **Refinamento:** Incorpore as melhorias identificadas na avaliação para criar uma versão superior.

3.  **Etapa 3: Formulação da Resposta Final**
    *   Com base no rascunho refinado, componha a resposta final que será entregue ao usuário.
    *   Use marcações simples como **negrito** para destacar termos importantes e bullet points para listas.

**SAÍDA FINAL PARA O USUÁRIO:**

*   **NÃO inclua absolutamente NADA do seu processo de raciocínio interno.**
*   Sua resposta deve ser apenas o produto final, polido e pronto para ser lido.
*   Comece diretamente com a resposta à tarefa solicitada.

--- INÍCIO DO TEXTO PARA ANÁLISE ---
${context}
--- FIM DO TEXTO PARA ANÁLISE ---

`;

    switch (action) {
        case 'SUMMARIZE':
            return basePrompt + "Tarefa: Crie um resumo conciso dos pontos-chave do texto. Apresente os pontos como uma lista (bullet points), cada um iniciado por um hífen '-'.";
        case 'KEYWORDS':
            return basePrompt + "Tarefa: Identifique e liste os 5 a 7 termos ou conceitos mais importantes do texto. Para cada termo, forneça uma breve definição (1-2 frases) baseada no contexto. Formate como: **Termo:** Definição.";
        case 'REFLECT':
            return basePrompt + "Tarefa: Elabore de 3 a 5 perguntas abertas e instigantes sobre o texto que incentivem o pensamento crítico e não possam ser respondidas com 'sim' ou 'não'. Numere as perguntas.";
        case 'TEST':
            return basePrompt + `Tarefa: Crie um quiz de nível **${difficulty}** com 4 perguntas de múltipla escolha para testar o conhecimento sobre o texto. Siga ESTRITAMENTE este formato:\n1. Pergunta...\na) Opção A\nb) Opção B\nc) Opção C\nd) Opção D\n\nNo final, adicione a chave de respostas usando a tag **Gabarito:** seguido das respostas (ex: 1-c, 2-a...).`;
        case 'SIMPLIFY':
            return basePrompt + "Tarefa: Reescreva os conceitos mais complexos do texto em linguagem simples, como se estivesse explicando para alguém mais jovem. Evite jargões, use parágrafos curtos e, se possível, uma analogia.";
        case 'MINDMAP':
            return basePrompt + "Tarefa: Gere uma estrutura de mapa mental em formato de texto (usando recuo e marcadores como -, +, *) que organize as ideias principais e secundárias do texto. Comece com a ideia central.";
        case 'ANALOGY':
            return basePrompt + "Tarefa: Explique o conceito central do texto usando uma analogia simples e fácil de entender, relacionando o tópico a algo do cotidiano.";
        case 'STEP_BY_STEP':
            return basePrompt + "Tarefa: Se o texto descreve um processo ou sequência, detalhe-o em um formato 'passo a passo' numerado. Caso contrário, explique a estrutura lógica do texto de forma sequencial.";
        case 'CONNECTIONS':
            return basePrompt + "Tarefa: Liste de 2 a 3 exemplos práticos de como os conceitos do texto se conectam com o mundo real ou outras áreas do conhecimento (ciência, história, etc.). Use bullet points (iniciados por '-').";
        case 'DEEPER_QUESTIONS':
            return basePrompt + "Tarefa: Gere 3-5 perguntas de aprofundamento que vão além do superficial, desafiando premissas e explorando as implicações das ideias do texto. Numere as perguntas.";
        case 'SOCRATIC_OPPONENT':
            return basePrompt + "Tarefa: Atue como um 'Oponente Socrático'. Formule 3 a 5 perguntas críticas que questionem os argumentos centrais do texto, identifiquem possíveis falhas ou explorem perspectivas alternativas.";
        case 'LESSON_PLAN':
            return basePrompt + "Tarefa: Esboce um plano de aula com base no texto, incluindo: **Objetivos**, **Atividade Introdutória**, **Atividades Principais**, e **Avaliação**. Use bullet points para organizar cada seção.";
        case 'RUBRIC':
            return basePrompt + "Tarefa: Crie uma rubrica de avaliação com 3 critérios e 3 níveis de desempenho (ex: 'Iniciante', 'Proficiente', 'Exemplar'). Formate o resultado ESTRITAMENTE como uma tabela Markdown.";
        case 'DIFFERENTIATION':
            return basePrompt + "Tarefa: Sugira 3 estratégias de diferenciação instrucional (para alunos com dificuldades, na média e avançados) com base no tópico do texto. Use bullet points.";
        case 'DOK_QUESTIONS':
            return basePrompt + "Tarefa: Elabore 2 perguntas para cada um dos quatro níveis da Profundidade de Conhecimento de Webb (DOK 1 a 4) sobre o texto. Rotule cada nível claramente (ex: **DOK 1 (Recordar):**).";
        case 'WORKSHEETS':
            return basePrompt + "Tarefa: Crie uma planilha de atividades com 3 a 4 tipos de exercícios diferentes (ex: preencher lacunas, resposta curta, etc.) baseados no texto. Use tabelas Markdown para maior clareza.";
        case 'PROJECT_IDEAS':
            return basePrompt + "Tarefa: Liste de 4 a 6 ideias de projetos criativos que os alunos poderiam realizar com base no texto. Para cada ideia, descreva o projeto e o produto final (ex: podcast, apresentação).";
        case 'EXEMPLARS':
            return basePrompt + "Tarefa: Crie dois exemplos de resposta de um aluno: um **Exemplar (Forte)** e um **Não-Exemplar (Com Pontos a Melhorar)**. Explique brevemente por que cada um foi classificado dessa forma.";
        case 'CHOICE_BOARD':
            return basePrompt + "Tarefa: Crie um 'Quadro de Escolhas' com nove atividades variadas baseadas no texto, apelando para diferentes estilos de aprendizagem. Formate a resposta ESTRITAMENTE como uma tabela Markdown 3x3.";
        case 'MISCONCEPTIONS':
            return basePrompt + "Tarefa: Identifique 2 a 3 equívocos comuns sobre o tópico do texto. Para cada um, declare o **Equívoco Comum** e forneça uma **Explicação Clara** para corrigi-lo.";
        case 'DISCUSSION_PROMPTS':
            return basePrompt + "Tarefa: Elabore 5 perguntas abertas para discussão em grupo que promovam o debate e a troca de perspectivas sobre o texto. Numere as perguntas.";
        case 'INFORMATIONAL_TEXT':
            return basePrompt + "Tarefa: Sintetize o conteúdo do texto em um novo texto informativo curto (3-4 parágrafos) para um público leigo, explicando os termos-chave de forma clara.";
        case 'REAL_WORLD_EXAMPLES':
            return basePrompt + "Tarefa: Liste de 4 a 6 exemplos concretos do mundo real que ilustrem os conceitos principais do texto. Use bullet points.";
        case 'STORYTELLER':
            return basePrompt + "Tarefa: Transforme o conteúdo principal do texto em uma pequena história ou narrativa envolvente. O objetivo é tornar a informação mais memorável e interessante. Seja breve e direto.";
        case 'FACT_CHECKER':
            return basePrompt + "Tarefa: Atue como um 'Verificador de Fatos'. Identifique de 3 a 5 alegações importantes no texto e, para cada uma, formule uma pergunta para verificar sua veracidade. Formate como:\n**Alegação 1:** [Alegação].\n**Pergunta de Verificação:** [Sua pergunta].";
        case 'AI_QUEST_EDU':
            // Este prompt foi simplificado para ser mais direto e reduzir a chance de erros de API.
            return `Você é o **Gerador de Missões AI QUEST EDU (BNCC)**, um Game Master pedagógico. Sua tarefa é transformar o texto do usuário em uma missão gamificada para alunos.

**Contexto Fornecido pelo Usuário:**
"""
${context}
"""

**Instruções: Crie uma missão de projeto. Inclua um **Título Cativante**, **Missão (o desafio)**, **Recursos (o que eles usam)**, **Etapas (o que eles fazem)** e **Avaliação (como são avaliados)**. Aponte 2-3 **Habilidades da BNCC** relevantes.`;
        case 'POSSIBILITIES_ENGINE':
            return basePrompt + "Tarefa: Gere 3 a 5 formas alternativas de explicar o conceito central do texto, cada uma com uma abordagem diferente (ex: uma metáfora visual, uma conexão histórica).";
        case 'CO_DESIGNER':
            return basePrompt + "Tarefa: Atue como um 'Co-Designer' de aprendizado. Para ajudar um professor a planejar uma atividade, sugira 3 perguntas-chave que ele poderia fazer a um aluno para entender seus interesses. Em seguida, proponha 2 ideias de atividades de projeto baseadas no texto.";
        case 'COLLABORATION_COACH':
            return basePrompt + "Tarefa: Atue como um 'Coach de Colaboração'. Sugira 3 funções específicas para membros de um grupo que trabalham com este texto (ex: 'Líder de Pesquisa') e liste 2 ideias de pesquisa para o grupo começar.";
        case 'EXPLORATORIUM':
            return basePrompt + "Tarefa: Identifique um ponto de informação ou dado chave no texto e gere 3 perguntas que incentivem um aluno a investigar e visualizar essa informação mais a fundo.";
        case 'IDENTIFY_PERSPECTIVE':
            return basePrompt + "Tarefa: Analise o texto para identificar o ponto de vista principal do autor. Destaque 2-3 frases que revelem essa perspectiva e descreva brevemente um ponto de vista alternativo.";
        case 'FEEDBACK_GENERATOR':
            return basePrompt + "Tarefa: Imagine que este texto é a resposta de um aluno. Forneça um feedback construtivo em 3 partes: 1) Um 'brilho' (o que foi bem feito). 2) Um 'ponto de crescimento' (uma área para melhorar). 3) Uma 'pergunta de aprofundamento'.";
        case 'PARETO_PRINCIPLE':
            return basePrompt + "Tarefa: Aplique o Princípio de Pareto (regra 80/20) ao texto. Identifique os 20% do conteúdo mais críticos que fornecem 80% da compreensão do tópico e liste-os em bullet points.";
        case 'FEYNMAN_TECHNIQUE':
            return basePrompt + "Tarefa: Aplique a Técnica de Feynman. Primeiro, explique o conceito central do texto em linguagem extremamente simples. Em seguida, identifique uma área onde sua explicação simplificada pode ser fraca, formulando uma pergunta sobre ela.";
        case 'SIMULATED_DEBATE':
            return basePrompt + "Tarefa: Crie um diálogo de debate curto entre 'Debatedor A' e 'Debatedor B' com pontos de vista opostos sobre o tema do texto. Cada um deve apresentar um argumento e uma réplica. Formate o diálogo claramente.";
        case 'WHAT_IF_SCENARIOS':
            return basePrompt + "Tarefa: Crie 3 cenários hipotéticos instigantes baseados no conceito central do texto. Formate ESTRITAMENTE como:\n**Cenário \"E Se...?\":** [Descrição].\n**Possíveis Consequências:** [Consequências].";
        case 'EVIDENCE_HUNT':
            return basePrompt + "Tarefa: Formule 3 'missões de caça às evidências'. Cada missão deve ser uma afirmação baseada no texto, e o desafio para o aluno é encontrar a evidência que a comprova. Formate ESTRITAMENTE como:\n**Afirmação 1:** [Afirmação].\n**Missão:** Encontre a evidência no texto.";
        case 'GAME_BUILDER':
            return basePrompt + "Tarefa: Descreva as regras para um minijogo simples (de tabuleiro, cartas, etc.) baseado no conteúdo do texto. Inclua: **Nome do Jogo**, **Objetivo**, **Regras Básicas** e **Condição de Vitória**.";
        case 'MAKER_GUIDE':
            return basePrompt + "Tarefa: Transforme um conceito do texto em um projeto prático de baixo custo. Descreva um guia 'faça você mesmo' com: **Título do Projeto**, **Conceito-Chave**, **Materiais Necessários** e **Passo a Passo Simplificado**.";
        case 'CASE_STUDIES':
            return basePrompt + "Tarefa: Crie 2 estudos de caso curtos que apliquem os conceitos do texto a um problema do mundo real. Cada um deve ter: **1. Cenário**, **2. Dilema**, e **3. Pergunta para Análise**.";
        case 'PROGRESS_MAP':
            return basePrompt + "Tarefa: Crie um 'Mapa de Progresso' para um estudante com duas seções: 1. **Conceitos Fundamentais (O que você já sabe):** liste 3-5 conceitos básicos do texto. 2. **Áreas para Aprofundamento (O que aprender a seguir):** liste 3-5 tópicos avançados do texto.";
        case 'SMART_STUDY_PLAN':
            return basePrompt + "Tarefa: Crie um 'Plano de Estudo Inteligente' de 3 dias com base no texto. Para cada dia, sugira uma meta e uma pequena atividade prática. Formate como:\n**Dia 1: Fundamentos**\n*   **Meta:** [Meta]\n*   **Atividade:** [Atividade]";
        case 'GAP_DETECTOR':
            return basePrompt + "Tarefa: Analise criticamente o texto e identifique de 3 a 4 áreas onde as informações são superficiais ou ambíguas, explicando por que cada uma merece mais estudo. Use bullet points.";
        case 'PRACTICAL_APPLICATIONS':
            return basePrompt + "Tarefa: Liste de 4 a 6 aplicações práticas dos conceitos do texto. Especifique se cada aplicação é para o **Cotidiano** ou **Mercado de Trabalho** e descreva seu uso. Formato: **[Cotidiano/Mercado de Trabalho] - Título:** Descrição.";
        case 'CONTEXTUALIZED_EXAMPLES':
            return basePrompt + "Tarefa: Gere 3 'Exemplos Contextualizados' como mini cenários ou breves histórias que descrevem uma situação do mundo real onde o conhecimento do texto é essencial. Numere cada exemplo.";
        case 'INTERDISCIPLINARY_EXPLORATION':
            return basePrompt + "Tarefa: Descreva como o tema central do texto se conecta com 3 outras áreas do conhecimento (ex: História, Arte, Ciência). Explique cada conexão em 2-3 frases. Formato: **Conexão com [Área]:** Explicação.";
        case 'METAPHORICAL_LEARNING':
            return basePrompt + "Tarefa: Explique o conceito central do texto usando uma metáfora ou analogia criativa e memorável. A explicação deve ser envolvente e terminar com uma pergunta que reforce a compreensão.";
        case 'SPACED_REPETITION':
            return basePrompt + "Tarefa: Com base nos conceitos-chave do texto, crie um plano de revisão espaçada. Sugira 3 perguntas de revisão e um cronograma simples (ex: revisar em 1 dia, 3 dias, 1 semana) para ajudar na memorização.";
        case 'GROWTH_MINDSET':
            return basePrompt + "Tarefa: Escreva 2-3 dicas sobre como abordar o estudo do tópico do texto com uma 'mentalidade de crescimento'. Foque em como superar desafios e ver o esforço como um caminho para o aprendizado.";
        case 'FLOW_STATE':
            return basePrompt + "Tarefa: Crie uma lista de 3 a 5 dicas práticas para ajudar um estudante a alcançar o 'estado de flow' (foco profundo) ao estudar o conteúdo deste texto. As dicas devem ser acionáveis e diretas.";
        case 'CURIOSITY_EXPLORATION':
            return basePrompt + "Tarefa: Para despertar a curiosidade sobre o tema, gere 3 'trilhas de exploração'. Cada trilha deve ser uma pergunta intrigante seguida por 2-3 sugestões de tópicos relacionados para pesquisa futura.";
        case 'SCENARIO_BASED_LEARNING':
            return basePrompt + "Tarefa: Crie um cenário ou estudo de caso curto e realista onde o conhecimento do texto é necessário para resolver um problema. Conclua o cenário com 1-2 perguntas desafiadoras para o leitor.";
        case 'REVERSE_ENGINEERING':
            return basePrompt + "Tarefa: Aplique a 'engenharia reversa' ao argumento principal do texto. Desconstrua-o em suas partes fundamentais: 1) A conclusão principal. 2) As premissas ou evidências que a sustentam. Apresente isso em uma lista clara.";
        case 'GLOSSARY':
             return basePrompt + "Tarefa: Crie um glossário com os 5 a 7 termos técnicos ou mais importantes do texto. Para cada termo, forneça uma definição clara e concisa baseada no contexto. Formate como: **Termo:** Definição.";
        case 'SENTIMENT_ANALYSIS':
            return basePrompt + "Tarefa: Realize uma análise de sentimento do texto. Determine o tom geral do autor (ex: positivo, negativo, neutro, informativo, persuasivo, crítico) e justifique sua análise com 2-3 exemplos ou frases do texto.";
        case 'GENERATE_TWEET':
            return basePrompt + "Tarefa: Resuma a ideia central do texto em um tweet conciso (máximo de 280 caracteres). O tweet deve ser envolvente e incluir 2-3 hashtags relevantes.";
        case 'IDENTIFY_BIAS':
            return basePrompt + "Tarefa: Atue como um analista crítico. Identifique 2-3 possíveis vieses, linguagens carregadas ou argumentos unilaterais no texto. Para cada ponto, descreva o viés potencial e cite a parte do texto que o sugere.";
        default:
            return context;
    }
}

const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = (error) => reject(error);
    });

const App: React.FC = () => {
    const [view, setView] = useState<View>(View.MAIN);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<ResultPayload | null>(null);
    const [error, setError] = useState('');
    const [currentAction, setCurrentAction] = useState<ActionType | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isHelpModalVisible, setHelpModalVisible] = useState(false);
    const [isRefineModalVisible, setRefineModalVisible] = useState(false);
    const [isExplanationModalVisible, setExplanationModalVisible] = useState(false);
    const [explanationTopic, setExplanationTopic] = useState('');
    const [explanationContent, setExplanationContent] = useState('');
    const [isExplanationLoading, setExplanationLoading] = useState(false);
    const [isOnboardingModalVisible, setOnboardingModalVisible] = useState(false);
    const [isSettingsModalVisible, setSettingsModalVisible] = useState(false);
    const [isQuizModalVisible, setQuizModalVisible] = useState(false);
    const [isOcrLoading, setOcrLoading] = useState(false);
    const [isPdfLoading, setPdfLoading] = useState(false);
    const [favoriteActions, setFavoriteActions] = useState<ActionType[]>([]);

    const initialSettings: AISettings = { temperature: 0.7, topK: 40, topP: 0.95 };
    const [aiSettings, setAiSettings] = useState<AISettings>(initialSettings);

    const lastRequestRef = useRef<{ action: ActionType, context: string, difficulty?: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load state from localStorage on initial render
    useEffect(() => {
        try {
            const savedHistory = localStorage.getItem('tutor-ai-history');
            if (savedHistory) {
                setHistory(JSON.parse(savedHistory));
            }

            const savedSettings = localStorage.getItem('tutor-ai-settings');
            if (savedSettings) {
                setAiSettings(JSON.parse(savedSettings));
            } else {
                setAiSettings(initialSettings);
            }

            const savedFavorites = localStorage.getItem('tutor-ai-favorites');
            if (savedFavorites) {
                setFavoriteActions(JSON.parse(savedFavorites));
            }

            const hasOnboarded = localStorage.getItem('tutor-ai-onboarded');
            if (!hasOnboarded) {
                setOnboardingModalVisible(true);
            }
        } catch (e) {
            console.error("Failed to load from localStorage", e);
        }
    }, []);

    // Save state to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('tutor-ai-history', JSON.stringify(history));
        } catch (e) {
            console.error("Failed to save history to localStorage", e);
        }
    }, [history]);

    useEffect(() => {
        try {
            localStorage.setItem('tutor-ai-settings', JSON.stringify(aiSettings));
        } catch (e) {
            console.error("Failed to save settings to localStorage", e);
        }
    }, [aiSettings]);

    useEffect(() => {
        try {
            localStorage.setItem('tutor-ai-favorites', JSON.stringify(favoriteActions));
        } catch (e) {
            console.error("Failed to save favorites to localStorage", e);
        }
    }, [favoriteActions]);

    const handleGenerateContent = useCallback(async (action: ActionType, context: string, isRefinement = false, refinementInstruction = '', difficulty: string = 'Médio') => {
        if (!context.trim()) {
            setError("O texto de entrada não pode estar vazio.");
            return;
        }

        setIsLoading(true);
        setError('');
        if (!isRefinement) {
            setResult(null);
            setView(View.RESULTS);
            setCurrentAction(action);
            lastRequestRef.current = { action, context, difficulty: action === ActionType.TEST ? difficulty : undefined };
        }

        try {
            const prompt = isRefinement
                ? `Com base na resposta anterior, refine o resultado com a seguinte instrução: "${refinementInstruction}". A resposta anterior foi gerada a partir do texto original. Mantenha o formato e a essência da resposta original, apenas aplicando a modificação solicitada.\n\n--- RESPOSTA ANTERIOR ---\n${result?.text}\n\n--- TEXTO ORIGINAL (para contexto) ---\n${context}`
                : getPromptForAction(action, context, difficulty);
            
            const modelConfig: any = {
                temperature: aiSettings.temperature,
                topK: aiSettings.topK,
                topP: aiSettings.topP,
            };

            if (action === ActionType.WEB_SEARCH) {
                modelConfig.tools = [{ googleSearch: {} }];
            }

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: modelConfig,
            });

            const responseText = response.text;
            const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] | undefined;
            const newResult: ResultPayload = { text: responseText, sources };

            setResult(newResult);

            if (!isRefinement) {
                const newHistoryItem: HistoryItem = {
                    id: Date.now(),
                    actionType: action,
                    inputTextSnippet: context.substring(0, 100) + (context.length > 100 ? '...' : ''),
                    fullInputText: context,
                    fullResult: newResult,
                    timestamp: new Date().toISOString(),
                    difficulty: action === ActionType.TEST ? difficulty as ('Fácil' | 'Médio' | 'Difícil') : undefined,
                };
                setHistory(prev => [newHistoryItem, ...prev]);
            }

        } catch (e: any) {
            console.error("Error generating content:", e);
            setError(`Ocorreu um erro ao comunicar com a IA: ${e.message}. Tente novamente.`);
        } finally {
            setIsLoading(false);
        }
    }, [aiSettings, result]);

    const handleActionSelect = (action: ActionType) => {
        if (!inputText.trim()) {
             setError("O texto de entrada não pode estar vazio.");
             return;
        }
        if (action === ActionType.TEST) {
            setQuizModalVisible(true);
        } else {
            handleGenerateContent(action, inputText);
        }
    };

    const handleQuizGeneration = (difficulty: 'Fácil' | 'Médio' | 'Difícil') => {
        setQuizModalVisible(false);
        handleGenerateContent(ActionType.TEST, inputText, false, '', difficulty);
    };

    const handleRefine = (instruction: string) => {
        if (lastRequestRef.current) {
            handleGenerateContent(lastRequestRef.current.action, lastRequestRef.current.context, true, instruction);
        }
    };

    const handleExplainTopic = useCallback(async (topic: string) => {
        setExplanationTopic(topic);
        setExplanationModalVisible(true);
        setExplanationLoading(true);
        setExplanationContent('');

        try {
            const prompt = `Explique o seguinte tópico de forma clara e concisa, como se estivesse ensinando a um iniciante. O tópico é: "${topic}".`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    temperature: 0.5,
                }
            });

            setExplanationContent(response.text);
        } catch (e: any) {
            setExplanationContent(`Ocorreu um erro ao gerar a explicação: ${e.message}`);
        } finally {
            setExplanationLoading(false);
        }
    }, []);

    const handleImageUpload = async (file: File) => {
        setOcrLoading(true);
        setInputText('');
        setError('');
        try {
            const base64Data = await fileToBase64(file);
            const imagePart = { inlineData: { mimeType: file.type, data: base64Data } };
            const textPart = { text: "Extraia todo o texto desta imagem, mantendo a formatação original o máximo possível. Responda apenas com o texto extraído." };
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, textPart] },
            });
            setInputText(response.text);
        } catch (e: any) {
            console.error("OCR Error:", e);
            setError(`Falha ao extrair texto da imagem: ${e.message}`);
        } finally {
            setOcrLoading(false);
        }
    };

    const handlePdfUpload = async (file: File) => {
        setPdfLoading(true);
        setInputText('');
        setError('');
    
        try {
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`;
            
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            
            const pagePromises = [];
            for (let i = 1; i <= pdf.numPages; i++) {
                pagePromises.push(pdf.getPage(i));
            }
            
            const pages = await Promise.all(pagePromises);
            const textContentPromises = pages.map(page => page.getTextContent());
            const textContents = await Promise.all(textContentPromises);
    
            const fullText = textContents.map(content => {
                return content.items.map((item: any) => item.str).join(' ');
            }).join('\n\n');
            
            setInputText(fullText.trim());
    
        } catch (e: any) {
            console.error("PDF Error:", e);
            setError(`Falha ao processar o PDF: ${e.message}`);
        } finally {
            setPdfLoading(false);
        }
    };

    const handleFabClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.type === 'application/pdf') {
                handlePdfUpload(file);
            } else if (file.type.startsWith('image/')) {
                handleImageUpload(file);
            } else {
                alert('Tipo de arquivo não suportado. Por favor, anexe uma imagem ou PDF.');
            }
        }
        if (event.target) {
            event.target.value = ''; // Allow uploading the same file again
        }
    };

    const handleBack = () => setView(View.MAIN);
    const handleClearText = () => setInputText('');
    const handleHistoryItemClick = (item: HistoryItem) => {
        setInputText(item.fullInputText);
        setResult(item.fullResult);
        setCurrentAction(item.actionType);
        lastRequestRef.current = { action: item.actionType, context: item.fullInputText, difficulty: item.difficulty };
        setView(View.RESULTS);
    };
    const handleDeleteItem = (itemId: number) => setHistory(prev => prev.filter(item => item.id !== itemId));
    const handleRenameItem = (itemId: number, newTitle: string) => {
        setHistory(prev => prev.map(item => item.id === itemId ? { ...item, customTitle: newTitle } : item));
    };

    const handleRefresh = () => {
        if (lastRequestRef.current) {
            handleGenerateContent(lastRequestRef.current.action, lastRequestRef.current.context, false, '', lastRequestRef.current.difficulty);
        }
    };

    const handleSaveSettings = (newSettings: AISettings) => {
        setAiSettings(newSettings);
        setSettingsModalVisible(false);
    };
    
    const handleCloseOnboarding = () => {
        setOnboardingModalVisible(false);
        localStorage.setItem('tutor-ai-onboarded', 'true');
    };

    const handleImportHistory = useCallback((importedHistory: HistoryItem[]) => {
        setHistory(prevHistory => {
            const existingIds = new Set(prevHistory.map(item => item.id));
            const newUniqueItems = importedHistory.filter(item => !existingIds.has(item.id));
    
            if (newUniqueItems.length === 0) {
                alert('Nenhum item novo para importar. O histórico pode já conter esses itens.');
                return prevHistory;
            }
    
            const mergedHistory = [...newUniqueItems, ...prevHistory];
            mergedHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            
            alert(`${newUniqueItems.length} novo(s) item(ns) importado(s) com sucesso!`);
            return mergedHistory;
        });
    }, []);
    
    const handleToggleFavorite = (action: ActionType) => {
        setFavoriteActions(prev => {
            const isFavorited = prev.includes(action);
            if (isFavorited) {
                return prev.filter(fav => fav !== action);
            } else {
                if (prev.length >= 5) {
                    alert('Você pode fixar no máximo 5 ações como favoritas.');
                    return prev;
                }
                return [...prev, action];
            }
        });
    };
    
    const LoadingFallback = () => (
        <div className="flex items-center justify-center h-full">
            <LoadingIcon className="text-4xl animate-spin text-sky-400" />
        </div>
    );

    return (
        <div className="flex flex-col h-screen">
            <Header
                title={view === View.MAIN ? 'Tutor Ativo AI' : (currentAction ? actionConfig[currentAction].title : 'Resultado')}
                showBackButton={view === View.RESULTS}
                onBack={handleBack}
                onHelp={() => setHelpModalVisible(true)}
                onRefresh={handleRefresh}
                isRefreshable={view === View.RESULTS && !!lastRequestRef.current}
                onSettings={() => setSettingsModalVisible(true)}
            />
            <main className="flex-grow overflow-y-auto p-4 md:p-6 w-full max-w-5xl mx-auto">
                <Suspense fallback={<LoadingFallback />}>
                    <div key={view} className="animate-view-enter h-full">
                        {view === View.MAIN && (
                            <MainView
                                onActionSelect={handleActionSelect}
                                inputText={inputText}
                                onTextChange={setInputText}
                                onClearText={handleClearText}
                                history={history}
                                onHistoryItemClick={handleHistoryItemClick}
                                onDeleteItem={handleDeleteItem}
                                onRenameItem={handleRenameItem}
                                isOcrLoading={isOcrLoading}
                                isPdfLoading={isPdfLoading}
                                onImportHistory={handleImportHistory}
                                favoriteActions={favoriteActions}
                                onToggleFavorite={handleToggleFavorite}
                            />
                        )}
                        {view === View.RESULTS && (
                            <ResultsView
                                isLoading={isLoading}
                                result={result}
                                error={error}
                                actionType={currentAction}
                                onOpenRefineModal={() => setRefineModalVisible(true)}
                                onExplainTopic={handleExplainTopic}
                            />
                        )}
                    </div>
                </Suspense>
            </main>

            {view === View.MAIN && (
                <>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*,application/pdf"
                        className="hidden"
                        aria-hidden="true"
                    />
                    <button
                        onClick={handleFabClick}
                        disabled={isOcrLoading || isPdfLoading}
                        className="fixed bottom-6 right-4 sm:right-6 md:right-8 w-14 h-14 bg-sky-600 hover:bg-sky-500 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-sky-400/50 disabled:bg-slate-500 disabled:cursor-not-allowed disabled:hover:scale-100 z-30"
                        title="Anexar Imagem ou PDF"
                        aria-label="Anexar Imagem ou PDF"
                    >
                        <PlusIcon className="text-2xl" />
                    </button>
                </>
            )}
            
            <Suspense fallback={null}>
                {isHelpModalVisible && <HelpModal isVisible={isHelpModalVisible} onClose={() => setHelpModalVisible(false)} />}
                {isRefineModalVisible && <RefineModal isVisible={isRefineModalVisible} onClose={() => setRefineModalVisible(false)} onSubmit={handleRefine} />}
                {isExplanationModalVisible && <ExplanationModal 
                    isVisible={isExplanationModalVisible} 
                    onClose={() => setExplanationModalVisible(false)}
                    topic={explanationTopic}
                    explanation={explanationContent}
                    isLoading={isExplanationLoading}
                />}
                {isOnboardingModalVisible && <OnboardingModal isVisible={isOnboardingModalVisible} onClose={handleCloseOnboarding} />}
                {isSettingsModalVisible && <SettingsModal 
                    isVisible={isSettingsModalVisible}
                    onClose={() => setSettingsModalVisible(false)}
                    currentSettings={aiSettings}
                    onSave={handleSaveSettings}
                />}
                {isQuizModalVisible && <QuizDifficultyModal
                    isVisible={isQuizModalVisible}
                    onClose={() => setQuizModalVisible(false)}
                    onSelectDifficulty={handleQuizGeneration}
                />}
            </Suspense>
        </div>
    );
};

export default App;
