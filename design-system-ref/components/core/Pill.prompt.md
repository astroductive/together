Rounded status pill with a colored, sometimes-pulsing dot — used for connection and liveness states across the app.

```jsx
<Pill state="live">Live meeting</Pill>
<Pill state="connecting">Connecting…</Pill>
<Pill state="idle">Idle</Pill>
```

States: `idle` (gray, static), `live` (green, pulsing), `connecting` (amber, pulsing), `failed` (red).
