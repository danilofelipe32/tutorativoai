import React, { useState, useEffect } from 'react';
import { CloseIcon } from './icons';

interface RefineModalProps {
    isVisible: boolean;
    onClose: () => void;
    onSubmit: (instruction: string) => void;
}

const RefineModal: React.FC<RefineModalProps> = ({ isVisible, onClose, onSubmit }) => {
    const [instruction, setInstruction] = useState('');
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
    
    const handleSubmit = () => {
        if (instruction.trim()) {
            onSubmit(instruction);
            setInstruction(''); // Clear after submit
            onClose();
        }
    };

    if (!isRendered) return null;

    return (
        <div 
            className={`fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 ${isVisible ? 'animate-fade-in' : 'animate-fade-out'}`}
            onAnimationEnd={handleAnimationEnd}
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="relative bg-slate-800/50 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-3 right-3 p-2 rounded-full text-slate-400 hover:bg-white/10 hover:text-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
                    aria-label="Fechar modal"
                >
                    <CloseIcon className="text-2xl" />
                </button>
                <h2 className="text-xl font-bold text-white mb-3" id="refine-modal-title">Refinar Resultado</h2>
                <p className="text-slate-300 mb-5">
                    Descreva como você gostaria de alterar o resultado. Por exemplo: "deixe mais curto", "use uma linguagem mais simples", "foque no segundo parágrafo".
                </p>
                <textarea
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    placeholder="Sua instrução aqui..."
                    className="w-full h-28 bg-slate-900/70 text-slate-300 p-3 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-y"
                    aria-label="Instrução para refinar resultado"
                    aria-describedby="refine-modal-title"
                />
                <div className="mt-6 flex items-center justify-end space-x-3">
                    <button 
                        onClick={onClose} 
                        className="bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-slate-500"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={!instruction.trim()}
                        className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500"
                    >
                        Enviar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RefineModal;