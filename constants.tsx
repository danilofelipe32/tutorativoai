
import React from 'react';
import { ActionType } from './types';
import { 
    SummarizeIcon, KeywordsIcon, ReflectIcon, TestIcon, SimplifyIcon, MindmapIcon, AnalogyIcon, 
    StepByStepIcon, ConnectionsIcon, LessonPlanIcon, RubricIcon, SparkleIcon, SocraticOpponentIcon,
    ProjectIdeasIcon, ChoiceBoardIcon, MisconceptionsIcon, InformationalTextIcon,
    StorytellerIcon, FactCheckerIcon
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
        className: 'bg-blue-500 hover:bg-blue-600',
    },
    [ActionType.KEYWORDS]: {
        title: 'Termos-Chave',
        description: 'Extrai e define os conceitos mais importantes.',
        icon: KeywordsIcon,
        className: 'bg-emerald-500 hover:bg-emerald-600',
    },
    [ActionType.REFLECT]: {
        title: 'Para Refletir',
        description: 'Gera perguntas para estimular o pensamento crítico.',
        icon: ReflectIcon,
        className: 'bg-purple-500 hover:bg-purple-600',
    },
    [ActionType.TEST]: {
        title: 'Testar Conhecimento',
        description: 'Cria um quiz para avaliar sua compreensão.',
        icon: TestIcon,
        className: 'bg-amber-500 hover:bg-amber-600',
    },
    [ActionType.SIMPLIFY]: {
        title: 'Simplificar Texto',
        description: 'Traduz seções complexas para uma linguagem fácil.',
        icon: SimplifyIcon,
        className: 'bg-rose-500 hover:bg-rose-600',
    },
    [ActionType.MINDMAP]: {
        title: 'Criar Mapa Mental',
        description: 'Organiza o conteúdo em uma estrutura visual.',
        icon: MindmapIcon,
        className: 'bg-sky-500 hover:bg-sky-600',
    },
    [ActionType.ANALOGY]: {
        title: 'Criar Analogia',
        description: 'Explica um tópico usando uma analogia simples.',
        icon: AnalogyIcon,
        className: 'bg-indigo-500 hover:bg-indigo-600',
    },
    [ActionType.STEP_BY_STEP]: {
        title: 'Passo a Passo',
        description: 'Detalha um processo em etapas sequenciais.',
        icon: StepByStepIcon,
        className: 'bg-teal-500 hover:bg-teal-600',
    },
    [ActionType.CONNECTIONS]: {
        title: 'Conexões Reais',
        description: 'Conecta o tema com o mundo real e outras áreas.',
        icon: ConnectionsIcon,
        className: 'bg-orange-500 hover:bg-orange-600',
    },
    [ActionType.DEEPER_QUESTIONS]: {
        title: 'Perguntas de Aprofundamento',
        description: 'Gera perguntas que desafiam premissas e exploram implicações.',
        icon: SocraticOpponentIcon,
        className: 'bg-zinc-500 hover:bg-zinc-600',
    },
    [ActionType.LESSON_PLAN]: {
        title: 'Esboçar Plano de Aula',
        description: 'Estrutura um plano de aula sobre o tópico.',
        icon: LessonPlanIcon,
        className: 'bg-cyan-500 hover:bg-cyan-600',
    },
    [ActionType.RUBRIC]: {
        title: 'Criar/Converter Rubrica',
        description: 'Gera uma rubrica de avaliação a partir do texto.',
        icon: RubricIcon,
        className: 'bg-yellow-600 hover:bg-yellow-700',
    },
    [ActionType.DIFFERENTIATION]: {
        title: 'Estratégias de Diferenciação',
        description: 'Cria estratégias para diferentes níveis de alunos.',
        icon: SparkleIcon,
        className: 'bg-fuchsia-500 hover:bg-fuchsia-600',
    },
    [ActionType.DOK_QUESTIONS]: {
        title: 'Criar Perguntas DOK',
        description: 'Elabora perguntas com base na Profundidade de Conhecimento.',
        icon: SparkleIcon,
        className: 'bg-lime-500 hover:bg-lime-600',
    },
    [ActionType.WORKSHEETS]: {
        title: 'Criar Planilhas de Atividades',
        description: 'Gera planilhas de atividades envolventes.',
        icon: SparkleIcon,
        className: 'bg-violet-500 hover:bg-violet-600',
    },
    [ActionType.SOCRATIC_OPPONENT]: {
        title: 'Oponente Socrático',
        description: 'Desafia suas ideias com perguntas críticas.',
        icon: SocraticOpponentIcon,
        className: 'bg-slate-500 hover:bg-slate-600',
    },
    [ActionType.PROJECT_IDEAS]: {
        title: 'Ideias de Projetos',
        description: 'Brainstorm de ideias de projetos criativos sobre o tema.',
        icon: ProjectIdeasIcon,
        className: 'bg-cyan-600 hover:bg-cyan-700',
    },
    [ActionType.EXEMPLARS]: {
        title: 'Exemplos e Não-Exemplos',
        description: 'Cria um exemplo forte e um fraco de uma tarefa.',
        icon: SparkleIcon,
        className: 'bg-rose-600 hover:bg-rose-700',
    },
    [ActionType.CHOICE_BOARD]: {
        title: 'Quadro de Escolhas',
        description: 'Cria um quadro com 9 atividades variadas.',
        icon: ChoiceBoardIcon,
        className: 'bg-pink-500 hover:bg-pink-600',
    },
    [ActionType.MISCONCEPTIONS]: {
        title: 'Equívocos Comuns',
        description: 'Aborda e corrige equívocos comuns sobre o tópico.',
        icon: MisconceptionsIcon,
        className: 'bg-blue-700 hover:bg-blue-800',
    },
    [ActionType.DISCUSSION_PROMPTS]: {
        title: 'Perguntas para Discussão',
        description: 'Cria perguntas que geram debate e engajamento.',
        icon: SparkleIcon,
        className: 'bg-indigo-600 hover:bg-indigo-700',
    },
    [ActionType.INFORMATIONAL_TEXT]: {
        title: 'Escrever Texto Informativo',
        description: 'Cria um texto informativo sobre o mesmo tópico.',
        icon: InformationalTextIcon,
        className: 'bg-emerald-600 hover:bg-emerald-700',
    },
    [ActionType.REAL_WORLD_EXAMPLES]: {
        title: 'Exemplos do Mundo Real',
        description: 'Brainstorm de aplicações práticas e exemplos reais.',
        icon: SparkleIcon,
        className: 'bg-amber-600 hover:bg-amber-700',
    },
    [ActionType.STORYTELLER]: {
        title: 'Contador de Histórias',
        description: 'Transforma o texto em uma narrativa envolvente.',
        icon: StorytellerIcon,
        className: 'bg-stone-500 hover:bg-stone-600',
    },
    [ActionType.FACT_CHECKER]: {
        title: 'Verificador de Fatos',
        description: 'Formula perguntas para verificar a veracidade das informações.',
        icon: FactCheckerIcon,
        className: 'bg-red-600 hover:bg-red-700',
    },
    [ActionType.AI_QUEST_EDU]: {
        title: 'AI QUEST EDU',
        description: 'Transforma um tema em uma missão de projeto gamificada (BNCC).',
        icon: ProjectIdeasIcon,
        className: 'bg-fuchsia-600 hover:bg-fuchsia-700',
    },
};