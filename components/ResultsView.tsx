import React, { useState } from 'react';
import { ActionType, ResultPayload } from '../types';
import MindMapRenderer from './MindMapRenderer';
import { LoadingIcon, SparkleIcon, CopyIcon, ShareIcon, CheckIcon } from './icons';
import FormattedResponse from './FormattedResponse';
import { actionConfig } from '../constants';

interface ResultsViewProps {
    isLoading: boolean;
    result: ResultPayload | null;
    error: string;
    actionType: ActionType | null;
    onOpenRefineModal: () => void;
    onExplainTopic: (topic: string) => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ isLoading, result, error, actionType, onOpenRefineModal, onExplainTopic }) => {
    const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
    const isShareSupported = typeof navigator.share === 'function';

    const handleCopy = async () => {
        if (!result?.text) return;
        try {
            await navigator.clipboard.writeText(result.text);
            setCopyStatus('copied');
            setTimeout(() => setCopyStatus('idle'), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            alert('Falha ao copiar o texto.');
        }
    };

    const handleShare = async () => {
        if (!result?.text) return;
        const title = actionType ? `Resultado: ${actionConfig[actionType].title}` : 'Resultado da Análise - Tutor Ativo AI';
        try {
            await navigator.share({
                title: title,
                text: result.text,
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
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-300">
                <LoadingIcon className="text-4xl animate-spin text-sky-400" />
                <p className="mt-4 text-lg font-semibold">Analisando...</p>
                <p className="text-sm text-slate-400">A IA está trabalhando para gerar sua resposta.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-rose-500/10 backdrop-blur-sm border border-rose-400/20 text-rose-200 p-4 rounded-lg">
                <h3 className="font-bold mb-2">Ocorreu um Erro</h3>
                <p className="text-sm">{error}</p>
            </div>
        );
    }

    const renderContent = () => {
        if (!result?.text) return null;

        if (actionType === ActionType.MINDMAP) {
            return <MindMapRenderer text={result.text} onNodeClick={onExplainTopic} />;
        }
        
        return <FormattedResponse text={result.text} actionType={actionType} />;
    };

    return (
        <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 h-full flex flex-col">
            <div className="flex-grow p-4 overflow-y-auto">
                {renderContent()}
                {result?.sources && result.sources.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-white/20">
                        <h4 className="text-sm font-bold text-slate-200 mb-3">Fontes Consultadas:</h4>
                        <ul className="space-y-2">
                            {result.sources.map((source, index) => (
                                <li key={index} className="text-xs flex items-start">
                                    <span className="text-sky-400 mr-2">&#8226;</span>
                                    <a
                                        href={source.web.uri}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sky-400 hover:text-sky-300 underline transition-colors break-words"
                                        title={source.web.uri}
                                    >
                                        {source.web.title || source.web.uri}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            
            {result?.text && (
                 <div className="flex-shrink-0 p-3 border-t border-white/10 flex items-stretch justify-between gap-2">
                    <button
                        onClick={onOpenRefineModal}
                        className="flex-1 flex items-center justify-center space-x-1.5 px-2 py-2 text-xs font-semibold rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-emerald-400"
                        disabled={isLoading}
                        title="Refinar resultado"
                    >
                        <SparkleIcon className="text-base flex-shrink-0" />
                        <span className="truncate">Assim mas...</span>
                    </button>

                    <button
                        onClick={handleCopy}
                        className={`flex-1 flex items-center justify-center space-x-1.5 px-2 py-2 text-xs font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                            copyStatus === 'copied'
                                ? 'bg-emerald-500/30 border border-emerald-400/50 text-white cursor-default'
                                : 'bg-white/10 hover:bg-white/20 border border-white/20 text-slate-200 focus:ring-slate-500'
                        }`}
                        disabled={copyStatus === 'copied'}
                        aria-live="polite"
                    >
                        {copyStatus === 'copied' ? (
                            <CheckIcon className="text-base flex-shrink-0" />
                        ) : (
                            <CopyIcon className="text-base flex-shrink-0" />
                        )}
                        <span className="truncate">{copyStatus === 'copied' ? 'Copiado!' : 'Copiar'}</span>
                    </button>

                    {isShareSupported && (
                        <button
                            onClick={handleShare}
                            className="flex-1 flex items-center justify-center space-x-1.5 px-2 py-2 text-xs font-semibold rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/50 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-400"
                        >
                            <ShareIcon className="text-base flex-shrink-0" />
                            <span className="truncate">Compartilhar</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ResultsView;