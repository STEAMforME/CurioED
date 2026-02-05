import React from 'react';
import { useCRAFT, CRAFTModule } from '../context/CRAFTContext';
import { 
  BookOpen,
  Users,
  Trophy,
  GraduationCap,
  Sparkles
} from 'lucide-react';

interface ModuleConfig {
  id: CRAFTModule;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

const modules: ModuleConfig[] = [
  {
    id: 'curioed',
    name: 'CurioED',
    description: 'Core learning platform',
    icon: BookOpen,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100'
  },
  {
    id: 'mentor',
    name: 'MentorConnect',
    description: 'Connect with mentors',
    icon: Users,
    color: 'text-green-600',
    bgColor: 'bg-green-50 hover:bg-green-100'
  },
  {
    id: 'quest',
    name: 'QuestCraft',
    description: 'Gamified learning',
    icon: Trophy,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 hover:bg-purple-100'
  },
  {
    id: 'edulearn',
    name: 'EduLearn',
    description: 'Rich educational content',
    icon: GraduationCap,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 hover:bg-orange-100'
  }
];

interface ModuleSwitcherProps {
  variant?: 'grid' | 'list' | 'compact';
  className?: string;
}

const ModuleSwitcher: React.FC<ModuleSwitcherProps> = ({ 
  variant = 'grid',
  className = '' 
}) => {
  const { activeModule, setActiveModule, userProfile } = useCRAFT();

  // Filter modules based on user's active modules
  const availableModules = modules.filter(module => 
    !userProfile?.activeModules || userProfile.activeModules.includes(module.id)
  );

  const handleModuleSwitch = (moduleId: CRAFTModule) => {
    setActiveModule(moduleId);
  };

  if (variant === 'compact') {
    return (
      <div className={`flex gap-2 ${className}`}>
        {availableModules.map(module => {
          const Icon = module.icon;
          const isActive = activeModule === module.id;
          return (
            <button
              key={module.id}
              onClick={() => handleModuleSwitch(module.id)}
              className={`
                p-2 rounded-lg transition-all
                ${isActive 
                  ? `${module.bgColor} ${module.color} ring-2 ring-offset-2` 
                  : 'hover:bg-gray-100 text-gray-600'
                }
              `}
              title={module.name}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={`space-y-2 ${className}`}>
        {availableModules.map(module => {
          const Icon = module.icon;
          const isActive = activeModule === module.id;
          return (
            <button
              key={module.id}
              onClick={() => handleModuleSwitch(module.id)}
              className={`
                w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left
                ${isActive 
                  ? `${module.bgColor} ${module.color} ring-2 ring-offset-2` 
                  : 'hover:bg-gray-100 text-gray-700'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <div>
                <div className="font-semibold">{module.name}</div>
                <div className="text-sm opacity-75">{module.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // Grid variant (default)
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {availableModules.map(module => {
        const Icon = module.icon;
        const isActive = activeModule === module.id;
        return (
          <button
            key={module.id}
            onClick={() => handleModuleSwitch(module.id)}
            className={`
              relative p-6 rounded-xl transition-all text-left
              ${isActive 
                ? `${module.bgColor} ${module.color} ring-2 ring-offset-2 shadow-lg` 
                : 'bg-white hover:shadow-md border-2 border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className={`p-3 rounded-full ${module.bgColor}`}>
                <Icon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{module.name}</h3>
                <p className="text-sm opacity-75">{module.description}</p>
              </div>
              {isActive && (
                <div className="absolute top-2 right-2">
                  <Sparkles className="w-5 h-5" />
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ModuleSwitcher;
