import React, { useState } from 'react';
import { ActionType } from '../types';
import MindMapRenderer from './MindMapRenderer';
import { LoadingIcon, SparkleIcon, CopyIcon, ShareIcon, CheckIcon } from './icons';
import FormattedResponse from './FormattedResponse';
import { actionConfig } from '../constants';

interface ResultsViewProps {
    isLoading: boolean;
    result: string;
    error: string;
    actionType: ActionType | null;
    onOpenRefineModal: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ isLoading, result, error, actionType, onOpenRefineModal }) => {
    const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
    const isShareSupported = typeof navigator.share === 'function';

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(result);
            setCopyStatus('copied');
            setTimeout(() => setCopyStatus('idle'), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            alert('Falha ao copiar o texto.');
        }
    };

    const handleShare = async () => {
        const title = actionType ? `Resultado: ${actionConfig[actionType].title}` : 'Resultado da Análise - Tutor Ativo AI';
        try {
            await navigator.share({
                title: title,
                text: result,
            });
        } catch (err) {
            // Ignore abort errors
            if (err instanceof DOMException && err.name === 'AbortError') {
                return;
            }
            console.error('Error sharing: ', err);
            alert('Ocorreu um erro ao compartilhar.');
        }
    };

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
                 <div className="flex-shrink-0 p-3 border-t border-slate-700/50 flex items-stretch justify-between gap-2">
                    <button
                        onClick={onOpenRefineModal}
                        className="flex-1 flex items-center justify-center space-x-1.5 px-2 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-emerald-400"
                        disabled={isLoading}
                        title="Refinar resultado"
                    >
                        <SparkleIcon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">Assim mas...</span>
                    </button>

                    <button
                        onClick={handleCopy}
                        className={`flex-1 flex items-center justify-center space-x-1.5 px-2 py-2 text-xs font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                            copyStatus === 'copied'
                                ? 'bg-emerald-600 text-white cursor-default'
                                : 'bg-slate-700 hover:bg-slate-600 text-slate-200 focus:ring-slate-500'
                        }`}
                        disabled={copyStatus === 'copied'}
                        aria-live="polite"
                    >
                        {copyStatus === 'copied' ? (
                            <CheckIcon className="h-4 w-4 flex-shrink-0" />
                        ) : (
                            <CopyIcon className="h-4 w-4 flex-shrink-0" />
                        )}
                        <span className="truncate">{copyStatus === 'copied' ? 'Copiado!' : 'Copiar'}</span>
                    </button>

                    {isShareSupported && (
                        <button
                            onClick={handleShare}
                            className="flex-1 flex items-center justify-center space-x-1.5 px-2 py-2 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-400"
                        >
                            <ShareIcon className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">Compartilhar</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ResultsView;