Together's primary button — teal accent by default, with ink/soft/ghost/outline variants for marketing and app surfaces.

```jsx
<Button variant="accent" size="md">Launch dashboard</Button>
<Button variant="primary" iconRight={<ArrowRight size={16} />}>Open</Button>
<Button variant="ghost" size="sm">Cancel</Button>
```

Variants: `accent` (teal, default), `primary` (ink/monochrome), `soft` (tinted teal), `ghost` (bordered), `outline` (glass). Sizes: `sm` · `md` · `lg`. Use `block` to fill width, `iconLeft`/`iconRight` for lucide icons.
