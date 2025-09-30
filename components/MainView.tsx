


import React, { useRef, useState } from 'react';
import { ActionType, HistoryItem } from '../types';
import { actionConfig } from '../constants';
import HistoryList from './HistoryList';
import { PlusIcon, LoadingIcon, TrashIcon, ImageIcon, PdfIcon, CameraIcon, CloseIcon } from './icons';
import CameraModal from './CameraModal';

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
      ActionType.PARETO_PRINCIPLE,
      ActionType.FEYNMAN_TECHNIQUE,
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
    actions: [
      ActionType.MINDMAP,
      ActionType.STEP_BY_STEP,
      ActionType.STORYTELLER,
      ActionType.PROJECT_IDEAS,
      ActionType.WORKSHEETS,
      ActionType.AI_QUEST_EDU,
      ActionType.CO_DESIGNER,
      ActionType.COLLABORATION_COACH,
      ActionType.GAME_BUILDER,
      ActionType.MAKER_GUIDE,
      ActionType.CASE_STUDIES,
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
}) => {
    const isTextProvided = inputText.trim().length > 0;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isFabMenuOpen, setFabMenuOpen] = useState(false);
    const [isCameraModalOpen, setCameraModalOpen] = useState(false);

    const isLoading = isOcrLoading || isPdfLoading;

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.type === 'application/pdf') {
                onPdfUpload(file);
            } else if (file.type.startsWith('image/')) {
                onImageUpload(file);
            }
        }
        event.target.value = ''; // Allow uploading the same file again
    };

    const handleFabClick = () => {
        setFabMenuOpen(prev => !prev);
    };

    const handleOptionClick = (handler: () => void) => {
        handler();
        setFabMenuOpen(false);
    };

    const handleImageClick = () => handleOptionClick(() => {
        if (fileInputRef.current) {
            fileInputRef.current.accept = 'image/*';
            fileInputRef.current.click();
        }
    });

    const handlePdfClick = () => handleOptionClick(() => {
        if (fileInputRef.current) {
            fileInputRef.current.accept = 'application/pdf';
            fileInputRef.current.click();
        }
    });

    const handleCameraClick = () => handleOptionClick(() => {
        setCameraModalOpen(true);
    });

    const handleCapture = (file: File) => {
        onImageUpload(file);
        setCameraModalOpen(false);
    };


    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-100">Bem-vindo!</h2>
                    <p className="text-slate-400">Cole um texto abaixo para começar.</p>
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

            <div className="relative">
                <textarea
                    value={inputText}
                    onChange={(e) => onTextChange(e.target.value)}
                    placeholder="Cole seu texto aqui para começar. Você também pode usar o botão azul para anexar uma imagem (e extrair o texto dela) ou um arquivo PDF."
                    className={`w-full flex-grow bg-slate-900/50 text-slate-300 p-4 rounded-lg mb-4 border backdrop-blur-sm focus:outline-none min-h-[150px] md:min-h-[200px] resize-y transition-all duration-300 border-white/10 focus:ring-2 focus:ring-sky-400 focus:shadow-[0_0_15px_rgba(59,130,246,0.4)]`}
                    aria-label="Área de texto para análise"
                    disabled={isLoading}
                />
                {isLoading && (
                    <div className="absolute inset-0 bg-slate-900/70 rounded-lg mb-4 flex flex-col items-center justify-center text-slate-200">
                        <LoadingIcon className="text-3xl animate-spin text-sky-400" />
                        <p className="mt-3 font-semibold">
                            {isOcrLoading ? 'Extraindo texto da imagem...' : 'Extraindo texto do PDF...'}
                        </p>
                    </div>
                )}
            </div>

            <>
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
            </>

            <HistoryList
                history={history}
                onItemClick={onHistoryItemClick}
                onDeleteItem={onDeleteItem}
                onRenameItem={onRenameItem}
            />
            
            {isFabMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 animate-fade-in"
                    onClick={() => setFabMenuOpen(false)}
                    aria-hidden="true"
                />
            )}

            <div className="fixed bottom-20 right-4 sm:right-6 md:right-8 z-30">
                <div className={`relative ${isFabMenuOpen ? 'fab-menu-open' : ''}`}>
                    {/* Menu Items */}
                    <div className="fab-menu-item fab-menu-item-3 flex items-center">
                        <span className="bg-slate-800 text-white text-xs font-semibold px-3 py-1 rounded-md mr-4 shadow-lg">Abrir Câmera</span>
                        <button onClick={handleCameraClick} className="w-12 h-12 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-110" title="Abrir Câmera"><CameraIcon className="text-xl" /></button>
                    </div>
                    <div className="fab-menu-item fab-menu-item-2 flex items-center">
                        <span className="bg-slate-800 text-white text-xs font-semibold px-3 py-1 rounded-md mr-4 shadow-lg">Anexar PDF</span>
                        <button onClick={handlePdfClick} className="w-12 h-12 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-110" title="Anexar PDF"><PdfIcon className="text-xl" /></button>
                    </div>
                     <div className="fab-menu-item fab-menu-item-1 flex items-center">
                        <span className="bg-slate-800 text-white text-xs font-semibold px-3 py-1 rounded-md mr-4 shadow-lg">Anexar Imagem</span>
                        <button onClick={handleImageClick} className="w-12 h-12 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-110" title="Anexar Imagem"><ImageIcon className="text-xl" /></button>
                    </div>
                </div>

                <button
                    onClick={handleFabClick}
                    disabled={isLoading}
                    className="relative w-14 h-14 bg-sky-600 hover:bg-sky-500 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-sky-400/50 disabled:bg-slate-500 disabled:cursor-not-allowed disabled:hover:scale-100"
                    title="Anexar Arquivo"
                    aria-label="Anexar Arquivo"
                    aria-haspopup="true"
                    aria-expanded={isFabMenuOpen}
                >
                    <div className={`transition-transform duration-300 ease-in-out ${isFabMenuOpen ? 'rotate-45' : ''}`}>
                         <PlusIcon className="text-2xl" />
                    </div>
                </button>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                aria-hidden="true"
            />

            <CameraModal 
                isVisible={isCameraModalOpen}
                onClose={() => setCameraModalOpen(false)}
                onCapture={handleCapture}
            />

        </div>
    );
};

export default MainView;