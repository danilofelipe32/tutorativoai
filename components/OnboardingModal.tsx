import React, { useState } from 'react';
import { CloseIcon, BackIcon, ChevronRightIcon } from './icons';

interface OnboardingModalProps {
    isVisible: boolean;
    onClose: () => void;
}

const steps = [
    {
        title: 'Bem-vindo ao Tutor Ativo AI!',
        content: 'Vamos fazer um tour rápido para você começar. Esta ferramenta foi projetada para turbinar seus estudos, transformando qualquer texto em material de aprendizado interativo.',
    },
    {
        title: 'Passo 1: Insira seu Texto',
        content: 'O primeiro passo é simples: cole qualquer texto que você queira analisar na área de texto principal. Pode ser um artigo, um capítulo de livro, suas anotações, etc.',
    },
    {
        title: 'Passo 2: Escolha uma Ação',
        content: 'Abaixo da área de texto, você encontrará dezenas de ações. Quer um resumo, um quiz ou ideias de projetos? Basta clicar em um botão para que a IA faça a mágica acontecer.',
    },
    {
        title: 'Passo 3: Explore seu Histórico',
        content: 'Todas as análises que você faz são salvas automaticamente. Role para baixo para encontrar seu histórico, permitindo que você revisite, renomeie ou exclua resultados anteriores facilmente.',
    },
    {
        title: 'Tudo Pronto!',
        content: 'É isso! Agora você está pronto para explorar todo o potencial do Tutor Ativo AI. Bons estudos!',
    },
];

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isVisible, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);

    if (!isVisible) return null;

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onClose(); // Finish the tour
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const step = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;

    return (
        <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in"
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="relative bg-slate-800/80 backdrop-blur-2xl border border-sky-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl text-center"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-3 right-3 p-2 rounded-full text-slate-400 hover:bg-white/10 hover:text-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
                    aria-label="Pular tour"
                >
                    <CloseIcon className="text-2xl" />
                </button>
                
                <div className="mb-4">
                     {/* Progress dots */}
                    <div className="flex justify-center space-x-2 my-4">
                        {steps.map((_, index) => (
                            <div
                                key={index}
                                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                                    currentStep === index ? 'bg-sky-400' : 'bg-slate-600'
                                }`}
                            />
                        ))}
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">{step.title}</h2>
                    <p className="text-slate-300">
                        {step.content}
                    </p>
                </div>

                <div className="mt-8 flex items-center justify-between">
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                    >
                        Pular
                    </button>
                    <div className="flex items-center space-x-2">
                         {currentStep > 0 && (
                            <button 
                                onClick={handlePrev} 
                                className="bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-slate-500"
                                aria-label="Passo anterior"
                            >
                                <BackIcon />
                            </button>
                        )}
                        <button 
                            onClick={handleNext} 
                            className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 flex items-center space-x-2"
                        >
                            <span>{isLastStep ? 'Começar!' : 'Próximo'}</span>
                            {!isLastStep && <ChevronRightIcon />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingModal;