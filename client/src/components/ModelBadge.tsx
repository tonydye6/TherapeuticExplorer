import { Badge } from '@/components/ui/badge';
import { ModelType } from '@shared/schema';
import { SiOpenai, SiGoogle } from 'react-icons/si';
import { Sparkles } from 'lucide-react';

interface ModelBadgeProps {
  model: ModelType | string;
  showText?: boolean;
}

export default function ModelBadge({ model, showText = false }: ModelBadgeProps) {
  const getModelDetails = () => {
    switch (model) {
      case ModelType.GPT:
        return {
          icon: <SiOpenai className="h-3 w-3 mr-1" />,
          label: 'GPT-4o',
          className: 'bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        };
      case ModelType.GEMINI:
        return {
          icon: <SiGoogle className="h-3 w-3 mr-1" />,
          label: 'Gemini',
          className: 'bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
        };
      case ModelType.CLAUDE:
        return {
          icon: <Sparkles className="h-3 w-3 mr-1" />,
          label: 'Claude',
          className: 'bg-purple-100 hover:bg-purple-200 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
        };
      default:
        return {
          icon: <Sparkles className="h-3 w-3 mr-1" />,
          label: String(model),
          className: 'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
        };
    }
  };

  const { icon, label, className } = getModelDetails();

  return (
    <Badge variant="outline" className={`${className} ${showText ? 'px-2 py-0' : 'w-5 h-5 p-0 flex items-center justify-center'}`}>
      {icon}
      {showText && label}
    </Badge>
  );
}
