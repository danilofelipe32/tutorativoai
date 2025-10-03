
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { HistoryItem, ActionType, GroundingChunk } from '../types';
import { actionConfig } from '../constants';
import { HistoryIcon, TrashIcon, PencilIcon, SearchIcon, DownloadIcon, ImportIcon, CheckIcon, CloseIcon, SortIcon, UndoIcon } from './icons';

interface HistoryListProps {
    history: HistoryItem[];
    onItemClick: (item: HistoryItem) => void;
    onDeleteItem: (itemId: number) => void;
    onRenameItem: (itemId: number, newTitle: string) => void;
    onImportHistory: (importedHistory: HistoryItem[]) => void;
}

const ITEMS_PER_PAGE = 10;
type SortOption = 'date-desc' | 'date-asc' | 'action-asc';

const HistoryList: React.FC<HistoryListProps> = ({ history, onItemClick, onDeleteItem, onRenameItem, onImportHistory }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [editingItemId, setEditingItemId] = useState<number | null>(null);
    const [renameValue, setRenameValue] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState<SortOption>('date-desc');
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    
    const inputRef = useRef<HTMLInputElement>(null);
    const importInputRef = useRef<HTMLInputElement>(null);
    const exportMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editingItemId !== null && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingItemId]);

    // Close export menu on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setIsExportMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleClearFilters = () => {
        setSearchTerm('');
        setSortOption('date-desc');
    };

    const areFiltersActive = searchTerm.trim() !== '' || sortOption !== 'date-desc';

    const processedHistory = useMemo(() => {
        let processedItems = [...history]; // Start with a shallow copy

        // 1. Filter
        if (searchTerm.trim()) {
            const lowerCaseSearch = searchTerm.toLowerCase();
            processedItems = processedItems.filter(item => {
                const title = item.customTitle ?? actionConfig[item.actionType].title;
                const originalText = item.fullInputText;
                const resultText = item.fullResult.text;

                return (
                    title.toLowerCase().includes(lowerCaseSearch) ||
                    originalText.toLowerCase().includes(lowerCaseSearch) ||
                    resultText.toLowerCase().includes(lowerCaseSearch)
                );
            });
        }
        
        // 2. Sort
        switch (sortOption) {
            case 'date-asc':
                processedItems.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                break;
            case 'action-asc':
                processedItems.sort((a, b) => {
                    const titleA = actionConfig[a.actionType].title;
                    const titleB = actionConfig[b.actionType].title;
                    return titleA.localeCompare(titleB);
                });
                break;
            case 'date-desc':
            default:
                processedItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                break;
        }

        return processedItems;
    }, [history, searchTerm, sortOption]);

    // Reset to page 1 when search term changes or history is updated
    useEffect(() => {
        setCurrentPage(1);
    }, [processedHistory.length]);

    // Pagination logic
    const totalPages = Math.ceil(processedHistory.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = processedHistory.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
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

    const handleExportHistory = (format: 'json' | 'xml' | 'pdf') => {
        setIsExportMenuOpen(false);
        if (history.length === 0) {
            alert('O histórico está vazio. Não há nada para exportar.');
            return;
        }
    
        const timestamp = new Date().toISOString().slice(0, 10);
    
        try {
            if (format === 'pdf') {
                const title = "Histórico de Análises - Tutor Ativo AI";
                const escapeHtml = (unsafe: string) => unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
                
                let htmlContent = `
                    <html><head><title>${title}</title><style>
                        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #333; margin: 2rem; }
                        h1 { color: #1e293b; border-bottom: 2px solid #38bdf8; padding-bottom: 10px; }
                        article { border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; page-break-inside: avoid; background: #f8fafc; }
                        h2 { margin: 0 0 10px; font-size: 1.25em; color: #0f172a; }
                        h3 { font-size: 1.1em; color: #334155; margin-top: 1rem; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px;}
                        p { margin: 5px 0; }
                        pre { background-color: #f1f5f9; padding: 10px; border-radius: 4px; white-space: pre-wrap; word-wrap: break-word; border: 1px solid #e2e8f0; }
                        .meta { font-size: 0.85em; color: #64748b; }
                    </style></head><body>
                    <h1>${title}</h1>
                    <p class="meta">Exportado em: ${new Date().toLocaleString('pt-BR')}</p>
                `;
    
                history.forEach(item => {
                    htmlContent += `
                        <article>
                            <h2>${escapeHtml(item.customTitle || actionConfig[item.actionType].title)}</h2>
                            <p class="meta"><strong>Ação:</strong> ${escapeHtml(actionConfig[item.actionType].title)}</p>
                            <p class="meta"><strong>Data:</strong> ${formatDate(item.timestamp)}</p>
                            <h3>Texto de Entrada:</h3>
                            <pre>${escapeHtml(item.fullInputText)}</pre>
                            <h3>Resultado Gerado:</h3>
                            <pre>${escapeHtml(item.fullResult.text)}</pre>
                        </article>
                    `;
                });
    
                htmlContent += `</body></html>`;
    
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                    printWindow.document.write(htmlContent);
                    printWindow.document.close();
                    printWindow.focus();
                    setTimeout(() => printWindow.print(), 500);
                } else {
                    alert('Por favor, habilite pop-ups para exportar como PDF.');
                }
                return;
            }
            
            let dataStr: string;
            let mimeType: string;
            let fileExtension: 'json' | 'xml' = 'json';

            if (format === 'json') {
                dataStr = JSON.stringify(history, null, 2);
                mimeType = 'application/json';
                fileExtension = 'json';
            } else { // xml
                const itemsXml = history.map(item => `
    <item id="${item.id}">
        <actionType>${item.actionType}</actionType>
        <timestamp>${item.timestamp}</timestamp>
        <customTitle><![CDATA[${item.customTitle || ''}]]></customTitle>
        <inputTextSnippet><![CDATA[${item.inputTextSnippet}]]></inputTextSnippet>
        <fullInputText><![CDATA[${item.fullInputText}]]></fullInputText>
        <fullResult>
            <text><![CDATA[${item.fullResult.text}]]></text>
            ${item.fullResult.sources ? `<sources>${item.fullResult.sources.map(s => `<source><uri><![CDATA[${s.web.uri}]]></uri><title><![CDATA[${s.web.title}]]></title></source>`).join('')}</sources>` : ''}
        </fullResult>
    </item>`).join('');
                dataStr = `<?xml version="1.0" encoding="UTF-8"?>\n<history>\n${itemsXml}\n</history>`;
                mimeType = 'application/xml';
                fileExtension = 'xml';
            }
        
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
                let importedData: HistoryItem[] = [];

                if (file.type === "application/json" || file.name.endsWith('.json')) {
                    const parsedJson = JSON.parse(text);
                    if (Array.isArray(parsedJson) && parsedJson.every(item => 'id' in item && 'actionType' in item)) {
                        importedData = parsedJson;
                    } else {
                        throw new Error('Formato de JSON inválido.');
                    }
                } else if (file.type === "application/xml" || file.type === "text/xml" || file.name.endsWith('.xml')) {
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(text, "application/xml");
                    
                    if (xmlDoc.getElementsByTagName("parsererror").length) {
                        throw new Error("Falha ao analisar o arquivo XML. Verifique se o formato está correto.");
                    }

                    const itemNodes = xmlDoc.getElementsByTagName("item");
                    importedData = Array.from(itemNodes).map(itemNode => {
                        const getTagContent = (tagName: string) => itemNode.getElementsByTagName(tagName)[0]?.textContent ?? '';
                        
                        const sourcesNodes = itemNode.getElementsByTagName("source");
                        const sources: GroundingChunk[] = Array.from(sourcesNodes).map(s => ({
                            web: {
                                uri: s.getElementsByTagName('uri')[0]?.textContent ?? '',
                                title: s.getElementsByTagName('title')[0]?.textContent ?? ''
                            }
                        }));

                        const historyItem: HistoryItem = {
                            id: Number(itemNode.getAttribute("id")),
                            actionType: getTagContent('actionType') as ActionType,
                            timestamp: getTagContent('timestamp'),
                            customTitle: getTagContent('customTitle') || undefined,
                            inputTextSnippet: getTagContent('inputTextSnippet'),
                            fullInputText: getTagContent('fullInputText'),
                            fullResult: {
                                text: itemNode.querySelector('fullResult > text')?.textContent ?? '',
                                sources: sources.length > 0 ? sources : undefined
                            },
                        };
                        return historyItem;
                    });
                } else {
                     throw new Error('Tipo de arquivo não suportado. Por favor, importe um arquivo JSON ou XML.');
                }

                if (importedData.length > 0) {
                    onImportHistory(importedData);
                } else {
                    alert("Nenhum item válido encontrado no arquivo importado.");
                }

            } catch (error: any) {
                alert(`Erro ao importar arquivo: ${error.message}`);
            }
        };
        reader.readAsText(file);
        event.target.value = ''; // Reset input to allow re-uploading the same file
    };


    return (
        <section className="mt-12 mb-8" aria-labelledby="history-title">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <div className="flex items-center space-x-3">
                    <HistoryIcon className="text-2xl text-slate-400" />
                    <h2 id="history-title" className="text-2xl font-bold text-slate-100">Histórico de Análises</h2>
                </div>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <div className="relative" ref={exportMenuRef}>
                        <button 
                            onClick={() => setIsExportMenuOpen(prev => !prev)} 
                            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 text-slate-200 font-semibold py-2 px-3 rounded-lg transition-colors text-xs border border-white/10"
                            title="Exportar Histórico"
                            aria-haspopup="true"
                            aria-expanded={isExportMenuOpen}
                        >
                            <DownloadIcon/><span>Exportar</span>
                        </button>
                        {isExportMenuOpen && (
                            <div className="absolute right-0 bottom-full mb-2 w-48 bg-slate-800/90 backdrop-blur-lg border border-white/10 rounded-lg shadow-xl z-20 animate-fade-in-fast" role="menu">
                                <button onClick={() => handleExportHistory('json')} className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-sky-500/20 transition-colors flex items-center space-x-2" role="menuitem">
                                    <span>Exportar como JSON</span>
                                </button>
                                <button onClick={() => handleExportHistory('xml')} className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-sky-500/20 transition-colors flex items-center space-x-2" role="menuitem">
                                    <span>Exportar como XML</span>
                                </button>
                                <button onClick={() => handleExportHistory('pdf')} className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-sky-500/20 transition-colors flex items-center space-x-2" role="menuitem">
                                    <span>Exportar como PDF</span>
                                </button>
                            </div>
                        )}
                    </div>
                    <button onClick={handleImportClick} className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 text-slate-200 font-semibold py-2 px-3 rounded-lg transition-colors text-xs border border-white/10" title="Importar Histórico de um arquivo JSON ou XML">
                        <ImportIcon/><span>Importar</span>
                    </button>
                    <input type="file" ref={importInputRef} onChange={handleFileImport} accept=".json,.xml,application/json,application/xml" className="hidden" />
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                <div className="relative w-full sm:flex-grow">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Pesquisar no histórico..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900/50 text-slate-300 pl-10 pr-4 py-2 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        aria-label="Pesquisar no histórico"
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-auto flex-grow">
                        <label htmlFor="sort-history" className="sr-only">Ordenar histórico</label>
                        <select
                            id="sort-history"
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value as SortOption)}
                            className="w-full sm:w-auto appearance-none bg-slate-900/50 text-slate-300 pl-4 pr-10 py-2 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            aria-label="Ordenar histórico"
                        >
                            <option value="date-desc">Mais Recentes</option>
                            <option value="date-asc">Mais Antigos</option>
                            <option value="action-asc">Tipo de Ação (A-Z)</option>
                        </select>
                        <SortIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                    {areFiltersActive && (
                        <button
                            onClick={handleClearFilters}
                            className="flex-shrink-0 py-2 px-3 bg-slate-900/50 text-slate-300 rounded-lg border border-white/10 hover:bg-rose-500/20 hover:text-rose-300 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
                            title="Limpar filtros"
                            aria-label="Limpar filtros de pesquisa e ordenação"
                        >
                            <UndoIcon className="text-lg" />
                        </button>
                    )}
                </div>
            </div>


            <div className="space-y-2 mt-4">
                {history.length > 0 && currentItems.length > 0 ? (
                    currentItems.map(item => {
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
                        <p className="text-slate-400">{searchTerm ? 'Nenhum item corresponde à sua busca.' : 'Seu histórico aparecerá aqui.'}</p>
                         { !searchTerm && <p className="text-xs text-slate-500 mt-1">Nenhuma análise foi realizada ainda.</p> }
                    </div>
                )}
            </div>
            
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                    <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className="bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 font-semibold py-2 px-4 rounded-lg transition-colors border border-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Anterior
                    </button>
                    <span className="text-sm text-slate-400 font-medium">
                        Página {currentPage} de {totalPages}
                    </span>
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 font-semibold py-2 px-4 rounded-lg transition-colors border border-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Próximo
                    </button>
                </div>
            )}
        </section>
    );
};

export default HistoryList;
