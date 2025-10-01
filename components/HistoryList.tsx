
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { HistoryItem, ActionType, GroundingChunk } from '../types';
import { actionConfig } from '../constants';
import { HistoryIcon, TrashIcon, PencilIcon, SearchIcon, DownloadIcon, ImportIcon } from './icons';

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
    
    const handleExportHistory = (format: 'json' | 'xml') => {
        if (history.length === 0) {
            alert('O histórico está vazio. Não há nada para exportar.');
            return;
        }

        try {
            let dataStr: string;
            let mimeType: string;
            let fileExtension: string;
            const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

            if (format === 'xml') {
                const cdata = (str: string | undefined | null): string => str ? `<![CDATA[${String(str).replace(/]]>/g, ']]&gt;')}