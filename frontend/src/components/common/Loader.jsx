import { Loader as LoaderIcon } from 'lucide-react';

export default function Loader({ fullScreen = false, size = 'md', text = '' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-2">
      <LoaderIcon className={`${sizeClasses[size]} animate-spin text-blue-600`} />
      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}