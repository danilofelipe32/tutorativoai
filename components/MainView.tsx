

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ActionType, HistoryItem } from '../types';
import { actionConfig } from '../constants';
import HistoryList from './HistoryList';
import { PlusIcon, LoadingIcon, TrashIcon, ChevronRightIcon, StarIcon, StarFillIcon } from './icons';

interface MainViewProps {
    onActionSelect: (action: ActionType) => void;
    inputText: string;
    onTextChange: (text: string) => void;
    onClearText: () => void;
    history: HistoryItem[];
    onHistoryItemClick: (item: HistoryItem) => void;
    onDeleteItem: (itemId: number) => void;
    onRenameItem: (itemId: number, newTitle: string) => void;
    onImageUpload: (file: File) => void;
    isOcrLoading: boolean;
    onPdfUpload: (file: File) => void;
    isPdfLoading: boolean;
    onImportHistory: (importedHistory: HistoryItem[]) => void;
    favoriteActions: ActionType[];
    onToggleFavorite: (action: ActionType) => void;
}

const ActionButton: React.FC<{ 
    action: ActionType; 
    onClick: () => void; 
    isDisabled: boolean;
    isFavorite: boolean;
    onToggleFavorite: (action: ActionType) => void;
}> = ({ action, onClick, isDisabled, isFavorite, onToggleFavorite }) => {
    const config = actionConfig[action];

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Impede que o botão de ação principal seja acionado
        onToggleFavorite(action);
    };

    return (
        <button
            onClick={onClick}
            disabled={isDisabled}
            className={`relative p-3 rounded-xl flex flex-col items-start justify-between text-white shadow-lg transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100 ${config.className}`}
            aria-disabled={isDisabled}
        >
            <div className="flex justify-between items-start w-full">
                <config.icon className="text-3xl mb-2" />
                <button
                    onClick={handleFavoriteClick}
                    className="p-1 -mr-1 -mt-1 text-slate-400 hover:text-yellow-400 transition-colors z-10"
                    aria-label={isFavorite ? 'Desfavoritar ação' : 'Favoritar ação'}
                    title={isFavorite ? 'Desfavoritar' : 'Favoritar'}
                >
                    {isFavorite ? <StarFillIcon className="text-yellow-400" /> : <StarIcon />}
                </button>
            </div>
            <div className="text-left">
                <h3 className="font-bold text-xs md:text-sm">{config.title}</h3>
                <p className="text-[10px] opacity-80 mt-1">{config.description}</p>
            </div>
        </button>
    );
};

const initialActionGroups = [
  {
    title: 'Análise e Compreensão',
    description: 'Ações para extrair, simplificar e entender as informações centrais do texto.',
    colorClass: 'border-sky-500 hover:bg-sky-900/40',
    actions: [
      ActionType.WEB_SEARCH,
      ActionType.SUMMARIZE,
      ActionType.KEYWORDS,
      ActionType.GLOSSARY,
      ActionType.SIMPLIFY,
      ActionType.INFORMATIONAL_TEXT,
      ActionType.METAPHORICAL_LEARNING,
      ActionType.REVERSE_ENGINEERING,
      ActionType.REAL_WORLD_EXAMPLES,
      ActionType.PRACTICAL_APPLICATIONS,
      ActionType.CONTEXTUALIZED_EXAMPLES,
      ActionType.MISCONCEPTIONS,
      ActionType.FACT_CHECKER,
      ActionType.CONNECTIONS,
    ],
  },
  {
    title: 'Pensamento Crítico e Exploração',
    description: 'Ferramentas para questionar, aprofundar e explorar as ideias do texto por diferentes ângulos.',
    colorClass: 'border-purple-500 hover:bg-purple-900/40',
    actions: [
      ActionType.REFLECT,
      ActionType.DEEPER_QUESTIONS,
      ActionType.SOCRATIC_OPPONENT,
      ActionType.SENTIMENT_ANALYSIS,
      ActionType.IDENTIFY_BIAS,
      ActionType.ANALOGY,
      ActionType.PARETO_PRINCIPLE,
      ActionType.FEYNMAN_TECHNIQUE,
      ActionType.GROWTH_MINDSET,
      ActionType.FLOW_STATE,
      ActionType.CURIOSITY_EXPLORATION,
      ActionType.GAP_DETECTOR,
      ActionType.INTERDISCIPLINARY_EXPLORATION,
      ActionType.POSSIBILITIES_ENGINE,
      ActionType.EXPLORATORIUM,
      ActionType.DISCUSSION_PROMPTS,
      ActionType.IDENTIFY_PERSPECTIVE,
      ActionType.SIMULATED_DEBATE,
      ActionType.WHAT_IF_SCENARIOS,
      ActionType.EVIDENCE_HUNT,
    ],
  },
  {
    title: 'Criação e Aplicação',
    description: 'Use o conteúdo como base para criar novos materiais, projetos e narrativas.',
    colorClass: 'border-emerald-500 hover:bg-emerald-900/40',
    actions: [
      ActionType.MINDMAP,
      ActionType.STEP_BY_STEP,
      ActionType.STORYTELLER,
      ActionType.GENERATE_TWEET,
      ActionType.PROJECT_IDEAS,
      ActionType.WORKSHEETS,
      ActionType.AI_QUEST_EDU,
      ActionType.CO_DESIGNER,
      ActionType.COLLABORATION_COACH,
      ActionType.GAME_BUILDER,
      ActionType.MAKER_GUIDE,
      ActionType.CASE_STUDIES,
      ActionType.SCENARIO_BASED_LEARNING,
    ],
  },
  {
    title: 'Avaliação e Planejamento Pedagógico',
    description: 'Recursos específicos para educadores criarem avaliações, planos de aula e atividades.',
    colorClass: 'border-amber-500 hover:bg-amber-900/40',
    actions: [
      ActionType.TEST,
      ActionType.PROGRESS_MAP,
      ActionType.SMART_STUDY_PLAN,
      ActionType.SPACED_REPETITION,
      ActionType.LESSON_PLAN,
      ActionType.RUBRIC,
      ActionType.DIFFERENTIATION,
      ActionType.DOK_QUESTIONS,
      ActionType.EXEMPLARS,
      ActionType.CHOICE_BOARD,
      ActionType.FEEDBACK_GENERATOR,
    ],
  },
];


