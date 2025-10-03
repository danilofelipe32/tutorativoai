

import React, { useMemo } from 'react';
import { ActionType } from '../types';
import { actionConfig } from '../constants';

interface FormattedResponseProps {
    text: string;
    actionType: ActionType | null;
}

// Helper para converter texto com **negrito** em JSX
const renderBoldText = (line: string): React.ReactNode[] => {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className="text-sky-300">{part.slice(2, -2)}</strong>;
        }
        return part;
    });
};

const TableRenderer: React.FC<{ tableLines: string[] }> = ({ tableLines }) => {
    if (tableLines.length < 2) return null; // Header + separator required

    const headerLine = tableLines[0];
    const headers = headerLine.split('|').map(h => h.trim()).filter(Boolean);
    
    const bodyRows = tableLines.slice(2); // Skip header and separator

    return (
        <div className="overflow-x-auto my-4 rounded-lg border border-white/10">
            <table className="w-full text-sm text-left text-slate-300">
                <thead className="bg-white/5 text-xs text-slate-200 uppercase">
                    <tr>
                        {headers.map((header, index) => (
                            <th key={index} scope="col" className="px-4 py-3 whitespace-nowrap">
                                {renderBoldText(header)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {bodyRows.map((rowLine, rowIndex) => {
                        const cells = rowLine.split('|').map(c => c.trim()).filter(Boolean);
                        // Make sure the number of cells matches the number of headers
                        if (cells.length !== headers.length) return null; 
                        return (
                            <tr key={rowIndex} className="bg-transparent even:bg-white/5 border-b border-white/10 last:border-b-0">
                                {cells.map((cell, cellIndex) => (
                                    <td key={cellIndex} className="px-4 py-3 whitespace-nowrap">
                                        {renderBoldText(cell)}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};


const FormattedResponse: React.FC<FormattedResponseProps> = ({ text, actionType }) => {

    const actionColor = actionType ? actionConfig[actionType].className.split(' ')[0] : 'bg-gray-500';

    const BulletIcon = () => (
        <svg className={`flex-shrink-0 h-4 w-4 mt-1 mr-3 ${actionColor.replace('bg-', 'text-')}`} viewBox="0 0 16 16" fill="currentColor">
            <circle cx="8" cy="8" r="6" />
        </svg>
    );

    const content = useMemo(() => {
        const lines = text.split('\n');
        const elements: React.ReactElement[] = [];
        let isList = false;

        // 1. Pre-scan for headers to build the Table of Contents
        const headers: { text: string; id: string }[] = [];
        const slugify = (str: string) => str.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

        lines.forEach((line) => {
            const trimmedLine = line.trim();
            // A header is a line that consists only of bold text.
            const isHeader = trimmedLine.startsWith('**') && trimmedLine.endsWith('**') && trimmedLine.split('**').length === 3;
            // Exclude common patterns that aren't titles (e.g., "**Gabarito:**")
            const isExcludedPattern = /gabarito|alegação|pergunta|cenário|afirmação/i.test(trimmedLine);

            if (isHeader && !isExcludedPattern) {
                const headerText = trimmedLine.slice(2, -2).trim();
                if (headerText) { // Ensure header is not empty
                    headers.push({
                        text: headerText,
                        id: `${slugify(headerText)}-${headers.length}`
                    });
                }
            }
        });

        // 2. If there's more than one header, create and add the TOC element
        if (headers.length > 1) {
            elements.push(
                <nav key="toc" className="bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-lg p-4 mb-6" aria-labelledby="toc-title">
                    <h2 id="toc-title" className="text-lg font-bold text-slate-100 mb-3">Tabela de Conteúdo</h2>
                    <ul className="space-y-2">
                        {headers.map((header) => (
                            <li key={header.id}>
                                <a href={`#${header.id}`} className="text-sky-400 hover:text-sky-300 hover:underline transition-colors text-sm">
                                    {header.text}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            );
        }

        let headerIndex = 0;

        // 3. Process the content line by line
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            const trimmedLine = line.trim();
            
            // Check if the current line is a header we identified
            const isHeader = trimmedLine.startsWith('**') && trimmedLine.endsWith('**') && trimmedLine.split('**').length === 3;
            const isExcludedPattern = /gabarito|alegação|pergunta|cenário|afirmação/i.test(trimmedLine);
            const currentHeaderFromList = headers[headerIndex];

            if (isHeader && !isExcludedPattern && currentHeaderFromList && trimmedLine.slice(2, -2).trim() === currentHeaderFromList.text) {
                elements.push(
                    <h2 key={currentHeaderFromList.id} id={currentHeaderFromList.id} className="text-xl font-bold text-slate-100 mt-6 mb-2 pt-2 scroll-mt-24">
                        {currentHeaderFromList.text}
                    </h2>
                );
                headerIndex++;
                isList = false;
                continue; // Skip other processing for this line
            }

            // Table Detection
            if (line.includes('|')) {
                const tableLines: string[] = [];
                // Consume all consecutive lines that are part of the table
                while (i < lines.length && lines[i].includes('|')) {
                    // Ignore separator line for content
                    if (!lines[i].replace(/[-|: ]/g, '').length) {
                         // This is likely a separator line like |---|---|
                    }
                    tableLines.push(lines[i]);
                    i++;
                }
                i--; // Decrement to account for the loop's i++
                elements.push(<TableRenderer key={`table-${i}`} tableLines={tableLines} />);
                isList = false;
                continue;
            }

            line = line.trim();

            if (line.startsWith('- ')) {
                if (!isList) {
                    isList = true;
                    elements.push(<ul key={`ul-${i}`} className="space-y-2 my-3"></ul>);
                }
                const lastElement = elements[elements.length - 1];
                if (lastElement.type === 'ul') {
                    // Fix: Explicitly cast props to access children, as the type of props on a generic ReactElement is not known.
                    const newChildren = React.Children.toArray((lastElement.props as { children?: React.ReactNode }).children);
                    newChildren.push(
                        <li key={`li-${i}`} className="flex items-start">
                           <BulletIcon />
                           <span>{renderBoldText(line.substring(2))}</span>
                        </li>
                    );
                     elements[elements.length - 1] = React.cloneElement(lastElement, {}, newChildren);
                }
            } else if (line.toLowerCase().startsWith('**gabarito:**')) {
                 isList = false;
                 elements.push(
                    <div key={`gabarito-${i}`} className="mt-6 bg-emerald-900/50 border-l-4 border-emerald-400 p-4 rounded-r-lg">
                        <p className="text-emerald-300 font-bold">{renderBoldText(line)}</p>
                    </div>
                 );
            } else if (/^\d+\.\s/.test(line)) { // Quiz Question
                isList = false;
                 elements.push(<h3 key={`h3-${i}`} className="text-lg font-semibold text-slate-100 mt-5 mb-2">{renderBoldText(line)}</h3>);
            } else if (/^[a-d]\)\s/.test(line)) { // Quiz Option
                isList = false;
                 elements.push(
                    <p key={`p-quiz-${i}`} className="ml-4 my-1 p-2 bg-white/5 rounded-md border border-white/10 hover:bg-white/10 transition-colors">
                        {renderBoldText(line)}
                    </p>
                );
            }
             else {
                isList = false;
                 if (line) {
                     elements.push(<p key={`p-${i}`} className="my-3 leading-relaxed">{renderBoldText(line)}</p>);
                 } else if (elements.length > 0 && elements[elements.length - 1].type !== 'div') {
                     // Adiciona um espaço vertical para linhas em branco, exceto após um gabarito
                     elements.push(<div key={`spacer-${i}`} className="h-4" />);
                 }
            }
        }
        return elements;
    }, [text, actionColor]);

    return <div className="text-slate-300">{content}</div>;
};

export default FormattedResponse;