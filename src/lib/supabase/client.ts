/** DUMMY BROWSER-SIDE SUPABASE CLIENT (NO REAL AUTH) */

export function createClient() {
  return {
    auth: {
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        // Allow any non-empty credentials
        if (email && password) {
          return {
            data: { user: { id: "demo-user", email } },
            error: null,
          };
        }
        return {
          data: null,
          error: { message: "Invalid credentials" },
        };
      },
      signOut: async () => ({
        error: null,
      }),
      onAuthStateChange: (callback: any) => {
        // Return unsubscribe function
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
    },
  };
}
