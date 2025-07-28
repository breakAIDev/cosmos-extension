import React, { useState } from 'react';
import { AlertStrip } from './v2';

export const ApiStatusWarningStrip = () => {
  const [show, setShow] = useState(true);

  if (!show) return null;

  return (
    <AlertStrip type="error">
      Failed to fetch network data. Check again later.
    </AlertStrip>
  );
};
