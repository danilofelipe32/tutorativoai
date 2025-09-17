import React, { useState } from 'react';
import { ActionType } from '../types';
import { actionConfig } from '../constants';
import { CopyIcon, ShareIcon, CheckIcon } from './icons';

interface ShareButtonsProps {
    textToShare: string;
    actionType: ActionType | null;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ textToShare, actionType }) => {
    const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
    const isShareSupported = typeof navigator.share === 'function';

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(textToShare);
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
                text: textToShare,
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

    return (
        <div className="flex items-center justify-end space-x-3">
            <button
                onClick={handleCopy}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                    copyStatus === 'copied'
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                }`}
                disabled={copyStatus === 'copied'}
                aria-live="polite"
            >
                {copyStatus === 'copied' ? (
                    <CheckIcon className="h-4 w-4" />
                ) : (
                    <CopyIcon className="h-4 w-4" />
                )}
                <span>{copyStatus === 'copied' ? 'Copiado!' : 'Copiar'}</span>
            </button>

            {isShareSupported && (
                <button
                    onClick={handleShare}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-400"
                >
                    <ShareIcon className="h-4 w-4" />
                    <span>Compartilhar</span>
                </button>
            )}
        </div>
    );
};

export default ShareButtons;