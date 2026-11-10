import React, { useState } from 'react';
import { Platform, Pressable, Text } from 'react-native';
import { Field, Icon, useInputStyle } from './ui';
import { R, useTheme } from '../theme';
import { fmtDate, toInputDate } from '../utils/date';

/** Web: input tanggal bawaan browser. Android/iOS: date picker native. */
export function DateField({ label, value, onChange }: { label: string; value: Date; onChange: (d: Date) => void }) {
  const { c, isDark } = useTheme();
  const [show, setShow] = useState(false);
  const inp = useInputStyle();

  if (Platform.OS === 'web') {
    return (
      <Field label={label}>
        {React.createElement('input', {
          type: 'date', 'aria-label': label, value: toInputDate(value),
          onChange: (e: any) => {
            const v: string = e.target.value;
            if (!v) return;
            const [y, m, d] = v.split('-').map(Number);
            onChange(new Date(y, m - 1, d, 23, 59));
          },
          style: { minHeight: 48, width: '100%', boxSizing: 'border-box', padding: '0 14px', fontSize: 15, fontFamily: 'inherit', borderRadius: R.md,
            border: `1px solid ${c.border}`, background: c.surface, color: c.text, colorScheme: isDark ? 'dark' : 'light' },
        })}
      </Field>
    );
  }
  const DateTimePicker = require('@react-native-community/datetimepicker').default;
  return (
    <Field label={label}>
      <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${fmtDate(value)}. Ketuk untuk mengubah.`} onPress={() => setShow(true)}
        style={[inp.style, { flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
        <Icon name="calendar" size={18} color={c.primaryText} />
        <Text style={{ color: c.text, fontSize: 15, fontWeight: '500' }}>{fmtDate(value)}</Text>
      </Pressable>
      {show && <DateTimePicker value={value} mode="date" onChange={(_: unknown, d?: Date) => { setShow(false); if (d) onChange(d); }} />}
    </Field>
  );
}
