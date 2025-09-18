
import React from 'react';
import { ActionType, HistoryItem } from '../types';
import { actionConfig } from '../constants';
import HistoryList from './HistoryList';

interface MainViewProps {
    onActionSelect: (action: ActionType) => void;
    inputText: string;
    onTextChange: (text: string) => void;
    history: HistoryItem[];
    onHistoryItemClick: (item: HistoryItem) => void;
}

const ActionButton: React.FC<{ action: ActionType; onClick: () => void; isDisabled: boolean }> = ({ action, onClick, isDisabled }) => {
    const config = actionConfig[action];
    return (
        <button
            onClick={onClick}
            disabled={isDisabled}
            className={`p-3 rounded-xl flex flex-col items-start justify-between text-white shadow-lg transition-all duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${config.className}`}
            aria-disabled={isDisabled}
        >
            <config.icon className="h-7 w-7 mb-2" />
            <div className="text-left">
                <h3 className="font-bold text-xs md:text-sm">{config.title}</h3>
                <p className="text-[10px] opacity-80 mt-1">{config.description}</p>
            </div>
        </button>
    );
};


const MainView: React.FC<MainViewProps> = ({ onActionSelect, inputText, onTextChange, history, onHistoryItemClick }) => {
    const isTextProvided = inputText.trim().length > 0;
    
    return (
        <div className="flex flex-col h-full">
            <div className="mb-4">
                <h2 className="text-2xl font-bold text-slate-100">Bem-vindo!</h2>
                <p className="text-slate-400">Cole o texto que você deseja analisar abaixo.</p>
            </div>

            <textarea
                value={inputText}
                onChange={(e) => onTextChange(e.target.value)}
                placeholder="Cole seu texto aqui para começar..."
                className="w-full flex-grow bg-slate-900 text-slate-300 p-4 rounded-lg mb-4 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 min-h-[150px] md:min-h-[200px] resize-y"
                aria-label="Área de texto para análise"
            />

            <div className="mb-4">
                 <p className="text-slate-400 font-semibold text-center">Agora, escolha uma ação:</p>
            </div>

            <div className="grid grid-cols-3 gap-3 md:gap-4">
                {Object.values(ActionType).map((action) => (
                    <ActionButton 
                        key={action} 
                        action={action} 
                        onClick={() => onActionSelect(action)} 
                        isDisabled={!isTextProvided}
                    />
                ))}
            </div>

            <HistoryList history={history} onItemClick={onHistoryItemClick} />
        </div>
    );
};

export default MainView;
