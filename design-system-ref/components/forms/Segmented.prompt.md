Segmented control for switching translation modes or languages. Active segment is teal.

```jsx
const [mode, setMode] = React.useState("text");
<Segmented
  value={mode}
  onChange={setMode}
  options={[
    { value: "text", label: "Text", icon: <FileText size={14} /> },
    { value: "speech", label: "Speech" },
  ]}
/>
```
