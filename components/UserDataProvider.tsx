// "use client";

// import { useEffect } from "react";
// import { useUser, useClerk } from "@clerk/nextjs";
// import { createClerkSupabaseClient } from "@/utils/supabaseClient";
// import useUserStore from "@/lib/useUserStore";

// interface Props {
//   children: React.ReactNode;
// }

// export default function UserDataProvider({ children }: Props) {
//   const { user, isLoaded } = useUser();
//   const { signOut, session } = useClerk();
//   const { setUser, setSubscription, setHasFetchedData, reset, hasFetchedData } = useUserStore();

//   useEffect(() => {
//     if (!isLoaded || !user) {
//       console.log("User not loaded yet:", { isLoaded, user });
//       return;
//     }

//     const fetchUserData = async (supabaseToken?: string | null) => { // Zmieniono typ na string | null | undefined
//       try {
//         console.log("Supabase Token:", supabaseToken);

//         const supabase = await createClerkSupabaseClient({
//           getToken: async () => supabaseToken || process.env.SUPABASE_SERVICE_ROLE_KEY!,
//         } as any);

//         const { data: profile, error: profileError } = await supabase
//           .from("profiles")
//           .select("user_id, first_name, last_name, email, avatar")
//           .eq("user_id", user.id)
//           .single();

//         if (profileError) {
//           console.error("Profile fetch error:", profileError);
//           throw profileError;
//         }
//         console.log("Fetched profile:", profile);

//         const { data: subscription, error: subError } = await supabase
//           .from("subscriptions")
//           .select("plan, status, stripe_subscription_id, job_offers_limit, cv_creator_limit")
//           .eq("user_id", user.id)
//           .single();

//         if (subError && !subscription) {
//           console.error("Subscription fetch error:", subError);
//         }
//         console.log("Fetched subscription:", subscription);

//         if (!hasFetchedData) {
//           setUser({
//             user_id: profile.user_id,
//             first_name: profile.first_name || user.firstName,
//             last_name: profile.last_name || user.lastName,
//             email: profile.email || user.emailAddresses[0].emailAddress,
//             avatar: profile.avatar || user.imageUrl,
//           });
//           setSubscription(
//             subscription || {
//               plan: "free",
//               status: "active",
//               job_offers_limit: 20,
//               cv_creator_limit: 3,
//             }
//           );
//           setHasFetchedData(true);
//           console.log("Data set in Zustand:", useUserStore.getState());
//         }
//       } catch (error) {
//         console.error("Error fetching user data from Supabase:", error);
//       }
//     };

//     session?.getToken({ template: "supabase" })
//       .then((supabaseToken) => {
//         fetchUserData(supabaseToken);
//       })
//       .catch((error) => {
//         console.error("Error getting Supabase token:", error);
//         fetchUserData(); // Fallback bez tokena, użyje klucza service role
//       });

//     // Reset przy wylogowaniu
//     const handleSignOut = () => {
//       reset();
//       signOut();
//     };

//     return () => {
//       // Cleanup niepotrzebne, reset w signOut
//     };
//   }, [user, isLoaded, setUser, setSubscription, setHasFetchedData, reset, signOut, hasFetchedData, session]);

//   return <>{children}</>;
// }