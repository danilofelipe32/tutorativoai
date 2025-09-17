
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
        <header className="flex items-center justify-between p-3 bg-slate-900/70 border-b border-slate-700 shadow-md flex-shrink-0">
            <div className="flex items-center space-x-2 w-1/3">
                {showBackButton && (
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500">
                        <BackIcon className="h-5 w-5" />
                    </button>
                )}
            </div>
            <h1 className="text-lg font-bold text-slate-200 truncate w-1/3 text-center">{title}</h1>
            <div className="flex items-center justify-end space-x-2 w-1/3">
                 <button onClick={onRefresh} disabled={!isRefreshable} className="p-2 rounded-full hover:bg-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-sky-500">
                    <RefreshIcon className="h-5 w-5" />
                </button>
                <button onClick={onHelp} className="p-2 rounded-full hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500">
                    <HelpIcon className="h-5 w-5" />
                </button>
            </div>
        </header>
    );
};

export default Header;
    