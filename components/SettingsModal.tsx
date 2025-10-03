import React, { useState, useEffect } from 'react';
import { CloseIcon } from './icons';
import { AISettings, Theme } from '../types';

interface SettingsModalProps {
    isVisible: boolean;
    onClose: () => void;
    currentSettings: AISettings;
    currentTheme: Theme;
    onSave: (newSettings: AISettings, newTheme: Theme) => void;
}

const SettingControl: React.FC<{
    label: string;
    description: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
}> = ({ label, description, value, min, max, step, onChange }) => (
    <div className="mb-6">
        <div className="flex justify-between items-center mb-1">
            <label className="font-bold text-slate-800 dark:text-slate-100">{label}</label>
            <span className="text-sm font-mono bg-slate-200 dark:bg-slate-700/50 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded">
                {value.toFixed(label === 'Temperatura' || label === 'Top-P' ? 2 : 0)}
            </span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{description}</p>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
            aria-label={label}
        />
    </div>
);


const SettingsModal: React.FC<SettingsModalProps> = ({ isVisible, onClose, currentSettings, currentTheme, onSave }) => {
    const [settings, setSettings] = useState<AISettings>(currentSettings);
    const [theme, setTheme] = useState<Theme>(currentTheme);
    const [isRendered, setIsRendered] = useState(isVisible);

    useEffect(() => {
        if (isVisible) {
            setSettings(currentSettings);
            setTheme(currentTheme);
            setIsRendered(true);
        }
    }, [isVisible, currentSettings, currentTheme]);

    const handleAnimationEnd = () => {
        if (!isVisible) {
            setIsRendered(false);
        }
    };

    if (!isRendered) return null;

    const handleSave = () => {
        onSave(settings, theme);
    };

    return (
        <div 
            className={`fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 ${isVisible ? 'animate-fade-in' : 'animate-fade-out'}`}
            onAnimationEnd={handleAnimationEnd}
            onClick={onClose}
            aria-modal="true"
            role="dialog"
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
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Configurações</h2>
                
                <div className="max-h-[60vh] overflow-y-auto pr-2">
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-1">
                            <label className="font-bold text-slate-800 dark:text-slate-100">Tema</label>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">Escolha a aparência da aplicação.</p>
                        <div className="flex items-center gap-2 p-1 bg-slate-200 dark:bg-slate-700/50 rounded-lg">
                            <button
                                onClick={() => setTheme('light')}
                                className={`w-full py-1.5 rounded-md text-sm font-semibold transition-colors ${
                                    theme === 'light' ? 'bg-white text-slate-900 shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-300/50 dark:hover:bg-slate-600/50'
                                }`}
                            >
                                Claro
                            </button>
                            <button
                                onClick={() => setTheme('dark')}
                                className={`w-full py-1.5 rounded-md text-sm font-semibold transition-colors ${
                                    theme === 'dark' ? 'bg-sky-600 text-white shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-300/50 dark:hover:bg-slate-600/50'
                                }`}
                            >
                                Escuro
                            </button>
                        </div>
                    </div>

                    <hr className="border-slate-300 dark:border-white/10 my-4" />

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Modelo de IA</h3>

                    <SettingControl
                        label="Temperatura"
                        description="Controla a criatividade. Valores mais altos (ex: 0.9) geram respostas mais criativas e variadas. Valores baixos (ex: 0.2) são mais diretos e previsíveis."
                        value={settings.temperature}
                        min={0}
                        max={1}
                        step={0.05}
                        onChange={(val) => setSettings(s => ({ ...s, temperature: val }))}
                    />

                    <SettingControl
                        label="Top-K"
                        description="Limita a seleção de palavras. Um valor de 1 significa que apenas a palavra mais provável será escolhida. Um valor maior aumenta a diversidade."
                        value={settings.topK}
                        min={1}
                        max={100}
                        step={1}
                        onChange={(val) => setSettings(s => ({ ...s, topK: val }))}
                    />

                    <SettingControl
                        label="Top-P"
                        description="Seleciona palavras com base na probabilidade acumulada. Um valor de 0.95 significa que são consideradas as palavras cuja probabilidade soma até 95%."
                        value={settings.topP}
                        min={0}
                        max={1}
                        step={0.01}
                        onChange={(val) => setSettings(s => ({ ...s, topP: val }))}
                    />
                </div>

                <div className="mt-6 flex items-center justify-end">
                    <button 
                        onClick={handleSave} 
                        className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-800 focus:ring-sky-500"
                    >
                        Salvar e Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;