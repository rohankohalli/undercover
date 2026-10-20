export default function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  disabled = false,
  formatValue
}) {
  return (
    <div className="slider-group">
      <div className="slider-header">
        <span className="slider-label">{label}</span>
        <span className="slider-value">
          {formatValue ? formatValue(value) : value}
        </span>
      </div>
      <input
        type="range"
        className="range-input"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={e => onChange(Number(e.target.value))}
      />
    </div>
  );
}
