// import NextAuth from "next-auth";
// import "next-auth/jwt";

// // import Apple from "next-auth/providers/apple"
// // import Facebook from "next-auth/providers/facebook"
// import Google from "next-auth/providers/google";

// export const { handlers, auth, signIn, signOut } = NextAuth({
//   debug: !!process.env.AUTH_DEBUG,
//   theme: { logo: "https://authjs.dev/img/logo-sm.png" },
//   providers: [
//     // Apple,
//     // Facebook,
//     Google({
//       clientId: process.env.AUTH_GOOGLE_ID!,
//       clientSecret: process.env.AUTH_GOOGLE_SECRET!,
//     }),
//   ],
//   session: { strategy: "jwt" },
//   callbacks: {
//     // authorized({ request, auth }) {
//     //   const { pathname } = request.nextUrl
//     //   if (pathname === "/middleware-example") return !!auth
//     //   return true
//     // },
//     async jwt({ token, account }) {
//       if (account && account.provider === "google") {
//         token.accessToken = account.access_token;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (token?.accessToken) session.accessToken = token.accessToken;

//       return session;
//     },
//   },
// });

// declare module "next-auth" {
//   interface Session {
//     accessToken?: string;
//   }
// }

// declare module "next-auth/jwt" {
//   interface JWT {
//     accessToken?: string;
//   }
// }

import NextAuth from "next-auth";
import "next-auth/jwt";

import Apple from "next-auth/providers/apple";
// import Facebook from "next-auth/providers/facebook"
import Google from "next-auth/providers/google";
import { User } from "./redux/reducers/usersReducer";
import { cookies } from "next/headers";

const handler = NextAuth({
  debug: !!process.env.AUTH_DEBUG,
  theme: { logo: "https://authjs.dev/img/logo-sm.png" },
  providers: [
    Apple({
      clientId: process.env.AUTH_APPLE_ID!,
      clientSecret: process.env.AUTH_APPLE_SECRET!,
    }),
    // Facebook,
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  //   cookies: {
  //     sessionToken: {
  //       name: "token", // 👈 custom cookie name
  //       options: {
  //         httpOnly: true,
  //         sameSite: "lax",
  //         path: "/",
  //         secure: process.env.NODE_ENV === "production",
  //       },
  //     },
  //   },
  callbacks: {
    async jwt({ token, account }) {
      if (account && account.provider === "google") {
        if (account?.id_token) {
          try {
            const response = await fetch(
              "http://localhost:3120/api/auth/google/verify",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ idToken: account.id_token }),
              }
            );
            if (!response.ok)
              throw new Error(
                `Error verifying ID token: ${await response.text()}`
              );
            const data: {
              token: string;
              user: User;
            } = await response.json();
            const cookieStore = cookies();
            cookieStore.set({
              name: "token", // ✅ same name as NextAuth cookie
              value: data.token, // ✅ your backend token
              path: "/",
              // httpOnly: true,
              // sameSite: "lax",
              // secure: process.env.NODE_ENV === "production",
              // maxAge: 60 * 60 * 24 * 7, // 7 days
            });

            // persist backend token inside JWT
            token.backendToken = data.token;
            token.user = data.user;
          } catch (error) {
            console.error("Error verifying ID token:", error);
          }
        }
      }

      if (account && account.provider === "apple") {
        if (account?.id_token) {
          try {
            const response = await fetch(
              "http://localhost:3120/api/auth/apple/verify",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ idToken: account.id_token,
                  // nonce: 'nonce_sent_from_client' // send the nonce generated on client here for verification
                 }),
              }
            );
            if (!response.ok)
              throw new Error(
                `Error verifying ID token: ${await response.text()}`
              );
            const data: {
              token: string;
              user: User;
            } = await response.json();
            const cookieStore = cookies();
            cookieStore.set({
              name: "token", // ✅ same name as NextAuth cookie
              value: data.token, // ✅ your backend token
              path: "/",
              // httpOnly: true,
              // sameSite: "lax",
              // secure: process.env.NODE_ENV === "production",
              // maxAge: 60 * 60 * 24 * 7, // 7 days
            });

            // persist backend token inside JWT
            token.backendToken = data.token;
            token.user = data.user;
          } catch (error) {
            console.error("Error verifying ID token:", error);
          }
        }
      }

      console.log("JWT Token:", token);

      return token;
    },
    async session({ session, token }) {
      //   if (token?.accessToken) session.accessToken = token.accessToken;
      //   if (token?.idToken) session.idToken = token.idToken;
      if (token?.backendToken) session.backendToken = token.backendToken;
      if (token?.user) session.user = token.user;
      console.log("Session:", session);
      console.log("Token:", token);
      return session;
    },
  },
});
export { handler as GET, handler as POST };

declare module "next-auth" {
  interface Session {
    // accessToken?: string;
    // idToken?: string;
    backendToken?: string;
    user?: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    // accessToken?: string;
    // idToken?: string;
    backendToken?: string;
    user?: User;
  }
}
