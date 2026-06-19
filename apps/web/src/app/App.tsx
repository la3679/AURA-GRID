import { RouterProvider } from 'react-router-dom';
import { Providers } from './providers.js';
import { router } from './router.js';

export const App = () => (
  <Providers>
    <RouterProvider router={router} />
  </Providers>
);
