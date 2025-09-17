import React, { useState, useMemo } from 'react';

interface MindMapNode {
    text: string;
    level: number;
    children: MindMapNode[];
}

const ChevronIcon: React.FC<{ isCollapsed: boolean }> = ({ isCollapsed }) => (
    <svg
        className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isCollapsed ? 'rotate-0' : 'rotate-90'
            }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
    >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);


// Componente para renderizar um único nó e seus filhos (recursivamente)
const Node: React.FC<{ node: MindMapNode }> = ({ node }) => {
    // Recolhe todos os nós que não são de nível superior por padrão
    const [isCollapsed, setIsCollapsed] = useState(node.level > 0);
    const hasChildren = node.children.length > 0;

    const toggleCollapse = () => {
        setIsCollapsed(prev => !prev);
    };

    const levelColors = [
        'text-slate-100 font-bold text-base', // Nível 0
        'text-sky-300',                     // Nível 1
        'text-emerald-300',                // Nível 2
        'text-amber-300',                  // Nível 3
        'text-rose-300',                   // Nível 4
    ];

    const colorClass = levelColors[node.level % levelColors.length] || 'text-slate-300';

    return (
        <li className="relative">
            {/* Linha vertical conectora para os filhos */}
            <div className="absolute left-3 top-7 -bottom-2 w-px bg-slate-700" />

            <div className="flex items-center relative z-10">
                <div className="flex items-center justify-center w-6 h-6 mr-1">
                    {hasChildren ? (
                        <button onClick={toggleCollapse} className="p-1 rounded-full hover:bg-slate-700">
                            <ChevronIcon isCollapsed={isCollapsed} />
                        </button>
                    ) : (
                        // Ponto conector para nós sem filhos
                        <div className="w-1.5 h-1.5 bg-slate-600 rounded-full" />
                    )}
                </div>
                <span className={`pl-1 ${colorClass}`}>{node.text}</span>
            </div>

            {hasChildren && (
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'max-h-0' : 'max-h-[1000px]'
                    }`}>
                    <ul className="pl-6 pt-2">
                        {/* Linha horizontal conectora */}
                        <div className="absolute left-3 -top-0.5 h-7 w-4 border-b border-l border-slate-700 rounded-bl-lg" />
                        {node.children.map((child, index) => (
                            <Node key={index} node={child} />
                        ))}
                    </ul>
                </div>
            )}
        </li>
    );
};

// Componente principal que parseia o texto e renderiza a árvore
const MindMapRenderer: React.FC<{ text: string }> = ({ text }) => {
    const tree = useMemo(() => {
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) return [];

        let firstNodeIndex = lines.findIndex(line => line.trim().match(/^[\*\-\+]/) || !line.startsWith(' '));
        if (firstNodeIndex === -1) firstNodeIndex = 0;
        const mapLines = lines.slice(firstNodeIndex);

        const indentationLevels = [...new Set(mapLines.map(line => line.search(/\S|$/)))].sort((a, b) => a - b);
        const getLevel = (indentation: number) => {
            const level = indentationLevels.indexOf(indentation);
            return level === -1 ? 0 : level;
        };

        const rootNodes: MindMapNode[] = [];
        const path: MindMapNode[] = [];

        mapLines.forEach(line => {
            const indentation = line.search(/\S|$/);
            const level = getLevel(indentation);

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
        <div className="font-sans text-sm">
            <ul className="space-y-2">
                {tree.map((node, index) => (
                    <Node key={index} node={node} />
                ))}
            </ul>
        </div>
    );
};

export default MindMapRenderer;