import React, { useMemo } from 'react';
import { ActionType } from '../types';
import { actionConfig } from '../constants';

interface FormattedResponseProps {
    text: string;
    actionType: ActionType | null;
}

// Helper para converter texto com **negrito** em JSX
const renderBoldText = (line: string) => {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className="text-sky-300">{part.slice(2, -2)}</strong>;
        }
        return part;
    });
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
        const elements: JSX.Element[] = [];
        let isList = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            if (line.startsWith('- ')) {
                if (!isList) {
                    isList = true;
                    elements.push(<ul key={`ul-${i}`} className="space-y-2 my-3"></ul>);
                }
                const lastElement = elements[elements.length - 1];
                if (lastElement.type === 'ul') {
                    const newChildren = React.Children.toArray(lastElement.props.children);
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
                    <div key={`gabarito-${i}`} className="mt-6 bg-slate-800 border-l-4 border-emerald-500 p-4 rounded-r-lg">
                        <p className="text-emerald-300 font-bold">{renderBoldText(line)}</p>
                    </div>
                 );
            } else if (/^\d+\.\s/.test(line)) { // Quiz Question
                isList = false;
                 elements.push(<h3 key={`h3-${i}`} className="text-lg font-semibold text-slate-100 mt-5 mb-2">{renderBoldText(line)}</h3>);
            } else if (/^[a-d]\)\s/.test(line)) { // Quiz Option
                isList = false;
                 elements.push(
                    <p key={`p-quiz-${i}`} className="ml-4 my-1 p-2 bg-slate-800/50 rounded-md border border-slate-700">
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
