interface Props {
  value: string
  status: 'correct' | 'incorrect' | 'partial' | 'higher' | 'lower'
  label?: string
}

const statusStyles: Record<string, string> = {
  correct:   'background:#4caf50; color:#fff;',
  incorrect: 'background:#e53935; color:#fff;',
  partial:   'background:#ffc107; color:#333;',
  higher:    'background:#e53935; color:#fff;',
  lower:     'background:#e53935; color:#fff;',
}

const statusIcon: Record<string, string> = {
  correct:   '',
  incorrect: '',
  partial:   '',
  higher:    ' ↑',
  lower:     ' ↓',
}

export default function FieldCell({ value, status, label }: Props) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px',
      padding: '8px 4px',
      minWidth: '90px',
      minHeight: '60px',
      textAlign: 'center',
      ...Object.fromEntries(
        statusStyles[status]
          .split(';')
          .filter(Boolean)
          .map(s => {
            const [k, v] = s.split(':')
            return [k.trim().replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase()), v.trim()]
          })
      )
    }}>
      {label && (
        <span style={{ fontSize: '10px', opacity: 0.8, marginBottom: '2px' }}>
          {label}
        </span>
      )}
      <span style={{ fontSize: '13px', fontWeight: 600 }}>
        {value}{statusIcon[status]}
      </span>
    </div>
  )
}