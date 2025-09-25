import React from 'react';
import { CloseIcon, LoadingIcon } from './icons';
import FormattedResponse from './FormattedResponse';

interface ExplanationModalProps {
    isVisible: boolean;
    onClose: () => void;
    topic: string;
    explanation: string;
    isLoading: boolean;
}

const ExplanationModal: React.FC<ExplanationModalProps> = ({ isVisible, onClose, topic, explanation, isLoading }) => {
    if (!isVisible) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
            aria-labelledby="explanation-modal-title"
        >
            <div 
                className="relative bg-slate-800/50 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 w-full max-w-2xl shadow-2xl flex flex-col max-h-[80vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-3 right-3 p-2 rounded-full text-slate-400 hover:bg-white/10 hover:text-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
                    aria-label="Fechar modal"
                >
                    <CloseIcon className="text-2xl" />
                </button>
                <h2 className="text-xl font-bold text-sky-300 mb-4 pr-8" id="explanation-modal-title">
                    Explicando: <span className="text-white">{topic}</span>
                </h2>
                <div className="flex-grow overflow-y-auto pr-2">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-slate-300 py-10">
                            <LoadingIcon className="text-3xl animate-spin text-sky-400" />
                            <p className="mt-4 text-md font-semibold">Gerando explicação...</p>
                        </div>
                    ) : (
                        <FormattedResponse text={explanation} actionType={null} />
                    )}
                </div>
                 <div className="flex-shrink-0 pt-4 mt-4 border-t border-white/10 text-right">
                    <button 
                        onClick={onClose} 
                        className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExplanationModal;