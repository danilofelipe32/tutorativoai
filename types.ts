export enum ActionType {
    SUMMARIZE = 'SUMMARIZE',
    KEYWORDS = 'KEYWORDS',
    REFLECT = 'REFLECT',
    TEST = 'TEST',
    SIMPLIFY = 'SIMPLIFY',
    MINDMAP = 'MINDMAP',
    ANALOGY = 'ANALOGY',
    STEP_BY_STEP = 'STEP_BY_STEP',
    CONNECTIONS = 'CONNECTIONS',
    DEEPER_QUESTIONS = 'DEEPER_QUESTIONS',
    LESSON_PLAN = 'LESSON_PLAN',
    RUBRIC = 'RUBRIC',
    DIFFERENTIATION = 'DIFFERENTIATION',
    DOK_QUESTIONS = 'DOK_QUESTIONS',
    WORKSHEETS = 'WORKSHEETS',
    SOCRATIC_OPPONENT = 'SOCRATIC_OPPONENT',
    PROJECT_IDEAS = 'PROJECT_IDEAS',
    EXEMPLARS = 'EXEMPLARS',
    CHOICE_BOARD = 'CHOICE_BOARD',
    MISCONCEPTIONS = 'MISCONCEPTIONS',
    DISCUSSION_PROMPTS = 'DISCUSSION_PROMPTS',
    INFORMATIONAL_TEXT = 'INFORMATIONAL_TEXT',
    REAL_WORLD_EXAMPLES = 'REAL_WORLD_EXAMPLES',
    STORYTELLER = 'STORYTELLER',
    FACT_CHECKER = 'FACT_CHECKER',
    AI_QUEST_EDU = 'AI_QUEST_EDU',
    POSSIBILITIES_ENGINE = 'POSSIBILITIES_ENGINE',
    CO_DESIGNER = 'CO_DESIGNER',
    COLLABORATION_COACH = 'COLLABORATION_COACH',
    EXPLORATORIUM = 'EXPLORATORIUM',
    IDENTIFY_PERSPECTIVE = 'IDENTIFY_PERSPECTIVE',
    FEEDBACK_GENERATOR = 'FEEDBACK_GENERATOR',
    PARETO_PRINCIPLE = 'PARETO_PRINCIPLE',
    FEYNMAN_TECHNIQUE = 'FEYNMAN_TECHNIQUE',
}

export enum View {
    MAIN = 'MAIN',
    RESULTS = 'RESULTS',
}

export interface GroundingChunk {
    web: {
        uri: string;
        title: string;
    };
}

export interface ResultPayload {
    text: string;
    sources?: GroundingChunk[];
}


export interface HistoryItem {
    id: number;
    actionType: ActionType;
    inputTextSnippet: string;
    fullInputText: string;
    fullResult: ResultPayload;
    timestamp: string; // ISO String
    customTitle?: string;
}

export interface AISettings {
    temperature: number;
    topK: number;
    topP: number;
}
