// // types/subscription.ts
// export type SubscriptionStatus = 
//   | "active"
//   | "canceled"
//   | "incomplete"
//   | "incomplete_expired"
//   | "past_due"
//   | "trialing"
//   | "unpaid";

// export interface DatabaseSubscription {
//   user_id: string;
//   plan: "free" | "premium";
//   status: SubscriptionStatus;
//   stripe_subscription_id: string | null;
//   start_date: string;
//   end_date: string | null;
//   job_offers_limit: number;
//   cv_creator_limit: number;
//   job_offers_used: number;
//   cv_creator_used: number;
//   created_at?: string;
// }

// export type SubscriptionCreate = Omit<DatabaseSubscription, "created_at">;
// export type SubscriptionUpdate = Partial<DatabaseSubscription>
  