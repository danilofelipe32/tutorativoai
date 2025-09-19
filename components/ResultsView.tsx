import React from 'react';
import { ActionType } from '../types';
import MindMapRenderer from './MindMapRenderer';
import { LoadingIcon, SparkleIcon } from './icons';
import FormattedResponse from './FormattedResponse';
import ShareButtons from './ShareButtons';

interface ResultsViewProps {
    isLoading: boolean;
    result: string;
    error: string;
    actionType: ActionType | null;
    onOpenRefineModal: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ isLoading, result, error, actionType, onOpenRefineModal }) => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
                <LoadingIcon className="h-10 w-10 animate-spin text-sky-400" />
                <p className="mt-4 text-lg font-semibold">Analisando o texto...</p>
                <p className="text-sm">A IA está trabalhando para gerar sua resposta.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-rose-900/50 border border-rose-700 text-rose-200 p-4 rounded-lg">
                <h3 className="font-bold mb-2">Ocorreu um Erro</h3>
                <p className="text-sm">{error}</p>
            </div>
        );
    }

    const renderContent = () => {
        if (!result) return null;

        if (actionType === ActionType.MINDMAP) {
            return <MindMapRenderer text={result} />;
        }
        
        return <FormattedResponse text={result} actionType={actionType} />;
    };

    return (
        <div className="bg-slate-900/70 rounded-xl h-full flex flex-col">
            <div className="flex-grow p-4 overflow-y-auto">
                {renderContent()}
            </div>
            
            {result && (
                 <div className="flex-shrink-0 p-3 border-t border-slate-700/50 flex items-center justify-end space-x-2">
                    <button
                        onClick={onOpenRefineModal}
                        className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-emerald-400"
                        disabled={isLoading}
                        title="Refinar resultado"
                    >
                        <SparkleIcon className="h-4 w-4" />
                        <span>Assim mas...</span>
                    </button>
                    <ShareButtons textToShare={result} actionType={actionType} />
                </div>
            )}
        </div>
    );
};

export default ResultsView;