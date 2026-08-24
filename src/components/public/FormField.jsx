export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  min,
  max,
  trailing,
}) {
  return (
    <label className="pub-field">
      <span>{label}</span>
      <span className="pub-field-control">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          min={min}
          max={max}
        />
        {trailing}
      </span>
    </label>
  );
}
