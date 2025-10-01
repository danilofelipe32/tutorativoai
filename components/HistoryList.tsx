
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { HistoryItem } from '../types';
import { actionConfig } from '../constants';
import { HistoryIcon, TrashIcon, PencilIcon, SearchIcon, DownloadIcon, ImportIcon, CheckIcon, CloseIcon } from './icons';

interface HistoryListProps {
    history: HistoryItem[];
    onItemClick: (item: HistoryItem) => void;
    onDeleteItem: (itemId: number) => void;
    onRenameItem: (itemId: number, newTitle: string) => void;
    onImportHistory: (importedHistory: HistoryItem[]) => void;
}

const ITEMS_PER_PAGE = 10;

const HistoryList: React.FC<HistoryListProps> = ({ history, onItemClick, onDeleteItem, onRenameItem, onImportHistory }) => {
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
    const [editingItemId, setEditingItemId] = useState<number | null>(null);
    const [renameValue, setRenameValue] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const importInputRef = useRef<HTMLInputElement>(null);

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

    const handleExportHistory = (format: 'json') => {
        if (history.length === 0) {
            alert('O histórico está vazio. Não há nada para exportar.');
            return;
        }
    
        try {
            const dataStr = JSON.stringify(history, null, 2);
            const mimeType = 'application/json';
            const fileExtension = 'json';
            const timestamp = new Date().toISOString().slice(0, 10);
    
            const blob = new Blob([dataStr], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tutor-ativo-ai-history-${timestamp}.${fileExtension}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
    
        } catch (error) {
            console.error('Failed to export history:', error);
            alert('Ocorreu um erro ao exportar o histórico.');
        }
    };

    const handleImportClick = () => {
        importInputRef.current?.click();
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                if (file.type === "application/json") {
                    const importedData = JSON.parse(text);
                    if (Array.isArray(importedData) && importedData.every(item => 'id' in item && 'actionType' in item)) {
                        onImportHistory(importedData);
                    } else {
                        throw new Error('Formato de JSON inválido.');
                    }
                } else {
                     throw new Error('Apenas a importação de arquivos JSON é suportada no momento.');
                }
            } catch (error: any) {
                alert(`Erro ao importar arquivo: ${error.message}`);
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    return (
        <section className="mt-12 mb-8" aria-labelledby="history-title">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <div className="flex items-center space-x-3">
                    <HistoryIcon className="text-2xl text-slate-400" />
                    <h2 id="history-title" className="text-2xl font-bold text-slate-100">Histórico de Análises</h2>
                </div>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <button onClick={() => handleExportHistory('json')} className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 text-slate-200 font-semibold py-2 px-3 rounded-lg transition-colors text-xs border border-white/10" title="Exportar Histórico como JSON">
                        <DownloadIcon/><span>Exportar JSON</span>
                    </button>
                    <button onClick={handleImportClick} className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 text-slate-200 font-semibold py-2 px-3 rounded-lg transition-colors text-xs border border-white/10" title="Importar Histórico de um arquivo JSON">
                        <ImportIcon/><span>Importar</span>
                    </button>
                    <input type="file" ref={importInputRef} onChange={handleFileImport} accept=".json" className="hidden" />
                </div>
            </div>

            <div className="relative mb-4">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    placeholder="Pesquisar no histórico..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900/50 text-slate-300 pl-10 pr-4 py-2 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
            </div>

            <div className="space-y-2 mt-4">
                {history.length > 0 ? (
                    filteredHistory.slice(0, visibleCount).map(item => {
                        const Icon = actionConfig[item.actionType].icon;
                        const title = item.customTitle || actionConfig[item.actionType].title;
                        const isEditing = editingItemId === item.id;
                        
                        return (
                            <div key={item.id} className="bg-slate-800/40 rounded-lg p-3 flex items-center justify-between hover:bg-slate-700/50 transition-colors group">
                                {isEditing ? (
                                    <div className="flex-grow flex items-center space-x-2">
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={renameValue}
                                            onChange={(e) => setRenameValue(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(item.id)}
                                            onBlur={() => handleSaveRename(item.id)}
                                            className="w-full bg-slate-900/80 text-slate-200 px-2 py-1 rounded border border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500"
                                        />
                                        <button onClick={() => handleSaveRename(item.id)} className="p-2 text-emerald-400 hover:bg-emerald-500/20 rounded-full"><CheckIcon /></button>
                                        <button onClick={handleCancelRename} className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-full"><CloseIcon /></button>
                                    </div>
                                ) : (
                                    <>
                                        <button onClick={() => onItemClick(item)} className="flex items-center space-x-3 text-left flex-grow truncate">
                                            <Icon className="text-2xl text-slate-400 flex-shrink-0" />
                                            <div className="truncate">
                                                <p className="font-bold text-slate-200 truncate" title={title}>{title}</p>
                                                <p className="text-xs text-slate-400 truncate" title={item.inputTextSnippet}>{item.inputTextSnippet}</p>
                                                <p className="text-[10px] text-slate-500 mt-1">{formatDate(item.timestamp)}</p>
                                            </div>
                                        </button>
                                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleRenameClick(item)} className="p-2 text-slate-400 hover:text-sky-400 hover:bg-sky-500/20 rounded-full" title="Renomear">
                                                <PencilIcon />
                                            </button>
                                            <button onClick={() => handleDeleteClick(item.id)} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 rounded-full" title="Excluir">
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-8 px-4 bg-slate-800/30 rounded-lg">
                        <HistoryIcon className="text-4xl text-slate-500 mx-auto mb-3" />
                        <p className="text-slate-400">Seu histórico aparecerá aqui.</p>
                        <p className="text-xs text-slate-500 mt-1">{searchTerm ? 'Nenhum item corresponde à sua busca.' : 'Nenhuma análise foi realizada ainda.'}</p>
                    </div>
                )}
            </div>
            
            {visibleCount < filteredHistory.length && (
                <div className="text-center mt-6">
                    <button
                        onClick={handleLoadMore}
                        className="bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 font-semibold py-2 px-6 rounded-lg transition-colors border border-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500"
                    >
                        Carregar Mais
                    </button>
                </div>
            )}
        </section>
    );
};

export default HistoryList;
