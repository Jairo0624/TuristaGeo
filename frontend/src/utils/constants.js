// Valores fijos que comparten varios componentes (deben coincidir con el backend)
export const PRECIOS = [
  { value: 'gratis', label: 'Gratis' },
  { value: 'bajo', label: 'Bajo ($)' },
  { value: 'medio', label: 'Medio ($$)' },
  { value: 'alto', label: 'Alto ($$$)' },
];

export const precioLabel = (value) => PRECIOS.find((p) => p.value === value)?.label || value;
