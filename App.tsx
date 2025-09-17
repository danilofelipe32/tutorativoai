

import React, { useState, useCallback } from 'react';
import { ActionType, View } from './types';
import Header from './components/Header';
import MainView from './components/MainView';
import ResultsView from './components/ResultsView';
import HelpModal from './components/HelpModal';
import { actionConfig } from './constants';

// --- Logic moved from background.js and adapted for PWA ---

function getPromptForAction(action: ActionType, context: string): string {
    const basePrompt = `Você é um "Tutor Inteligente", uma IA assistente de estudos. Analise o seguinte texto e execute a tarefa solicitada. Responda em Português do Brasil.\n\n--- INÍCIO DO TEXTO ---\n${context}\n--- FIM DO TEXTO ---\n\n`;

    switch (action) {
        case 'SUMMARIZE':
            return basePrompt + "Tarefa: Crie um resumo conciso e claro dos pontos principais do texto acima. Use bullet points para facilitar a leitura.";
        case 'KEYWORDS':
            return basePrompt + "Tarefa: Identifique e liste os 5 a 7 termos ou conceitos mais importantes do texto. Para cada termo, forneça uma breve definição (1-2 frases) baseada no contexto do texto.";
        case 'REFLECT':
            return basePrompt + "Tarefa: Elabore de 3 a 5 perguntas abertas e instigantes que incentivem a reflexão sobre o conteúdo do texto. As perguntas devem estimular o pensamento crítico.";
        case 'TEST':
            return basePrompt + "Tarefa: Crie um pequeno quiz com 4 perguntas de múltipla escolha (com 4 opções cada, sendo apenas uma correta) para testar o conhecimento do leitor sobre o texto. Indique a resposta correta no final com um gabarito.";
        case 'SIMPLIFY':
            return basePrompt + "Tarefa: Reescreva os conceitos mais complexos do texto em uma linguagem simples e fácil de entender, como se estivesse explicando para um estudante do ensino médio.";
        case 'MINDMAP':
            return basePrompt + "Tarefa: Gere uma estrutura de mapa mental em formato de texto (usando recuo e marcadores como -, +, *) que organize as ideias principais e secundárias do texto. Comece com a ideia central e ramifique os subtópicos.";
        case 'ANALOGY':
            return basePrompt + "Tarefa: Explique o conceito central do texto usando uma analogia simples e fácil de entender. A analogia deve relacionar o tópico a algo do cotidiano para facilitar a compreensão.";
        case 'STEP_BY_STEP':
            return basePrompt + "Tarefa: Se o texto descreve um processo, evento histórico ou uma sequência de passos, detalhe-o em um formato 'passo a passo' claro e numerado. Se não houver um processo claro, explique a estrutura lógica do texto de forma sequencial.";
        case 'CONNECTIONS':
            return basePrompt + "Tarefa: Descreva como os principais conceitos do texto se conectam com o mundo real ou outras áreas do conhecimento (como história, ciência, arte, tecnologia, etc.). Forneça 2 a 3 exemplos práticos e claros.";
        default:
            return basePrompt + `Tarefa: Responda à seguinte solicitação: ${action}.`;
    }
}

async function callApiFreeLLM(prompt: string): Promise<string> {
    const API_URL = 'https://apifreellm.com/api/chat';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: prompt }),
        });

        if (!response.ok) {
            throw new Error(`Erro de rede: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.status === 'success') {
            return data.response;
        } else if (data.status === 'rate_limited') {
            throw new Error(`Limite de requisições atingido. Por favor, aguarde ${data.retry_after} segundos.`);
        } else {
            throw new Error(data.error || 'Ocorreu um erro desconhecido na resposta da API.');
        }
    } catch (error: any) {
        console.error("Error calling APIFreeLLM:", error);
        throw new Error(`Não foi possível se conectar ao serviço de IA. Detalhes: ${error.message}`);
    }
}

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>(View.MAIN);
    const [result, setResult] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [currentAction, setCurrentAction] = useState<ActionType | null>(null);
    const [isHelpVisible, setIsHelpVisible] = useState<boolean>(false);
    const [inputText, setInputText] = useState<string>('');

    const handleActionClick = useCallback(async (action: ActionType) => {
        if (!inputText.trim()) {
            setError('Por favor, insira um texto para analisar.');
            return;
        }

        setCurrentAction(action);
        setCurrentView(View.RESULTS);
        setIsLoading(true);
        setError('');
        setResult('');

        try {
            const prompt = getPromptForAction(action, inputText);
            const aiResponse = await callApiFreeLLM(prompt);
            setResult(aiResponse);
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro desconhecido.');
        } finally {
            setIsLoading(false);
        }
    }, [inputText]);

    const handleBackClick = () => {
        setCurrentView(View.MAIN);
        setCurrentAction(null);
        setError('');
    };

    const handleRefresh = () => {
        if (currentAction) {
            handleActionClick(currentAction);
        }
    };

    const title = currentAction ? actionConfig[currentAction].title : 'Tutor Ativo AI';

    return (
        <div className="w-full min-h-screen bg-slate-800 text-white flex flex-col antialiased md:max-w-2xl md:mx-auto md:my-4 md:rounded-lg md:shadow-2xl md:overflow-hidden md:min-h-[95vh] h-screen">
            <Header
                title={title}
                showBackButton={currentView === View.RESULTS}
                onBack={handleBackClick}
                onHelp={() => setIsHelpVisible(true)}
                onRefresh={handleRefresh}
                isRefreshable={currentView === View.RESULTS && !isLoading}
            />
            <main className="flex-grow p-4 overflow-y-auto flex flex-col">
                {currentView === View.MAIN && (
                    <MainView 
                        onActionSelect={handleActionClick}
                        inputText={inputText}
                        onTextChange={setInputText}
                    />
                )}
                {currentView === View.RESULTS && (
                    <ResultsView
                        isLoading={isLoading}
                        result={result}
                        error={error}
                        actionType={currentAction}
                    />
                )}
            </main>
            <HelpModal isVisible={isHelpVisible} onClose={() => setIsHelpVisible(false)} />
        </div>
    );
};

export default App;