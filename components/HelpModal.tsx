

import React, { useState, useEffect } from 'react';
import { actionConfig } from '../constants';
import { CloseIcon } from './icons';

interface HelpModalProps {
    isVisible: boolean;
    onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isVisible, onClose }) => {
    const [isRendered, setIsRendered] = useState(isVisible);

    useEffect(() => {
        if (isVisible) {
            setIsRendered(true);
        }
    }, [isVisible]);

    const handleAnimationEnd = () => {
        if (!isVisible) {
            setIsRendered(false);
        }
    };

    if (!isRendered) return null;

    return (
        <div 
            className={`fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 ${isVisible ? 'animate-fade-in' : 'animate-fade-out'}`}
            onAnimationEnd={handleAnimationEnd}
            onClick={onClose}
        >
            <div 
                className="relative bg-slate-100/90 dark:bg-slate-800/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-3 right-3 p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-black/10 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
                    aria-label="Fechar modal"
                >
                    <CloseIcon className="text-2xl" />
                </button>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Como usar o Tutor Ativo AI</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-5">
                    Esta extensão ajuda-o a estudar o conteúdo de qualquer página web. Use os botões para interagir com o texto:
                </p>
                <ul className="space-y-3 text-sm max-h-[50vh] overflow-y-auto pr-2">
                    {Object.values(actionConfig).map(config => (
                        <li key={config.title}>
                            <strong className="text-slate-800 dark:text-slate-100">{config.title}:</strong>
                            <span className="text-slate-600 dark:text-slate-300 ml-2">{config.description}</span>
                        </li>
                    ))}
                </ul>
                <button 
                    onClick={onClose} 
                    className="mt-6 w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-800 focus:ring-sky-500"
                >
                    Entendido
                </button>
            </div>
        </div>
    );
};

export default HelpModal;