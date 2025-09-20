
import React from 'react';
import { BackIcon, HelpIcon, RefreshIcon } from './icons';

interface HeaderProps {
    title: string;
    showBackButton: boolean;
    onBack: () => void;
    onHelp: () => void;
    onRefresh: () => void;
    isRefreshable: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, showBackButton, onBack, onHelp, onRefresh, isRefreshable }) => {
    return (
        <header className="flex-shrink-0 sticky top-0 z-40 bg-slate-900/60 backdrop-blur-lg border-b border-white/10">
            <div className="flex items-center justify-between p-3 w-full max-w-5xl mx-auto">
                <div className="flex items-center space-x-2 w-1/3">
                    {showBackButton && (
                        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500" title="Voltar">
                            <BackIcon className="h-5 w-5" />
                        </button>
                    )}
                </div>
                <h1 className="text-lg font-bold text-slate-200 truncate w-1/3 text-center">{title}</h1>
                <div className="flex items-center justify-end space-x-2 w-1/3">
                    <button
                        onClick={onRefresh}
                        disabled={!isRefreshable}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-sky-500"
                        title="Refazer"
                    >
                        <RefreshIcon className="h-5 w-5" />
                    </button>
                    <button
                        onClick={onHelp}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
                        title="Ajuda"
                    >
                        <HelpIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;