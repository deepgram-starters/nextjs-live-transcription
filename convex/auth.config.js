export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      // domain: "https://genuine-catfish-96.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};