const MainView: React.FC<MainViewProps> = ({
    onActionSelect,
    inputText,
    onTextChange,
    onClearText,
    history,
    onHistoryItemClick,
    onDeleteItem,
    onRenameItem,
    onImageUpload,
    isOcrLoading,
    onPdfUpload,
    isPdfLoading,
    onImportHistory,
    favoriteActions,
    onToggleFavorite,
}) => {
    const isTextProvided = inputText.trim().length > 0;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isLoading = isOcrLoading || isPdfLoading;
    
    const [loadingMessage, setLoadingMessage] = useState('');

    const actionGroups = useMemo(() => {
        const favoriteSet = new Set(favoriteActions);

        const favoritesGroup = {
            title: '⭐ Favoritos',
            description: 'Suas ações mais usadas, sempre à mão.',
            colorClass: 'border-yellow-400 hover:bg-yellow-900/40',
            actions: favoriteActions.sort((a, b) => actionConfig[a].title.localeCompare(actionConfig[b].title)),
        };

        const otherGroups = initialActionGroups.map(group => ({
            ...group,
            actions: group.actions.filter(action => !favoriteSet.has(action)),
        })).filter(group => group.actions.length > 0);

        return favoriteActions.length > 0 ? [favoritesGroup, ...otherGroups] : otherGroups;
    }, [favoriteActions]);

    const [openGroup, setOpenGroup] = useState<string | null>(actionGroups.length > 0 ? actionGroups[0].title : null);

    useEffect(() => {
        let intervalId: number | undefined;
        if (isLoading) {
            const ocrMessages = [
                'Analisando a imagem...',
                'Identificando áreas de texto...',
                'Extraindo caracteres...',
                'Reconstruindo palavras e frases...',
            ];
            const pdfMessages = [
                'Carregando o arquivo PDF...',
                'Processando as páginas...',
                'Extraindo conteúdo textual...',
                'Montando o documento final...',
            ];
            const messages = isOcrLoading ? ocrMessages : pdfMessages;
            let messageIndex = 0;
            
            setLoadingMessage(messages[0]);
            intervalId = window.setInterval(() => {
                messageIndex = (messageIndex + 1) % messages.length;
                setLoadingMessage(messages[messageIndex]);
            }, 2000);

        }
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isLoading, isOcrLoading]);

    const handleToggleGroup = (title: string) => {
        setOpenGroup(prevOpenGroup => (prevOpenGroup === title ? null : title));
    };

    const handleFabClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.type === 'application/pdf') {
                onPdfUpload(file);
            } else if (file.type.startsWith('image/')) {
                onImageUpload(file);
            } else {
                alert('Tipo de arquivo não suportado. Por favor, anexe uma imagem ou PDF.');
            }
        }
        event.target.value = ''; // Allow uploading the same file again
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-100">Bem-vindo!</h2>
                    <p className="text-slate-400">Cole um texto ou faça uma pergunta abaixo.</p>
                </div>
                {isTextProvided && !isLoading && (
                     <button
                        onClick={onClearText}
                        className="bg-white/5 hover:bg-white/10 text-slate-200 font-semibold py-2 px-4 rounded-lg transition-colors text-sm flex items-center space-x-2 border border-white/10"
                        title="Limpar texto"
                    >
                        <TrashIcon className="text-base" />
                        <span>Limpar</span>
                    </button>
                )}
            </div>

            <div className="relative">
                <textarea
                    value={inputText}
                    onChange={(e) => onTextChange(e.target.value)}
                    placeholder="Cole seu texto aqui para analisá-lo, ou digite uma pergunta para a 'Pesquisa Web Inteligente'. Você também pode usar o botão azul para anexar uma imagem ou PDF."
                    className={`w-full flex-grow bg-slate-900/50 text-slate-300 p-4 rounded-lg mb-4 border backdrop-blur-sm focus:outline-none min-h-[150px] md:min-h-[200px] resize-y transition-all duration-300 border-white/10 focus:ring-2 focus:ring-sky-400 focus:shadow-[0_0_15px_rgba(59,130,246,0.4)]`}
                    aria-label="Área de texto para análise"
                    disabled={isLoading}
                />
                {isLoading && (
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-lg mb-4 flex flex-col items-center justify-center text-slate-200">
                        <LoadingIcon className="text-3xl animate-spin text-sky-400" />
                        <p className="mt-3 font-semibold text-center px-4">
                            {loadingMessage}
                        </p>
                        <div className="w-4/5 max-w-xs bg-slate-700/50 rounded-full h-1.5 mt-3 overflow-hidden">
                           <div className="bg-sky-500 h-1.5 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                )}
            </div>

            <>
                <div className="mb-6">
                    <p className="text-slate-300 font-semibold text-center text-lg">Agora, escolha uma ação:</p>
                </div>

                <div className="space-y-3">
                    {actionGroups.map((group) => {
                        const isOpen = openGroup === group.title;
                        const groupId = group.title.replace(/\s+/g, '-');
                        return (
                            <div key={group.title} className="bg-slate-900/30 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden transition-shadow duration-300 shadow-md hover:shadow-lg hover:shadow-black/30">
                                <button
                                    onClick={() => handleToggleGroup(group.title)}
                                    className={`w-full flex justify-between items-center p-4 text-left transition-colors duration-200 ${group.colorClass} border-l-4`}
                                    aria-expanded={isOpen}
                                    aria-controls={`accordion-content-${groupId}`}
                                >
                                    <div>
                                        <h3 id={`accordion-title-${groupId}`} className="text-lg font-bold text-slate-100">{group.title}</h3>
                                        <p className="text-slate-400 text-sm mt-1">{group.description}</p>
                                    </div>
                                    <ChevronRightIcon className={`text-2xl text-slate-400 transition-transform duration-300 flex-shrink-0 ml-4 ${isOpen ? 'rotate-90' : ''}`} />
                                </button>
                                <div
                                    id={`accordion-content-${groupId}`}
                                    className={`accordion-content ${isOpen ? 'open' : ''}`}
                                    role="region"
                                    aria-labelledby={`accordion-title-${groupId}`}
                                >
                                    <div className="max-h-96 overflow-y-auto pr-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                                        {group.actions.map((action) => (
                                            <ActionButton
                                                key={action}
                                                action={action}
                                                onClick={() => onActionSelect(action)}
                                                isDisabled={!isTextProvided || isLoading}
                                                isFavorite={favoriteActions.includes(action)}
                                                onToggleFavorite={onToggleFavorite}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </>

            <HistoryList
                history={history}
                onItemClick={onHistoryItemClick}
                onDeleteItem={onDeleteItem}
                onRenameItem={onRenameItem}
                onImportHistory={onImportHistory}
            />

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
                disabled={isLoading}
                className="fixed bottom-20 right-4 sm:right-6 md:right-8 w-14 h-14 bg-sky-600 hover:bg-sky-500 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-sky-400/50 disabled:bg-slate-500 disabled:cursor-not-allowed disabled:hover:scale-100 z-30"
                title="Anexar Imagem ou PDF"
                aria-label="Anexar Imagem ou PDF"
            >
                <PlusIcon className="text-2xl" />
            </button>

        </div>
    );
};

export default MainView;