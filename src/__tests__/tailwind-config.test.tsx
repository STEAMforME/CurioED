// src/__tests__/tailwind-config.test.tsx
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

test('applies themed text color and font weight', () => {
  const { getByText } = render(
    <p className="text-primary font-semibold">Hello Tailwind</p>
  );
  const el = getByText('Hello Tailwind');
  expect(el).toHaveClass('text-primary');
  expect(el).toHaveClass('font-semibold');
});
