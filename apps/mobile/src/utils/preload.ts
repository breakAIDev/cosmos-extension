export const preloadOnboardingRoutes = () => {
  return Promise.all([
    import('../screens/onboarding'),
    import('../screens/onboarding/create'),
    import('../screens/onboarding/import'),
    import('../screens/onboarding/success'),
  ]);
};
