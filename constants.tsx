import React from 'react';
import { ActionType } from './types';
import { 
    SummarizeIcon, KeywordsIcon, ReflectIcon, TestIcon, SimplifyIcon, MindmapIcon, AnalogyIcon, 
    StepByStepIcon, ConnectionsIcon, LessonPlanIcon, RubricIcon, SocraticOpponentIcon,
    ProjectIdeasIcon, ChoiceBoardIcon, MisconceptionsIcon, InformationalTextIcon,
    StorytellerIcon, FactCheckerIcon, DeeperQuestionsIcon, DifferentiationIcon, 
    DOKQuestionsIcon, WorksheetsIcon, ExemplarsIcon, DiscussionPromptsIcon, 
    RealWorldExamplesIcon, AIQuestEduIcon, PossibilitiesEngineIcon, CoDesignerIcon, 
    CollaborationCoachIcon, ExploratoriumIcon, IdentifyPerspectiveIcon, FeedbackGeneratorIcon,
    ParetoPrincipleIcon, FeynmanTechniqueIcon,
    SimulatedDebateIcon, WhatIfScenariosIcon, EvidenceHuntIcon, GameBuilderIcon, MakerGuideIcon, CaseStudiesIcon
} from './components/icons';

type ActionConfig = {
    [key in ActionType]: {
        title: string;
        description: string;
        icon: React.ComponentType<{ className?: string }>;
        className: string;
    };
};

