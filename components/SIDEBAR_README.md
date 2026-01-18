# Sidebar Component

A beautiful, responsive sidebar component with smooth animations that slides in from the right on mobile devices.

## Features

✨ **Smooth Animations**: CSS-based transitions for optimal performance
📱 **Mobile-First**: Designed for mobile with responsive behavior
🎨 **Beautiful UI**: Modern design with backdrop blur and shadows
⌨️ **Keyboard Support**: Close with Escape key
🔒 **Body Scroll Lock**: Prevents scrolling when sidebar is open
♿ **Accessible**: ARIA labels and semantic HTML
🎯 **Easy to Use**: Simple API with custom hook

## Installation

The sidebar is already integrated into your app! No additional installation needed.

> **Note**: While the sidebar was designed to work with `@floating-ui/react`, it currently uses pure CSS transitions which are more suitable for slide-in sidebars. If you need floating-ui for other purposes, install it with:
> ```bash
> npm install @floating-ui/react
> ```

## Basic Usage

```tsx
import { Sidebar, SidebarToggleButton, useSidebar } from './components/Sidebar';

function MyComponent() {
  const { isOpen, close, toggle } = useSidebar();

  return (
    <div>
      {/* Toggle button */}
      <SidebarToggleButton onClick={toggle} />

      {/* Sidebar */}
      <Sidebar isOpen={isOpen} onClose={close}>
        <h2>Your Content Here</h2>
        {/* Add your menu items, links, etc. */}
      </Sidebar>
    </div>
  );
}
```

## API Reference

### `<Sidebar>`

Main sidebar component.

**Props:**
- `isOpen: boolean` - Controls visibility of the sidebar
- `onClose: () => void` - Callback when sidebar should close (backdrop click, Escape key)
- `children: React.ReactNode` - Content to display inside the sidebar

**Features:**
- Slides in from the right
- Width: 320px (80 on mobile, max 85vw)
- Auto-closes on Escape key
- Prevents body scroll when open
- Backdrop overlay with blur effect

### `<SidebarToggleButton>`

A pre-styled button to toggle the sidebar.

**Props:**
- `onClick: () => void` - Click handler (usually `toggle` from the hook)
- `className?: string` - Optional additional CSS classes

### `useSidebar()`

Custom hook for managing sidebar state.

**Returns:**
```tsx
{
  isOpen: boolean;      // Current open state
  open: () => void;     // Open the sidebar
  close: () => void;    // Close the sidebar
  toggle: () => void;   // Toggle open/closed
}
```

## Animation Details

The sidebar uses CSS transitions for smooth, performant animations:

- **Slide Animation**: `transform` with `translate-x-full` (300ms, ease-in-out)
- **Backdrop Fade**: `opacity` transition (300ms)
- **Hardware Accelerated**: Uses `transform` for 60fps animations

## Responsive Behavior

- **Desktop (md and up)**: Shows traditional navigation in header
- **Mobile (< md)**: Shows hamburger menu button that opens sidebar
- **Width**: `max-w-[85vw]` ensures sidebar never takes full screen on small devices

## Integration in Your App

The sidebar is already integrated into your app via the `Layout` component:

```tsx
// App.tsx
import { Layout } from './components/Layout';

// Wrap your protected routes with Layout
<Layout>
  <YourPageContent />
</Layout>
```

The Layout component includes:
- Desktop navigation header
- Mobile sidebar menu
- User profile display
- Active route highlighting
- Logout functionality

## Customization

### Custom Styling

The sidebar uses Tailwind CSS classes. Modify the classes in `Sidebar.tsx`:

```tsx
// Change sidebar width
className="w-96"  // Instead of w-80

// Change animation speed
className="transition-transform duration-500"  // Instead of duration-300

// Change background
className="bg-slate-900 text-white"  // Dark theme
```

### Custom Content

Add any content inside the Sidebar component:

```tsx
<Sidebar isOpen={isOpen} onClose={close}>
  {/* Custom header */}
  <div className="mb-6 p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white">
    <h2 className="text-xl font-bold">My App</h2>
  </div>

  {/* Navigation links */}
  <nav>
    {/* Your links */}
  </nav>

  {/* Footer */}
  <div className="mt-auto">
    {/* Footer content */}
  </div>
</Sidebar>
```

## Accessibility

The sidebar implements several accessibility features:

- **ARIA labels**: `aria-label` on sidebar and buttons
- **Keyboard support**: Escape key to close
- **Focus management**: Proper focus handling
- **Semantic HTML**: Uses `<aside>`, `<nav>`, etc.

## Performance

The sidebar is highly performant:

- **CSS Transitions**: Hardware-accelerated, 60fps
- **No JavaScript animations**: Pure CSS for smoothness
- **Conditional rendering**: Backdrop uses `pointer-events-none` when closed
- **Body scroll lock**: Prevents layout shift

## Browser Support

Works in all modern browsers that support:
- CSS `transform` and `transition`
- CSS `backdrop-filter` (backdrop blur)
- React 19+

## Examples

See `SidebarExample.tsx` for more usage examples:
- Basic sidebar
- Rich content sidebar
- Programmatic control

## Troubleshooting

**Sidebar doesn't slide smoothly:**
- Ensure Tailwind CSS is properly configured
- Check for conflicting CSS

**Body still scrolls when open:**
- The component handles this automatically
- Check for `overflow` styles on parent elements

**Backdrop not visible:**
- Ensure `z-index` values aren't conflicting
- Check for `position: relative` on parent containers
