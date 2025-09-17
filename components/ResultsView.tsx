import React from 'react';
import { ActionType } from '../types';
import MindMapRenderer from './MindMapRenderer';
import { LoadingIcon } from './icons';
import FormattedResponse from './FormattedResponse';

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
        <div className="bg-slate-900/70 p-4 rounded-xl h-full overflow-y-auto">
            {renderContent()}
        </div>
    );
};

export default ResultsView;