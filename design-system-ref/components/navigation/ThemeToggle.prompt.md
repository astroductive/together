Pill-shaped light/dark toggle with sun/moon glyphs. Wire `onChange` to add/remove `.dark` on a wrapper.

```jsx
const [theme, setTheme] = React.useState("dark");
<ThemeToggle value={theme} onChange={setTheme} />
```
