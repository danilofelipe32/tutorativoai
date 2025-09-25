


import React, { useState, useRef, useEffect, useMemo } from 'react';
import { HistoryItem } from '../types';
import { actionConfig } from '../constants';
import { HistoryIcon, TrashIcon, PencilIcon, SearchIcon } from './icons';

interface HistoryListProps {
    history: HistoryItem[];
    onItemClick: (item: HistoryItem) => void;
    onDeleteItem: (itemId: number) => void;
    onRenameItem: (itemId: number, newTitle: string) => void;
}

const ITEMS_PER_PAGE = 10;

const HistoryList: React.FC<HistoryListProps> = ({ history, onItemClick, onDeleteItem, onRenameItem }) => {
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
    const [editingItemId, setEditingItemId] = useState<number | null>(null);
    const [renameValue, setRenameValue] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editingItemId !== null && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingItemId]);

    const filteredHistory = useMemo(() => {
        if (!searchTerm.trim()) {
            return history;
        }
        const lowerCaseSearch = searchTerm.toLowerCase();
        return history.filter(item => {
            const title = item.customTitle ?? actionConfig[item.actionType].title;
            const snippet = item.inputTextSnippet;
            return (
                title.toLowerCase().includes(lowerCaseSearch) ||
                snippet.toLowerCase().includes(lowerCaseSearch)
            );
        });
    }, [history, searchTerm]);

    const handleLoadMore = () => {
        setVisibleCount(prevCount => prevCount + ITEMS_PER_PAGE);
    };

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleRenameClick = (item: HistoryItem) => {
        setEditingItemId(item.id);
        setRenameValue(item.customTitle ?? actionConfig[item.actionType].title);
    };

    const handleCancelRename = () => {
        setEditingItemId(null);
        setRenameValue('');
    };

    const handleSaveRename = (itemId: number) => {
        if (renameValue.trim()) {
            onRenameItem(itemId, renameValue);
        }
        handleCancelRename();
    };

    const handleDeleteClick = (itemId: number) => {
        if (window.confirm('Tem certeza de que deseja excluir este item do histórico?')) {
            onDeleteItem(itemId);
        }
    };

    const visibleHistory = filteredHistory.slice(0, visibleCount);
    const canLoadMore = filteredHistory.length > visibleCount;

    return (
        <div className="mt-8">
            <h2 className="text-xl font-bold text-slate-100 mb-3 flex items-center">
                <HistoryIcon className="text-2xl mr-2 text-slate-400" />
                Histórico de Atividades
            </h2>

            {history.length > 0 && (
                <div className="relative my-4">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <SearchIcon className="text-xl text-slate-500" />
                    </span>
                    <input
                        type="search"
                        placeholder="Pesquisar por título ou trecho..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900/50 text-slate-300 p-2 pl-10 rounded-lg border border-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors"
                        aria-label="Pesquisar no histórico"
                    />
                </div>
            )}

            {history.length === 0 ? (
                <div className="text-center py-8 px-4 bg-black/20 rounded-lg border border-dashed border-white/10">
                    <p className="text-slate-500">Seu histórico de atividades aparecerá aqui.</p>
                </div>
            ) : filteredHistory.length === 0 ? (
                <div className="text-center py-8 px-4 bg-black/20 rounded-lg">
                    <p className="text-slate-500">Nenhum resultado encontrado para &ldquo;{searchTerm}&rdquo;.</p>
                </div>
            ) : (
                <>
                    <ul className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                        {visibleHistory.map((item) => {
                            const config = actionConfig[item.actionType];
                            const Icon = config.icon;
                            return (
                                <li key={item.id} className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 hover:border-sky-400/50 focus-within:border-sky-400/50 transition-all duration-200">
                                    {editingItemId === item.id ? (
                                        // EDIT MODE
                                        <div className="p-3">
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                value={renameValue}
                                                onChange={(e) => setRenameValue(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleSaveRename(item.id);
                                                    if (e.key === 'Escape') handleCancelRename();
                                                }}
                                                className="w-full bg-slate-800/70 text-slate-100 p-2 rounded-md border border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                                aria-label="Novo nome para o item do histórico"
                                            />
                                            <div className="flex items-center justify-end space-x-2 mt-2">
                                                <button onClick={handleCancelRename} className="text-xs font-semibold py-1 px-3 rounded-md bg-slate-600 hover:bg-slate-500 transition-colors">Cancelar</button>
                                                <button onClick={() => handleSaveRename(item.id)} className="text-xs font-semibold py-1 px-3 rounded-md bg-sky-600 hover:bg-sky-500 transition-colors">Salvar</button>
                                            </div>
                                        </div>
                                    ) : (
                                        // DISPLAY MODE
                                        <div className="p-3">
                                            <div className="flex items-start mb-2">
                                                <div className={`flex-shrink-0 h-8 w-8 rounded-md flex items-center justify-center mr-3 ${config.className}`}>
                                                    <Icon className="text-xl text-white" />
                                                </div>
                                                <div
                                                    className="flex-grow cursor-pointer"
                                                    onClick={() => onItemClick(item)}
                                                >
                                                    <h3 className="font-bold text-slate-200">{item.customTitle ?? config.title}</h3>
                                                    <p className="text-xs text-slate-400">{formatDate(item.timestamp)}</p>
                                                </div>
                                                <div className="flex items-center space-x-0 -mr-2">
                                                    <button
                                                        onClick={() => handleRenameClick(item)}
                                                        className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-sky-400 transition-colors"
                                                        title="Renomear"
                                                    >
                                                        <PencilIcon className="text-base" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(item.id)}
                                                        className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-rose-500 transition-colors"
                                                        title="Excluir"
                                                    >
                                                        <TrashIcon className="text-base" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div
                                                className="cursor-pointer"
                                                onClick={() => onItemClick(item)}
                                            >
                                                <p className="text-xs text-slate-400 italic bg-black/20 p-2 rounded">
                                                    &ldquo;{item.inputTextSnippet}&rdquo;
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                    {canLoadMore && (
                        <div className="mt-4 text-center">
                            <button
                                onClick={handleLoadMore}
                                className="w-full sm:w-auto bg-slate-700/50 hover:bg-slate-600/50 border border-white/10 text-slate-200 font-semibold py-2 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500"
                            >
                                Carregar Mais
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default HistoryList;