/**
 작성자: 김슬기
 */
import whaleImage from '@/assets/whale.png';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'lg', fullScreen = false }) => {
  const sizeClasses = {
    sm: { container: 'w-12', bar: 'w-1.5', whale: 'w-12', height: 'h-12' },
    md: { container: 'w-18', bar: 'w-2', whale: 'w-18', height: 'h-12' },
    lg: { container: 'w-24', bar: 'w-3', whale: 'w-24', height: 'h-12' },
  };

  const { container, bar, whale, height } = sizeClasses[size];

  const spinnerContent = (
    <div className="flex flex-col items-center gap-2">
      <div 
        className={`${whale} relative`} 
        style={{ animation: 'float 1.2s ease-in-out infinite' }}
      >
        <img src={whaleImage} alt="Loading..." className="w-full h-auto" />
      </div>
      <div className={`${container} ${height} flex items-center justify-center gap-1.5`}>
        {[0, 1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={`${bar} h-full rounded-full`}
            style={{
              backgroundColor: '#0492F4',
              animation: 'wave 1.2s ease-in-out infinite',
              animationDelay: `${index * 0.1}s`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes wave {
          0%, 100% {
            transform: scaleY(0.3);
          }
          50% {
            transform: scaleY(1);
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};