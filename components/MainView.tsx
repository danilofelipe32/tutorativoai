import React from 'react';
import { ActionType, HistoryItem } from '../types';
import { actionConfig } from '../constants';
import HistoryList from './HistoryList';
import { TrashIcon } from './icons';

interface MainViewProps {
    onActionSelect: (action: ActionType) => void;
    inputText: string;
    onTextChange: (text: string) => void;
    onClearText: () => void;
    history: HistoryItem[];
    onHistoryItemClick: (item: HistoryItem) => void;
    onDeleteItem: (itemId: number) => void;
    onRenameItem: (itemId: number, newTitle: string) => void;
}

const ActionButton: React.FC<{ action: ActionType; onClick: () => void; isDisabled: boolean }> = ({ action, onClick, isDisabled }) => {
    const config = actionConfig[action];
    return (
        <button
            onClick={onClick}
            disabled={isDisabled}
            className={`p-3 rounded-xl flex flex-col items-start justify-between text-white shadow-lg transition-all duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${config.className}`}
            aria-disabled={isDisabled}
        >
            <config.icon className="text-3xl mb-2" />
            <div className="text-left">
                <h3 className="font-bold text-xs md:text-sm">{config.title}</h3>
                <p className="text-[10px] opacity-80 mt-1">{config.description}</p>
            </div>
        </button>
    );
};

const actionGroups = [
  {
    title: 'Análise e Compreensão',
    description: 'Ações para extrair, simplificar e entender as informações centrais do texto.',
    actions: [
      ActionType.SUMMARIZE,
      ActionType.KEYWORDS,
      ActionType.SIMPLIFY,
      ActionType.INFORMATIONAL_TEXT,
      ActionType.REAL_WORLD_EXAMPLES,
      ActionType.MISCONCEPTIONS,
      ActionType.FACT_CHECKER,
      ActionType.CONNECTIONS,
    ],
  },
  {
    title: 'Pensamento Crítico e Exploração',
    description: 'Ferramentas para questionar, aprofundar e explorar as ideias do texto por diferentes ângulos.',
    actions: [
      ActionType.REFLECT,
      ActionType.DEEPER_QUESTIONS,
      ActionType.SOCRATIC_OPPONENT,
      ActionType.ANALOGY,
      ActionType.POSSIBILITIES_ENGINE,
      ActionType.EXPLORATORIUM,
      ActionType.DISCUSSION_PROMPTS,
      ActionType.IDENTIFY_PERSPECTIVE,
    ],
  },
  {
    title: 'Criação e Aplicação',
    description: 'Use o conteúdo como base para criar novos materiais, projetos e narrativas.',
    actions: [
      ActionType.MINDMAP,
      ActionType.STEP_BY_STEP,
      ActionType.STORYTELLER,
      ActionType.PROJECT_IDEAS,
      ActionType.WORKSHEETS,
      ActionType.AI_QUEST_EDU,
      ActionType.CO_DESIGNER,
      ActionType.COLLABORATION_COACH,
    ],
  },
  {
    title: 'Avaliação e Planejamento Pedagógico',
    description: 'Recursos específicos para educadores criarem avaliações, planos de aula e atividades.',
    actions: [
      ActionType.TEST,
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


const MainView: React.FC<MainViewProps> = ({ onActionSelect, inputText, onTextChange, onClearText, history, onHistoryItemClick, onDeleteItem, onRenameItem }) => {
    const isTextProvided = inputText.trim().length > 0;
    
    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-100">Bem-vindo!</h2>
                    <p className="text-slate-400">Cole o texto que você deseja analisar abaixo.</p>
                </div>
                {isTextProvided && (
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

            <textarea
                value={inputText}
                onChange={(e) => onTextChange(e.target.value)}
                placeholder="Cole seu texto aqui para começar..."
                className="w-full flex-grow bg-slate-900/50 text-slate-300 p-4 rounded-lg mb-4 border border-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:shadow-[0_0_15px_rgba(59,130,246,0.4)] min-h-[150px] md:min-h-[200px] resize-y transition-shadow"
                aria-label="Área de texto para análise"
            />

            <div className="mb-6">
                 <p className="text-slate-300 font-semibold text-center text-lg">Agora, escolha uma ação:</p>
            </div>

            <div className="space-y-8">
                {actionGroups.map((group) => (
                    <section key={group.title} aria-labelledby={group.title.replace(/\s+/g, '-').toLowerCase()}>
                        <div className="mb-4 border-l-4 border-sky-500/50 pl-4">
                            <h3 id={group.title.replace(/\s+/g, '-').toLowerCase()} className="text-xl font-bold text-slate-100">{group.title}</h3>
                            <p className="text-slate-400 text-sm">{group.description}</p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                            {group.actions.map((action) => (
                                <ActionButton
                                    key={action}
                                    action={action}
                                    onClick={() => onActionSelect(action)}
                                    isDisabled={!isTextProvided}
                                />
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            <HistoryList
                history={history}
                onItemClick={onHistoryItemClick}
                onDeleteItem={onDeleteItem}
                onRenameItem={onRenameItem}
            />
        </div>
    );
};

export default MainView;