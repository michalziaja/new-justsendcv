// import { create } from "zustand";
// import { persist } from "zustand/middleware";

// export interface EmailAddress {
//   emailAddress: string;
// }

// export interface UserData {
//   id: string;
//   imageUrl?: string;
//   firstName?: string;
//   lastName?: string;
//   emailAddresses?: EmailAddress[];
// }

// export interface SubscriptionData {
//   plan: "free" | "premium";
//   stripeSubscriptionId?: string;
//   status?: "active" | "inactive";
//   email?: string;
//   updatedAt?: string;
// }

// interface UserStore {
//   user: UserData | null;
//   subscription: SubscriptionData | null;
//   hasFetchedData: boolean;
//   setUser: (userData: UserData) => void;
//   setSubscription: (subscription: SubscriptionData) => void;
//   setHasFetchedData: (fetched: boolean) => void;
//   reset: () => void;
// }

// const useUserStore = create<UserStore>()(
//   persist(
//     (set) => ({
//       user: null,
//       subscription: null,
//       hasFetchedData: false,
//       setUser: (userData) => set({ user: userData }),
//       setSubscription: (subscription) => set({ subscription }),
//       setHasFetchedData: (fetched) => set({ hasFetchedData: fetched }),
//       reset: () => set({ user: null, subscription: null, hasFetchedData: false }),
//     }),
//     {
//       name: "user-store",
//       storage: {
//         getItem: (name) => {
//           const str = sessionStorage.getItem(name);
//           if (!str) return null;
//           return JSON.parse(str);
//         },
//         setItem: (name, value) => {
//           sessionStorage.setItem(name, JSON.stringify(value));
//         },
//         removeItem: (name) => {
//           sessionStorage.removeItem(name);
//         },
//       },
//     }
//   )
// );

// export default useUserStore;


import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface EmailAddress {
  emailAddress: string;
}

export interface UserData {
  user_id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  avatar?: string;
}

export interface SubscriptionData {
  plan: "free" | "premium";
  status: "active" | "inactive";
  stripe_subscription_id?: string;
  job_offers_limit: number;
  cv_creator_limit: number;
}

interface UserStore {
  user: UserData | null;
  subscription: SubscriptionData | null;
  hasFetchedData: boolean;
  setUser: (userData: UserData) => void;
  setSubscription: (subscription: SubscriptionData) => void;
  setHasFetchedData: (fetched: boolean) => void;
  reset: () => void;
}

const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      subscription: null,
      hasFetchedData: false,
      setUser: (userData) => set({ user: userData }),
      setSubscription: (subscription) => set({ subscription }),
      setHasFetchedData: (fetched) => set({ hasFetchedData: fetched }),
      reset: () => set({ user: null, subscription: null, hasFetchedData: false }),
    }),
    {
      name: "user-store",
      storage: {
        getItem: (name) => {
          const str = sessionStorage.getItem(name);
          if (!str) return null;
          return JSON.parse(str);
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
        },
      },
    }
  )
);

export default useUserStore;