
import React, { useState, useMemo, useCallback } from 'react';

interface MindMapNode {
    text: string;
    level: number;
    children: MindMapNode[];
}

// Componente para renderizar um único nó e seus filhos (recursivamente)
const Node: React.FC<{ node: MindMapNode }> = ({ node }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const hasChildren = node.children.length > 0;

    const toggleCollapse = () => {
        setIsCollapsed(prev => !prev);
    };

    const levelColors = [
        'text-slate-100 font-bold',
        'text-sky-300',
        'text-emerald-300',
        'text-amber-300',
        'text-rose-300',
    ];

    const colorClass = levelColors[node.level % levelColors.length] || 'text-slate-300';

    return (
        <li className="relative">
            <div className="flex items-center">
                {hasChildren && (
                    <button onClick={toggleCollapse} className="text-slate-500 hover:text-slate-300 w-6 h-6 flex items-center justify-center flex-shrink-0">
                        {isCollapsed ? '+' : '-'}
                    </button>
                )}
                <span className={`pl-2 ${!hasChildren ? 'ml-6' : ''} ${colorClass}`}>{node.text}</span>
            </div>
            {hasChildren && !isCollapsed && (
                <ul className="pl-6 border-l border-slate-700">
                    {node.children.map((child, index) => (
                        <Node key={index} node={child} />
                    ))}
                </ul>
            )}
        </li>
    );
};

// Componente principal que parseia o texto e renderiza a árvore
const MindMapRenderer: React.FC<{ text: string }> = ({ text }) => {
    const tree = useMemo(() => {
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) return [];
        
        // Heurística para encontrar o início do mapa
        let firstNodeIndex = lines.findIndex(line => line.trim().match(/^[\*\-\+]/) || line.trim().endsWith(':'));
        if (firstNodeIndex === -1) firstNodeIndex = 0;
        const mapLines = lines.slice(firstNodeIndex);

        const indentationLevels = [...new Set(mapLines.map(line => line.search(/\S|$/)))].sort((a, b) => a - b);
        const getLevel = (indentation: number) => indentationLevels.indexOf(indentation);

        const rootNodes: MindMapNode[] = [];
        const path: MindMapNode[] = [];

        mapLines.forEach(line => {
            const indentation = line.search(/\S|$/);
            const level = getLevel(indentation);
            if (level < 0) return; // Ignora linhas sem indentação se não for o nível base

            const node: MindMapNode = {
                text: line.trim().replace(/^[\*\-\+]\s*/, '').replace(/\*\*(.*?)\*\*/g, '$1'),
                level: level,
                children: []
            };

            while (path.length > level) {
                path.pop();
            }

            if (path.length === 0) {
                rootNodes.push(node);
            } else {
                path[path.length - 1].children.push(node);
            }
            path.push(node);
        });
        return rootNodes;
    }, [text]);

    if (!tree.length) {
        return <p className="text-slate-400">Não foi possível gerar um mapa mental a partir do texto.</p>;
    }

    return (
        <div className="font-mono text-sm">
            <ul>
                {tree.map((node, index) => (
                    <Node key={index} node={node} />
                ))}
            </ul>
        </div>
    );
};

export default MindMapRenderer;
    