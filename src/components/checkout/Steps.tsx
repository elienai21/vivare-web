import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Steps({ currentStep }: { currentStep: number }) {
    const steps = [
        { number: 1, label: 'Resumo' },
        { number: 2, label: 'Seus Dados' },
        { number: 3, label: 'Pagamento' },
    ];

    return (
        <div className="flex items-center justify-center w-full mb-8">
            {steps.map((step, index) => {
                const isCompleted = currentStep > step.number;
                const isCurrent = currentStep === step.number;

                return (
                    <div key={step.number} className="flex items-center">
                        {/* Step Circle */}
                        <div className="flex flex-col items-center relative">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 z-10",
                                isCompleted ? "bg-primary-600 text-white" :
                                    isCurrent ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900" :
                                        "bg-neutral-200 dark:bg-neutral-800 text-neutral-500"
                            )}>
                                {isCompleted ? <Check className="w-5 h-5" /> : step.number}
                            </div>
                            <span className={cn(
                                "absolute -bottom-6 text-xs font-semibold whitespace-nowrap",
                                isCurrent ? "text-neutral-900 dark:text-white" : "text-neutral-400"
                            )}>
                                {step.label}
                            </span>
                        </div>

                        {/* Line */}
                        {index < steps.length - 1 && (
                            <div className={cn(
                                "w-20 md:w-40 h-1 mx-4 rounded-full transition-colors duration-300",
                                currentStep > step.number + 0 ? "bg-neutral-900 dark:bg-white" : "bg-neutral-200 dark:bg-neutral-800"
                            )} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
