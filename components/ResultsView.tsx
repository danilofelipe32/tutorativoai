import React from 'react';
import { ActionType } from '../types';
import MindMapRenderer from './MindMapRenderer';
import { LoadingIcon } from './icons';
import FormattedResponse from './FormattedResponse';
import ShareButtons from './ShareButtons';

interface ResultsViewProps {
    isLoading: boolean;
    result: string;
    error: string;
    actionType: ActionType | null;
}

const ResultsView: React.FC<ResultsViewProps> = ({ isLoading, result, error, actionType }) => {
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
                 <div className="flex-shrink-0 p-4 border-t border-slate-700/50">
                    <ShareButtons textToShare={result} actionType={actionType} />
                </div>
            )}
        </div>
    );
};

export default ResultsView;