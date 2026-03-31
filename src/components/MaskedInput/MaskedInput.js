import { useCallback } from 'react';

const MASKS = {
  cpf:   '999.999.999-99',
  phone: '(99)99999-9999',
  cep:   '99999-999',
};

function applyMask(raw, pattern) {
  const digits = raw.replace(/\D/g, '');
  let result = '';
  let d = 0;

  for (let i = 0; i < pattern.length && d < digits.length; i++) {
    if (pattern[i] === '9') {
      result += digits[d++];
    } else {
      result += pattern[i];
    }
  }
  return result;
}

// Formats digits as Brazilian currency: 12345 → "123,45", 1234567 → "12.345,67"
function applyCurrencyMask(raw) {
  const digits = raw.replace(/\D/g, '').replace(/^0+/, '') || '0';
  const padded = digits.padStart(3, '0');
  const intPart = padded.slice(0, -2);
  const decPart = padded.slice(-2);
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${intFormatted},${decPart}`;
}

function MaskedInput({ mask, value, onChange, name, ...rest }) {
  const isCurrency = mask === 'currency';
  const pattern = !isCurrency ? (MASKS[mask] || mask) : null;

  const handleChange = useCallback(
    (e) => {
      const masked = isCurrency
        ? applyCurrencyMask(e.target.value)
        : applyMask(e.target.value, pattern);
      if (onChange) {
        onChange({
          target: { name: name || e.target.name, value: masked },
        });
      }
    },
    [onChange, pattern, name, isCurrency],
  );

  return (
    <input
      {...rest}
      name={name}
      value={value || ''}
      onChange={handleChange}
    />
  );
}

export default MaskedInput;
