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

function MaskedInput({ mask, value, onChange, name, ...rest }) {
  const pattern = MASKS[mask] || mask;

  const handleChange = useCallback(
    (e) => {
      const masked = applyMask(e.target.value, pattern);
      // Build a synthetic-like event so parent onChange works normally
      if (onChange) {
        onChange({
          target: { name: name || e.target.name, value: masked },
        });
      }
    },
    [onChange, pattern, name],
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
