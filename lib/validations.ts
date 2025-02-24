// lib/validations.ts

type ValidationResult = {
    code: string;
    message: string;
  } | null;
  
  type PlanTransition = {
    from: 'free' | 'premium' | null;
    to: 'free' | 'premium';
  };
  
  export const validateSubscriptionPlan = (
    plan: unknown
  ): ValidationResult => {
    if (!plan) {
      return {
        code: 'MISSING_PLAN',
        message: 'Subscription plan is required'
      };
    }
  
    if (typeof plan !== 'string') {
      return {
        code: 'INVALID_PLAN_TYPE',
        message: 'Plan must be a string'
      };
    }
  
    if (!['free', 'premium'].includes(plan)) {
      return {
        code: 'INVALID_PLAN',
        message: 'Valid plans are: free, premium'
      };
    }
  
    return null;
  };
  
  export const validatePlanTransition = ({
    from,
    to
  }: PlanTransition): ValidationResult => {
    if (from === to) {
      return {
        code: 'SAME_PLAN',
        message: `User is already on ${to} plan`
      };
    }
  
    if (from === 'premium' && to === 'free') {
      return {
        code: 'DOWNGRADE_NOT_ALLOWED',
        message: 'Please contact support to downgrade your plan'
      };
    }
  
    return null;
  };
  
  export const validateSubscriptionInput = (
    currentPlan: 'free' | 'premium' | null,
    newPlan: string
  ): ValidationResult => {
    const planValidation = validateSubscriptionPlan(newPlan);
    if (planValidation) return planValidation;
  
    const transitionValidation = validatePlanTransition({
      from: currentPlan,
      to: newPlan as 'free' | 'premium'
    });
  
    return transitionValidation;
  };
  
  // Helper for API error responses
  export const validationErrorResponse = (validationResult: ValidationResult) => {
    return {
      code: validationResult?.code || 'VALIDATION_ERROR',
      message: validationResult?.message || 'Invalid request data'
    };
  };
  
  // Zod schema alternative (optional)
  import { z } from 'zod';
  
  export const subscriptionSchema = z.object({
    plan: z.enum(['free', 'premium']),
    userId: z.string().uuid().optional()
  });
  
  export type SubscriptionInput = z.infer<typeof subscriptionSchema>;
  