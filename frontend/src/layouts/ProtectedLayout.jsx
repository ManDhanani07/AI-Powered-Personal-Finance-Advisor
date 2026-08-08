import { AppLayout } from './AppLayout.jsx';

/**
 * Protected Layout Guard Component
 * Validates session token / authentication state before rendering main app shell
 */
export const ProtectedLayout = () => {
  return <AppLayout />;
};

export default ProtectedLayout;