export const actionConfig: ActionConfig = {
    [ActionType.SUMMARIZE]: {
        title: 'Resumir Texto',
        description: 'Cria um resumo conciso dos pontos principais.',
        icon: SummarizeIcon,
        className: 'bg-blue-900/30 border border-blue-500/50 hover:bg-blue-500/30 hover:shadow-lg hover:shadow-blue-500/40 backdrop-blur',
    },
    [ActionType.KEYWORDS]: {
        title: 'Termos-Chave',
        description: 'Extrai e define os conceitos mais importantes.',
        icon: KeywordsIcon,
        className: 'bg-emerald-900/30 border border-emerald-500/50 hover:bg-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/40 backdrop-blur',
    },
    [ActionType.REFLECT]: {
        title: 'Para Refletir',
        description: 'Gera perguntas para estimular o pensamento crítico.',
        icon: ReflectIcon,
        className: 'bg-purple-900/30 border border-purple-500/50 hover:bg-purple-500/30 hover:shadow-lg hover:shadow-purple-500/40 backdrop-blur',
    },
    [ActionType.TEST]: {
        title: 'Testar Conhecimento',
        description: 'Cria um quiz para avaliar sua compreensão.',
        icon: TestIcon,
        className: 'bg-amber-900/30 border border-amber-500/50 hover:bg-amber-500/30 hover:shadow-lg hover:shadow-amber-500/40 backdrop-blur',
    },
    [ActionType.SIMPLIFY]: {
        title: 'Simplificar Texto',
        description: 'Traduz seções complexas para uma linguagem fácil.',
        icon: SimplifyIcon,
        className: 'bg-rose-900/30 border border-rose-500/50 hover:bg-rose-500/30 hover:shadow-lg hover:shadow-rose-500/40 backdrop-blur',
    },
    [ActionType.MINDMAP]: {
        title: 'Criar Mapa Mental',
        description: 'Organiza o conteúdo em uma estrutura visual.',
        icon: MindmapIcon,
        className: 'bg-sky-900/30 border border-sky-500/50 hover:bg-sky-500/30 hover:shadow-lg hover:shadow-sky-500/40 backdrop-blur',
    },
    [ActionType.ANALOGY]: {
        title: 'Criar Analogia',
        description: 'Explica um tópico usando uma analogia simples.',
        icon: AnalogyIcon,
        className: 'bg-indigo-900/30 border border-indigo-500/50 hover:bg-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/40 backdrop-blur',
    },
    [ActionType.STEP_BY_STEP]: {
        title: 'Passo a Passo',
        description: 'Detalha um processo em etapas sequenciais.',
        icon: StepByStepIcon,
        className: 'bg-teal-900/30 border border-teal-500/50 hover:bg-teal-500/30 hover:shadow-lg hover:shadow-teal-500/40 backdrop-blur',
    },
    [ActionType.CONNECTIONS]: {
        title: 'Conexões Reais',
        description: 'Conecta o tema com o mundo real e outras áreas.',
        icon: ConnectionsIcon,
        className: 'bg-orange-900/30 border border-orange-500/50 hover:bg-orange-500/30 hover:shadow-lg hover:shadow-orange-500/40 backdrop-blur',
    },
    [ActionType.DEEPER_QUESTIONS]: {
        title: 'Perguntas de Aprofundamento',
        description: 'Gera perguntas que desafiam premissas e exploram implicações.',
        icon: DeeperQuestionsIcon,
        className: 'bg-zinc-900/30 border border-zinc-500/50 hover:bg-zinc-500/30 hover:shadow-lg hover:shadow-zinc-500/40 backdrop-blur',
    },
    [ActionType.LESSON_PLAN]: {
        title: 'Esboçar Plano de Aula',
        description: 'Estrutura um plano de aula sobre o tópico.',
        icon: LessonPlanIcon,
        className: 'bg-cyan-900/30 border border-cyan-500/50 hover:bg-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/40 backdrop-blur',
    },
    [ActionType.RUBRIC]: {
        title: 'Criar/Converter Rubrica',
        description: 'Gera uma rubrica de avaliação a partir do texto.',
        icon: RubricIcon,
        className: 'bg-yellow-900/30 border border-yellow-500/50 hover:bg-yellow-500/30 hover:shadow-lg hover:shadow-yellow-500/40 backdrop-blur',
    },
    [ActionType.DIFFERENTIATION]: {
        title: 'Estratégias de Diferenciação',
        description: 'Cria estratégias para diferentes níveis de alunos.',
        icon: DifferentiationIcon,
        className: 'bg-fuchsia-900/30 border border-fuchsia-500/50 hover:bg-fuchsia-500/30 hover:shadow-lg hover:shadow-fuchsia-500/40 backdrop-blur',
    },
    [ActionType.DOK_QUESTIONS]: {
        title: 'Criar Perguntas DOK',
        description: 'Elabora perguntas com base na Profundidade de Conhecimento.',
        icon: DOKQuestionsIcon,
        className: 'bg-lime-900/30 border border-lime-500/50 hover:bg-lime-500/30 hover:shadow-lg hover:shadow-lime-500/40 backdrop-blur',
    },
    [ActionType.WORKSHEETS]: {
        title: 'Criar Planilhas de Atividades',
        description: 'Gera planilhas de atividades envolventes.',
        icon: WorksheetsIcon,
        className: 'bg-violet-900/30 border border-violet-500/50 hover:bg-violet-500/30 hover:shadow-lg hover:shadow-violet-500/40 backdrop-blur',
    },
    [ActionType.SOCRATIC_OPPONENT]: {
        title: 'Oponente Socrático',
        description: 'Desafia suas ideias com perguntas críticas.',
        icon: SocraticOpponentIcon,
        className: 'bg-slate-900/30 border border-slate-500/50 hover:bg-slate-500/30 hover:shadow-lg hover:shadow-slate-500/40 backdrop-blur',
    },
    [ActionType.PROJECT_IDEAS]: {
        title: 'Ideias de Projetos',
        description: 'Brainstorm de ideias de projetos criativos sobre o tema.',
        icon: ProjectIdeasIcon,
        className: 'bg-cyan-900/30 border border-cyan-400/50 hover:bg-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/40 backdrop-blur',
    },
    [ActionType.EXEMPLARS]: {
        title: 'Exemplos e Não-Exemplos',
        description: 'Cria um exemplo forte e um fraco de uma tarefa.',
        icon: ExemplarsIcon,
        className: 'bg-rose-900/30 border border-rose-400/50 hover:bg-rose-500/30 hover:shadow-lg hover:shadow-rose-500/40 backdrop-blur',
    },
    [ActionType.CHOICE_BOARD]: {
        title: 'Quadro de Escolhas',
        description: 'Cria um quadro com 9 atividades variadas.',
        icon: ChoiceBoardIcon,
        className: 'bg-pink-900/30 border border-pink-500/50 hover:bg-pink-500/30 hover:shadow-lg hover:shadow-pink-500/40 backdrop-blur',
    },
    [ActionType.MISCONCEPTIONS]: {
        title: 'Equívocos Comuns',
        description: 'Aborda e corrige equívocos comuns sobre o tópico.',
        icon: MisconceptionsIcon,
        className: 'bg-blue-900/30 border border-blue-400/50 hover:bg-blue-500/30 hover:shadow-lg hover:shadow-blue-500/40 backdrop-blur',
    },
    [ActionType.DISCUSSION_PROMPTS]: {
        title: 'Perguntas para Discussão',
        description: 'Cria perguntas que geram debate e engajamento.',
        icon: DiscussionPromptsIcon,
        className: 'bg-indigo-900/30 border border-indigo-400/50 hover:bg-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/40 backdrop-blur',
    },
    [ActionType.INFORMATIONAL_TEXT]: {
        title: 'Escrever Texto Informativo',
        description: 'Cria um texto informativo sobre o mesmo tópico.',
        icon: InformationalTextIcon,
        className: 'bg-emerald-900/30 border border-emerald-400/50 hover:bg-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/40 backdrop-blur',
    },
    [ActionType.REAL_WORLD_EXAMPLES]: {
        title: 'Exemplos do Mundo Real',
        description: 'Brainstorm de aplicações práticas e exemplos reais.',
        icon: RealWorldExamplesIcon,
        className: 'bg-amber-900/30 border border-amber-400/50 hover:bg-amber-500/30 hover:shadow-lg hover:shadow-amber-500/40 backdrop-blur',
    },
    [ActionType.STORYTELLER]: {
        title: 'Contador de Histórias',
        description: 'Transforma o texto em uma narrativa envolvente.',
        icon: StorytellerIcon,
        className: 'bg-stone-900/30 border border-stone-500/50 hover:bg-stone-500/30 hover:shadow-lg hover:shadow-stone-500/40 backdrop-blur',
    },
    [ActionType.FACT_CHECKER]: {
        title: 'Verificador de Fatos',
        description: 'Formula perguntas para verificar a veracidade das informações.',
        icon: FactCheckerIcon,
        className: 'bg-red-900/30 border border-red-500/50 hover:bg-red-500/30 hover:shadow-lg hover:shadow-red-500/40 backdrop-blur',
    },
    [ActionType.AI_QUEST_EDU]: {
        title: 'AI QUEST EDU',
        description: 'Transforma um tema em uma missão de projeto gamificada (BNCC).',
        icon: AIQuestEduIcon,
        className: 'bg-fuchsia-900/30 border border-fuchsia-500/50 hover:bg-fuchsia-500/30 hover:shadow-lg hover:shadow-fuchsia-500/40 backdrop-blur',
    },
    [ActionType.POSSIBILITIES_ENGINE]: {
        title: 'Motor de Possibilidades',
        description: 'Gera formas alternativas para explicar um conceito.',
        icon: PossibilitiesEngineIcon,
        className: 'bg-fuchsia-900/30 border border-fuchsia-400/50 hover:bg-fuchsia-500/30 hover:shadow-lg hover:shadow-fuchsia-500/40 backdrop-blur',
    },
    [ActionType.CO_DESIGNER]: {
        title: 'Co-Designer',
        description: 'Ajuda a planejar atividades de aprendizado personalizadas.',
        icon: CoDesignerIcon,
        className: 'bg-lime-900/30 border border-lime-400/50 hover:bg-lime-500/30 hover:shadow-lg hover:shadow-lime-500/40 backdrop-blur',
    },
    [ActionType.COLLABORATION_COACH]: {
        title: 'Coach de Colaboração',
        description: 'Auxilia grupos em projetos com ideias de pesquisa.',
        icon: CollaborationCoachIcon,
        className: 'bg-orange-900/30 border border-orange-400/50 hover:bg-orange-500/30 hover:shadow-lg hover:shadow-orange-500/40 backdrop-blur',
    },
    [ActionType.EXPLORATORIUM]: {
        title: 'Exploratorium',
        description: 'Facilita a exploração de dados e promove a curiosidade.',
        icon: ExploratoriumIcon,
        className: 'bg-red-900/30 border border-red-400/50 hover:bg-red-500/30 hover:shadow-lg hover:shadow-red-500/40 backdrop-blur',
    },
    [ActionType.IDENTIFY_PERSPECTIVE]: {
        title: 'Identificar Perspectiva',
        description: 'Analisa o texto para identificar o ponto de vista e possíveis vieses.',
        icon: IdentifyPerspectiveIcon,
        className: 'bg-stone-900/30 border border-stone-500/50 hover:bg-stone-500/30 hover:shadow-lg hover:shadow-stone-500/40 backdrop-blur',
    },
    [ActionType.FEEDBACK_GENERATOR]: {
        title: 'Gerador de Feedback',
        description: 'Cria exemplos de feedback construtivo para os alunos.',
        icon: FeedbackGeneratorIcon,
        className: 'bg-gray-900/30 border border-gray-500/50 hover:bg-gray-500/30 hover:shadow-lg hover:shadow-gray-500/40 backdrop-blur',
    },
    [ActionType.PARETO_PRINCIPLE]: {
        title: 'Princípio de Pareto (80/20)',
        description: 'Identifica os 20% do conteúdo que geram 80% do resultado.',
        icon: ParetoPrincipleIcon,
        className: 'bg-green-900/30 border border-green-500/50 hover:bg-green-500/30 hover:shadow-lg hover:shadow-green-500/40 backdrop-blur',
    },
    [ActionType.FEYNMAN_TECHNIQUE]: {
        title: 'Técnica de Feynman',
        description: 'Explica um conceito de forma super simples, como se ensinasse a uma criança.',
        icon: FeynmanTechniqueIcon,
        className: 'bg-pink-900/30 border border-pink-400/50 hover:bg-pink-500/30 hover:shadow-lg hover:shadow-pink-500/40 backdrop-blur',
    },
    [ActionType.SIMULATED_DEBATE]: {
        title: 'Debate Simulado',
        description: 'Cria uma discussão entre perspectivas opostas sobre o tema.',
        icon: SimulatedDebateIcon,
        className: 'bg-gray-900/30 border border-gray-400/50 hover:bg-gray-500/30 hover:shadow-lg hover:shadow-gray-500/40 backdrop-blur',
    },
    [ActionType.WHAT_IF_SCENARIOS]: {
        title: 'Cenários "E Se..."',
        description: 'Explora hipóteses e consequências alternativas.',
        icon: WhatIfScenariosIcon,
        className: 'bg-indigo-900/30 border border-indigo-500/50 hover:bg-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/40 backdrop-blur',
    },
    [ActionType.EVIDENCE_HUNT]: {
        title: 'Caça às Evidências',
        description: 'Desafia a buscar provas que sustentem ou refutem uma afirmação.',
        icon: EvidenceHuntIcon,
        className: 'bg-stone-900/30 border border-stone-400/50 hover:bg-stone-500/30 hover:shadow-lg hover:shadow-stone-500/40 backdrop-blur',
    },
    [ActionType.GAME_BUILDER]: {
        title: 'Construtor de Jogos',
        description: 'Gera minijogos didáticos baseados no conteúdo.',
        icon: GameBuilderIcon,
        className: 'bg-fuchsia-900/30 border border-fuchsia-500/50 hover:bg-fuchsia-500/30 hover:shadow-lg hover:shadow-fuchsia-500/40 backdrop-blur',
    },
    [ActionType.MAKER_GUIDE]: {
        title: 'Guia Maker (STEAM)',
        description: 'Transforma conceitos em projetos práticos de experimentação.',
        icon: MakerGuideIcon,
        className: 'bg-orange-900/30 border border-orange-400/50 hover:bg-orange-500/30 hover:shadow-lg hover:shadow-orange-500/40 backdrop-blur',
    },
    [ActionType.CASE_STUDIES]: {
        title: 'Estudos de Caso',
        description: 'Cria situações-problema contextualizadas para análise.',
        icon: CaseStudiesIcon,
        className: 'bg-amber-900/30 border border-amber-400/50 hover:bg-amber-500/30 hover:shadow-lg hover:shadow-amber-500/40 backdrop-blur',
    },
};