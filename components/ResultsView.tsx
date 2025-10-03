import React, { useState, useEffect } from 'react';
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
    const [loadingMessage, setLoadingMessage] = useState('Aquecendo os motores da IA...');
    const [progress, setProgress] = useState(0);
    const isShareSupported = typeof navigator.share === 'function';

    useEffect(() => {
        let messageInterval: number | undefined;
        let progressInterval: number | undefined;

        if (isLoading) {
            const messages = [
                'Analisando a estrutura do seu texto...',
                'Consultando a vasta base de conhecimento...',
                'Formulando os conceitos principais...',
                'Construindo uma resposta clara e objetiva...',
                'Polindo os detalhes finais para você...',
                'Quase pronto, a mágica está acontecendo!',
            ];
            let messageIndex = 0;
            
            setLoadingMessage(messages[0]);
            messageInterval = window.setInterval(() => {
                messageIndex = (messageIndex + 1) % messages.length;
                setLoadingMessage(messages[messageIndex]);
            }, 3000);

            // Simulate progress
            setProgress(0);
            progressInterval = window.setInterval(() => {
                setProgress(prev => {
                    if (prev >= 95) {
                        clearInterval(progressInterval);
                        return 95;
                    }
                    return prev + Math.random() * 5;
                });
            }, 400);

        } else {
            setProgress(100);
        }

        return () => {
            if (messageInterval) clearInterval(messageInterval);
            if (progressInterval) clearInterval(progressInterval);
        };
    }, [isLoading]);

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
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-600 dark:text-slate-300">
                <LoadingIcon className="text-4xl animate-spin text-sky-500 dark:text-sky-400" />
                <p className="mt-4 text-lg font-semibold">{loadingMessage}</p>
                <div className="w-full max-w-sm bg-slate-200 dark:bg-slate-700/50 rounded-full h-2.5 mt-4 overflow-hidden">
                    <div
                        className="bg-sky-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-rose-100 dark:bg-rose-500/10 backdrop-blur-sm border border-rose-300 dark:border-rose-400/20 text-rose-800 dark:text-rose-200 p-4 rounded-lg">
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
        <div className="bg-white/70 dark:bg-black/20 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 h-full flex flex-col">
            <div className="flex-grow p-4 overflow-y-auto">
                {renderContent()}
                {result?.sources && result.sources.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-slate-300 dark:border-white/20">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Fontes Consultadas:</h4>
                        <ul className="space-y-2">
                            {result.sources.map((source, index) => (
                                <li key={index} className="text-xs flex items-start">
                                    <span className="text-sky-500 dark:text-sky-400 mr-2">&#8226;</span>
                                    <a
                                        href={source.web.uri}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 underline transition-colors break-words"
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
                 <div className="flex-shrink-0 p-3 border-t border-slate-200 dark:border-white/10 flex items-stretch justify-between gap-2">
                    <button
                        onClick={onOpenRefineModal}
                        className="flex-1 flex items-center justify-center space-x-1.5 px-2 py-2 text-xs font-semibold rounded-lg bg-emerald-100 hover:bg-emerald-200 border border-emerald-300/70 text-emerald-800 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 dark:border-emerald-400/50 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 focus:ring-emerald-400"
                        disabled={isLoading}
                        title="Refinar resultado"
                    >
                        <SparkleIcon className="text-base flex-shrink-0" />
                        <span className="truncate">Assim mas...</span>
                    </button>

                    <button
                        onClick={handleCopy}
                        className={`flex-1 flex items-center justify-center space-x-1.5 px-2 py-2 text-xs font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 ${
                            copyStatus === 'copied'
                                ? 'bg-emerald-500/30 border border-emerald-400/50 text-white cursor-default'
                                : 'bg-slate-200 hover:bg-slate-300 border border-slate-300 text-slate-700 dark:bg-white/10 dark:hover:bg-white/20 dark:border-white/20 dark:text-slate-200 focus:ring-slate-500'
                        }`}
                        disabled={copyStatus === 'copied'}
                        aria-live="polite"
                    >
                        {copyStatus === 'copied' ? (
                            <CheckIcon className="text-base flex-shrink-0 animate-checkmark-pop" />
                        ) : (
                            <CopyIcon className="text-base flex-shrink-0" />
                        )}
                        <span className="truncate">{copyStatus === 'copied' ? 'Copiado!' : 'Copiar'}</span>
                    </button>

                    {isShareSupported && (
                        <button
                            onClick={handleShare}
                            className="flex-1 flex items-center justify-center space-x-1.5 px-2 py-2 text-xs font-semibold rounded-lg bg-sky-100 hover:bg-sky-200 border border-sky-300/70 text-sky-800 dark:bg-sky-500/20 dark:hover:bg-sky-500/30 dark:border-sky-400/50 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 focus:ring-sky-400"
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