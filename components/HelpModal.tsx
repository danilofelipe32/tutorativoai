
import React from 'react';
import { actionConfig } from '../constants';

interface HelpModalProps {
    isVisible: boolean;
    onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isVisible, onClose }) => {
    if (!isVisible) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-xl font-bold text-white mb-3">Como usar o Tutor Ativo AI</h2>
                <p className="text-slate-400 mb-5">
                    Esta extensão ajuda-o a estudar o conteúdo de qualquer página web. Use os botões para interagir com o texto:
                </p>
                <ul className="space-y-3 text-sm">
                    {Object.values(actionConfig).map(config => (
                        <li key={config.title}>
                            <strong className="text-slate-200">{config.title}:</strong>
                            <span className="text-slate-400 ml-2">{config.description}</span>
                        </li>
                    ))}
                </ul>
                <button 
                    onClick={onClose} 
                    className="mt-6 w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500"
                >
                    Entendido
                </button>
            </div>
        </div>
    );
};

export default HelpModal;
    