interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between gap-4 mb-8">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        return (
          <div key={label} className="flex-1">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-semibold ${
                  isActive
                    ? 'border-primary-600 text-primary-600'
                    : isCompleted
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-gray-300 text-gray-500'
                }`}
              >
                {stepNumber}
              </div>
              <div>
                <p className={`text-sm ${isActive ? 'text-primary-600' : 'text-gray-500'}`}>
                  الخطوة {stepNumber}
                </p>
                <p className="text-base font-medium text-gray-900">{label}</p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className="mt-3 h-1 rounded bg-gray-200">
                <div
                  className={`h-1 rounded transition-all duration-300 ${
                    isCompleted ? 'bg-primary-500 w-full' : 'bg-gray-200 w-0'
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

