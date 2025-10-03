
import React from 'react';
import { BackIcon, HelpIcon, RefreshIcon, SettingsIcon } from './icons';

interface HeaderProps {
    title: string;
    showBackButton: boolean;
    onBack: () => void;
    onHelp: () => void;
    onRefresh: () => void;
    isRefreshable: boolean;
    onSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, showBackButton, onBack, onHelp, onRefresh, isRefreshable, onSettings }) => {
    return (
        <header className="flex-shrink-0 sticky top-0 z-40 bg-slate-100/60 dark:bg-slate-900/60 backdrop-blur-lg border-b border-slate-300/80 dark:border-white/10">
            <div className="flex items-center justify-between p-3 w-full max-w-5xl mx-auto">
                <div className="flex items-center space-x-2 w-1/3">
                    {showBackButton && (
                        <button onClick={onBack} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500" title="Voltar" aria-label="Voltar para a tela principal">
                            <BackIcon className="text-xl" />
                        </button>
                    )}
                </div>
                <h1 className="text-lg font-bold text-slate-800 dark:text-slate-200 truncate w-1/3 text-center">{title}</h1>
                <div className="flex items-center justify-end space-x-2 w-1/3">
                    <button
                        onClick={onRefresh}
                        disabled={!isRefreshable}
                        className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-sky-500"
                        title="Refazer"
                        aria-label="Refazer a última ação"
                    >
                        <RefreshIcon className="text-xl" />
                    </button>
                    <button
                        onClick={onSettings}
                        className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
                        title="Configurações"
                        aria-label="Abrir configurações da IA"
                    >
                        <SettingsIcon className="text-xl" />
                    </button>
                    <button
                        onClick={onHelp}
                        className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
                        title="Ajuda"
                        aria-label="Abrir modal de ajuda"
                    >
                        <HelpIcon className="text-xl" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;