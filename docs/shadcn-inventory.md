# shadcn Inventory

Automated search for raw HTML elements that should use shadcn/ui components.

Commands executed:

```
grep -R "<button" -n src | grep -v "/ui/"
grep -R "<input" -n src | grep -v "/ui/"
grep -R "<label" -n src | grep -v "/ui/"
```

No occurrences were found. All buttons, inputs, labels and related components already use the abstractions under `src/components/ui/`.
