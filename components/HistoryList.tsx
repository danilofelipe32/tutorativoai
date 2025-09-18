
import React from 'react';
import { HistoryItem } from '../types';
import { actionConfig } from '../constants';
import { HistoryIcon } from './icons';

interface HistoryListProps {
    history: HistoryItem[];
    onItemClick: (item: HistoryItem) => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ history, onItemClick }) => {
    
    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="mt-8">
            <h2 className="text-xl font-bold text-slate-100 mb-3 flex items-center">
                <HistoryIcon className="h-6 w-6 mr-2 text-slate-400" />
                Histórico de Atividades
            </h2>

            {history.length === 0 ? (
                <div className="text-center py-8 px-4 bg-slate-900/50 rounded-lg border border-dashed border-slate-700">
                    <p className="text-slate-500">Seu histórico de atividades aparecerá aqui.</p>
                </div>
            ) : (
                <ul className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {history.map((item) => {
                        const config = actionConfig[item.actionType];
                        const Icon = config.icon;
                        return (
                            <li key={item.id}>
                                <button
                                    onClick={() => onItemClick(item)}
                                    className="w-full text-left p-3 bg-slate-900/70 rounded-lg border border-slate-700 hover:bg-slate-800/90 hover:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all duration-200"
                                >
                                    <div className="flex items-center mb-2">
                                        <div className={`flex-shrink-0 h-8 w-8 rounded-md flex items-center justify-center mr-3 ${config.className}`}>
                                            <Icon className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="font-bold text-slate-200">{config.title}</h3>
                                            <p className="text-xs text-slate-500">{formatDate(item.timestamp)}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-400 italic bg-slate-800 p-2 rounded">
                                        &ldquo;{item.inputTextSnippet}&rdquo;
                                    </p>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default HistoryList;
