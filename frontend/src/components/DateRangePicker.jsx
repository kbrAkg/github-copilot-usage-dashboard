import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { format, subDays } from 'date-fns';

export default function DateRangePicker({ selectedDay, onDayChange }) {
  const today = new Date();
  const options = [
    { label: 'Last 28 days', value: '' },
    ...Array.from({ length: 28 }, (_, i) => {
      const d = subDays(today, i + 1);
      return { label: format(d, 'yyyy-MM-dd'), value: format(d, 'yyyy-MM-dd') };
    }),
  ];

  return (
    <FormControl size="small" sx={{ minWidth: 180 }}>
      <InputLabel sx={{ color: 'inherit' }}>Date</InputLabel>
      <Select
        value={selectedDay}
        label="Date"
        onChange={(e) => onDayChange(e.target.value)}
        sx={{ color: 'white', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' } }}
      >
        {options.map((o) => (
          <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
