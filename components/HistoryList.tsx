

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

    const handleExportHistory = () => {
        if (history.length === 0) {
            alert('O histórico está vazio. Não há nada para exportar.');
            return;
        }

        try {
            const dataStr = JSON.stringify(history, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
            link.download = `tutor-ativo-ai-historico-${timestamp}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erro ao exportar o histórico:', error);
            alert('Ocorreu um erro ao tentar exportar o histórico.');
        }
    };
    
    const handleExportHistoryXML = () => {
        if (history.length === 0) {
            alert('O histórico está vazio. Não há nada para exportar.');
            return;
        }

        try {
            const toXML = (items: HistoryItem[]) => {
                const escapeCdata = (str: string) => str.replace(/