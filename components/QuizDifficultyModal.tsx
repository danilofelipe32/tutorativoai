import React from 'react';
import { CloseIcon, TestIcon } from './icons';

type Difficulty = 'Fácil' | 'Médio' | 'Difícil';

interface QuizDifficultyModalProps {
    isVisible: boolean;
    onClose: () => void;
    onSelectDifficulty: (difficulty: Difficulty) => void;
}

const DifficultyButton: React.FC<{
    level: Difficulty;
    color: string;
    onClick: (level: Difficulty) => void;
}> = ({ level, color, onClick }) => (
    <button
        onClick={() => onClick(level)}
        className={`w-full text-left p-4 rounded-lg border-l-4 transition-all duration-200 hover:scale-105 hover:shadow-lg ${color}`}
    >
        <p className="font-bold text-lg text-slate-100">{level}</p>
        <p className="text-sm text-slate-300">
            {level === 'Fácil' && 'Perguntas diretas sobre o texto.'}
            {level === 'Médio' && 'Requer interpretação e conexão de ideias.'}
            {level === 'Difícil' && 'Desafia a aplicar conceitos e pensar criticamente.'}
        </p>
    </button>
);


const QuizDifficultyModal: React.FC<QuizDifficultyModalProps> = ({ isVisible, onClose, onSelectDifficulty }) => {
    if (!isVisible) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in"
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
                <div className="flex items-center mb-4">
                     <TestIcon className="text-2xl text-amber-400 mr-3" />
                     <h2 className="text-xl font-bold text-white">Nível do Quiz</h2>
                </div>
                <p className="text-slate-300 mb-6">
                    Selecione o nível de dificuldade para as perguntas que serão geradas.
                </p>
                
                <div className="space-y-3">
                    <DifficultyButton level="Fácil" color="bg-emerald-500/20 border-emerald-400 hover:bg-emerald-500/30" onClick={onSelectDifficulty} />
                    <DifficultyButton level="Médio" color="bg-sky-500/20 border-sky-400 hover:bg-sky-500/30" onClick={onSelectDifficulty} />
                    <DifficultyButton level="Difícil" color="bg-rose-500/20 border-rose-400 hover:bg-rose-500/30" onClick={onSelectDifficulty} />
                </div>
            </div>
        </div>
    );
};

export default QuizDifficultyModal;
