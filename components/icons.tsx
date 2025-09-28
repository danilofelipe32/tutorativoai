import React from 'react';

type IconProps = { className?: string };

const createIcon = (lineiconClass: string): React.FC<IconProps> => {
    // eslint-disable-next-line react/display-name
    return ({ className }) => <i className={`${lineiconClass} ${className || ''}`} aria-hidden="true"></i>;
};

// UI Icons
export const BackIcon = createIcon('lni lni-arrow-left');
export const HelpIcon = createIcon('lni lni-question-circle');
export const RefreshIcon = createIcon('lni lni-reload');
export const HistoryIcon = createIcon('lni lni-timer');
export const TrashIcon = createIcon('lni lni-trash-can');
export const PencilIcon = createIcon('lni lni-pencil-alt');
export const CloseIcon = createIcon('lni lni-close');
export const SearchIcon = createIcon('lni lni-search-alt');
export const CopyIcon = createIcon('lni lni-clipboard');
export const ShareIcon = createIcon('lni lni-upload');
export const CheckIcon = createIcon('lni lni-checkmark');
export const LoadingIcon = createIcon('lni lni-spinner-alt');
export const ChevronRightIcon = createIcon('lni lni-chevron-right');
export const SparkleIcon = createIcon('lni lni-sparkles');


// Action Icons (30 unique icons for 30 actions)
export const SummarizeIcon = createIcon('lni lni-highlight-alt');
export const KeywordsIcon = createIcon('lni lni-key');
export const ReflectIcon = createIcon('lni lni-thought');
export const TestIcon = createIcon('lni lni-files');
export const SimplifyIcon = createIcon('lni lni-bubble');
export const MindmapIcon = createIcon('lni lni-graph');
export const AnalogyIcon = createIcon('lni lni-magnet');
export const StepByStepIcon = createIcon('lni lni-list-check');
export const ConnectionsIcon = createIcon('lni lni-world-alt');
export const DeeperQuestionsIcon = createIcon('lni lni-keyword-research');
export const LessonPlanIcon = createIcon('lni lni-agenda');
export const RubricIcon = createIcon('lni lni-grid-alt');
export const DifferentiationIcon = createIcon('lni lni-users');
export const DOKQuestionsIcon = createIcon('lni lni-layers');
export const WorksheetsIcon = createIcon('lni lni-paperclip');
export const SocraticOpponentIcon = createIcon('lni lni-hammer');
export const ProjectIdeasIcon = createIcon('lni lni-bulb');
export const ExemplarsIcon = createIcon('lni lni-stamp');
export const ChoiceBoardIcon = createIcon('lni lni-layout');
export const MisconceptionsIcon = createIcon('lni lni-cross-circle');
export const DiscussionPromptsIcon = createIcon('lni lni-comments');
export const InformationalTextIcon = createIcon('lni lni-text-format');
export const RealWorldExamplesIcon = createIcon('lni lni-apartment');
export const StorytellerIcon = createIcon('lni lni-mic');
export const FactCheckerIcon = createIcon('lni lni-magnifier');
export const AIQuestEduIcon = createIcon('lni lni-game');
export const PossibilitiesEngineIcon = createIcon('lni lni-infinite');
export const CoDesignerIcon = createIcon('lni lni-ruler-pencil');
export const CollaborationCoachIcon = createIcon('lni lni-handshake');
export const ExploratoriumIcon = createIcon('lni lni-map-marker');
export const IdentifyPerspectiveIcon = createIcon('lni lni-eye');
export const FeedbackGeneratorIcon = createIcon('lni lni-comments-reply');
export const ParetoPrincipleIcon = createIcon('lni lni-target');
export const FeynmanTechniqueIcon = createIcon('lni lni-graduation');