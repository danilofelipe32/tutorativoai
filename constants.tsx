
import React from 'react';
import { ActionType } from './types';
import { SummarizeIcon, KeywordsIcon, ReflectIcon, TestIcon, SimplifyIcon, MindmapIcon, AnalogyIcon, StepByStepIcon, ConnectionsIcon } from './components/icons';

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
};